# So Excited — site

Public pages for the So Excited app, served by GitHub Pages at https://soexcitedapp.com:

- `index.html` — landing page
- `privacy.html` — privacy policy (linked from the RevenueCat paywall and App Store Connect)
- `terms.html` — terms of use, including the So Excited Plus subscription terms
- `support.html` — support and FAQ
- `app/` — soexcitedapp.com/app, the link share cards carry: the App Store once So Excited is on it, the site until then
- `store.js` — checks Apple's lookup service; shows the App Store badge (and sends /app to the App Store) only once the app is released. Set `APP_ID` once the App Store Connect record exists.
- `media/` — Apple's App Store badges (toolbox.marketingtools.apple.com, unmodified)

Colors come from the app's themes: Sunday Paper (light) and Evening Edition (dark). The ticket on the home page mirrors the app's `TicketView`. `icon.svg` is a stand-in until the app icon refresh.

When you change `style.css`, bump the `?v=` in each page's stylesheet link (GitHub Pages caches for 10 minutes).
