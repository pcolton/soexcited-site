// Shows the App Store badge (and sends soexcitedapp.com/app to the App Store)
// only once So Excited is actually on the App Store: Apple's lookup service
// lists an app only after it's released. Until then the page says "Coming soon".
// Set APP_ID to the App Store Connect Apple ID once the app record exists.
(function () {
  var APP_ID = "";
  var STORE_URL = "https://apps.apple.com/app/id" + APP_ID;
  var redirects = document.documentElement.dataset.redirect;
  window.__soExcitedStore = function (data) {
    var live = data && data.resultCount > 0;
    if (redirects) {
      location.replace(live ? STORE_URL : "/");
      return;
    }
    if (!live) return;
    document.querySelectorAll("[data-store-badge]").forEach(function (el) { el.hidden = false; });
    document.querySelectorAll("[data-store-soon]").forEach(function (el) { el.hidden = true; });
  };
  if (!APP_ID) {
    window.__soExcitedStore(null);
    return;
  }
  var script = document.createElement("script");
  script.src = "https://itunes.apple.com/lookup?id=" + APP_ID + "&callback=__soExcitedStore&t=" + Date.now();
  script.onerror = function () { if (redirects) location.replace("/"); };
  document.head.appendChild(script);
})();
