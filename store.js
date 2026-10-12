// Set APP_ID to the numeric Apple ID from App Store Connect > App Information.
// Leave it empty until verified. A public US lookup result for that exact app
// enables downloads; missing results, errors, and timeouts retain the homepage.
(function () {
  var APP_ID = "6816685893";
  var STORE_URL = "https://apps.apple.com/app/id" + APP_ID;
  var redirects = document.documentElement.dataset.redirect;
  var settled = false;
  var timer;
  var script;

  window.__soExcitedStore = function (data) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (script) script.remove();
    var live = /^[1-9]\d*$/.test(APP_ID) && data && data.resultCount > 0 &&
      Array.isArray(data.results) && data.results.some(function (app) {
        return app && app.wrapperType === "software" && String(app.trackId) === APP_ID;
      });
    if (redirects) {
      location.replace(live ? STORE_URL : "/");
      return;
    }
    if (!live) return;
    function showDownload() {
      document.querySelectorAll("[data-store-badge]").forEach(function (el) {
        el.href = STORE_URL;
        el.hidden = false;
      });
      document.querySelectorAll("[data-store-soon]").forEach(function (el) { el.hidden = true; });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showDownload, { once: true });
    } else {
      showDownload();
    }
  };
  if (!/^[1-9]\d*$/.test(APP_ID)) {
    window.__soExcitedStore(null);
    return;
  }
  script = document.createElement("script");
  script.src = "https://itunes.apple.com/lookup?id=" + APP_ID +
    "&country=us&entity=software&callback=__soExcitedStore&t=" + Date.now();
  script.onerror = function () { window.__soExcitedStore(null); };
  timer = setTimeout(function () { window.__soExcitedStore(null); }, 8000);
  document.head.appendChild(script);
})();
