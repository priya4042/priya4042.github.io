# -*- coding: utf-8 -*-
"""Small images for cards, contents lists for guides, previous/next links and the "Keep exploring" block."""
import os, re, html
from PIL import Image

def esc(s): return html.escape(s, quote=True)
def bi(en, hi): return f'<span data-only="en">{en}</span><span data-only="hi" lang="hi">{hi}</span>' if hi else en

COLOURS = {"Money": ((14, 124, 102), (18, 160, 110)), "Study": ((79, 67, 214), (83, 131, 255)), "Apps": ((224, 69, 123), (245, 165, 36)),
           "Video": ((108, 76, 240), (224, 69, 123)), "tool": ((245, 165, 36), (255, 122, 89)), "case": ((29, 27, 76), (91, 79, 216)),
           "app": ((29, 27, 76), (79, 67, 214))}

def _cover(path, colours, icon=None, letter="P"):
    """Picture-only card cover: diagonal colour wash, dot pattern and a big app icon (no text, so it never repeats the title)."""
    from PIL import ImageDraw, ImageFont
    W, H = 480, 252
    a, b = colours
    im = Image.new("RGB", (W, H)); px = im.load()
    for y in range(H):
        for x in range(0, W, 2):
            t = (x / W * 0.6 + y / H * 0.4)
            c = tuple(int(a[k] + (b[k] - a[k]) * t) for k in range(3)); px[x, y] = c
            if x + 1 < W: px[x + 1, y] = c
    d = ImageDraw.Draw(im, "RGBA")
    for y in range(10, H, 18):
        for x in range(10, W, 18): d.ellipse((x, y, x + 2, y + 2), fill=(255, 255, 255, 40))
    d.ellipse((W - 170, -90, W + 90, 170), fill=(255, 255, 255, 30))
    d.ellipse((-80, H - 110, 140, H + 110), fill=(0, 0, 0, 30))
    size = 120
    if icon and os.path.exists(icon):
        ic = Image.open(icon).convert("RGBA").resize((size, size), Image.LANCZOS)
        m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size - 1, size - 1), 30, fill=255)
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle(((W - size) // 2 + 4, (H - size) // 2 + 14, (W + size) // 2 + 4, (H + size) // 2 + 14), 30, fill=(0, 0, 0, 70))
        im = Image.alpha_composite(im.convert("RGBA"), sh).convert("RGB")
        im.paste(ic, ((W - size) // 2, (H - size) // 2), m)
    else:
        d = ImageDraw.Draw(im, "RGBA")
        d.rounded_rectangle(((W - size) // 2, (H - size) // 2, (W + size) // 2, (H + size) // 2), 30, fill=(255, 255, 255, 235))
        f = ImageFont.truetype(os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", "bahnschrift.ttf"), 64)
        d.text((W // 2, H // 2), letter, font=f, fill=a, anchor="mm")
    im.save(path, quality=80)

def make_thumbs(root, apps=None):
    """Card covers for guides, tools, case studies and apps."""
    import content as C, content_tools as T, content_more as M
    dst = os.path.join(root, "assets", "og", "thumb"); os.makedirs(dst, exist_ok=True)
    icon = lambda slug: os.path.join(root, "assets", "apps", f"{slug}.png") if slug else None
    for g in C.GUIDES:
        _cover(os.path.join(dst, f"guide-{g['slug']}.webp"), COLOURS.get(g.get("cat", "Apps"), COLOURS["Apps"]), icon(g.get("app")), "F")
    for t in T.TOOLS:
        _cover(os.path.join(dst, f"tool-{t['slug']}.webp"), COLOURS["tool"], icon(t.get("app")), "₹")
    for c in M.CASES:
        _cover(os.path.join(dst, f"case-{c['slug']}.webp"), COLOURS["case"], icon(c["app"]))
    for a in (apps or []):
        _cover(os.path.join(dst, f"app-{a['slug']}.webp"), COLOURS["app"], icon(a["slug"]))

def thumb(up, kind, slug):
    return f'<img class="gc-thumb" src="{up}assets/og/thumb/{kind}-{slug}.webp" alt="" width="480" height="252" loading="lazy">'

def add_ids(body, prefix):
    n = [0]
    def rep(m):
        n[0] += 1; return f'<h2 id="{prefix}{n[0]}">'
    return re.sub(r"<h2>", rep, body)

def toc(body, prefix):
    heads = re.findall(r"<h2>(.*?)</h2>", body)
    return "".join(f'<li><a href="#{prefix}{i}">{re.sub("<[^>]+>", "", h)}</a></li>' for i, h in enumerate(heads, 1))

def prev_next(items, i, href, title, hi_title=lambda x: ""):
    out = ""
    if i > 0:
        p = items[i - 1]
        out += f'<a class="pn pn-prev" href="{href(p)}"><small>{bi("Previous", "पिछला")}</small><b>{bi(esc(title(p)), hi_title(p))}</b></a>'
    else:
        out += "<span></span>"
    if i + 1 < len(items):
        n = items[i + 1]
        out += f'<a class="pn pn-next" href="{href(n)}"><small>{bi("Next", "अगला")}</small><b>{bi(esc(title(n)), hi_title(n))}</b></a>'
    return f'<nav class="prev-next" aria-label="Previous and next">{out}</nav>'

def explore(up, app_slug, exclude_kind, exclude_slug, apps):
    """Up to three related things for an app: its guide(s), its tool, its case study, or the app itself."""
    import content as C, content_tools as T, content_more as M
    cards = []
    a = next((x for x in apps if x["slug"] == app_slug), None)
    if a and exclude_kind != "app":
        cards.append(("app", a["slug"], f"{up}apps/{a['slug']}.html", "App", "ऐप", a["short"], C.HI.get("", ("",))[0], a["what"]))
    for t in T.TOOLS:
        if t.get("app") == app_slug and not (exclude_kind == "tool" and exclude_slug == t["slug"]):
            cards.append(("tool", t["slug"], f"{up}tools/{t['slug']}.html", "Free tool", "मुफ़्त टूल", t["name"], t["name_hi"], t["desc"]))
    for g in C.GUIDES:
        if g.get("app") == app_slug and not (exclude_kind == "guide" and exclude_slug == g["slug"]):
            cards.append(("guide", g["slug"], f"{up}guides/{g['slug']}.html", "Guide", "गाइड", g["title"], C.HI.get(g["slug"], ("",))[0], g["desc"]))
    for c in M.CASES:
        if c["app"] == app_slug and exclude_kind != "case":
            cards.append(("case", c["slug"], f"{up}work/{c['slug']}.html", "Case study", "केस स्टडी", c["title"], "", c["desc"]))
    cards = cards[:3]
    if not cards: return ""
    html_cards = "".join(
        f'<a class="ex-card" href="{href}">{thumb(up, kind, slug)}<span class="ex-body"><span class="gc-meta">{bi(k_en, k_hi)}</span><b>{bi(esc(t_en), t_hi)}</b></span></a>'
        for kind, slug, href, k_en, k_hi, t_en, t_hi, _ in cards)
    return f'<section class="explore" aria-labelledby="ex-h"><h2 id="ex-h">{bi("Keep exploring", "और देखें")}</h2><div class="ex-grid">{html_cards}</div></section>'
