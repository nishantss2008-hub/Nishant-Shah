// Vercel serverless function — records one visit for the private insights dashboard.
//
// Collects only what answers "who is looking at my site":
//   · coarse location, from Vercel's own x-vercel-ip-* headers (no third party)
//   · the visiting network's organisation, via reverse DNS on the IP
//   · the page, the referrer, and the time
//
// What is deliberately NOT kept:
//   · the IP address
//   · the full reverse-DNS hostname. A PTR record can read like
//     "dhcp-j-smith.chem.example.edu", which identifies a person, not just an
//     institution. Only the registrable domain is stored, which is all the
//     dashboard ever shows.
//
// Visitor id: a salted hash of the IP, used purely to collapse repeat visits
// into one visitor. The salt MUST be secret. IPv4 is only ~4 billion values,
// so a hash made with a guessable salt can be reversed by brute force in
// seconds — a public default salt would make this pseudonymisation worthless.
// With no secret available the visitor id is simply omitted.
//
// Storage is Upstash/Vercel KV over its REST API. Without those environment
// variables this function does nothing and returns 204: the site must never
// break because analytics are unconfigured.
//
// Env: KV_REST_API_URL + KV_REST_API_TOKEN  (or UPSTASH_REDIS_REST_URL/_TOKEN)
//      INSIGHTS_SALT   — secret for visitor hashing. Falls back to
//                        INSIGHTS_TOKEN. Absent both, no visitor id is stored.

const dns = require('dns').promises;
const crypto = require('crypto');

const LIST_KEY = 'visits';
const RATE_PREFIX = 'rate:';
const SALT_KEY = 'visitor-salt';
const MAX_VISITS = 5000;        // rolling window kept in KV
const RETENTION_DAYS = 120;     // anything older is pruned off the tail
const RATE_PER_MIN = 60;        // per source, before writes are dropped
const RDNS_TIMEOUT_MS = 1200;   // never let a slow PTR lookup stall the function
const PRUNE_PER_REQUEST = 20;

// Secret used for hashing. Two hard requirements:
//   STABLE across instances — a per-process random gives every concurrent
//   lambda its own rate-limit namespace, which is no limit at all.
//   NOT PUBLIC — IPv4 is ~4 billion values, so a hash salted with a constant
//   that ships in this file can be brute-forced straight back to the address.
// Prefer the configured secret; otherwise mint one random value, store it in
// KV so every instance agrees on it, and cache it for the process lifetime.
let CACHED_SALT = null;
async function hashSalt(kv) {
  const env = process.env.INSIGHTS_SALT || process.env.INSIGHTS_TOKEN;
  if (env) return env;
  if (CACHED_SALT) return CACHED_SALT;
  try {
    const made = crypto.randomBytes(32).toString('hex');
    const r = await kvPipeline(kv, [['SET', SALT_KEY, made, 'NX'], ['GET', SALT_KEY]]);
    const got = Array.isArray(r) && r[1] ? r[1].result : null;
    if (typeof got === 'string' && got) CACHED_SALT = got;
  } catch (e) { /* fall through */ }
  return CACHED_SALT;
}

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

// A client can prepend whatever it likes to x-forwarded-for, so the FIRST entry
// is attacker-controlled: trusting it lets anyone fabricate visits from any
// network they choose, which is exactly the claim this dashboard exists to make.
// x-real-ip is set by Vercel's proxy and overwritten rather than appended to, so
// prefer it; failing that take the LAST x-forwarded-for entry, which is the
// address the closest trusted proxy actually observed.
function clientIp(req) {
  // Vercel strips client-supplied x-vercel-* headers, so this one cannot be
  // forged. Without it a client could rotate x-real-ip on every request and
  // both fake its organisation and land in a fresh rate-limit bucket each time.
  const vercel = req.headers['x-vercel-forwarded-for'];
  if (vercel) return String(vercel).split(',').pop().trim();
  const real = req.headers['x-real-ip'];
  if (real) return String(real).split(',').pop().trim();
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    const parts = String(fwd).split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return (req.socket && req.socket.remoteAddress) || '';
}

// Two-part public suffixes, so "cam.ac.uk" survives instead of collapsing to "ac.uk".
const TWO_PART = new Set([
  'ac.uk','co.uk','org.uk','gov.uk','sch.uk','edu.au','gov.au','org.au','com.au',
  'ac.jp','ed.jp','go.jp','co.jp','ac.nz','edu.sg','edu.in','ac.in','edu.cn','edu.hk',
  'ac.za','edu.mx','edu.br','ac.kr','edu.tr','ac.be','edu.pl','ac.at',
]);

function domainFromHost(hostname) {
  const parts = String(hostname).toLowerCase().replace(/\.$/, '').split('.').filter(Boolean);
  if (parts.length < 2) return null;
  const lastTwo = parts.slice(-2).join('.');
  const take = TWO_PART.has(lastTwo) ? 3 : 2;
  return parts.slice(-take).join('.');
}

