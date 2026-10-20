# -*- coding: utf-8 -*-
"""A page for each live website (sites/<slug>.html)."""
import html, json

def esc(s): return html.escape(s, quote=True)

SITE_PAGES = [
    dict(slug="daily-rashifal", shot="daily-rashifal", tall=True, name="Daily Rashifal", url="https://priya4042.github.io/daily-rashifal/",
         cat="Lifestyle", langs="English, Hindi",
         what="Your free daily horoscope for all 12 signs, in English and Hindi.",
         about="Daily Rashifal gives a fresh reading for every zodiac sign each day - love, career, health and money - along with a lucky number, colour and time. Switch between English and Hindi with one tap and share your sign's reading with family.",
         feats=["All 12 zodiac signs, updated every day", "Love, career, health and money readings", "Lucky number, colour and time",
                "English and Hindi", "Easy to share with family and friends", "Free, with nothing to install"],
         note="For entertainment."),
    dict(slug="mca-prep-hub", shot="mca-prep-hub", tall=True, name="MCA Prep Hub", url="https://priya4042.github.io/mca-prep-hub/",
         cat="Study", langs="English",
         what="A free study site for MCA CET and NIMCET, with about 690 practice questions.",
         about="MCA Prep Hub lays out every subject and topic for MCA entrance exams with a priority tag, tells you exactly where to prepare each one - books, YouTube and practice sites - and lets you test yourself as you go.",
         feats=["9 subjects with every topic tagged by priority", "About 690 practice questions with simple answers",
                "Test Me quiz to check yourself", "A study plan to follow", "Save questions and track your progress", "Works in any browser, free"],
         note=""),
    dict(slug="finvest-pro", shot="finvest-pro", tall=False, name="Finvest Pro", url="https://priya4042.github.io/finvest-pro/",
         cat="Money", langs="English",
         what="Check whether a stock is undervalued using 9 valuation models.",
         about="Finvest Pro runs nine different valuation models on a company side by side, so you can see whether the share price looks cheap or expensive from more than one angle. Search companies from India, the US, Europe and the UK.",
         feats=["9 valuation models side by side", "Indian and global stocks", "Stock screener", "Compare companies",
                "Watchlist and portfolio", "Beginner and pro modes"],
         note="For learning, not investment advice.", guide="is-this-stock-undervalued"),
    dict(slug="stackprep", shot="stackprep", tall=False, name="StackPrep", url="https://priya4042.github.io/stackprep/",
         cat="Study", langs="English",
         what="A free, offline study companion for full-stack .NET and Angular interviews.",
         about="StackPrep gives you five personalised questions every day and helps you practise saying the answers, not just reading them - it reads answers aloud and lets you record your own.",
         feats=["Today's 5: five personalised questions every day", "Answers read aloud, and record your own voice",
                "Mock interview mode", "Flashcards with spaced repetition", "Compare two questions side by side",
                "Daily streaks and keyboard shortcuts"],
         note="", guide="dotnet-interview-roadmap"),
    dict(slug="anmielove", shot="anmielove", tall=False, name="AnmieLove", url="https://priya4042.github.io/anmielove/",
         cat="Creative", langs="English",
         what="Type a prompt and get an animated portrait in anime, Ghibli, K-drama or cartoon style.",
         about="AnmieLove turns a few words into an animated, cinematic portrait. Start from a ready-made prompt template, upload a reference image if you like, and pick a style.",
         feats=["Text prompt to animated portrait", "Anime, Ghibli, K-drama and cartoon styles", "Ready-made prompt templates",
                "Upload a reference image", "Free to use"],
         note=""),
    dict(slug="wellness-bloom", shot="wellness-bloom-women-health-blog", tall=True, name="Wellness Bloom", url="https://priya4042.github.io/wellness-bloom-women-health-blog/",
         cat="Health", langs="English",
         what="A women's health blog with practical, everyday guides.",
         about="Wellness Bloom explains common women's health topics in plain language - hair growth, thyroid, periods, digestion and fat loss - with everyday habits that are easy to start.",
         feats=["Hair growth", "Thyroid support", "Periods and cycle health", "Digestion", "Fat loss", "Practical habits you can start today"],
         note="General information, not medical advice. See a doctor for anything that worries you."),
    dict(slug="librisphere", shot="librisphere-lms", tall=True, name="LibriSphere", url="https://priya4042.github.io/librisphere-lms/",
         cat="Business tool", langs="English",
         what="Library management for small libraries: books, members, issuing and returns.",
         about="LibriSphere gives a small library one dashboard for everything: how many titles and members there are, what's issued, what's overdue and what's due soon - plus the day-to-day work of adding books and recording issues and returns.",
         feats=["Dashboard with titles, members and books issued", "Overdue, due-today and due-soon alerts", "Books and copies",
                "Members", "Issue and return (circulation)", "Acquisitions, vendors, ledger and reports"],
         note=""),
]

