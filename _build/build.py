# -*- coding: utf-8 -*-
"""
Builds the per-app pages (apps/<slug>.html), sitemap.xml and the share image (assets/og.png)
from the APPS list below. Run after editing an app:   python _build/build.py
"""
import os, sys, json, html, glob, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content as C

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = "https://priya4042.github.io/"   # change when a custom domain is added
EMAIL = "priyatechlabs9@gmail.com"

# status: "testing" | "soon" | "live"   (live -> set play to the Play Store URL)
APPS = [
    dict(slug="quickscan", name="QuickScan: QR & Barcode", short="QuickScan", status="testing", cat="Utility",
         package="com.priyatechlabs.quickscan", version="1.3.0", langs="English, Hindi", offline=True, ads=True,
         what="Scan or create any QR code or barcode, fast and offline.",
         about="QuickScan reads every common QR code and barcode and knows what to do with it: join the Wi-Fi, pay with UPI, save the contact, add the event. It also makes codes - with your logo and a caption - and keeps everything you scan or create in one place.",
         feats=["Smart results for Wi-Fi, UPI payments, contacts, calendar events and links",
                "Create 12 code types, with your own logo and a caption under the code",
                "My Codes wallet for the codes you use every day",
                "History with favourites and search",
                "Batch scanning with CSV export",
                "Reads results aloud, in English and Hindi"],
         faq=[("Is QuickScan free?", "Yes. It is free with small ads."),
              ("Does it work without internet?", "Yes. Scanning and creating codes happen on your phone."),
              ("How do I get it before it's public?", "Join the test: send your Gmail address and you'll get a Google Play invite link. Google asks new apps to run a 14-day test with at least 12 people.")],
         privacy="https://sites.google.com/view/quickscan-app-privacy/home", github="https://github.com/priya4042/quickscan-qr-barcode", shots=2),
    dict(slug="spendly", name="Spendly", short="Spendly", status="soon", cat="Money",
         package="com.priyatechlabs.spendly", version="1.0.0", langs="English, Hindi", offline=True, ads=True,
         what="A private, offline money manager for income, spending, budgets and savings.",
         about="Spendly keeps your money on your phone, not on a server. Add what you earn and spend in a couple of taps, set budgets, track savings goals, and keep track of who owes whom.",
         feats=["Wallets for cash, bank and cards", "Budgets and recurring entries",
                "Savings goals and a round-up jar", "Udhaar: lend and borrow tracking",
                "Bill splitting and EMI tracker", "Charts, calendar heatmap, PIN or fingerprint lock"],
         faq=[("Where is my data stored?", "Only on your phone. There is no account and no server."),
              ("Can I lock the app?", "Yes, with a PIN or your fingerprint."),
              ("Is there a dark mode?", "Yes.")],
         privacy="", github="https://github.com/priya4042/spendly-budget-tracker", shots=4),
    dict(slug="committee-book", name="Committee Book: BC & Chit", short="Committee Book", status="soon", cat="Money",
         package="com.priyatechlabs.committee_book", version="1.0.0", langs="English, Hindi", offline=True, ads=True,
         what="Run your committee, BC or chit group: who paid, whose turn it is, and how much cash is in hand.",
         about="Committee Book replaces the notebook for savings groups. The organiser records payments and payouts; members can see their own status live once the organiser approves them.",
         feats=["Turn order or lucky draw", "Partial payments and late fines", "Bidding / auction chits",
                "Members view live after the organiser approves them", "WhatsApp and UPI reminders",
                "PDF statements"],
         faq=[("Do members need to install the app?", "Only if they want to see their status live. The organiser can run everything alone."),
              ("Is my group's data shared?", "Only if the organiser turns on live sharing, and then only with members they approve."),
              ("Does it support bidding chits?", "Yes, as well as fixed turn order and lucky draw.")],
         privacy="../privacy/committee-book.html", github="", shots=5),
    dict(slug="dues", name="Dues", short="Dues", status="soon", cat="Money",
         package="com.priyatechlabs.dues", version="1.0.0", langs="English", offline=True, ads=True,
         what="Never miss a bill, recharge, EMI, subscription or warranty date again.",
         about="Add a bill once and Dues reminds you before it's due, on the day, and again if it's overdue - then lets you pay from the reminder with UPI.",
         feats=["Reminders before the due date, on the day and when overdue", "Pay with a UPI link straight from the reminder",
                "Recharges, EMIs, subscriptions and warranties in one list", "Calendar view of everything coming up",
                "Spending insights", "EMI instalment progress"],
         faq=[("Does Dues pay my bills automatically?", "No. It reminds you and opens your UPI app with the details filled in."),
              ("Does it need internet?", "No. Reminders run on your phone.")],
         privacy="", github="", shots=0),
    dict(slug="mca-entrance-prep", name="MCA Entrance Prep", short="MCA Entrance Prep", status="soon", cat="Study",
         package="com.priyatechlabs.nimcet_prep", version="1.1.0", langs="English, Hindi", offline=True, ads=False,
         what="Complete preparation for NIMCET and 10 other MCA entrance exams, with no ads.",
         about="Everything for MCA entrance exams in one app: past papers, predicted papers, a trick for every question, real-format mocks, and the college information you need after the exam.",
         feats=["Thousands of past-paper questions", "48 predicted papers", "An easy trick for every question",
                "Timed mocks in the real exam format", "Study plan and exam-date reminders",
                "College cut-offs and rank prediction"],
         faq=[("Which exams does it cover?", "NIMCET plus 10 other MCA entrance exams, including CUET PG, MAH MCA CET, WB JECA and Jamia MCA."),
              ("Are there ads?", "No."),
              ("Does it work offline?", "Yes. News and exam-date updates need internet; everything else works offline.")],
         privacy="../privacy/mca-entrance-prep.html", github="", shots=7),
    dict(slug="daily-english", name="Daily English", short="Daily English", status="soon", cat="Study",
         package="com.priyatechlabs.dailyenglish", version="1.0.0", langs="English, Hindi", offline=True, ads=True,
         what="Learn to speak English with a coach that listens and checks your pronunciation.",
         about="Daily English is practice for speaking, not just reading. Say a word or a sentence and it tells you how close you were, with US and UK audio to copy.",
         feats=["Speak and check: pronunciation scored by speech recognition", "US and UK pronunciation audio",
                "Grammar, word usage and everyday phrases", "Spoken two-person dialogues",
                "Quizzes and favourites", "Daily reminder"],
         faq=[("Is my voice recorded?", "No. Speech is checked on your phone and is not saved or uploaded."),
              ("Who is it for?", "Anyone who understands English but wants to speak it with more confidence.")],
         privacy="../privacy/daily-english.html", github="https://github.com/priya4042/Daily-English", shots=0),
    dict(slug="dotnet-prep", name="DotNet Interview Prep", short="DotNet Interview Prep", status="soon", cat="Study",
         package="com.priyatechlabs.dotnetprep", version="1.0.0", langs="English", offline=True, ads=True,
         what="About 1,300 .NET, C#, SQL, DSA and system design interview questions with answers, offline.",
         about="Built for .NET developers preparing for product-company interviews: questions with clear answers, the DSA patterns that come up again and again, and tools to practise saying it out loud.",
         feats=["About 1,300 questions across .NET, C#, SQL, DSA and system design", "Blind 75 and 18 DSA patterns",
                "Amazon leadership principles", "Mock interviews and MCQ quizzes",
                "Spaced-repetition review", "STAR story builder and readiness score"],
         faq=[("Does it need internet?", "No. All questions and answers are in the app."),
              ("Is it only for .NET?", "The core is .NET and C#, but DSA, SQL and system design apply to any backend role.")],
         privacy="../privacy/dotnet-prep.html", github="https://github.com/priya4042/dotnet-prep", shots=5),
    dict(slug="reelcut", name="ReelCut", short="ReelCut", status="soon", cat="Tools",
         package="com.reelcut.app", version="1.0.0", langs="English", offline=True, ads=False,
         what="Turn your own long videos into Shorts, Reels and TikToks, entirely on your phone.",
         about="Pick a long video you recorded and ReelCut cuts it into vertical clips, keeps faces in frame, adds your title and watermark, and saves them to your gallery. Nothing is uploaded - it has no internet permission at all.",
         feats=["Auto-split into clips of any length", "AI highlights: picks the liveliest moments",
                "Face-centred smart crop", "9:16, 1:1 and 4:5 presets", "Title, watermark and background music",
                "Manual trim, then share straight to your apps"],
         faq=[("Are my videos uploaded?", "No. Everything happens on your phone and the app has no internet permission."),
              ("Can I use it with YouTube links?", "No - ReelCut works with videos you recorded or own.")],
         privacy="../privacy/reelcut.html", github="https://github.com/priya4042/reelcut", shots=2),
]

