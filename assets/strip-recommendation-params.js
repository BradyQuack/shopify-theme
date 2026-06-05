(function () {
  // Recommendation-app tracking params that pollute crawlable URLs.
  // Stripping them from internal links lets Googlebot discover clean
  // /products/<handle> URLs. The app's click beacons fire from their own
  // element-bound listeners, so analytics are preserved — only the
  // navigated URL is cleaned.
  var TRACKING_PARAMS = ['pr_prod_strat', 'pr_rec_id', 'pr_rec_pid', 'pr_ref_pid', 'pr_seq'];

  function cleanLink(a) {
    var href = a.getAttribute('href');
    if (!href || href.indexOf('pr_') === -1) return;
    var url;
    try { url = new URL(href, window.location.origin); } catch (e) { return; }
    if (url.origin !== window.location.origin) return; // same-origin only
    var changed = false;
    TRACKING_PARAMS.forEach(function (p) {
      if (url.searchParams.has(p)) { url.searchParams.delete(p); changed = true; }
    });
    if (changed) a.setAttribute('href', url.pathname + url.search + url.hash);
  }

  function sweep(root) {
    var links = (root || document).querySelectorAll('a[href*="pr_"]');
    for (var i = 0; i < links.length; i++) cleanLink(links[i]);
  }

  function init() {
    sweep(document);
    // Recommendation widgets often render asynchronously; watch for them.
    if ('MutationObserver' in window) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () { pending = false; sweep(document); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
