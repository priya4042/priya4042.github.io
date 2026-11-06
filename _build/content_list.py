# -*- coding: utf-8 -*-
"""The shared Bhakti Dhara list page (l/index.html): reads the list from the link, no trackers."""

APP_PAGE = "../apps/bhakti.html"
PACKAGE = "com.priyatechlabs.bhakti"

CSS = """<style>
.sl { max-width: 46rem; margin: 0 auto; padding: clamp(28px, 6vw, 64px) var(--gutter, 16px) 48px; }
.sl h1 { font-size: clamp(1.7rem, 4.4vw, 2.6rem); line-height: 1.12; overflow-wrap: anywhere; }
.sl .sl-sub { color: var(--muted); margin: 6px 0 18px; }
.sl .sl-btns { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 22px; }
.sl .sl-btns .btn { flex: 1 1 220px; text-align: center; }
.sl ol { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.sl li a { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 14px; background: var(--card, #fff); box-shadow: inset 0 0 0 1px var(--line); color: var(--head); text-decoration: none; font-weight: 600; overflow-wrap: anywhere; }
.sl li a:hover { box-shadow: inset 0 0 0 2px var(--head); }
.sl li b { flex: 0 0 auto; min-width: 2em; height: 2em; display: grid; place-items: center; border-radius: 50%; background: var(--paper); color: var(--head); font-size: .9rem; }
.sl .sl-note { color: var(--muted); font-size: .95rem; margin-top: 18px; }
.sl-top { display: flex; align-items: center; padding: 14px var(--gutter, 16px); }
</style>"""

# reads n and v from the link; every text goes in with textContent
JS = """<script>
(function () {
  var q = new URLSearchParams(location.search), idRe = /^[A-Za-z0-9_-]{11}$/, seen = {}, ids = [];
  (q.get("v") || "").split(",").slice(0, 200).forEach(function (s) {
    s = s.trim();
    if (idRe.test(s) && !seen[s] && ids.length < 40) { seen[s] = 1; ids.push(s); }
  });
  var name = Array.from((q.get("n") || "").replace(/[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]/g, "").replace(/\\s+/g, " ").trim()).slice(0, 40).join("").trim();
  var hi = document.documentElement.lang === "hi";
  var $ = function (id) { return document.getElementById(id); };
  if (name) { $("sl-name").textContent = name; document.title = name + " - Bhakti Dhara"; }
  if (!ids.length) { $("sl-empty").hidden = false; $("sl-open").hidden = true; return; }
  $("sl-count").textContent = ids.length + (hi ? " वीडियो" : (ids.length === 1 ? " video" : " videos"));
  var list = $("sl-list");
  function draw(titles) {
    list.textContent = "";
    ids.forEach(function (id, i) {
      var li = document.createElement("li"), a = document.createElement("a"), b = document.createElement("b"), t = document.createElement("span");
      a.href = "https://www.youtube.com/watch?v=" + id;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      b.textContent = String(i + 1);
      var v = titles[id];
      t.textContent = v ? ((hi && v.hi) ? v.hi : v.en) : (hi ? "वीडियो" : "Video");
      a.appendChild(b); a.appendChild(t); li.appendChild(a); list.appendChild(li);
    });
  }
  draw({});
  fetch("../data/bhakti-videos.json").then(function (r) { return r.json(); }).then(function (d) {
    var m = {};
    (d.videos || []).forEach(function (v) { if (v && typeof v.id === "string" && typeof v.en === "string") m[v.id] = { en: v.en, hi: typeof v.hi === "string" ? v.hi : "" }; });
    draw(m);
  }).catch(function () {});
  var link = "priya4042.github.io/l/?n=" + encodeURIComponent(name) + "&v=" + ids.join(",");
  var open = $("sl-open");
  if (/Android/i.test(navigator.userAgent)) {
    open.href = "intent://" + link + "#Intent;scheme=https;package=PACKAGE;S.browser_fallback_url=" + encodeURIComponent(new URL("APP_PAGE", location.href).href) + ";end";
  } else {
    open.hidden = true;
    $("sl-android").hidden = false;
  }
})();
</script>""".replace("PACKAGE", PACKAGE).replace("APP_PAGE", APP_PAGE)


def bi(en, hi):
    return f'<span data-only="en">{en}</span><span data-only="hi" lang="hi">{hi}</span>'


def list_page(head, footer_block, site_url):
    url = f"{site_url}l/"
    h = head("Shared bhakti list - Bhakti Dhara", "A list of aartis and bhajans shared from the Bhakti Dhara app.", url)
    # never indexed, and the list name never leaves in a referrer
    h = h.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n<meta name="robots" content="noindex">\n<meta name="referrer" content="no-referrer">\n', 1)
    h = h.replace("</head>", CSS + "\n</head>", 1)
    return f"""{h}
<body>
<header class="sl-top"><a class="brand" href="../"><img class="mark" src="../assets/mark.svg" alt="" width="30" height="30"><span>Priya Tech Labs</span></a></header>
<main id="main" class="sl">
  <p class="crumbs">{bi("Shared from Bhakti Dhara", "भक्ति धारा से भेजी गई")}</p>
  <h1 id="sl-name">{bi("Shared list", "भेजी गई सूची")}</h1>
  <p class="sl-sub" id="sl-count"></p>
  <div class="sl-btns">
    <a class="btn btn-primary" id="sl-open" href="{APP_PAGE}">{bi("Open in Bhakti Dhara", "भक्ति धारा में खोलें")}</a>
    <a class="btn btn-ghost" href="{APP_PAGE}">{bi("Get the app", "ऐप पाएँ")}</a>
  </div>
  <p class="sl-note" id="sl-android" hidden>{bi("Bhakti Dhara is an Android app. The videos below open on YouTube.", "भक्ति धारा एंड्रॉइड ऐप है। नीचे के वीडियो YouTube पर खुलते हैं।")}</p>
  <p class="sl-note" id="sl-empty" hidden>{bi("This link has no videos. Ask for the link again.", "इस लिंक में कोई वीडियो नहीं है। लिंक फिर से माँगें।")}</p>
  <ol id="sl-list"></ol>
  <noscript><p class="sl-note">{bi("Turn on JavaScript to see the list.", "सूची देखने के लिए JavaScript चालू करें।")}</p></noscript>
  <p class="sl-note">{bi("Each video opens on YouTube, from its official channel.", "हर वीडियो YouTube पर उसके आधिकारिक चैनल से खुलता है।")}</p>
</main>
{footer_block("../")}
{JS}
</body>
</html>"""
