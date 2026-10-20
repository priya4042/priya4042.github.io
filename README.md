# Priya Tech Labs website

Static site (no build step): `index.html`, `styles.css`, `main.js`, `assets/`, `privacy/`.

- Preview locally: `python -m http.server 8790` in this folder, then open http://localhost:8790
- Host on GitHub Pages: push to a repo named `priya4042.github.io` and it is served at https://priya4042.github.io/
- App privacy policies live at `privacy/<app>.html` - paste those URLs into Play Console.

To add an app: copy one `<article class="app">` block in `index.html`, put its 192x192 icon in `assets/apps/`
and an optional screenshot (540px wide, .webp) in `assets/shots/`. When an app goes live on Google Play,
change its badge to `<span class="badge badge-live">On Google Play</span>` and its first link to the Play URL.
