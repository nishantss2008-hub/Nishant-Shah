/* ============================================================
   analytics.js — Google Analytics 4 (gtag.js)
   ------------------------------------------------------------
   The standard gtag snippet, kept in one file instead of pasted
   into eight <head>s, so the measurement ID has a single home.
   Loads the tag asynchronously and queues the js/config calls on
   dataLayer exactly as the inline snippet does — gtag.js drains
   that queue whenever it finishes loading.

   Also pings /api/track, which records the visit for the private
   insights dashboard (coarse location + the visiting network's
   organisation, so an .edu visit is visible). That call is fire and
   forget: if the endpoint is missing or unconfigured nothing here
   changes, and the page never waits on it.

   Add to a page with:  <script src="assets/analytics.js"></script>
   ============================================================ */
(function () {
  var ID = 'G-X2N3HEHKP5';

  window.dataLayer = window.dataLayer || [];
  // must stay a real global: any inline gtag(...) call on a page relies on it
  window.gtag = function () { window.dataLayer.push(arguments); };

  gtag('js', new Date());
  gtag('config', ID);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  (document.head || document.documentElement).appendChild(s);

  /* ---- private insights beacon ---- */
  try {
    var payload = JSON.stringify({
      path: location.pathname + location.search,
      ref: document.referrer || '',
      mobile: matchMedia('(max-width: 768px)').matches
    });
    // sendBeacon survives the page being closed straight after load
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: payload, keepalive: true }).catch(function () {});
    }
  } catch (e) { /* never let analytics break a page */ }
})();
