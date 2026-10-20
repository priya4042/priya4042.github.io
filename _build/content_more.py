# -*- coding: utf-8 -*-
"""Case studies and the website's own privacy notice + terms - used by build.py."""
import html

def esc(s): return html.escape(s, quote=True)

CASES = [
    dict(slug="reelcut", app="reelcut", title="ReelCut: a video editor that never uploads your videos",
         desc="How a tool that needed a PC became an Android app that edits everything on the phone - with no internet permission at all.",
         facts=[("Platform", "Android"), ("Built with", "Flutter, FFmpeg, ML Kit"), ("Status", "Ready for Google Play")],
         body="""
<h2>The problem</h2>
<p>Creators who film long videos - talks, classes, podcasts - want short vertical clips for Shorts and Reels. The popular tools upload the whole video to a server first, cost money, or both. I wanted something free that never sends anyone's video anywhere.</p>
<h2>The first version, and why I threw it away</h2>
<p>The first ReelCut was a phone remote for a program running on my PC: the phone sent the video, the PC cut it with FFmpeg and sent the clips back. It worked, but it meant a server, and a server means hosting costs and your videos on someone else's computer. Not what I promised.</p>
<h2>What I built instead</h2>
<ul class="check">
  <li><strong>All editing on the phone.</strong> The full FFmpeg video engine runs inside the app: cutting, cropping to 9:16, 1:1 or 4:5, titles, watermark and background music.</li>
  <li><strong>Face-aware cropping.</strong> Google's on-device ML Kit finds the face in a frame, so the vertical crop keeps the speaker in shot.</li>
  <li><strong>Highlights.</strong> It measures how loud each moment is and suggests the liveliest parts as clips.</li>
  <li><strong>No internet permission.</strong> The app literally cannot send data off the phone - and its Play Store data-safety form says "no data collected".</li>
</ul>
<h2>The hard part</h2>
<p>A full video engine is big. Built for every kind of phone at once, the app was huge - so it ships as an Android App Bundle, and Google Play delivers only the version each phone's processor needs.</p>
<h2>Where it is now</h2>
<p>Finished, signed and ready for its Google Play listing. Free, with no ads and no account.</p>
"""),
    dict(slug="committee-book", app="committee-book", title="Committee Book: getting the money maths of a BC exactly right",
         desc="Turning the notebook that runs a savings group into an app - with bidding chits, partial payments and members who can check their own status.",
         facts=[("Platform", "Android"), ("Built with", "Flutter, Supabase"), ("Status", "Signed release, ready for Google Play")],
         body="""
<h2>The problem</h2>
<p>Millions of families and offices run committees - BCs, chits, kitties - on paper and WhatsApp. When a payment is disputed, there is no record everyone trusts. I couldn't find a free app that handled the way these groups actually work, so I built one.</p>
<h2>What I built</h2>
<ul class="check">
  <li><strong>Every way the pot is shared:</strong> fixed turn order, lucky draw, and bidding chits where the winner's discount is shared back with the others.</li>
  <li><strong>Real-life payments:</strong> partial payments, late fines, the organiser's commission, and a "cash in hand" figure that is always correct.</li>
  <li><strong>Members can check for themselves.</strong> The organiser can share a committee live. Joining needs the organiser's approval - a share code alone shows nothing - and the database only lets approved members read it.</li>
  <li><strong>Reminders and statements:</strong> WhatsApp, SMS and UPI payment links, PDF statements, and Hindi throughout.</li>
</ul>
<h2>The hard part</h2>
<p>Money bugs are the worst kind of bug. In a bidding chit, what each member pays changes every cycle, so every calculation in the app goes through one function that knows the amount due for that cycle. Automated tests check the maths for fixed, partial, commission and bidding committees before every build - for example, in a four-person committee of 1,000 each, a winning bid of 1,000 with 5% commission must give each member exactly 200 back.</p>
<h2>Where it is now</h2>
<p>Signed release built and waiting for its Google Play listing.</p>
"""),
    dict(slug="mca-entrance-prep", app="mca-entrance-prep", title="MCA Entrance Prep: one app for eleven entrance exams",
         desc="Building a study app where every answer has been checked twice, every exam has its own pattern, and exam dates update without an app update.",
         facts=[("Platform", "Android (iPhone build in testing)"), ("Built with", "Flutter"), ("Status", "Release built, no ads")],
         body="""
<h2>The problem</h2>
<p>Students preparing for MCA entrance exams usually sit several of them - NIMCET, CUET PG, MAH MCA CET and more - each with a different pattern, marking scheme and calendar. Most prep material covers one exam, and coaching is expensive.</p>
<h2>What I built</h2>
<ul class="check">
  <li><strong>Eleven exams, each with its own profile:</strong> sections, marks, negative marking, time limits, syllabus, eligibility and colleges.</li>
  <li><strong>Practice that feels like the real thing:</strong> timed mock series in the real format, including section timers that lock like the actual exam.</li>
  <li><strong>A trick for every question,</strong> 48 predicted papers, and real past-year questions.</li>
  <li><strong>Remembering, not just reading:</strong> spaced revision, flashcards, a mistake journal and a study plan that adapts to how close the exam is.</li>
  <li><strong>Exam dates that stay current.</strong> The app reads dates from a small public file, so when a form opens I update one file - no app update needed.</li>
</ul>
<h2>The hard part</h2>
<p>A wrong answer key in a study app does real damage. Every answer key was checked by a separate second pass, and automated tests guard each exam's pattern - number of questions, marks and negative marking - so a change can't quietly break it.</p>
<h2>Where it is now</h2>
<p>The Android release is built. It has no ads, and an iPhone build is being tested.</p>
"""),
]