BADGE = {"testing": ("badge-testing", "Testing on Google Play", "badge.testing"),
         "soon": ("badge-soon", "Coming to Google Play", "badge.soon"),
         "live": ("badge-live", "On Google Play", "badge.live")}

def esc(s): return html.escape(s, quote=True)

def head(title, desc, url, depth=1):
    up = "../" * depth
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE_URL}assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1D1B4C">
<link rel="icon" href="{up}assets/mark.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Hind:wght@400;500;600&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add("js");try{{var t=localStorage.getItem("ptl-theme");if(t)document.documentElement.dataset.theme=t;var l=localStorage.getItem("ptl-lang");if(l==="hi")document.documentElement.lang="hi"}}catch(e){{}}</script>
<link rel="stylesheet" href="{up}styles.css">
</head>"""

def header(up, home_links=True):
    nav = (f'<a href="{up}#apps" data-i18n="nav.apps">Apps</a><a href="{up}#web" data-i18n="nav.web">Websites</a>'
           f'<a href="{up}#about" data-i18n="nav.about">About</a>')
    return f"""<body>
<a class="skip" href="#main" data-i18n="skip">Skip to content</a>
<header class="top">
  <a class="brand" href="{up}" aria-label="Priya Tech Labs home"><img class="mark" src="{up}assets/mark.svg" alt="" width="30" height="30"><span>Priya Tech Labs</span></a>
  <nav aria-label="Main">{nav}<a class="nav-cta" href="{up}#contact" data-i18n="nav.work">Work with me</a></nav>
  <div class="toggles">
    <button class="tgl" data-search-open aria-label="Search apps and sites" title="Search (Ctrl+K)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></button>
    <button class="tgl" data-lang-toggle aria-label="Switch language">हिंदी</button>
    <button class="tgl" data-theme-toggle aria-label="Switch dark mode"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="sun" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/><path class="moon-i" d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg></button>
  </div>
