# -*- coding: utf-8 -*-
"""Guides, websites list, press kit, search index and QR codes - used by build.py."""
import os, json, html, zipfile

SITES = [
    ("Daily Rashifal", "https://priya4042.github.io/daily-rashifal/", "Free daily horoscope for all 12 signs in English and Hindi."),
    ("MCA Prep Hub", "https://priya4042.github.io/mca-prep-hub/", "Free study site for MCA CET and NIMCET with about 690 practice questions."),
    ("Finvest Pro", "https://priya4042.github.io/finvest-pro/", "Check whether a stock is undervalued using 9 valuation models."),
    ("StackPrep", "https://priya4042.github.io/stackprep/", "Offline study companion for full-stack .NET and Angular interviews."),
    ("AnmieLove", "https://priya4042.github.io/anmielove/", "Type a prompt and get an animated video in anime, Ghibli or cartoon style."),
    ("Wellness Bloom", "https://priya4042.github.io/wellness-bloom-women-health-blog/", "Women's health blog with practical everyday guides."),
    ("LibriSphere", "https://priya4042.github.io/librisphere-lms/", "Library management: books, members, issuing, returns and overdue alerts."),
]

GUIDES = [
    dict(slug="join-google-play-test", date="2026-10-20", mins=3, app="quickscan",
         title="How to join an Android app's test on Google Play",
         desc="What a closed test is, why new apps need 12 testers for 14 days, and the four steps to join one.",
         body="""
<p>Before a new app from a new developer account can go public on Google Play, Google asks for a <strong>closed test</strong>: a small group of real people who install the app and keep it for <strong>14 days in a row</strong>. For new personal developer accounts the group must be at least <strong>12 testers</strong>. It is how Google checks that an app works on real phones before the whole world can download it.</p>
<p>Testing costs nothing, takes a minute to set up, and you get the app before everyone else.</p>
<h2>The four steps</h2>
<ol class="steps">
  <li><strong>Send your Gmail address.</strong> The developer adds it to the test list. It has to be the Google account you use for the Play Store on your phone.</li>
  <li><strong>Open the invite link.</strong> You'll get a link that says <em>Become a tester</em>. Tap it while signed in to the same Google account and accept.</li>
  <li><strong>Install from the Play Store.</strong> The invite page has a <em>Download it on Google Play</em> link. The app installs like any other app and updates itself.</li>
  <li><strong>Keep it installed for 14 days.</strong> That's the part that counts. Open it now and then, and if something feels wrong, say so - feedback during the test is exactly what it's for.</li>
</ol>
<h2>Questions testers ask</h2>
<p><strong>Will the developer see my data?</strong> They see the email address you sent them. The app itself works the same as the public version will.</p>
<p><strong>Can I leave the test?</strong> Yes, from the same invite link, any time. Please stay for the 14 days if you can - leaving early can reset the count for the developer.</p>
<p><strong>Do I need to pay?</strong> No.</p>
<h2>Try it now</h2>
<p>QuickScan, my QR and barcode scanner, is in its closed test right now. Send your Gmail from the <a href="../apps/quickscan.html">QuickScan page</a> and you'll get the invite link.</p>
"""),
    dict(slug="run-a-committee-fairly", date="2026-10-20", mins=4, app="committee-book",
         title="How to run a committee (BC) fairly: a simple checklist",
         desc="Fix the rules before the first collection, write everything down, and keep everyone informed - a checklist for small savings groups.",
         body="""
<p>A committee - also called a BC, kitty or chit - is a group that saves together: everyone puts in the same amount every cycle, and each cycle one member takes the whole pot. Most fights in a committee don't come from money going missing. They come from rules nobody wrote down. This checklist is for small groups of friends, family or colleagues.</p>
<p class="note">Large or commercial chit funds are regulated by law in India. This guide is only about informal groups.</p>
<h2>Before the first collection</h2>
<ul class="check">
  <li><strong>Amount and members.</strong> How much per person, how many people, and so how big the pot is.</li>
  <li><strong>Cycle and date.</strong> Monthly or weekly, and the exact day money is due.</li>
  <li><strong>Who gets the pot when.</strong> A fixed turn order, a lucky draw each cycle, or bidding - where a member who needs money early accepts a little less, and the difference is shared by the others. Choose one and stick to it.</li>
  <li><strong>Late payments.</strong> How many days of grace, and whether there is a late fine.</li>
  <li><strong>What if someone leaves.</strong> Agree it now, while everyone is friendly.</li>
</ul>
<h2>During the committee</h2>
<ul class="check">
  <li><strong>Record every payment the day it arrives</strong> - who, how much, how (cash or UPI).</li>
  <li><strong>Announce each payout</strong> to the whole group, with the amount.</li>
  <li><strong>Send reminders before the due date</strong>, not after.</li>
  <li><strong>Share a statement</strong> every cycle: collected, paid out, cash in hand.</li>
</ul>
<h2>Why I made an app for it</h2>
<p>A notebook works until someone asks "did I pay in March?". <a href="../apps/committee-book.html">Committee Book</a> keeps the records, sends WhatsApp and UPI reminders, handles turn order, lucky draw and bidding, and makes PDF statements. Members can see their own status once the organiser approves them.</p>
"""),
    dict(slug="why-my-apps-work-offline", date="2026-10-20", mins=3, app="spendly",
         title="Why my apps work offline - and what that means for your data",
         desc="No accounts, no servers holding your records: how offline-first apps keep your data on your phone, and how to keep it safe.",
         body="""
<p>Most of my apps don't ask you to sign up, and most of them keep working in a basement with no signal. That's on purpose.</p>
<h2>Your data stays on your phone</h2>
<p>Apps like <a href="../apps/spendly.html">Spendly</a>, <a href="../apps/dues.html">Dues</a> and <a href="../apps/dotnet-prep.html">DotNet Interview Prep</a> save what you enter in the phone's own storage. There is no account and no server of mine holding your spending, your bills or your study progress - so there is nothing of yours for me to lose, sell or leak.</p>
<p><a href="../apps/reelcut.html">ReelCut</a> goes one step further: it doesn't even have permission to use the internet. Your videos are edited on the phone and never leave it.</p>
<h2>The honest exceptions</h2>
<ul class="check">
  <li><strong>Ads.</strong> Some free apps show ads from Google AdMob. Google may use your device's advertising ID for that; you can reset or limit it in your phone's settings.</li>
  <li><strong>Sharing you turn on.</strong> In <a href="../apps/committee-book.html">Committee Book</a> the organiser can choose to share a committee live with approved members. If nobody turns it on, nothing leaves the phone.</li>
  <li><strong>Things that need the internet by nature</strong> - like exam news in <a href="../apps/mca-entrance-prep.html">MCA Entrance Prep</a>.</li>
</ul>
<p>Each app's privacy policy lists exactly what it does.</p>
<h2>The one thing you should do</h2>
<p>Because your data lives only on your phone, uninstalling the app or losing the phone loses the data too. Turn on Android backup to your Google account, and use the app's own export option when it has one.</p>
"""),
]

