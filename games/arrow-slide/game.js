(function () {
  'use strict';
  // directions: up, right, down, left
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  // own palette, picked to stay apart for common colour-blindness types on a dark board
  const COLORS = ['#F2A93B', '#58B9EC', '#33C3A2', '#E8DC62', '#EE7660', '#C98BDB', '#8C9DF5'];
  const MAX_LEN = 14;

  // seeded 32-bit xorshift, same numbers on every device
  function Rng(seed) {
    let z = (Math.imul(seed, 0x9E3779B1) + 0x7F4A7C15) >>> 0;
    z = Math.imul(z ^ (z >>> 16), 0x85EBCA6B) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xC2B2AE35) >>> 0;
    z = (z ^ (z >>> 16)) >>> 0;
    let s = z === 0 ? 0x1234567 : z;
    const next = () => { let x = s; x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >>> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0; return (s = x); };
    const r = { next, nextInt: n => (n <= 1 ? 0 : next() % n), chance: q => r.nextInt(100) < q,
      shuffle: a => { for (let i = a.length - 1; i > 0; i--) { const j = r.nextInt(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } } };
    for (let i = 0; i < 8; i++) next();
    return r;
  }

  function rayFrom(w, h, cell, dir) {
    const out = []; let x = cell % w + DX[dir], y = Math.floor(cell / w) + DY[dir];
    while (x >= 0 && y >= 0 && x < w && y < h) { out.push(y * w + x); x += DX[dir]; y += DY[dir]; }
    return out;
  }
  const fullGrid = p => { const g = new Array(p.w * p.h).fill(-1); p.arrows.forEach((a, i) => a.cells.forEach(c => (g[c] = i))); return g; };
  const head = a => a.cells[a.cells.length - 1];
  function blocker(p, g, a) { for (const c of rayFrom(p.w, p.h, head(p.arrows[a]), p.arrows[a].dir)) if (g[c] !== -1 && g[c] !== a) return c; return null; }
  function movable(p, g) { const alive = [...new Set(g.filter(x => x >= 0))].sort((a, b) => a - b); return alive.filter(a => blocker(p, g, a) === null); }

  // removing an arrow never blocks another, so taking every free arrow each round finds a clear when one exists
  function solveBoard(p) {
    const g = fullGrid(p); let left = p.arrows.length, rounds = 0, first = -1;
    while (left > 0) {
      const free = movable(p, g); if (first < 0) first = free.length;
      if (!free.length) return { ok: false, rounds, first };
      free.forEach(a => p.arrows[a].cells.forEach(c => (g[c] = -1))); left -= free.length; rounds++;
    }
    return { ok: true, rounds, first: Math.max(first, 0) };
  }

  // board grows from 8x10 to 20x26, arrows get longer and bend more
  function specFor(level) {
    const l = Math.max(1, Math.floor(level) || 1);
    const w = Math.min(20, 8 + Math.floor((l - 1) / 6)), h = Math.min(26, w + Math.floor(w * 3 / 10));
    return { w, h, maxLen: Math.min(MAX_LEN, 6 + Math.floor(l / 8)), turn: Math.min(62, 34 + Math.floor(l / 3)), minRounds: Math.min(4 + Math.floor(l / 8), 14) };
  }

  // every arrow gets a slot in a clear order: whatever sits on its way out leaves before it
  function attempt(s, rng) {
    const w = s.w, h = s.h, n = w * h;
    const own = new Array(n).fill(-1), cross = Array.from({ length: n }, () => []);
    const bodies = [], dirs = [], ord = [], pos = [], mark = new Array(n).fill(0);
    let stamp = 0;
    const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    const minCross = (c, hi, skip) => { for (const i of cross[c]) if (i !== skip && pos[i] < hi) hi = pos[i]; return hi; };
    const wantLen = () => 2 + Math.min(rng.nextInt(s.maxLen - 1), rng.nextInt(s.maxLen - 1) + 2);
    function commit(body, d, q) {
      const id = bodies.length; bodies.push(body); dirs.push(d);
      ord.splice(q, 0, id); pos.push(0); for (let i = q; i < ord.length; i++) pos[ord[i]] = i;
      for (const c of body) own[c] = id;
      for (const c of rayFrom(w, h, body[body.length - 1], d)) cross[c].push(id);
    }
    function place(hd, d, want) {
      if (own[hd] !== -1) return false;
      const nx = hd % w - DX[d], ny = Math.floor(hd / w) - DY[d];
      if (!inside(nx, ny)) return false;
      const neck = ny * w + nx; if (own[neck] !== -1) return false;
      const ray = rayFrom(w, h, hd, d);
      let lo = -1; for (const c of ray) if (own[c] >= 0 && pos[own[c]] > lo) lo = pos[own[c]];
      let hi = minCross(neck, minCross(hd, ord.length));
      if (hi <= lo) return false;
      stamp++; for (const c of ray) mark[c] = stamp; mark[hd] = stamp; mark[neck] = stamp;
      const body = [neck, hd]; let cx = nx, cy = ny, last = d;
      while (body.length < want) {
        const opts = [];
        for (let k = 0; k < 4; k++) {
          const px = cx - DX[k], py = cy - DY[k]; if (!inside(px, py)) continue;
          const c = py * w + px; if (own[c] !== -1 || mark[c] === stamp || minCross(c, hi) <= lo) continue;
          opts.push(k);
        }
        if (!opts.length) break;
        const bends = opts.filter(k => k !== last);
        const k = opts.includes(last) && (!bends.length || !rng.chance(s.turn)) ? last : bends[rng.nextInt(bends.length)];
        cx -= DX[k]; cy -= DY[k]; const c = cy * w + cx; body.unshift(c); mark[c] = stamp; hi = minCross(c, hi); last = k;
      }
      commit(body, d, lo + 1 + rng.nextInt(hi - lo));
      return true;
    }
    // an empty cell joins a neighbour's tail, or a head steps forward into it
    function grow(c) {
      const x = c % w, y = Math.floor(c / w), ks = [0, 1, 2, 3]; rng.shuffle(ks);
      for (const k of ks) {
        const px = x + DX[k], py = y + DY[k]; if (!inside(px, py)) continue;
        const nb = py * w + px, a = own[nb]; if (a < 0 || bodies[a].length >= MAX_LEN) continue;
        const b = bodies[a];
        if (b[0] === nb && minCross(c, ord.length) > pos[a]) { b.unshift(c); own[c] = a; return true; }
        if (b[b.length - 1] === nb && dirs[a] === (k + 2) % 4 && minCross(c, ord.length, a) > pos[a]) {
          b.push(c); own[c] = a; cross[c] = cross[c].filter(i => i !== a); return true;
        }
      }
      return false;
    }
    const cells = Array.from({ length: n }, (_, i) => i);
    for (let round = 0; round < 8; round++) {
      let changed = false;
      rng.shuffle(cells);
      for (const c of cells) {
        if (own[c] !== -1) continue;
        const ds = [0, 1, 2, 3]; rng.shuffle(ds);
        for (const d of ds) if (place(c, d, wantLen())) { changed = true; break; }
      }
      for (let more = true; more;) { more = false; for (const c of cells) if (own[c] === -1 && grow(c)) more = changed = true; }
      if (!changed) break;
    }
    const p = { w, h, arrows: bodies.map((b, i) => ({ cells: b, dir: dirs[i], color: 0 })) };
    // touching arrows never share a colour
    const g = fullGrid(p);
    p.arrows.forEach((a, i) => {
      const near = new Set();
      for (const c of a.cells) for (let d = 0; d < 4; d++) {
        const nx = c % w + DX[d], ny = Math.floor(c / w) + DY[d]; if (!inside(nx, ny)) continue;
        const b = g[ny * w + nx]; if (b >= 0 && b < i) near.add(p.arrows[b].color);
      }
      const ok = []; for (let k = 0; k < COLORS.length; k++) if (!near.has(k)) ok.push(k);
      a.color = ok.length ? ok[rng.nextInt(ok.length)] : rng.nextInt(COLORS.length);
    });
    return p;
  }

  const fillOf = p => p.arrows.reduce((n, a) => n + a.cells.length, 0) / (p.w * p.h);
  // best of a few seeded tries, each proved clearable by the solver
  function generate(s, seed) {
    const rng = Rng(seed); let best = null, bestScore = -1;
    for (let t = 0; t < 8; t++) {
      const p = attempt(s, Rng(rng.next())), info = solveBoard(p);
      if (!info.ok || p.arrows.length < 2 || info.first >= p.arrows.length) continue;
      const fill = fillOf(p);
      const score = Math.round(fill * 1000) + Math.min(info.rounds, s.minRounds) * 25 - info.first;
      if (score > bestScore) { bestScore = score; best = p; }
      if (fill >= 0.9 && info.rounds >= s.minRounds) break;
    }
    if (best) {
      // a few short arrows come out so the board has room to breathe; fewer arrows can never block a clear
      const target = 0.89 + rng.nextInt(6) / 100, n = best.w * best.h, order = best.arrows.map((_, i) => i);
      rng.shuffle(order);
      let used = Math.round(fillOf(best) * n); const drop = new Set();
      for (const i of order) { const len = best.arrows[i].cells.length; if (used / n <= target) break; if (len <= 3) { drop.add(i); used -= len; } }
      best.arrows = best.arrows.filter((_, i) => !drop.has(i));
      return best;
    }
    const arrows = [];
    for (let y = 0; y < s.h; y++) for (let x = 0; x + 1 < s.w; x += 2) arrows.push({ cells: [y * s.w + x, y * s.w + x + 1], dir: 1, color: arrows.length % COLORS.length });
    return { w: s.w, h: s.h, arrows };
  }
  const levelPuzzle = level => generate(specFor(level), Math.imul(7919, level) + 101 >>> 0);
  const dayNumber = d => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 10, 1)) / 864e5) + 1;
  // Monday is the easiest daily board, Sunday the biggest
  const dailyPuzzle = d => generate(specFor(25 + ((d.getDay() + 6) % 7) * 12), 0xA77A0000 + d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate());
  const sketch = p => { const g = fullGrid(p); let out = ''; for (let y = 0; y < p.h; y++) { for (let x = 0; x < p.w; x++) { const i = y * p.w + x, a = g[i]; out += a < 0 ? ' .' : head(p.arrows[a]) === i ? ' ' + '^>v<'[p.arrows[a].dir] : ' ' + String.fromCharCode(97 + (a % 26)); } out += '\n'; } return out; };
  if (typeof window === 'undefined') { module.exports = { levelPuzzle, dailyPuzzle, solveBoard, specFor, fillOf, sketch, COLORS }; return; }

  // saved progress; version 1.0 kept only {level}
  const dayKey = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  let save = {}; try { save = JSON.parse(localStorage.getItem('arrowslide_save') || '{}') || {}; } catch (e) { save = {}; }
  save.unlocked = Math.max(1, save.unlocked || save.level || 1);
  save.stars = typeof save.stars === 'string' ? save.stars : '';
  if (save.sound === undefined) save.sound = true;
  save.shapes = !!save.shapes;
  const persist = () => { try { localStorage.setItem('arrowslide_save', JSON.stringify(save)); } catch (e) { /* private mode */ } };
  const FREE = { hint: 3, undo: 3, lift: 1 };
  function toolsLeft() { const k = dayKey(new Date()); if (save.toolDay !== k || !save.tools) { save.toolDay = k; save.tools = Object.assign({}, FREE); persist(); } return save.tools; }

  const $ = id => document.getElementById(id), canvas = $('board'), ctx = canvas.getContext('2d');
  if (!ctx.roundRect) ctx.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const BG = '#0C1316';
  let daily = false, level = save.unlocked, p, grid, mistakes, lifted, history, lifting, hint, hintUntil, leaving, bump, won, step, cursor = -1;
  let W = 300, H = 300, dpr = 1, fitTile = 20, zoom = 1, panX = 0, panY = 0, tile = 20, ox = 0, oy = 0;

  function start() {
    p = daily ? dailyPuzzle(new Date()) : levelPuzzle(level);
    grid = fullGrid(p); mistakes = 0; lifted = false; history = []; lifting = false; hint = null; leaving = []; bump = null; won = false; step = 0; cursor = -1;
    zoom = 1; panX = panY = 0;
    if (!daily && level <= 2) { hint = hintArrow(); hintUntil = Infinity; }
    $('title').textContent = daily ? 'Daily #' + dayNumber(new Date()) : 'Level ' + level;
    $('tabLevel').classList.toggle('on', !daily); $('tabDaily').classList.toggle('on', daily);
    $('tabLevel').setAttribute('aria-pressed', String(!daily)); $('tabDaily').setAttribute('aria-pressed', String(daily));
    ui(); layout(); kick();
  }
  const stars = () => Math.min(mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, lifted ? 2 : 3);
  const starText = n => '★'.repeat(n) + '<span class="off">' + '★'.repeat(3 - n) + '</span>';
  const leftCount = () => new Set(grid.filter(x => x >= 0)).size;
  function hintArrow() {
    let best = null, gain = -1;
    for (const a of movable(p, grid)) { const g = grid.slice(); p.arrows[a].cells.forEach(c => (g[c] = -1)); const n = movable(p, g).length; if (n > gain) { gain = n; best = a; } }
    return best;
  }

  const ICON = {
    restart: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
    undo: '<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -6)"/>',
    hint: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    lift: '<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.6 14a1.5 1.5 0 0 1 2.4-1.8L7 13.5"/>',
    on: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    off: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="m17 9 5 6M22 9l-5 6"/>'
  };
  const svg = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';

  function ui() {
    const t = toolsLeft(), left = leftCount();
    $('stars').innerHTML = starText(stars());
    $('stars').setAttribute('aria-label', stars() + ' of 3 stars');
    const n = $('note'); n.className = 'note' + (lifting ? ' lift' : '');
    n.textContent = lifting ? 'Tap the arrow to remove' : hint !== null && hintUntil === Infinity ? 'Tap an arrow whose way to the edge is clear' :
      left + (left === 1 ? ' arrow left' : ' arrows left') + (mistakes ? '  |  ' + mistakes + (mistakes === 1 ? ' mistake' : ' mistakes') : '');
    $('snd').innerHTML = svg(save.sound ? ICON.on : ICON.off); $('snd').setAttribute('aria-pressed', String(save.sound));
    $('shp').setAttribute('aria-pressed', String(save.shapes)); $('shp').classList.toggle('on', save.shapes);
    const defs = [['restart', 'Restart', null, 'R'], ['undo', 'Undo', t.undo, 'U'], ['hint', 'Hint', t.hint, 'H'], ['lift', 'Remove one', t.lift, 'X']];
    $('tools').innerHTML = defs.map(([k, lab, c, key]) => '<button class="tool' + (k === 'lift' && lifting ? ' on' : '') + '" data-k="' + k + '" aria-keyshortcuts="' + key + '"' +
      ((k === 'undo' && !history.length) || won ? ' disabled' : '') + '>' + svg(ICON[k]) + '<span>' + lab + '</span>' +
      (c === null ? '' : '<b class="badge' + (c ? '' : ' zero') + '">' + c + '</b>') + '</button>').join('');
  }

  // fit the board in the space left, centred both ways
  function layout() {
    const wrap = $('wrap');
    dpr = Math.min(window.devicePixelRatio || 1, 3); W = Math.max(50, wrap.clientWidth); H = Math.max(50, wrap.clientHeight);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const pad = W < 520 ? 10 : 20;
    fitTile = Math.max(6, Math.min(46, (W - pad * 2) / p.w, (H - pad * 2) / p.h));
    view();
  }
  const maxZoom = () => Math.max(1.6, 64 / fitTile);
  function view() {
    zoom = Math.max(1, Math.min(maxZoom(), zoom)); tile = fitTile * zoom;
    const bw = tile * p.w, bh = tile * p.h, mx = Math.max(0, (bw - W) / 2 + 40), my = Math.max(0, (bh - H) / 2 + 40);
    panX = Math.max(-mx, Math.min(mx, panX)); panY = Math.max(-my, Math.min(my, panY));
    ox = Math.round(((W - bw) / 2 + panX) * dpr) / dpr; oy = Math.round(((H - bh) / 2 + panY) * dpr) / dpr;
    $('fit').disabled = zoom <= 1.001;
  }
  function zoomAt(px, py, nz) {
    const u = (px - ox) / tile, v = (py - oy) / tile;
    zoom = Math.max(1, Math.min(maxZoom(), nz)); tile = fitTile * zoom;
    panX = px - u * tile - (W - tile * p.w) / 2; panY = py - v * tile - (H - tile * p.h) / 2;
    view(); kick();
  }
  function lookAt(cell) {
    if (zoom <= 1.001) return;
    const [x, y] = center(cell);
    if (x > tile && x < W - tile && y > tile && y < H - tile) return;
    panX += W / 2 - x; panY += H / 2 - y; view();
  }
  const center = c => [ox + (c % p.w + 0.5) * tile, oy + (Math.floor(c / p.w) + 0.5) * tile];

  // the body follows its own trail, then runs straight out of the head
  function shifted(a, shift, reach) {
    const pts = a.cells.map(center), last = pts[pts.length - 1];
    for (let k = 1; k <= reach; k++) pts.push([last[0] + DX[a.dir] * tile * k, last[1] + DY[a.dir] * tile * k]);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const at = s => { if (s <= 0) return pts[0]; let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = Math.min(1, (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
    const len = cum[a.cells.length - 1], out = [at(shift)];
    for (let i = 0; i < pts.length; i++) if (cum[i] > shift + 0.01 && cum[i] < shift + len - 0.01) out.push(pts[i]);
    out.push(at(shift + len));
    return out;
  }
  const exitReach = a => rayFrom(p.w, p.h, head(a), a.dir).length + a.cells.length + 1;

  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, f) => { const x = rgb(a), y = rgb(b); return 'rgb(' + x.map((v, i) => Math.round(v * (1 - f) + y[i] * f)).join(',') + ')'; };

  // a small dark mark per colour, for the high-contrast setting
  function shapeMark(k, x, y, r) {
    ctx.fillStyle = BG; ctx.strokeStyle = BG; ctx.lineWidth = Math.max(1, r * 0.55); ctx.beginPath();
    if (k === 0) { ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    else if (k === 1) { ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7); ctx.fill(); }
    else if (k === 2) { ctx.moveTo(x, y - r * 1.15); ctx.lineTo(x + r * 1.15, y); ctx.lineTo(x, y + r * 1.15); ctx.lineTo(x - r * 1.15, y); ctx.closePath(); ctx.fill(); }
    else if (k === 3) { ctx.arc(x, y, r * 0.8, 0, 7); ctx.stroke(); }
    else if (k === 4) { ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); }
    else if (k === 5) { ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); }
    else { ctx.moveTo(x - r, y + r * 0.8); ctx.lineTo(x + r, y + r * 0.8); ctx.lineTo(x, y - r); ctx.closePath(); ctx.fill(); }
  }

  function arrowPath(pts) {
    const r = tile * 0.4;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) ctx.arcTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r);
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  }
  function drawArrow(pts, k, dir, glow, flash, mark) {
    const base = COLORS[k], col = flash > 0 ? mix(base, '#FF4F5E', flash * 0.8) : base;
    const lw = Math.max(1.6, tile * (save.shapes ? 0.36 : 0.32)), hd = pts[pts.length - 1], dx = DX[dir], dy = DY[dir];
    const tip = [hd[0] + dx * tile * 0.42, hd[1] + dy * tile * 0.42], bs = [hd[0] - dx * tile * 0.08, hd[1] - dy * tile * 0.08];
    const hw = Math.max(lw * 0.95, tile * 0.27), sx = -dy * hw, sy = dx * hw;
    const tri = () => { ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(bs[0] + sx, bs[1] + sy); ctx.lineTo(bs[0] - sx, bs[1] - sy); ctx.closePath(); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (glow > 0) {
      ctx.strokeStyle = 'rgba(255,236,190,' + (0.22 + 0.5 * glow).toFixed(3) + ')'; ctx.lineWidth = lw * 2.5; arrowPath(pts); ctx.stroke();
      ctx.lineWidth = lw * 1.5; tri(); ctx.stroke();
    }
    if (save.shapes) { ctx.strokeStyle = BG; ctx.lineWidth = lw + Math.max(2, tile * 0.08); arrowPath(pts); ctx.stroke(); tri(); ctx.lineWidth = Math.max(2, tile * 0.08); ctx.stroke(); }
    ctx.strokeStyle = col; ctx.lineWidth = lw; arrowPath(pts); ctx.stroke();
    tri(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = Math.max(1, tile * 0.05); ctx.strokeStyle = col; ctx.stroke();
    // a hollow bead marks the tail
    const tl = pts[0]; ctx.beginPath(); ctx.arc(tl[0], tl[1], lw * 0.62, 0, 7); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(tl[0], tl[1], lw * 0.26, 0, 7); ctx.fillStyle = BG; ctx.fill();
    if (mark && save.shapes && tile >= 9) shapeMark(k, hd[0] - dx * tile * 0.5, hd[1] - dy * tile * 0.5, lw * 0.3);
  }

  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = Math.max(6, tile * 0.35), x0 = ox - pad, y0 = oy - pad, bw = tile * p.w + pad * 2, bh = tile * p.h + pad * 2, rr = Math.min(18, pad * 1.4);
    ctx.beginPath(); ctx.roundRect(x0, y0, bw, bh, rr); ctx.fillStyle = '#111B1F'; ctx.fill();
    ctx.lineWidth = lifting ? 2 : 1; ctx.strokeStyle = lifting ? '#F2A93B' : '#21333A'; ctx.stroke();
    // faint grid and a dot on each empty cell
    if (tile >= 9) {
      ctx.beginPath();
      for (let x = 1; x < p.w; x++) { const X = Math.round((ox + x * tile) * dpr) / dpr + 0.5 / dpr; ctx.moveTo(X, oy); ctx.lineTo(X, oy + tile * p.h); }
      for (let y = 1; y < p.h; y++) { const Y = Math.round((oy + y * tile) * dpr) / dpr + 0.5 / dpr; ctx.moveTo(ox, Y); ctx.lineTo(ox + tile * p.w, Y); }
      ctx.lineWidth = 1 / dpr; ctx.strokeStyle = 'rgba(190,225,230,.07)'; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(190,225,230,.16)';
    for (let c = 0; c < grid.length; c++) if (grid[c] < 0) { const [x, y] = center(c); ctx.beginPath(); ctx.arc(x, y, Math.max(1, tile * 0.06), 0, 7); ctx.fill(); }
    const bt = bump ? (calm ? 0.5 : Math.min(1, (now - bump.t0) / 460)) : 0, fl = bump ? Math.sin(Math.PI * Math.min(1, bt * 1.2)) : 0;
    if (bump) { const [x, y] = center(bump.cell); ctx.beginPath(); ctx.arc(x, y, tile * 0.46, 0, 7); ctx.lineWidth = Math.max(1.5, tile * 0.08); ctx.strokeStyle = 'rgba(255,79,94,' + (0.9 * fl).toFixed(3) + ')'; ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, bw, bh, rr); ctx.clip();
    const pulse = calm ? 1 : 0.55 + 0.45 * Math.sin(now / 200), seen = new Set();
    for (const a of grid) {
      if (a < 0 || seen.has(a)) continue; seen.add(a);
      const ar = p.arrows[a];
      if (bump && bump.a === a) {
        // runs up to the blocker, comes back and shivers
        const go = calm ? 0 : bump.reach * tile * Math.sin(Math.PI * Math.min(1, bt / 0.6)) * (bt < 0.6 ? 1 : 0);
        const sh = calm || bt < 0.6 ? 0 : Math.sin((bt - 0.6) * 60) * tile * 0.09 * (1 - bt) / 0.4;
        ctx.save(); ctx.translate(-DY[ar.dir] * sh, DX[ar.dir] * sh); drawArrow(shifted(ar, go, 1), ar.color, ar.dir, 0, fl, false); ctx.restore();
      } else drawArrow(ar.cells.map(center), ar.color, ar.dir, a === hint ? pulse : 0, 0, true);
    }
    for (const l of leaving) {
      const ar = p.arrows[l.a], t = Math.min(1, (now - l.t0) / l.dur), e = t * t * (0.6 + 0.4 * t);
      drawArrow(shifted(ar, e * l.reach * tile, l.reach), ar.color, ar.dir, 0, 0, false);
    }
    ctx.restore();
    if (cursor >= 0 && !won) {
      const [x, y] = center(cursor); ctx.beginPath(); ctx.roundRect(x - tile * 0.5 + 1, y - tile * 0.5 + 1, tile - 2, tile - 2, tile * 0.2);
      ctx.lineWidth = 2; ctx.strokeStyle = '#FFF4D6'; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  let raf = 0;
  function frame(now) {
    raf = 0;
    leaving = leaving.filter(l => now - l.t0 < l.dur);
    if (bump && now - bump.t0 > (calm ? 650 : 460)) bump = null;
    if (hint !== null && hintUntil !== Infinity && now > hintUntil) hint = null;
    draw(now);
    if (leaving.length || bump || (hint !== null && !calm)) raf = requestAnimationFrame(frame);
    else if (calm && (bump || hint !== null)) setTimeout(kick, 200);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  // tiny sounds made in the browser, with mute
  let actx = null;
  function beep(f, len, type, vol) {
    if (!save.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, t); if (type === 'sine') o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.1);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + len);
    } catch (e) { /* no audio */ }
  }
  const NOTES = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];

  function clearArrow(a) {
    const ar = p.arrows[a]; ar.cells.forEach(c => (grid[c] = -1));
    if (!calm) { const reach = exitReach(ar); leaving.push({ a, t0: performance.now(), reach, dur: Math.min(820, 220 + reach * 16) }); }
    if (hint === a || hintUntil === Infinity) hint = null;
  }
  function tapCell(cell) {
    if (won || cell < 0) return;
    const a = grid[cell]; if (a < 0) return;
    if (lifting) {
      const t = toolsLeft(); if (t.lift <= 0) return;
      t.lift--; persist(); history.push({ a, m: mistakes, l: lifted }); lifted = true; lifting = false; clearArrow(a); beep(NOTES[step++ % 8], 0.35, 'sine', 0.18);
    } else {
      const b = blocker(p, grid, a);
      if (b !== null) {
        history.push({ a: -1, m: mistakes, l: lifted }); mistakes++;
        bump = { a, cell: b, t0: performance.now(), reach: Math.max(0, rayFrom(p.w, p.h, head(p.arrows[a]), p.arrows[a].dir).indexOf(b)) + 0.12 };
        beep(150, 0.16, 'triangle', 0.3); if (navigator.vibrate) navigator.vibrate(15);
      } else {
        history.push({ a, m: mistakes, l: lifted }); clearArrow(a); beep(NOTES[step++ % 8], 0.35, 'sine', 0.18);
      }
    }
    ui(); kick();
    if (!grid.some(x => x >= 0)) win();
  }
  // the cell under the finger, or the nearest arrow cell when the tap lands just beside one
  function cellAt(px, py) {
    const fx = (px - ox) / tile, fy = (py - oy) / tile, x = Math.floor(fx), y = Math.floor(fy);
    let best = -1, bd = 0.72 * 0.72;
    for (let j = y - 1; j <= y + 1; j++) for (let i = x - 1; i <= x + 1; i++) {
      if (i < 0 || j < 0 || i >= p.w || j >= p.h) continue;
      const c = j * p.w + i; if (grid[c] < 0) continue;
      const d = (fx - i - 0.5) ** 2 + (fy - j - 0.5) ** 2; if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  // one finger taps or drags, two fingers pinch, the wheel zooms
  const ptrs = new Map(); let gest = null;
  const local = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener('pointerdown', e => {
    if (!p || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* fine */ }
    const [x, y] = local(e); ptrs.set(e.pointerId, [x, y]);
    if (ptrs.size === 1) gest = { kind: 'tap', sx: x, sy: y, px: panX, py: panY };
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; gest = { kind: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z0: zoom, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; }
  });
  canvas.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId) || !gest) return;
    const [x, y] = local(e); ptrs.set(e.pointerId, [x, y]);
    if (gest.kind === 'pinch' && ptrs.size >= 2) {
      const [a, b] = [...ptrs.values()], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      panX += m[0] - gest.m[0]; panY += m[1] - gest.m[1]; view(); gest.m = m;
      zoomAt(m[0], m[1], gest.z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / gest.d0);
    } else if (gest.kind === 'tap' && Math.hypot(x - gest.sx, y - gest.sy) > 8) gest.kind = 'pan';
    if (gest.kind === 'pan') { panX = gest.px + x - gest.sx; panY = gest.py + y - gest.sy; view(); kick(); }
  });
  const lift = e => {
    if (!ptrs.has(e.pointerId)) return;
    const [x, y] = local(e);
    if (gest && gest.kind === 'tap' && ptrs.size === 1 && e.type === 'pointerup') { cursor = -1; tapCell(cellAt(x, y)); }
    ptrs.delete(e.pointerId);
    if (!ptrs.size) gest = null; else if (gest && gest.kind === 'pinch') gest = { kind: 'done' };
  };
  canvas.addEventListener('pointerup', lift); canvas.addEventListener('pointercancel', lift);
  canvas.addEventListener('wheel', e => { if (!p) return; e.preventDefault(); const [x, y] = local(e); zoomAt(x, y, zoom * Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0018))); }, { passive: false });

  function say(t) { const n = $('note'); n.className = 'note lift'; n.textContent = t; clearTimeout(say.t); say.t = setTimeout(ui, 2200); }
  function useTool(k) {
    const t = toolsLeft();
    if (won) return;
    if (k === 'restart') return start();
    if (k === 'undo') {
      if (!history.length) return; if (t.undo <= 0) return say('No undos left today. More tomorrow.');
      t.undo--; persist(); const s = history.pop();
      if (s.a >= 0) { p.arrows[s.a].cells.forEach(c => (grid[c] = s.a)); leaving = leaving.filter(l => l.a !== s.a); }
      mistakes = s.m; lifted = s.l; bump = null;
    }
    if (k === 'hint') {
      if (t.hint <= 0) return say('No hints left today. More tomorrow.');
      const h = hintArrow(); if (h === null) return; t.hint--; persist(); hint = h; hintUntil = performance.now() + 3000; lifting = false;
      cursor = head(p.arrows[h]); lookAt(cursor); beep(880, 0.4, 'sine', 0.12);
    }
    if (k === 'lift') {
      if (lifting) lifting = false;
      else if (t.lift <= 0) return say('No removes left today. More tomorrow.');
      else return ask();
    }
    ui(); kick();
  }
  $('tools').addEventListener('click', e => { const b = e.target.closest('.tool'); if (b && !b.disabled) useTool(b.dataset.k); });
  function ask() { $('ask').classList.add('show'); $('askYes').focus(); }
  $('askYes').addEventListener('click', () => { $('ask').classList.remove('show'); lifting = true; ui(); kick(); });
  $('askNo').addEventListener('click', () => { $('ask').classList.remove('show'); });

  function win() {
    won = true; cursor = -1; const n = stars();
    if (!daily) { const s = save.stars.padEnd(level, '0').split(''); if (n > +s[level - 1]) s[level - 1] = String(n); save.stars = s.join(''); save.unlocked = Math.max(save.unlocked, level + 1); }
    else save.daily = { day: dayKey(new Date()), mistakes };
    persist(); ui();
    setTimeout(() => {
      [0, 2, 4, 5, 7].forEach((k, i) => setTimeout(() => beep(NOTES[k], 0.45, 'sine', 0.13), i * 100));
      $('winTitle').textContent = daily ? 'Daily #' + dayNumber(new Date()) + ' cleared' : 'Level ' + level + ' cleared';
      $('bigStars').innerHTML = starText(n);
      $('winText').textContent = (mistakes === 0 ? 'Perfect, no mistakes.' : mistakes === 1 ? 'Cleared with 1 mistake.' : 'Cleared with ' + mistakes + ' mistakes.') + (lifted ? ' Remove one was used.' : '');
      $('next').style.display = daily ? 'none' : '';
      $('overlay').classList.add('show'); (daily ? $('replay') : $('next')).focus();
    }, calm ? 200 : 700);
  }
  $('next').addEventListener('click', () => { $('overlay').classList.remove('show'); level++; start(); });
  $('replay').addEventListener('click', () => { $('overlay').classList.remove('show'); start(); });
  $('tabLevel').addEventListener('click', () => { daily = false; level = save.unlocked; start(); });
  $('tabDaily').addEventListener('click', () => { daily = true; start(); });
  $('snd').addEventListener('click', () => { save.sound = !save.sound; persist(); ui(); });
  $('shp').addEventListener('click', () => { save.shapes = !save.shapes; persist(); ui(); kick(); });
  $('fit').addEventListener('click', () => { zoom = 1; panX = panY = 0; view(); kick(); });

  // arrows move a cursor, Enter or Space taps, letters run the tools
  function moveCursor(d) {
    if (cursor < 0) { const h = hintArrow(); cursor = h !== null ? head(p.arrows[h]) : Math.floor(p.h / 2) * p.w + Math.floor(p.w / 2); }
    else { const x = cursor % p.w + DX[d], y = Math.floor(cursor / p.w) + DY[d]; if (x >= 0 && y >= 0 && x < p.w && y < p.h) cursor = y * p.w + x; }
    lookAt(cursor); kick();
  }
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); return useTool('undo'); }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if ($('ask').classList.contains('show')) { if (e.key === 'Escape') $('askNo').click(); return; }
    if ($('overlay').classList.contains('show')) return;
    const onBtn = document.activeElement && document.activeElement.tagName === 'BUTTON';
    const k = e.key, dir = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[k];
    if (dir !== undefined) { e.preventDefault(); moveCursor(dir); }
    else if ((k === 'Enter' || k === ' ') && !onBtn) { e.preventDefault(); if (cursor < 0) moveCursor(0); else tapCell(cursor); }
    else if (k === 'Escape' && lifting) { lifting = false; ui(); kick(); }
    else {
      const m = { r: 'restart', u: 'undo', h: 'hint', x: 'lift' }[k.toLowerCase()];
      if (m) useTool(m);
      else if (k === 'm' || k === 'M') $('snd').click();
      else if (k === 's' || k === 'S') $('shp').click();
      else if (k === 'f' || k === 'F' || k === '0') $('fit').click();
      else if (k === '+' || k === '=') zoomAt(W / 2, H / 2, zoom * 1.25);
      else if (k === '-' || k === '_') zoomAt(W / 2, H / 2, zoom / 1.25);
    }
  });
  // refit whenever the board box changes size
  let rs = 0;
  const refit = () => { cancelAnimationFrame(rs); rs = requestAnimationFrame(() => { if (p) { layout(); kick(); } }); };
  if (window.ResizeObserver) new ResizeObserver(refit).observe($('wrap')); else window.addEventListener('resize', refit);
  persist();
  start();
})();
