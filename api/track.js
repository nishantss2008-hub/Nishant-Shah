// Vercel serverless function — records one visit for the private insights dashboard.
//
// Collects only what answers "who is looking at my site":
//   · coarse location, straight from Vercel's own geo headers (no third party)
//   · the visiting network's organisation, via reverse DNS on the IP
//   · the page, the referrer, and the time
//
// The raw IP is never stored. It is salted and hashed so repeat visits can be
// counted as one person without keeping an identifier that points back at them.
//
// Storage is Upstash/Vercel KV over its REST API. If the KV environment
// variables are absent this function quietly does nothing and returns 204 —
// the site must never break because analytics are unconfigured.
//
// Env: KV_REST_API_URL + KV_REST_API_TOKEN  (or UPSTASH_REDIS_REST_URL/_TOKEN)
//      INSIGHTS_SALT (optional) — changes the hashing salt.

const dns = require('dns').promises;
const crypto = require('crypto');

const LIST_KEY = 'visits';
const MAX_VISITS = 5000;      // rolling window kept in KV
const RDNS_TIMEOUT_MS = 1200; // never let a slow PTR lookup stall the function

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '';
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
  if (/\.gov$/.test(domain) || /\.gov\.[a-z]{2}$/.test(domain)) return 'government';
  if (/\.(mil)$/.test(domain)) return 'government';
  // consumer ISPs — a home or phone connection, not an organisation
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

module.exports = async (req, res) => {
  // Always succeed from the browser's point of view; this must never surface an error.
  const done = () => { res.statusCode = 204; res.end(); };
  if (req.method !== 'POST') return done();

  try {
    const kv = kvConfig();
    if (!kv) return done(); // not configured yet — no-op

    const body = readBody(req);
    const h = req.headers;
    const ip = clientIp(req);

    const hostname = await reverseDns(ip);
    const domain = hostname ? domainFromHost(hostname) : null;

    const salt = process.env.INSIGHTS_SALT || 'nishantshah.us';
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
      org: domain,
      host: hostname,
      kind: classify(domain),
      visitor: visitorHash,
      mobile: !!body.mobile,
    };

    await fetch(kv.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + kv.token, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['LPUSH', LIST_KEY, JSON.stringify(visit)],
        ['LTRIM', LIST_KEY, '0', String(MAX_VISITS - 1)],
      ]),
    });
  } catch (e) { /* swallow — analytics must never affect the visitor */ }

  return done();
};