def esc(s): return html.escape(s, quote=True)

def guide_page(g, head, header, footer, site_url, apps):
    url = f"{site_url}guides/{g['slug']}.html"
    others = "".join(f'<a class="guide-card" href="{o["slug"]}.html"><span class="gc-meta">{o["mins"]} min read</span><h3>{esc(o["title"])}</h3><p>{esc(o["desc"])}</p></a>'
                     for o in GUIDES if o["slug"] != g["slug"])
    app = next((a for a in apps if a["slug"] == g["app"]), None)
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": g["title"], "description": g["desc"],
          "datePublished": g["date"], "author": {"@type": "Person", "name": "Priya Kumari"},
          "publisher": {"@type": "Organization", "name": "Priya Tech Labs"}, "mainEntityOfPage": url, "image": f"{site_url}assets/og.png"}
    cta = ""
    if app:
        cta = f"""<a class="guide-app" href="../apps/{app['slug']}.html"><img src="../assets/apps/{app['slug']}.png" alt="" width="56" height="56"><span><b>{esc(app['short'])}</b>{esc(app['what'])}</span></a>"""
    return f"""{head(g['title'] + ' - Priya Tech Labs', g['desc'], url)}
{header("../")}
<main id="main" class="guide">
  <article>
    <p class="crumbs"><a href="../#guides" data-i18n="nav.guides">Guides</a></p>
    <h1>{esc(g['title'])}</h1>
    <p class="guide-meta"><time datetime="{g['date']}">20 October 2026</time><span>{g['mins']} min read</span><span>Priya Kumari</span></p>
    <p class="guide-lede">{esc(g['desc'])}</p>
    <div class="guide-body">{g['body']}</div>
    {cta}
  </article>
  <section class="guide-more"><h2 data-i18n="guides.more">More guides</h2><div class="guide-grid">{others}</div></section>
</main>
<script type="application/ld+json">{json.dumps(ld)}</script>
{footer("../")}"""

COLOURS = [("Indigo ink", "#1D1B4C"), ("Marigold", "#F5A524"), ("Leaf", "#12805C"), ("Paper", "#F4F5FA"), ("Violet glow", "#7C6CFF"), ("Rose", "#E0457B")]