def site_page(sp, head, header, footer, site_url, segno_dir):
    url = f"{site_url}sites/{sp['slug']}.html"
    if sp["tall"]:
        visual = f'<div class="scrollshot sp-shot" role="img" aria-label="{esc(sp["name"])} preview" style="background-image:url(../assets/sites/{sp["shot"]}-tall.webp)"></div>'
    else:
        visual = f'<img class="sp-shot" src="../assets/sites/{sp["shot"]}.webp" alt="{esc(sp["name"])} preview" width="800" height="500">'
    feats = "".join(f"<li>{esc(f)}</li>" for f in sp["feats"])
    others = "".join(f'<a class="more-site" href="{o["slug"]}.html"><span>{esc(o["name"])}</span><small>{esc(o["cat"])}</small></a>'
                     for o in SITE_PAGES if o["slug"] != sp["slug"])
    note = f'<p class="sp-note">{esc(sp["note"])}</p>' if sp.get("note") else ""
    guide = f'<p class="sp-guide"><a class="link" href="../guides/{sp["guide"]}.html" data-i18n="sp.guide">Read the related guide</a></p>' if sp.get("guide") else ""
    ld = {"@context": "https://schema.org", "@type": "WebApplication", "name": sp["name"], "url": sp["url"], "description": sp["what"],
          "applicationCategory": sp["cat"], "operatingSystem": "Any (web browser)", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"},
          "author": {"@type": "Organization", "name": "Priya Tech Labs", "url": site_url}}
    return f"""{head(sp['name'] + ' - Priya Tech Labs', sp['what'], url)}
{header("../")}
<main id="main" class="app-page site-page">
  <section class="sp-hero">
    <div class="sp-copy">
      <p class="crumbs"><a href="../#web" data-i18n="nav.web">Websites</a> / {esc(sp['cat'])}</p>
      <h1>{esc(sp['name'])}</h1>
      <span class="badge badge-live" data-i18n="badge.web">Live now</span>
      <p class="ap-what">{esc(sp['what'])}</p>
      <p class="ap-meta"><span data-i18n="meta.web">Website</span><span>{esc(sp['langs'])}</span><span data-i18n="meta.free">Free</span><span data-i18n="meta.noinstall">Nothing to install</span></p>
      <a class="btn btn-primary" href="{sp['url']}" target="_blank" rel="noopener" data-i18n="visit">Open the site</a>
      {note}
    </div>
    <a class="browser sp-frame" href="{sp['url']}" target="_blank" rel="noopener" aria-label="Open {esc(sp['name'])}"><div class="bar"><i></i><i></i><i></i><span>{esc(sp['url'].replace('https://', ''))}</span></div>{visual}</a>
  </section>
  <section class="ap-about">
    <div><h2 data-i18n="page.about">What it does</h2><p>{esc(sp['about'])}</p>{guide}</div>
    <div><h2 data-i18n="page.features">Features</h2><ul class="feats">{feats}</ul></div>
  </section>
  <section class="ap-share" aria-labelledby="sh-h">
    <div class="share-copy">
      <h2 id="sh-h" data-i18n="share.h2">Share it</h2>
      <p data-i18n="share.p">Know someone who needs this? Send it their way.</p>
      <div class="share-btns" data-share-url="{sp['url']}" data-share-text="{esc(sp['name'])} - {esc(sp['what'])}">
        <a class="btn btn-wa" href="https://wa.me/?text={html.escape(__import__('urllib.parse').parse.quote(sp['name'] + ' - ' + sp['what'] + ' ' + sp['url']))}" target="_blank" rel="noopener" data-i18n="share.wa">Share on WhatsApp</a>
        <button class="btn btn-ghost" type="button" data-copy-link data-i18n="share.copy">Copy link</button>
        <button class="btn btn-ghost" type="button" data-native-share hidden data-i18n="share.more">More options</button>
      </div>
    </div>
    <figure class="qr"><img src="../assets/qr/site-{sp['slug']}.svg" alt="QR code that opens {esc(sp['name'])}" width="180" height="180" loading="lazy"><figcaption data-i18n="share.qr2">Scan to open it on your phone</figcaption></figure>
  </section>
  <section class="ap-more"><h2 data-i18n="sp.more">More websites</h2><div class="more-sites">{others}</div></section>
</main>
<script type="application/ld+json">{json.dumps(ld)}</script>
{footer("../")}"""

def site_qrs(root):
    import segno, os
    d = os.path.join(root, "assets", "qr"); os.makedirs(d, exist_ok=True)
    for sp in SITE_PAGES:
        segno.make(sp["url"], error="m").save(os.path.join(d, f"site-{sp['slug']}.svg"), scale=6, border=2, dark="#1D1B4C", light="#FFFFFF")
