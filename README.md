# So Excited — site

Public pages for the So Excited app, served by GitHub Pages at https://soexcitedapp.com:

- `index.html` — landing page
- `privacy.html` — privacy policy (linked from the RevenueCat paywall and App Store Connect)
- `terms.html` — terms of use, including the So Excited Plus subscription terms
- `support.html` — support and FAQ
- `app/` — soexcitedapp.com/app, the link share cards carry: the App Store once So Excited is on it, the site until then
- `store.js` — checks Apple's lookup service; shows the App Store badge (and sends /app to the App Store) only once the app is released. The configured Apple ID is `6816685893` (provided from App Store Connect).
- `home.css`, `home.js` — Big Day Energy landing page and accessible feature tour
- `style.css` — shared support and legal page styles
- `media/` — app screenshots, app icon, ticket celebration video, and Apple's unmodified App Store badges

The landing page uses the Big Day Energy design: burnt orange, cream, and green, with real artwork from the app's marketing/app-store assets. Support and legal pages share the palette and app icon, with their existing dark appearance preserved.

The feature tour advances every 7 seconds while visible. It pauses on hover, stops after manual selection or keyboard focus, and offers a Play/Pause control. Reduced Motion disables automatic playback by default. The App Store release detection and /app redirect remain in store.js.

When you change `style.css`, bump the `?v=` in each page's stylesheet link (GitHub Pages caches for 10 minutes).

## App Store release configuration

The configured Apple ID is `6816685893`, supplied by the app owner on October 12, 2026.
Apple’s US lookup returned zero results on that date, so the public listing’s
name, seller, and bundle ID could not yet be independently verified.
In App Store Connect, open **My Apps → So Excited → App Information → Apple ID**.
Copy that numeric ID (not the bundle ID, SKU, or developer/team ID) into `APP_ID`
in `store.js`. Bump the `store.js?v=` value in both `index.html` and `app/index.html`
when changing the configuration so visitors load the new script.

Verify the ID against the So Excited App Store Connect record before committing.
Once released, check `https://itunes.apple.com/lookup?id=<APPLE_ID>&country=us&entity=software`
and confirm the matching `trackId`, `trackName`, seller, and bundle ID. The site
currently uses the US storefront; a release available only outside the US will
keep the coming-soon state until the configured lookup country is changed.
A missing lookup result is not proof of App Store review status.

Before release (or on a network error or an 8-second timeout), badges stay hidden,
coming-soon text stays visible, and `/app` returns to `/`. After a matching software
listing appears, both badges link directly to `https://apps.apple.com/app/id<APPLE_ID>`
and `/app` redirects there. Each visit checks again; no negative result is stored.
JavaScript-disabled visits retain the homepage fallback. The redirect page also
has a manual homepage link if the script itself fails to load.

Run `node --test tests/store.test.cjs` for isolated pre-release, post-release,
lookup failure, timeout, invalid response, and page integration checks. The numeric
ID used in tests is a synthetic fixture, never production configuration. These
checks simulate Apple's responses; they do not establish actual app availability.