def press_page(head, header, footer, site_url, apps):
    url = f"{site_url}press.html"
    icons = "".join(f'<a class="press-icon" href="assets/apps/{a["slug"]}.png" download><img src="assets/apps/{a["slug"]}.png" alt="" width="72" height="72" loading="lazy"><span>{esc(a["short"])}</span></a>' for a in apps)
    sw = "".join(f'<button class="swatch" type="button" data-copy="{hx}" style="--c:{hx}"><i></i><b>{n}</b><span>{hx}</span></button>' for n, hx in COLOURS)
    page = f"""{head('Press kit - Priya Tech Labs', 'Logos, app icons, colours and a short description of Priya Tech Labs for articles and reviews.', url, depth=0)}
{header("")}
<main id="main" class="press">
  <section class="press-hero">
    <h1 data-i18n="press.h">Press kit</h1>
    <p data-i18n="press.p">Writing about Priya Tech Labs or one of the apps? Everything you need is here. Questions go to priyatechlabs9@gmail.com.</p>
    <a class="btn btn-primary" href="assets/press/priya-tech-labs-press-kit.zip" download data-i18n="press.zip">Download everything (.zip)</a>
  </section>
  <section class="press-block">
    <h2 data-i18n="press.about">About</h2>
    <div class="boiler"><p>Priya Tech Labs is an independent studio by Priya Kumari that builds Android apps and websites for money, study and everyday life in India. The apps keep data on the phone, work offline wherever they can, and most of them work in both English and Hindi.</p>
    <button class="btn btn-ghost" type="button" data-copy-text data-i18n="press.copy">Copy this text</button></div>
  </section>
  <section class="press-block">
    <h2 data-i18n="press.logo">Logo</h2>
    <div class="logo-row">
      <div class="logo-tile light"><img src="assets/mark.svg" alt="Priya Tech Labs mark on light" width="96" height="96"></div>
      <div class="logo-tile dark"><img src="assets/mark.svg" alt="Priya Tech Labs mark on dark" width="96" height="96"></div>
      <p>The mark is a 3x3 grid of app tiles with one marigold tile in the middle. Keep space around it equal to one tile, and don't recolour the marigold tile.<br><a class="link" href="assets/mark.svg" download>Download SVG</a></p>
    </div>
  </section>
  <section class="press-block">
    <h2 data-i18n="press.colours">Colours</h2>
    <p class="press-hint" data-i18n="press.tap">Tap a colour to copy it.</p>
    <div class="swatches">{sw}</div>
    <p class="press-hint">Typeface: Bricolage Grotesque (Google Fonts). Hindi text: Hind.</p>
  </section>
  <section class="press-block">
    <h2 data-i18n="press.icons">App icons</h2>
    <div class="press-icons">{icons}</div>
  </section>
</main>
{footer("")}"""
    return page

def press_zip(root, apps):
    d = os.path.join(root, "assets", "press"); os.makedirs(d, exist_ok=True)
    with zipfile.ZipFile(os.path.join(d, "priya-tech-labs-press-kit.zip"), "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(root, "assets", "mark.svg"), "logo/priya-tech-labs-mark.svg")
        z.write(os.path.join(root, "assets", "og.png"), "logo/priya-tech-labs-banner.png")
        for a in apps:
            z.write(os.path.join(root, "assets", "apps", a["slug"] + ".png"), f"app-icons/{a['slug']}.png")
            for i in range(1, a["shots"] + 1):
                z.write(os.path.join(root, "assets", "gallery", f"{a['slug']}-{i}.webp"), f"screenshots/{a['slug']}-{i}.webp")
        z.writestr("about.txt", "Priya Tech Labs is an independent studio by Priya Kumari that builds Android apps and websites for money, "
                   "study and everyday life in India.\nContact: priyatechlabs9@gmail.com\nWebsite: https://priya4042.github.io/\n")

def search_index(apps):
    items = [{"t": a["short"], "d": a["what"], "u": f"apps/{a['slug']}.html", "i": f"assets/apps/{a['slug']}.png", "k": "App",
              "x": " ".join([a["name"], a["cat"], " ".join(a["feats"])])} for a in apps]
    items += [{"t": n, "d": d, "u": u, "k": "Website", "x": n} for n, u, d in SITES]
    items += [{"t": g["title"], "d": g["desc"], "u": f"guides/{g['slug']}.html", "k": "Guide", "x": g["title"]} for g in GUIDES]
    items += [{"t": "Work with me", "d": "Get an Android app, website or web app built.", "u": "#contact", "k": "Page", "x": "hire contact quote build"},
              {"t": "Press kit", "d": "Logo, app icons and colours.", "u": "press.html", "k": "Page", "x": "logo brand media"},
              {"t": "Become a QuickScan tester", "d": "Join the Google Play closed test.", "u": "apps/quickscan.html", "k": "Page", "x": "test tester beta"}]
    return items

def qr_codes(root, site_url, apps):
    import segno
    d = os.path.join(root, "assets", "qr"); os.makedirs(d, exist_ok=True)
    for a in apps:
        segno.make(f"{site_url}apps/{a['slug']}.html", error="m").save(os.path.join(d, a["slug"] + ".svg"), scale=6, border=2,
                                                                         dark="#1D1B4C", light="#FFFFFF")
