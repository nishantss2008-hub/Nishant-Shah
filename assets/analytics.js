/* ============================================================
   analytics.js — Google Analytics 4 (gtag.js)
   ------------------------------------------------------------
   The standard gtag snippet, kept in one file instead of pasted
   into eight <head>s, so the measurement ID has a single home.
   Loads the tag asynchronously and queues the js/config calls on
   dataLayer exactly as the inline snippet does — gtag.js drains
   that queue whenever it finishes loading.

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
})();
