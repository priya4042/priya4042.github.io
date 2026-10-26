# -*- coding: utf-8 -*-
"""Android APK downloads: files live on the site repo's GitHub release "apps"; sizes are read from F:\\Desktop\\APKs at build time."""
import os
import html

esc = lambda s: html.escape(s, quote=True)
RELEASE = "https://github.com/priya4042/priya4042.github.io/releases/download/apps/"
APK_ROOT = r"F:\Desktop\APKs"

# slug on the site -> (folder in APKs, version)
DL = {
    "quickscan": ("qr_scanner", "1.3.0"),
    "spendly": ("spendly", "1.0.0"),
    "committee-book": ("committee_book", "1.0.0"),
    "dues": ("dues", "1.0.0"),
    "mca-entrance-prep": ("nimcet_prep", "1.1.0"),
    "daily-english": ("daily_english", "1.0.0"),
    "dotnet-prep": ("dotnet_prep", "1.0.0"),
    "formready": ("formready_app", "1.0.0"),
    "hisaab": ("hisaab_app", "1.0.0"),
    "panchang": ("panchang_app", "1.0.0"),
    "biodata": ("biodata_app", "1.0.0"),
    "rozana": ("rozana_app", "1.0.0"),
    "zameen": ("zameen_app", "1.0.0"),
    "tuition": ("tuition_app", "1.0.0"),
    "shagun": ("shagun_app", "1.0.0"),
    "vehicle": ("vehicle_app", "1.0.0"),
}

def files(slug):
    """(new-phone file, old-phone file, MB, MB) or None when the APKs are not built."""
    if slug not in DL:
        return None
    folder, ver = DL[slug]
    a, b = f"{slug}-{ver}-arm64.apk", f"{slug}-{ver}-old-phones.apk"
    pa, pb = os.path.join(APK_ROOT, folder, a), os.path.join(APK_ROOT, folder, b)
    if not (os.path.exists(pa) and os.path.exists(pb)):
        return None
    return a, b, round(os.path.getsize(pa) / 1e6), round(os.path.getsize(pb) / 1e6)

def all_files():
    """Every file to upload to the release, with its path."""
    out = []
    for slug, (folder, ver) in DL.items():
        f = files(slug)
        if f:
            out += [(f[0], os.path.join(APK_ROOT, folder, f[0])), (f[1], os.path.join(APK_ROOT, folder, f[1]))]
    return out

def block(a, up):
    """Download buttons for an app page or card; empty when there is no APK."""
    f = files(a["slug"])
    if not f:
        return ""
    return f"""<div class="dl-box">
      <a class="btn btn-dl" href="{RELEASE}{f[0]}" download><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg><span data-i18n="dl.btn">Download for Android</span> <small>APK, {f[2]} MB</small></a>
      <p class="dl-note"><a href="{RELEASE}{f[1]}" download data-i18n="dl.old">Older phone (before 2017)? Get this one</a> ({f[3]} MB) &middot; <a href="{up}download.html#how" data-i18n="dl.how">How to install</a></p>
    </div>"""

def page(apps, head, header, footer, site_url):
    rows = ""
    for a in apps:
        f = files(a["slug"])
        if not f:
            continue
        rows += f"""<article class="dl-row">
      <img src="assets/apps/{a['slug']}.png" alt="" width="64" height="64" loading="lazy">
      <div class="dl-txt"><h3><a href="apps/{a['slug']}.html">{esc(a['name'])}</a></h3><p data-i18n="app.{a['slug']}">{esc(a['what'])}</p>
        <p class="dl-meta">v{DL[a['slug']][1]} &middot; {esc(a['langs'])}</p></div>
      <div class="dl-btns"><a class="btn btn-dl" href="{RELEASE}{f[0]}" download><span data-i18n="dl.short">Download</span> <small>{f[2]} MB</small></a>
        <a class="link" href="{RELEASE}{f[1]}" download data-i18n="dl.oldshort">Older phone</a></div>
    </article>"""
    steps_en = ["Tap <b>Download</b> on the app you want. Chrome may say the file can be harmful; tap <b>Download anyway</b>. It is the same app that is coming to Google Play.",
                "Open the downloaded file from the notification or from <b>Files &gt; Downloads</b>.",
                "If Android asks, allow <b>Install unknown apps</b> for Chrome or Files, then go back and tap <b>Install</b>.",
                "Google Play Protect may ask to scan the app. Tap <b>Scan app</b> or <b>Install anyway</b>.",
                "Open the app. You can turn the permission off again in Settings afterwards."]
    steps_hi = ["जो ऐप चाहिए उस पर <b>डाउनलोड</b> दबाएँ। Chrome कह सकता है कि फ़ाइल नुकसानदेह हो सकती है; <b>फिर भी डाउनलोड करें</b> दबाएँ। यह वही ऐप है जो Google Play पर आ रहा है।",
                "डाउनलोड हुई फ़ाइल नोटिफ़िकेशन से या <b>Files &gt; Downloads</b> से खोलें।",
                "Android पूछे तो Chrome या Files के लिए <b>अनजान ऐप इंस्टॉल करने</b> की अनुमति दें, फिर वापस आकर <b>इंस्टॉल</b> दबाएँ।",
                "Google Play Protect ऐप स्कैन करने को कह सकता है। <b>ऐप स्कैन करें</b> या <b>फिर भी इंस्टॉल करें</b> दबाएँ।",
                "ऐप खोलें। बाद में यह अनुमति सेटिंग्स में फिर से बंद कर सकते हैं।"]
    steps = "".join(f'<li><span data-only="en">{e}</span><span data-only="hi" lang="hi">{h}</span></li>' for e, h in zip(steps_en, steps_hi))
    url = f"{site_url}download.html"
    return f"""{head("Download the apps - Priya Tech Labs", "Download Priya Tech Labs Android apps as APK files and install them on your phone, free.", url, depth=0)}
{header("")}
<main id="main" class="dl-page">
  <section class="dl-hero">
    <h1 data-i18n="dl.h1">Download the apps</h1>
    <p data-i18n="dl.lede">Every app is free. Until they reach Google Play, you can install them straight from here. Pick the one you need, download it, and install it in a minute.</p>
  </section>
  <section class="dl-list" aria-label="Apps">{rows}</section>
  <section class="dl-how" id="how">
    <h2 data-i18n="dl.howh">How to install an APK</h2>
    <ol>{steps}</ol>
    <h3 data-i18n="dl.whichh">Which file do I need?</h3>
    <p data-i18n="dl.which">The main Download button works on almost every phone sold since 2017. Use the older-phone file only if Android says the app is not compatible.</p>
    <h3 data-i18n="dl.playh">When the app comes to Google Play</h3>
    <p data-i18n="dl.play">Keep using the copy you have. If Google Play says it cannot update it, uninstall this copy and install it from Google Play. First use the app's Back up my data option, where there is one, so you keep your data.</p>
  </section>
</main>
{footer("")}"""
