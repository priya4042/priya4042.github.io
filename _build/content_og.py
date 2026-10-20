# -*- coding: utf-8 -*-
"""Per-page share images (1200x630) for apps, websites, guides and case studies."""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
INK, MARIGOLD = (29, 27, 76), (245, 165, 36)

def _font(size, bold=True):
    d = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")
    for f in (["bahnschrift.ttf", "arialbd.ttf"] if bold else ["bahnschrift.ttf", "arial.ttf"]):
        p = os.path.join(d, f)
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default(size)

def _wrap(d, text, font, max_w, max_lines):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= max_w or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]; lines[-1] = lines[-1].rstrip(".,") + "..."
    return lines

def _base(accent=None):
    im = Image.new("RGB", (W, H), INK)
    glow = Image.new("L", (W, H), 0); g = ImageDraw.Draw(glow)
    for r in range(560, 0, -10):
        g.ellipse((W - 120 - r, H + 60 - r, W - 120 + r, H + 60 + r), fill=int(140 * (1 - r / 560)))
    im = Image.composite(Image.new("RGB", (W, H), accent or MARIGOLD), im, glow)
    d = ImageDraw.Draw(im)
    for i in range(9):   # brand mark + name, top-left
        x, y = 64 + (i % 3) * 20, 56 + (i // 3) * 20
        d.rounded_rectangle((x, y, x + 16, y + 16), 4, fill=MARIGOLD if i == 4 else (255, 255, 255))
    d.text((140, 60), "Priya Tech Labs", font=_font(30), fill="white")
    return im, d

def _rounded(img, size, radius):
    img = img.convert("RGBA").resize((size, size))
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size - 1, size - 1), radius, fill=255)
    return img, m

def card(kind, title, sub, out, icon=None, shot=None, accent=None):
    im, d = _base(accent)
    tx, maxw = 64, 1072
    if icon:
        ic, m = _rounded(Image.open(icon), 150, 40); im.paste(ic, (64, 170), m); tx, maxw = 250, 880
    if shot:
        s = Image.open(shot).convert("RGB")
        s = s.crop((0, 0, s.width, min(s.height, int(s.width * 0.62)))).resize((520, int(520 * 0.62)))
        frame = Image.new("RGB", (s.width + 16, s.height + 46), (236, 235, 250))
        ImageDraw.Draw(frame).rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), 16, fill=(236, 235, 250))
        for k in range(3): ImageDraw.Draw(frame).ellipse((14 + k * 18, 14, 26 + k * 18, 26), fill=(197, 201, 219))
        frame.paste(s, (8, 38))
        fm = Image.new("L", frame.size, 0); ImageDraw.Draw(fm).rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), 16, fill=255)
        im.paste(frame, (W - frame.width - 56, 150), fm); maxw = 520
    d = ImageDraw.Draw(im)
    d.text((tx, 140 if not icon else 172), kind, font=_font(30), fill=MARIGOLD)
    size = 64
    while size > 38:
        f = _font(size); lines = _wrap(d, title, f, maxw, 3)
        if all(d.textlength(l, font=f) <= maxw for l in lines) and len(lines) <= 3: break
        size -= 4
    y = (190 if not icon else 222)
    for l in lines:
        d.text((tx, y), l, font=f, fill="white"); y += int(size * 1.15)
    sf = _font(28, bold=False)
    for l in _wrap(d, sub, sf, maxw, 3):
        y += 6; d.text((tx, y + 10), l, font=sf, fill=(205, 207, 240)); y += 34
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, optimize=True)

def build_all(root, apps, guides, cases, sites):
    o = os.path.join(root, "assets", "og")
    for a in apps:
        card("Android app", a["name"], a["what"], os.path.join(o, f"app-{a['slug']}.png"), icon=os.path.join(root, "assets", "apps", a["slug"] + ".png"))
    for g in guides:
        card(f"Guide - {g['mins']} min read", g["title"], g["desc"], os.path.join(o, f"guide-{g['slug']}.png"))
    for c in cases:
        card("Case study", c["title"], c["desc"], os.path.join(o, f"case-{c['slug']}.png"), icon=os.path.join(root, "assets", "apps", c["app"] + ".png"))
    for s in sites:
        shot = os.path.join(root, "assets", "sites", s["shot"] + ("-tall.webp" if s["tall"] else ".webp"))
        card("Website - live now", s["name"], s["what"], os.path.join(o, f"site-{s['slug']}.png"), shot=shot)