</header>"""

def footer(up):
    return f"""<footer class="foot">
  <p>© 2026 Priya Tech Labs · <a href="mailto:{EMAIL}">{EMAIL}</a></p>
  <nav aria-label="Footer"><a href="{up}#apps" data-i18n="nav.apps">Apps</a><a href="{up}#web" data-i18n="nav.web">Websites</a><a href="{up}#guides" data-i18n="nav.guides">Guides</a><a href="{up}press.html" data-i18n="nav.press">Press kit</a><a href="{up}#contact" data-i18n="nav.work">Work with me</a></nav>
</footer>
<button class="to-top" type="button" hidden aria-label="Back to top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
<a class="wa" href="#" hidden aria-label="Chat on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7a.6.6 0 0 0 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z"/></svg></a>
<script src="{up}site.config.js"></script>
<script src="{up}i18n.js"></script>
<script src="{up}main.js"></script>
</body>
</html>"""

def cta(a):
    if a["status"] == "live" and a.get("play"):
        return f'<a class="btn btn-primary" href="{a["play"]}" target="_blank" rel="noopener" data-i18n="cta.play">Get it on Google Play</a>'
    if a["status"] == "testing":
        return f"""<form class="inline-form" data-form="tester" data-app="{esc(a['short'])}">
          <label class="sr" for="tg-{a['slug']}" data-i18n="form.gmail">Your Gmail address</label>
          <input id="tg-{a['slug']}" type="email" name="email" required placeholder="you@gmail.com" autocomplete="email">
          <button class="btn btn-primary" type="submit" data-i18n="cta.tester">Become a tester</button>
          <p class="form-msg" role="status"></p>
        </form>
        <div class="tester-count" hidden><div class="tc-bar"><i></i></div><span></span></div>"""
    return f"""<form class="inline-form" data-form="notify" data-app="{esc(a['short'])}">
          <label class="sr" for="nf-{a['slug']}" data-i18n="form.email">Your email address</label>
          <input id="nf-{a['slug']}" type="email" name="email" required placeholder="you@example.com" autocomplete="email">
          <button class="btn btn-primary" type="submit" data-i18n="cta.notify">Tell me when it launches</button>
          <p class="form-msg" role="status"></p>
        </form>"""

def app_page(a):
    url = f"{SITE_URL}apps/{a['slug']}.html"
    cls, label, key = BADGE[a["status"]]
    meta = [f'<span data-i18n="meta.android">Android</span>', f'<span>v{a["version"]}</span>', f'<span>{esc(a["langs"])}</span>']
    if a["offline"]: meta.append('<span data-i18n="meta.offline">Works offline</span>')
    meta.append(f'<span data-i18n="{"meta.ads" if a["ads"] else "meta.noads"}">{"Free with ads" if a["ads"] else "Free, no ads"}</span>')
    gallery = ""
    if a["shots"]:
        imgs = "".join(f'<li><img src="../assets/gallery/{a["slug"]}-{i}.webp" alt="{esc(a["short"])} screen {i}" width="432" height="786" loading="lazy"></li>' for i in range(1, a["shots"] + 1))
        gallery = f"""<section class="gallery" aria-labelledby="g-h">
  <div class="gallery-head"><h2 id="g-h" data-i18n="page.screens">Screens</h2>
    <div class="g-btns"><button class="g-btn" data-g="-1" aria-label="Previous screen"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><button class="g-btn" data-g="1" aria-label="Next screen"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></div></div>
  <ul class="g-track" tabindex="0" aria-label="Screenshots, scroll sideways">{imgs}</ul>
