# Priya Tech Labs website

Static site, no build step needed to view it: `index.html`, `styles.css`, `main.js`, `i18n.js`, `site.config.js`.

- Preview locally: `python -m http.server 8790` in this folder, then open http://localhost:8790
- Host on GitHub Pages: push to a public repo named `priya4042.github.io`; it is served at https://priya4042.github.io/
- App privacy policies live at `privacy/<app>.html` - paste those URLs into Play Console.

## Things only you can fill in

All in `site.config.js`:

| Setting | What to put |
|---|---|
| `whatsapp` | Your number with country code, digits only (e.g. `919876543210`). Shows the WhatsApp button. |
| `formEndpoint` | Free Formspree form URL (formspree.io > New form). Until then, forms open the visitor's email app pre-filled. |
| `testers.joined` | How many QuickScan testers have joined (a number). Shows the "x of 12" bar. `null` hides it. |
| `goatcounter` | Your GoatCounter code (goatcounter.com, free, no cookie banner). Turns on visit stats. |
| `quotes` | Real quotes from testers or clients. The section appears only when there is at least one. |

Other files:

- **Your photo**: save it as `assets/me.jpg` (square, about 800x800), then set `photo: "assets/me.jpg"` in `site.config.js`. Until then the About section shows "PK".
- **Google Search Console**: paste its `google-site-verification` meta tag where the comment says in `index.html`, then submit `sitemap.xml`.
- **Custom domain** (e.g. priyatechlabs.in): add a file `CNAME` containing just the domain, point the domain's DNS to GitHub Pages,
  then change `SITE_URL` in `_build/build.py` and the `https://priya4042.github.io/` links in `index.html`, `robots.txt` and the meta tags.
- **AdMob**: `app-ads.txt` already has your publisher ID (pub-7416802415729514). In Play Console set each app's website to this site.

## App pages

`apps/<app>.html`, `sitemap.xml` and the share image `assets/og.png` are generated from the `APPS` list in `_build/build.py`:

```
python _build/build.py
```

When an app goes live on Google Play: set its `status` to `"live"` and add `play="https://play.google.com/store/apps/details?id=..."`
in `_build/build.py`, rebuild, then on `index.html` change its badge to
`<span class="badge badge-live" data-i18n="badge.live">On Google Play</span>`.

Screenshots for an app page go in `assets/gallery/<app>-1.webp`, `-2.webp`... (432px wide) and set `shots=` to the count.

## Languages

English is the text in the HTML. Hindi lives in `i18n.js`; any element with `data-i18n="key"` switches when the key exists there.
App feature lists and FAQs on app pages stay in English.