def case_page(c, head, header, footer, site_url, apps):
    url = f"{site_url}work/{c['slug']}.html"
    app = next(a for a in apps if a["slug"] == c["app"])
    facts = "".join(f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in c["facts"])
    shots = ""
    if app["shots"]:
        shots = '<div class="case-shots">' + "".join(
            f'<img src="../assets/gallery/{app["slug"]}-{i}.webp" alt="{esc(app["short"])} screen {i}" width="432" height="786" loading="lazy">'
            for i in range(1, min(app["shots"], 3) + 1)) + "</div>"
    others = "".join(f'<a class="guide-card" href="{o["slug"]}.html"><span class="gc-meta">Case study</span><h3>{esc(o["title"])}</h3><p>{esc(o["desc"])}</p></a>'
                     for o in CASES if o["slug"] != c["slug"])
    return f"""{head(c['title'] + ' - Priya Tech Labs', c['desc'], url)}
{header("../")}
<main id="main" class="guide case">
  <article>
    <p class="crumbs"><a href="../#work" data-i18n="nav.cases">Case studies</a></p>
    <div class="case-head"><img src="../assets/apps/{app['slug']}.png" alt="" width="72" height="72"><h1>{esc(c['title'])}</h1></div>
    <p class="guide-lede">{esc(c['desc'])}</p>
    <dl class="case-facts">{facts}</dl>
    {shots}
    <div class="guide-body">{c['body']}</div>
    <a class="guide-app" href="../apps/{app['slug']}.html"><img src="../assets/apps/{app['slug']}.png" alt="" width="56" height="56"><span><b>{esc(app['short'])}</b>{esc(app['what'])}</span></a>
    <div class="case-cta"><h2 data-i18n="case.cta">Want something like this built?</h2><a class="btn btn-primary" href="../#contact" data-i18n="nav.work">Work with me</a></div>
  </article>
  <section class="guide-more"><h2 data-i18n="case.more">More case studies</h2><div class="guide-grid">{others}</div></section>
</main>
{footer("../")}"""

SITE_PRIVACY = """
<h2>The short version</h2>
<p>This website doesn't use cookies, doesn't track you across sites and doesn't sell anything about you. Each app has its own privacy policy, linked from its page.</p>
<h2>What you send through the forms</h2>
<p>The tester, launch-list and contact forms send what you type - usually your name and email address - to Priya Tech Labs so I can reply, add you to a test, or tell you when an app launches. If a form opens your email app instead, the message goes through your own email provider. I use it only for that purpose, never share it, and delete it when you ask.</p>
<h2>Things stored in your browser</h2>
<p>Your choice of dark mode and language is saved in your own browser (local storage) so the site remembers it. It never leaves your device. If you install the site as an app, your browser keeps a copy of the pages so they open offline.</p>
<h2>Services this site uses</h2>
<ul class="check">
  <li><strong>GitHub Pages</strong> hosts the site and, like every web host, keeps standard server logs.</li>
  <li><strong>Google Fonts</strong> serves the typefaces, so your browser contacts Google to download them.</li>
  <li><strong>Visit statistics</strong>, if turned on, use GoatCounter, which counts page views without cookies or personal data.</li>
  <li><strong>WhatsApp</strong> - the chat button opens WhatsApp, which then works under WhatsApp's own privacy policy.</li>
</ul>
<h2>Your rights and contact</h2>
<p>To see, correct or delete anything you've sent, email <a href="mailto:priyatechlabs9@gmail.com">priyatechlabs9@gmail.com</a>.</p>
"""

SITE_TERMS = """
<h2>Using this website</h2>
<p>You're welcome to browse, share and link to any page. The text, logo, app icons and screenshots belong to Priya Tech Labs; the <a href="press.html">press kit</a> lists what you may use when writing about the apps.</p>
<h2>The apps and websites</h2>
<p>The apps and websites listed here are provided free and as they are. I work hard to keep them accurate and working, but I can't promise they will be free of errors or always available.</p>
<ul class="check">
  <li><strong>Daily Rashifal</strong> is for entertainment.</li>
  <li><strong>Finvest Pro</strong> and <strong>IPO Radar</strong> are tools for learning and research, not investment advice. Make your own investment decisions, or ask a registered adviser.</li>
  <li><strong>Study apps and sites</strong> are practice material; always check exam details on the official exam website.</li>
  <li><strong>Committee Book</strong> helps you keep records of a savings group; the group's members remain responsible for the money and for following the law.</li>
</ul>
<h2>Testing apps early</h2>
<p>Test versions may still have bugs. Please don't rely on a test version for anything important, and tell me about anything that goes wrong.</p>
<h2>Changes and contact</h2>
<p>These terms may be updated; the date at the top shows the latest version. Questions: <a href="mailto:priyatechlabs9@gmail.com">priyatechlabs9@gmail.com</a>.</p>
"""

def legal_page(title, body, slug, head, header, footer, site_url):
    url = f"{site_url}{slug}.html"
    return f"""{head(title + ' - Priya Tech Labs', title + ' for the Priya Tech Labs website.', url, depth=0)}
{header("")}
<main id="main" class="guide">
  <article>
    <h1>{esc(title)}</h1>
    <p class="guide-meta"><span>Last updated 20 October 2026</span></p>
    <div class="guide-body">{body}</div>
  </article>
</main>
{footer("")}"""