</section>"""
    feats = "".join(f"<li>{esc(f)}</li>" for f in a["feats"])
    faq = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(ans)}</p></details>" for q, ans in a["faq"])
    links = []
    if a["privacy"]: links.append(f'<a class="link" href="{a["privacy"]}" data-i18n="link.privacy">Privacy policy</a>')
    if a["github"]: links.append(f'<a class="link" href="{a["github"]}" target="_blank" rel="noopener" data-i18n="link.code">View the code</a>')
    others = "".join(f'<a class="more-app" href="{o["slug"]}.html"><img src="../assets/apps/{o["slug"]}.png" alt="" width="56" height="56" loading="lazy"><span>{esc(o["short"])}</span></a>'
                     for o in APPS if o["slug"] != a["slug"])
    ld = {"@context": "https://schema.org", "@type": "MobileApplication", "name": a["name"], "operatingSystem": "Android",
          "applicationCategory": {"Money": "FinanceApplication", "Study": "EducationalApplication", "Utility": "UtilitiesApplication", "Tools": "MultimediaApplication"}[a["cat"]],
          "description": a["what"], "url": url, "image": f"{SITE_URL}assets/apps/{a['slug']}.png",
          "author": {"@type": "Organization", "name": "Priya Tech Labs", "url": SITE_URL}}
    return f"""{head(f"{a['name']} - Priya Tech Labs", a["what"], url)}
{header("../")}
<main id="main" class="app-page" style="--app-accent:{a.get('accent', '#1D1B4C')}">
  <section class="ap-hero">
    <img class="ap-icon" src="../assets/apps/{a['slug']}.png" alt="{esc(a['short'])} icon" width="112" height="112">
    <div class="ap-copy">
      <p class="crumbs"><a href="../#apps" data-i18n="nav.apps">Apps</a> / <span data-i18n="cat.{a['cat'].lower()}">{a['cat']}</span></p>
      <h1>{esc(a['name'])}</h1>
      <span class="badge {cls}" data-i18n="{key}">{label}</span>
      <p class="ap-what" data-i18n="app.{a['slug']}">{esc(a['what'])}</p>
      <p class="ap-meta">{''.join(meta)}</p>
      {cta(a)}
    </div>
  </section>
  {gallery}
  <section class="ap-about">
    <div><h2 data-i18n="page.about">What it does</h2><p>{esc(a['about'])}</p></div>
    <div><h2 data-i18n="page.features">Features</h2><ul class="feats">{feats}</ul></div>
  </section>
  <section class="ap-faq"><h2 data-i18n="page.faq">Questions people ask</h2>{faq}
    <p class="ap-links">{' '.join(links)}</p></section>
  <section class="ap-share" aria-labelledby="sh-h">
    <div class="share-copy">
      <h2 id="sh-h" data-i18n="share.h">Share {esc(a['short'])}</h2>
      <p data-i18n="{'share.p.test' if a['status'] == 'testing' else 'share.p'}">{'Every tester helps it reach Google Play sooner. Send it to a friend.' if a['status'] == 'testing' else 'Know someone who needs this? Send it their way.'}</p>
      <div class="share-btns" data-share-url="{url}" data-share-text="{esc(a['short'])} - {esc(a['what'])}">
        <a class="btn btn-wa" href="https://wa.me/?text={html.escape(urllib.parse.quote(a['short'] + ' - ' + a['what'] + ' ' + url))}" target="_blank" rel="noopener" data-i18n="share.wa">Share on WhatsApp</a>
        <button class="btn btn-ghost" type="button" data-copy-link data-i18n="share.copy">Copy link</button>
        <button class="btn btn-ghost" type="button" data-native-share hidden data-i18n="share.more">More options</button>
      </div>
    </div>
    <figure class="qr"><img src="../assets/qr/{a['slug']}.svg" alt="QR code that opens this page" width="180" height="180" loading="lazy"><figcaption data-i18n="share.qr">Scan to open on your phone</figcaption></figure>
  </section>
  <section class="ap-more"><h2 data-i18n="page.more">More apps</h2><div class="more-row">{others}</div></section>
