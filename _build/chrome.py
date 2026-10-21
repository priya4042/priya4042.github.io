# -*- coding: utf-8 -*-
"""Shared header (dropdown menus + phone drawer) and the big footer, used on every page."""
import html

def esc(s): return html.escape(s, quote=True)

ICON_SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>'
ICON_THEME = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path class="sun" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>'
              '<path class="moon-i" d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>')
CARET = '<svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'

def _groups(up, apps, sites, tools, guides):
    """(key, label, i18n, all-link, items[(href, title, sub, img_or_svg)])"""
    import content_tools as T
    return [
        ("apps", "Apps", "nav.apps", f"{up}#apps",
         [(f"{up}apps/{a['slug']}.html", a["short"], a["cat"], f'<img src="{up}assets/apps/{a["slug"]}.png" alt="" width="36" height="36" loading="lazy">') for a in apps]),
        ("web", "Websites", "nav.web", f"{up}#web",
         [(f"{up}sites/{s['slug']}.html", s["name"], s["cat"], f'<span class="dd-dot">{esc(s["name"][0])}</span>') for s in sites]),
        ("tools", "Free tools", "nav.tools", f"{up}tools/",
         [(f"{up}tools/{t['slug']}.html", t["name"], "", T.tool_icon(t)) for t in tools]),
        ("guides", "Guides", "nav.guides", f"{up}guides/",
         [(f"{up}guides/{g['slug']}.html", g["title"], f"{g['mins']} min read", "") for g in guides[-5:][::-1]]),
    ]

def header_html(up, apps, sites, tools, guides, on_hero=False):
    items = ""
    for key, label, i18n, allhref, rows in _groups(up, apps, sites, tools, guides):
        lis = "".join(f'<a class="dd-i" href="{h}">{ic}<span><b>{esc(t)}</b>{f"<small>{esc(sub)}</small>" if sub else ""}</span></a>' for h, t, sub, ic in rows)
        allt = {"apps": ("See all apps", "सभी ऐप्स"), "web": ("See all websites", "सभी वेबसाइटें"), "tools": ("See all tools", "सभी टूल"),
                "guides": (f"See all {len(guides)} guides", f"सभी {len(guides)} गाइड")}[key]
        items += (f'<div class="nav-item nav-{key}"><a class="nav-top" href="{allhref}"><span data-i18n="{i18n}">{label}</span>{CARET}</a>'
                  f'<div class="dd dd-{key}"><div class="dd-grid">{lis}</div>'
                  f'<a class="dd-all" href="{allhref}"><span data-only="en">{allt[0]}</span><span data-only="hi" lang="hi">{allt[1]}</span></a></div></div>')
    drawer = ""
    for key, label, i18n, allhref, rows in _groups(up, apps, sites, tools, guides):
        lis = "".join(f'<a href="{h}">{ic if key in ("apps", "tools") else ""}<span>{esc(t)}</span></a>' for h, t, sub, ic in rows)
        drawer += f'<details class="dr-g"{" open" if key == "apps" else ""}><summary data-i18n="{i18n}">{label}</summary><div class="dr-list">{lis}<a class="dr-all" href="{allhref}">{label} &rarr;</a></div></details>'
    return f"""<header class="top{' on-hero' if on_hero else ''}">
  <a class="brand" href="{up or './'}" aria-label="Priya Tech Labs home"><img class="mark" src="{up}assets/mark.svg" alt="" width="30" height="30"><span>Priya Tech Labs</span></a>
  <nav class="mainnav" aria-label="Main">{items}<a class="nav-top nav-plain" href="{up}#about" data-i18n="nav.about">About</a><a class="nav-cta" href="{up}#contact" data-i18n="nav.work">Work with me</a></nav>
  <div class="toggles">
    <button class="tgl" data-search-open aria-label="Search apps and sites" title="Search (Ctrl+K)">{ICON_SEARCH}</button>
    <button class="tgl" data-lang-toggle aria-label="Switch language">हिंदी</button>
    <button class="tgl" data-theme-toggle aria-label="Switch dark mode">{ICON_THEME}</button>
    <button class="tgl menu-btn" data-menu-open aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>
<div class="drawer" id="drawer" hidden>
  <div class="drawer-back" data-menu-close></div>
  <nav class="drawer-panel" aria-label="Menu">
    <div class="drawer-head"><b>Priya Tech Labs</b><button class="tgl" data-menu-close aria-label="Close menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    {drawer}
    <a class="dr-link" href="{up}#work" data-i18n="nav.cases">Case studies</a>
    <a class="dr-link" href="{up}#about" data-i18n="nav.about">About</a>
    <a class="btn btn-primary dr-cta" href="{up}#contact" data-i18n="nav.work">Work with me</a>
  </nav>
</div>"""

def footer_html(up, apps, sites, tools, guides, email, privacy_links):
    def col(title, i18n, links):
        return f'<div class="fb-col"><h3 data-i18n="{i18n}">{title}</h3><ul>' + "".join(f'<li><a href="{h}">{esc(t)}</a></li>' for h, t in links) + "</ul></div>"
    company = [(f"{up}#about", "About"), (f"{up}#work", "Case studies"), (f"{up}#contact", "Work with me"), (f"{up}press.html", "Press kit"),
               (f"{up}site-privacy.html", "Privacy"), (f"{up}terms.html", "Terms"), (f"{up}accessibility.html", "Accessibility")]
    pol = " ".join(f'<a href="{h}">{esc(n)}</a>' for n, h in privacy_links)
    return f"""<footer class="foot-big">
  <div class="fb-top">
    <div class="fb-brand">
      <a class="brand" href="{up or './'}"><img class="mark" src="{up}assets/mark.svg" alt="" width="30" height="30"><span>Priya Tech Labs</span></a>
      <p data-i18n="fb.about">Android apps and websites for money, study and everyday life - most of them in English and Hindi, most of them offline.</p>
      <a class="fb-mail" href="mailto:{email}">{email}</a>
      <div class="socials"></div>
      <button class="btn btn-ghost install-btn" type="button" hidden data-install data-i18n="pwa.install">Install as an app</button>
    </div>
    {col("Apps", "nav.apps", [(f"{up}apps/{a['slug']}.html", a["short"]) for a in apps])}
    {col("Websites", "nav.web", [(f"{up}sites/{s['slug']}.html", s["name"]) for s in sites])}
    {col("Free tools", "nav.tools", [(f"{up}tools/{t['slug']}.html", t["name"]) for t in tools])}
    {col("Guides", "nav.guides", [(f"{up}guides/{g['slug']}.html", g["title"].split(":")[0]) for g in guides[-5:][::-1]] + [(f"{up}guides/", f"All {len(guides)} guides")])}
    {col("Company", "fb.company", company)}
  </div>
  <div class="fb-bottom">
    <p>© 2026 Priya Tech Labs</p>
    <p class="fb-pol"><span data-i18n="fb.pol">App privacy policies:</span> {pol}</p>
  </div>
</footer>"""
