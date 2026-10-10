# So Excited — site

Public pages for the So Excited app, served by GitHub Pages at https://soexcitedapp.com:

- `index.html` — landing page
- `privacy.html` — privacy policy (linked from the RevenueCat paywall and App Store Connect)
- `terms.html` — terms of use, including the So Excited Plus subscription terms
- `support.html` — support and FAQ
- `app/` — soexcitedapp.com/app, the link share cards carry: the App Store once So Excited is on it, the site until then
- `store.js` — checks Apple's lookup service; shows the App Store badge (and sends /app to the App Store) only once the app is released. Set `APP_ID` once the App Store Connect record exists.
- `home.css`, `home.js` — Big Day Energy landing page and accessible feature tour
- `style.css` — shared support and legal page styles
- `media/` — app screenshots, app icon, ticket celebration video, and Apple's unmodified App Store badges

The landing page uses the Big Day Energy design: burnt orange, cream, and green, with real artwork from the app's marketing/app-store assets. Support and legal pages share the palette and app icon, with their existing dark appearance preserved.

The feature tour advances every 7 seconds while visible. It pauses on hover, stops after manual selection or keyboard focus, and offers a Play/Pause control. Reduced Motion disables automatic playback by default. The App Store release detection and /app redirect remain in store.js.

When you change `style.css`, bump the `?v=` in each page's stylesheet link (GitHub Pages caches for 10 minutes).
