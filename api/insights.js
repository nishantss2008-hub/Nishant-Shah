// Vercel serverless function — aggregated visit data for the private dashboard.
//
// This is the thing that is actually protected. The dashboard page itself is
// just empty markup; without the token it can be opened and shows nothing.
// Guarding the data rather than the HTML is what makes the page safe to host
// on the same domain as the public site.
//
// Env: INSIGHTS_TOKEN  — required; the dashboard password. No token set means
//                        the endpoint stays closed rather than open.
//
// The token is only ever accepted in the x-insights-key header, never in the
// query string, so it cannot leak into request logs or browser history.
//      KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/_TOKEN)

const crypto = require('crypto');

const LIST_KEY = 'visits';

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

// Length-independent comparison so the token can't be guessed a character at a time.
function sameToken(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function tally(rows, pick) {
  const m = new Map();
  for (const r of rows) {
    const k = pick(r);
    if (!k) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const expected = process.env.INSIGHTS_TOKEN;
  if (!expected) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'setup', message: 'INSIGHTS_TOKEN is not set in Vercel.' }));
  }

  // Header only, never a query parameter. A ?key= in the URL would be copied
  // into Vercel's request logs, the browser's history, and any Referer header
  // the page later sends — all places a password must not end up. The dashboard
  // accepts #key=... in the fragment, which browsers never transmit, and then
  // sends it from script as this header.
  const given = String(req.headers['x-insights-key'] || '');

  if (!given || !sameToken(given, expected)) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'unauthorized' }));
  }

  const kv = kvConfig();
  if (!kv) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'setup', message: 'No KV store connected in Vercel.' }));
  }

  let rows = [];
  try {
    const r = await fetch(kv.url + '/lrange/' + LIST_KEY + '/0/-1', {
      headers: { Authorization: 'Bearer ' + kv.token },
    });
    const j = await r.json();
    rows = (j.result || []).map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
  } catch (e) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'store', message: String(e.message || e) }));
  }

  const days = Math.max(1, Math.min(365, parseInt((req.url.match(/[?&]days=(\d+)/) || [])[1] || '30', 10)));
  const since = Date.now() - days * 86400000;
  const recent = rows.filter(r => r.t >= since);

  const named = recent.filter(r => r.kind === 'education' || r.kind === 'government' || r.kind === 'organisation');

  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    days,
    totalStored: rows.length,
    visits: recent.length,
    visitors: new Set(recent.map(r => r.visitor).filter(Boolean)).size,
    identifiedRate: recent.length ? Math.round((named.length / recent.length) * 100) : 0,
    education:    tally(recent.filter(r => r.kind === 'education'),    r => r.org),
    organisations:tally(recent.filter(r => r.kind === 'organisation'), r => r.org),
    government:   tally(recent.filter(r => r.kind === 'government'),   r => r.org),
    countries:    tally(recent, r => r.country),
    cities:       tally(recent, r => [r.city, r.region, r.country].filter(Boolean).join(', ')),
    pages:        tally(recent, r => r.path),
    referrers:    tally(recent.filter(r => r.ref), r => { try { return new URL(r.ref).hostname; } catch (e) { return null; } }),
    recentNamed: named.slice(0, 60).map(r => ({ t: r.t, org: r.org, kind: r.kind, path: r.path, city: r.city, country: r.country })),
  }));
};