// Education is the thing the dashboard is actually watching for.
function classify(domain) {
  if (!domain) return 'unknown';
  if (/\.edu$/.test(domain) || /\.(ac|edu|sch|ed)\.[a-z]{2}$/.test(domain)) return 'education';
  if (/\.gov$/.test(domain) || /\.gov\.[a-z]{2}$/.test(domain) || /\.mil$/.test(domain)) return 'government';
  if (/^(comcast|xfinity|verizon|att|spectrum|charter|rr|cox|t-mobile|tmobile|sprint|vodafone|telus|rogers|bell|virginm|bt|sky|orange|telefonica|optimum|frontier|centurylink|windstream|mediacom|cableone|starlink|googlefiber)\./.test(domain)
      || /(amazonaws|azure|googleusercontent|cloudfront|akamai|digitalocean|linode|hetzner|ovh)\./.test(domain)) return 'isp';
  return 'organisation';
}

async function reverseDns(ip) {
  if (!ip || ip === '::1' || ip.startsWith('127.')) return null;
  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), RDNS_TIMEOUT_MS)),
    ]);
    return names && names.length ? names[0] : null;
  } catch (e) { return null; }
}

function readBody(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b && typeof b === 'object' ? b : {};
}

// The collector has to stay open for the browser to reach it, so it cannot be
// authenticated. These two checks keep casual abuse from flooding the store and
// evicting real visits through LTRIM. Neither stops a determined scripted
// attacker; the rate limit is what bounds the damage.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // sendBeacon does not always set it
  try { return new URL(origin).host === String(req.headers.host || ''); }
  catch (e) { return false; }
}

async function kvPipeline(kv, cmds) {
  const r = await fetch(kv.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + kv.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  return r.json();
}

module.exports = async (req, res) => {
  // Always succeed from the browser's point of view; never surface an error.
  const done = () => { res.statusCode = 204; res.end(); };
  if (req.method !== 'POST') return done();
  if (!sameOrigin(req)) return done();

  try {
    const kv = kvConfig();
    if (!kv) return done(); // not configured yet — no-op

    const ip = clientIp(req);

    const salt = await hashSalt(kv);
    if (!salt) return done();   // cannot hash safely, so do not record at all

    // Rate limit before doing any work. One stable key per source across all
    // instances, carrying a 60s TTL so nothing identifying outlives the window.
    // EXPIRE ... NX attaches a deadline only when the key has none: a bare
    // EXPIRE on every hit keeps pushing it out, so a source that crossed the
    // threshold could never recover, while no EXPIRE at all would leave a
    // counter with no TTL that climbs forever and blocks that source for good.
    const rateKey = RATE_PREFIX + crypto.createHash('sha256')
      .update(ip + '|rate|' + salt).digest('hex').slice(0, 16);
    const limited = await kvPipeline(kv, [
      ['INCR', rateKey],
      ['EXPIRE', rateKey, '60', 'NX'],
    ]);
    // Fail CLOSED. If the store answers in a shape we cannot read, the limit is
    // unknown — treating that as "zero so far" would quietly disable rate
    // limiting for exactly as long as the store is unhealthy.
    const count = (Array.isArray(limited) && limited[0] && limited[0].result != null)
      ? Number(limited[0].result) : NaN;
    if (!Number.isFinite(count) || count > RATE_PER_MIN) return done();

    const body = readBody(req);
    const h = req.headers;

    const hostname = await reverseDns(ip);
    const domain = hostname ? domainFromHost(hostname) : null;

    const visitorHash = ip
      ? crypto.createHash('sha256').update(ip + '|' + salt).digest('hex').slice(0, 16)
      : null;

    const visit = {
      t: Date.now(),
      path: String(body.path || '').slice(0, 200),
      ref: String(body.ref || '').slice(0, 200),
      country: h['x-vercel-ip-country'] || null,
      region: h['x-vercel-ip-country-region'] || null,
      city: h['x-vercel-ip-city'] ? decodeURIComponent(h['x-vercel-ip-city']) : null,
      org: domain,            // registrable domain only — never the full PTR
      kind: classify(domain),
      visitor: visitorHash,
      mobile: !!body.mobile,
    };

    await kvPipeline(kv, [
      ['LPUSH', LIST_KEY, JSON.stringify(visit)],
      ['LTRIM', LIST_KEY, '0', String(MAX_VISITS - 1)],
    ]);

    // Age out the tail a little on each write: O(1) and converges, so records
    // do not sit in the store indefinitely.
    try {
      const cutoff = Date.now() - RETENTION_DAYS * 86400000;
      const tail = await kvPipeline(kv, [['LINDEX', LIST_KEY, '-1']]);
      const oldest = tail && tail[0] && tail[0].result ? JSON.parse(tail[0].result) : null;
      if (oldest && oldest.t < cutoff) {
        await kvPipeline(kv, Array.from({ length: PRUNE_PER_REQUEST }, () => ['RPOP', LIST_KEY]));
      }
    } catch (e) { /* pruning is best-effort */ }
  } catch (e) { /* swallow — analytics must never affect the visitor */ }

  return done();
};