</main>
<script type="application/ld+json">{json.dumps(ld)}</script>
{footer("../")}"""

def sitemap():
    urls = [SITE_URL, f"{SITE_URL}press.html"] + [f"{SITE_URL}apps/{a['slug']}.html" for a in APPS] + \
           [f"{SITE_URL}guides/{g['slug']}.html" for g in C.GUIDES] + \
           [f"{SITE_URL}privacy/{os.path.basename(p)}" for p in sorted(glob.glob(os.path.join(ROOT, "privacy", "*.html")))]
    body = "".join(f"<url><loc>{u}</loc></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n'

def og_image():
    from PIL import Image, ImageDraw, ImageFont
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (29, 27, 76))
    d = ImageDraw.Draw(im)
    # marigold glow bottom-right
    glow = Image.new("L", (W, H), 0); gd = ImageDraw.Draw(glow)
    for r in range(520, 0, -8):
        gd.ellipse((W - 160 - r, H + 40 - r, W - 160 + r, H + 40 + r), fill=int(150 * (1 - r / 520)))
    im = Image.composite(Image.new("RGB", (W, H), (245, 165, 36)), im, glow)
    d = ImageDraw.Draw(im)
    fp = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", "bahnschrift.ttf")
    big = ImageFont.truetype(fp, 76); mid = ImageFont.truetype(fp, 34); small = ImageFont.truetype(fp, 30)
    for i in range(9):   # brand mark
        x, y = 70 + (i % 3) * 26, 70 + (i // 3) * 26
        d.rounded_rectangle((x, y, x + 22, y + 22), 6, fill=(245, 165, 36) if i == 4 else (255, 255, 255))
    d.text((170, 78), "Priya Tech Labs", font=mid, fill="white")
    d.text((70, 210), "Small apps that make", font=big, fill="white")
    d.text((70, 296), "everyday India easier.", font=big, fill="white")
    d.text((70, 410), "Android apps and websites for money, study and daily life", font=small, fill=(205, 207, 240))
    x = 70
    for a in APPS:
        ic = Image.open(os.path.join(ROOT, "assets", "apps", a["slug"] + ".png")).convert("RGBA").resize((84, 84))
        m = Image.new("L", (84, 84), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 83, 83), 22, fill=255)
        im.paste(ic, (x, 488), m); x += 104
    im.save(os.path.join(ROOT, "assets", "og.png"), optimize=True)

if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "apps"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "guides"), exist_ok=True)
    C.qr_codes(ROOT, SITE_URL, APPS)
    for a in APPS:
        with open(os.path.join(ROOT, "apps", a["slug"] + ".html"), "w", encoding="utf-8") as f: f.write(app_page(a))
    for g in C.GUIDES:
        with open(os.path.join(ROOT, "guides", g["slug"] + ".html"), "w", encoding="utf-8") as f:
            f.write(C.guide_page(g, head, header, footer, SITE_URL, APPS))
    with open(os.path.join(ROOT, "press.html"), "w", encoding="utf-8") as f:
        f.write(C.press_page(head, header, footer, SITE_URL, APPS))
    with open(os.path.join(ROOT, "assets", "search.json"), "w", encoding="utf-8") as f:
        json.dump(C.search_index(APPS), f, ensure_ascii=False)
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f: f.write(sitemap())
    og_image()
    C.press_zip(ROOT, APPS)
    print(f"built {len(APPS)} app pages, {len(C.GUIDES)} guides, press kit, search index, QR codes, sitemap, og image")
