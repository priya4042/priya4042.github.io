(function () {
  'use strict';
  // same rules and seeded maker as the Arrow Slide app, so level N matches on every device
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const COLORS = ['#3ec8ff', '#ff9f2e', '#ff5fbf', '#5fe38a', '#ffd84a', '#9d7bff', '#34d6c4', '#ff7b72'];
  const MAX_W = 11, MAX_H = 15;

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

  function specFor(level) {
    const l = Math.max(1, level);
    if (l === 1) return { w: 3, h: 4, minLen: 2, maxLen: 3, turn: 20, minRounds: 2, chain: 0 };
    if (l === 2) return { w: 4, h: 5, minLen: 2, maxLen: 3, turn: 25, minRounds: 2, chain: 10 };
    const w = Math.min(MAX_W, 4 + Math.floor(Math.sqrt(l - 1) * 0.5)), h = Math.min(MAX_H, w + Math.floor((w + 2) / 3));
    return { w, h, minLen: l < 25 ? 2 : 3, maxLen: Math.min(8, 3 + Math.floor(l / 30)), turn: Math.min(70, 25 + Math.floor(l / 5)),
      minRounds: Math.min(3 + Math.floor(l / 10), w + 3), chain: Math.min(90, 20 + Math.floor(l / 2)) };
  }

  // arrows go on one by one, each with a clear way out at that moment, so taking them off in reverse always works
  function attempt(s, rng) {
    const w = s.w, h = s.h, n = w * h, grid = new Array(n).fill(-1);
    const bodies = [], dirs = [], height = [], crossing = Array.from({ length: n }, () => []);
    const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    const freeFor = (cell, k) => crossing[cell].every(i => i < k);
    const chainOf = body => { let best = 0; for (const c of body) for (const i of crossing[c]) if (height[i] > best) best = height[i]; return best + 1; };
    function build(hd, dir, want, min) {
      if (grid[hd] !== -1) return null;
      const ray = rayFrom(w, h, hd, dir);
      if (ray.some(c => grid[c] !== -1)) return null;
      const bx = hd % w - DX[dir], by = Math.floor(hd / w) - DY[dir];
      if (!inside(bx, by) || grid[by * w + bx] !== -1) return null;
      const body = [by * w + bx, hd]; let cx = bx, cy = by, last = dir;
      while (body.length < want) {
        const opts = [];
        for (let d = 0; d < 4; d++) {
          const nx = cx - DX[d], ny = cy - DY[d]; if (!inside(nx, ny)) continue;
          const c = ny * w + nx; if (grid[c] !== -1 || ray.includes(c) || body.includes(c)) continue; opts.push(d);
        }
        if (!opts.length) break;
        const bends = opts.filter(o => o !== last);
        const d = opts.includes(last) && (!bends.length || !rng.chance(s.turn)) ? last : bends[rng.nextInt(bends.length)];
        cx -= DX[d]; cy -= DY[d]; body.unshift(cy * w + cx); last = d;
      }
      return body.length < min ? null : body;
    }
    function commit(body, dir) {
      const id = bodies.length; height.push(chainOf(body)); body.forEach(c => (grid[c] = id));
      rayFrom(w, h, body[body.length - 1], dir).forEach(c => crossing[c].push(id)); bodies.push(body); dirs.push(dir);
    }
    const wantLen = () => s.minLen + rng.nextInt(s.maxLen - s.minLen + 1);
    let misses = 0;
    while (misses < 6) {
      let pick = null, pickDir = 0, pickChain = -1;
      for (let t = 0; t < 40; t++) {
        const dir = rng.nextInt(4), hd = rng.nextInt(n), body = build(hd, dir, wantLen(), s.minLen);
        if (!body) continue;
        const ch = chainOf(body) * 10 + rng.nextInt(10);
        if (pick === null || (ch > pickChain && rng.chance(s.chain))) { pick = body; pickDir = dir; pickChain = ch; }
      }
      if (pick === null) misses++; else { misses = 0; commit(pick, pickDir); }
    }
    const order = Array.from({ length: n }, (_, i) => i); rng.shuffle(order);
    for (const c of order) {
      const ds = [0, 1, 2, 3]; rng.shuffle(ds);
      for (const d of ds) { const body = build(c, d, wantLen(), s.minLen); if (body) { commit(body, d); break; } }
    }
    let grew = true;
    while (grew) {
      grew = false;
      for (let c = 0; c < n; c++) {
        if (grid[c] !== -1) continue;
        const x = c % w, y = Math.floor(c / w);
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (!inside(nx, ny)) continue;
          const k = grid[ny * w + nx];
          if (k < 0 || bodies[k][0] !== ny * w + nx || bodies[k].length >= s.maxLen + 1 || !freeFor(c, k)) continue;
          bodies[k].unshift(c); grid[c] = k; grew = true; break;
        }
      }
    }
    for (const c of order) for (let d = 0; d < 4 && grid[c] === -1; d++) { const body = build(c, d, 3, 2); if (body) commit(body, d); }
    const p = { w, h, arrows: bodies.map((b, i) => ({ cells: b, dir: dirs[i], color: 0 })) };
    // neighbouring arrows never share a colour
    const g = fullGrid(p), cols = new Array(p.arrows.length).fill(-1);
    p.arrows.forEach((a, i) => {
      const near = new Set();
      for (const c of a.cells) for (let d = 0; d < 4; d++) {
        const nx = c % w + DX[d], ny = Math.floor(c / w) + DY[d]; if (!inside(nx, ny)) continue;
        const b = g[ny * w + nx]; if (b >= 0 && b !== i && cols[b] >= 0) near.add(cols[b]);
      }
      const ok = []; for (let k = 0; k < COLORS.length; k++) if (!near.has(k)) ok.push(k);
      cols[i] = ok.length ? ok[rng.nextInt(ok.length)] : rng.nextInt(COLORS.length); a.color = cols[i];
    });
    return p;
  }

  function generate(s, seed) {
    const rng = Rng(seed); let best = null, bestScore = -1;
    for (let t = 0; t < 16; t++) {
      const p = attempt(s, Rng(rng.next())), info = solveBoard(p);
      if (!info.ok || p.arrows.length < 2) continue;
      const filled = p.arrows.reduce((n, a) => n + a.cells.length, 0);
      const score = (filled >= s.w * s.h * 0.86 ? 100000 : 0) + Math.min(info.rounds, s.minRounds) * 1000 + filled * 4 - info.first;
      if (score > bestScore) { bestScore = score; best = p; }
      if (info.rounds >= s.minRounds && filled >= s.w * s.h * 0.9) break;
    }
    if (best) return best;
    const arrows = [];
    for (let y = 0; y < s.h; y++) for (let x = 0; x + 1 < s.w; x += 2) arrows.push({ cells: [y * s.w + x, y * s.w + x + 1], dir: 1, color: arrows.length % COLORS.length });
    return { w: s.w, h: s.h, arrows };
  }
  const levelPuzzle = level => generate(specFor(level), 7919 * level + 101);
  const dayNumber = d => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 10, 1)) / 864e5) + 1;
  const dailyPuzzle = d => generate(specFor(30 + ((d.getDay() + 6) % 7) * 15), 0xA77A0000 + d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate());
  const sketch = p => { const g = fullGrid(p); let out = ''; for (let y = 0; y < p.h; y++) { for (let x = 0; x < p.w; x++) { const i = y * p.w + x, a = g[i]; out += a < 0 ? ' .' : head(p.arrows[a]) === i ? ' ' + '^>v<'[p.arrows[a].dir] : ' ' + String.fromCharCode(97 + (a % 26)); } out += '\n'; } return out; };
  if (typeof window === 'undefined') { module.exports = { levelPuzzle, dailyPuzzle, solveBoard, sketch }; return; }

  // saved progress; version 1.0 kept only {level}
  const dayKey = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  let save = {}; try { save = JSON.parse(localStorage.getItem('arrowslide_save') || '{}') || {}; } catch (e) { save = {}; }
  save.unlocked = Math.max(1, save.unlocked || save.level || 1);
  save.stars = save.stars || '';
  if (save.sound === undefined) save.sound = true;
  const persist = () => { try { localStorage.setItem('arrowslide_save', JSON.stringify(save)); } catch (e) { /* private mode */ } };
  const FREE = { hint: 3, undo: 3, lift: 1 };
  function toolsLeft() { const k = dayKey(new Date()); if (save.toolDay !== k || !save.tools) { save.toolDay = k; save.tools = Object.assign({}, FREE); persist(); } return save.tools; }

  const $ = id => document.getElementById(id), canvas = $('board'), ctx = canvas.getContext('2d');
  if (!ctx.roundRect) ctx.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
  let daily = false, level = save.unlocked, p, grid, mistakes, lifted, history, lifting, hint, hintUntil, leaving, bump, won, step;
  let tile = 40, ox = 0, oy = 0;

  function start() {
    p = daily ? dailyPuzzle(new Date()) : levelPuzzle(level);
    grid = fullGrid(p); mistakes = 0; lifted = false; history = []; lifting = false; hint = null; leaving = []; bump = null; won = false; step = 0;
    if (!daily && level <= 2) { hint = hintArrow(); hintUntil = Infinity; }
    $('title').textContent = daily ? 'Daily puzzle #' + dayNumber(new Date()) : 'Level ' + level;
    $('tabLevel').classList.toggle('on', !daily); $('tabDaily').classList.toggle('on', daily);
    layout(); ui(); draw(performance.now()); kick();
  }
  const stars = () => Math.min(mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, lifted ? 2 : 3);
  const starText = n => '★'.repeat(n) + '<span class="off">' + '★'.repeat(3 - n) + '</span>';
  function hintArrow() {
    let best = null, gain = -1;
    for (const a of movable(p, grid)) { const g = grid.slice(); p.arrows[a].cells.forEach(c => (g[c] = -1)); const n = movable(p, g).length; if (n > gain) { gain = n; best = a; } }
    return best;
  }

  function ui() {
    const t = toolsLeft();
    $('stars').innerHTML = starText(stars());
    $('note').className = 'note' + (lifting ? ' lift' : '');
    $('note').textContent = lifting ? 'Tap the arrow to remove' : (hint !== null && hintUntil === Infinity ? 'Tap an arrow whose path to the edge is clear' : '');
    $('snd').innerHTML = save.sound ? '&#128266;' : '&#128263;';
    const defs = [['restart', '&#8635;', 'Restart', null], ['undo', '&#8630;', 'Undo', t.undo], ['hint', '&#128161;', 'Hint', t.hint], ['lift', '&#9995;', 'Remove one', t.lift]];
    $('tools').innerHTML = defs.map(([k, ic, lab, n]) => '<button class="tool' + (k === 'lift' && lifting ? ' on' : '') + '" data-k="' + k + '"' +
      ((k === 'undo' && !history.length) || won ? ' disabled' : '') + '><span class="ic">' + ic + '</span>' + lab +
      (n === null ? '' : '<span class="badge' + (n ? '' : ' zero') + '">' + n + '</span>') + '</button>').join('');
  }

  function layout() {
    const wrap = $('wrap'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = wrap.clientWidth, H = wrap.clientHeight;
    tile = Math.max(16, Math.min(76, Math.floor(Math.min((W - 16) / p.w, (H - 16) / p.h))));
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ox = (W - tile * p.w) / 2; oy = (H - tile * p.h) / 2;
  }
  const center = c => [ox + (c % p.w + 0.5) * tile, oy + (Math.floor(c / p.w) + 0.5) * tile];

  // the body follows its own trail, then leaves straight out of the head
  function shifted(a, shift) {
    const pts = a.cells.map(center), last = pts[pts.length - 1], reach = p.w + p.h + 2;
    for (let k = 1; k <= reach; k++) pts.push([last[0] + DX[a.dir] * tile * k, last[1] + DY[a.dir] * tile * k]);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const at = s => { if (s <= 0) return pts[0]; let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = Math.min(1, (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
    const len = cum[a.cells.length - 1], out = [at(shift)];
    for (let i = 0; i < pts.length; i++) if (cum[i] > shift && cum[i] < shift + len) out.push(pts[i]);
    out.push(at(shift + len));
    return { out, total: len + reach * tile };
  }

  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, f, alpha) => { const x = rgb(a), y = typeof b === 'string' ? rgb(b) : b; return 'rgba(' + x.map((v, i) => Math.round(v * (1 - f) + y[i] * f)).join(',') + ',' + (alpha === undefined ? 1 : alpha) + ')'; };
  function ribbon(pts, color, dir, glow, flash) {
    const lw = tile * 0.44, bodyHex = color, body = flash > 0 ? mix(bodyHex, '#ff6f61', flash * 0.75) : bodyHex;
    const edge = flash > 0 ? mix(bodyHex, [0, 0, 0], 0.42 + flash * 0.1) : mix(bodyHex, [0, 0, 0], 0.42);
    const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2); ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); };
    const hd = pts[pts.length - 1], dx = DX[dir], dy = DY[dir];
    const tip = [hd[0] + dx * tile * 0.44, hd[1] + dy * tile * 0.44], base = [hd[0] - dx * tile * 0.04, hd[1] - dy * tile * 0.04], sx = -dy * tile * 0.34, sy = dx * tile * 0.34;
    const arrowHead = () => { ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(base[0] + sx, base[1] + sy); ctx.lineTo(base[0] - sx, base[1] - sy); ctx.closePath(); };
    const stroke = (wd, c) => { ctx.lineWidth = wd; ctx.strokeStyle = c; path(); ctx.stroke(); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (glow > 0) { stroke(lw * 1.8, 'rgba(255,255,255,' + 0.34 * glow + ')'); ctx.lineWidth = lw * 0.8; arrowHead(); ctx.stroke(); }
    ctx.save(); ctx.translate(0, tile * 0.07); stroke(lw + tile * 0.06, 'rgba(0,0,0,.32)'); arrowHead(); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fill(); ctx.restore();
    stroke(lw + tile * 0.07, edge); arrowHead(); ctx.lineWidth = tile * 0.07; ctx.strokeStyle = edge; ctx.stroke();
    stroke(lw, body); arrowHead(); ctx.fillStyle = body; ctx.fill();
    ctx.save(); ctx.translate(-lw * 0.08, -lw * 0.18); stroke(lw * 0.3, mix(bodyHex, [255, 255, 255], 0.6, 0.7)); ctx.restore();
    ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], lw * 0.16, 0, 7); ctx.fillStyle = edge; ctx.fill(); ctx.globalAlpha = 1;
  }

  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function draw(now) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();
    const pad = tile * 0.18, r = tile * 0.45, x0 = ox - pad, y0 = oy - pad, bw = tile * p.w + pad * 2, bh = tile * p.h + pad * 2;
    ctx.beginPath(); ctx.roundRect(x0, y0, bw, bh, r); ctx.fillStyle = 'rgba(14,28,53,.88)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = lifting ? '#ffd152' : 'rgba(44,71,114,.7)'; ctx.stroke();
    ctx.fillStyle = 'rgba(241,246,255,.12)';
    for (let c = 0; c < p.w * p.h; c++) { const [x, y] = center(c); ctx.beginPath(); ctx.arc(x, y, tile * 0.06, 0, 7); ctx.fill(); }
    const bt = bump ? (calm ? 0.5 : Math.min(1, (now - bump.t0) / 420)) : 0, fl = bump ? Math.sin(Math.PI * bt) : 0;
    if (bump) { const [x, y] = center(bump.cell); ctx.beginPath(); ctx.arc(x, y, tile * 0.5, 0, 7); ctx.lineWidth = tile * 0.08; ctx.strokeStyle = 'rgba(255,111,97,' + 0.9 * fl + ')'; ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, bw, bh, r); ctx.clip();
    const pulse = calm ? 1 : 0.55 + 0.45 * Math.sin(now / 210);
    for (const a of new Set(grid.filter(x => x >= 0))) {
      const ar = p.arrows[a];
      if (bump && bump.a === a) ribbon(shifted(ar, calm ? 0 : bump.reach * tile * Math.sin(Math.PI * bt)).out, COLORS[ar.color], ar.dir, 0, fl);
      else ribbon(ar.cells.map(center), COLORS[ar.color], ar.dir, a === hint ? pulse : 0, 0);
    }
    for (const l of leaving) { const ar = p.arrows[l.a], t = Math.min(1, (now - l.t0) / 520), s = shifted(ar, 0); ribbon(shifted(ar, t * t * t * s.total).out, COLORS[ar.color], ar.dir, 0, 0); }
    ctx.restore();
  }
  let raf = 0;
  function frame(now) {
    leaving = leaving.filter(l => now - l.t0 < 520);
    if (bump && now - bump.t0 > (calm ? 650 : 420)) bump = null;
    if (hint !== null && hintUntil !== Infinity && now > hintUntil) hint = null;
    draw(now);
    raf = leaving.length || bump || (hint !== null && !calm) ? requestAnimationFrame(frame) : 0;
    if (!raf && calm && (bump || hint !== null)) setTimeout(kick, 200);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  // tiny sounds made in the browser, with mute
  let actx = null;
  function beep(f, len, type, vol) {
    if (!save.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, t); if (type === 'sine') o.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.12);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + len);
    } catch (e) { /* no audio */ }
  }
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

  function clearArrow(a) { p.arrows[a].cells.forEach(c => (grid[c] = -1)); if (!calm) leaving.push({ a, t0: performance.now() }); if (hint === a || hintUntil === Infinity) hint = null; }
  function tapCell(cell) {
    if (won || cell < 0) return;
    const a = grid[cell]; if (a < 0) return;
    if (lifting) {
      const t = toolsLeft(); if (t.lift <= 0) return;
      t.lift--; persist(); history.push({ a, m: mistakes, l: lifted }); lifted = true; lifting = false; clearArrow(a); beep(NOTES[step++ % 8], 0.4, 'sine', 0.2);
    } else {
      const b = blocker(p, grid, a);
      if (b !== null) {
        history.push({ a: -1, m: mistakes, l: lifted }); mistakes++;
        bump = { a, cell: b, t0: performance.now(), reach: Math.max(0, rayFrom(p.w, p.h, head(p.arrows[a]), p.arrows[a].dir).indexOf(b)) + 0.18 };
        beep(160, 0.16, 'triangle', 0.35); if (navigator.vibrate) navigator.vibrate(15);
      } else {
        history.push({ a, m: mistakes, l: lifted }); clearArrow(a); beep(NOTES[step++ % 8], 0.4, 'sine', 0.2);
      }
    }
    ui(); draw(performance.now()); kick();
    if (!grid.some(x => x >= 0)) win();
  }
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault(); if (!p) return;
    const rc = canvas.getBoundingClientRect(), x = Math.floor((e.clientX - rc.left - ox) / tile), y = Math.floor((e.clientY - rc.top - oy) / tile);
    tapCell(x >= 0 && y >= 0 && x < p.w && y < p.h ? y * p.w + x : -1);
  });

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
      const h = hintArrow(); if (h === null) return; t.hint--; persist(); hint = h; hintUntil = performance.now() + 2600; lifting = false; beep(880, 0.5, 'sine', 0.15);
    }
    if (k === 'lift') {
      if (lifting) lifting = false;
      else if (t.lift <= 0) return say('No removes left today. More tomorrow.');
      else if (confirm('Remove one arrow?\n\nTap any arrow to take it off the board, even a stuck one. You get 1 a day, and this level then gives at most 2 stars.')) lifting = true;
    }
    ui(); draw(performance.now()); kick();
  }
  $('tools').addEventListener('click', e => { const b = e.target.closest('.tool'); if (b && !b.disabled) useTool(b.dataset.k); });

  function win() {
    won = true; const n = stars();
    if (!daily) { const s = save.stars.padEnd(level, '0').split(''); if (n > +s[level - 1]) s[level - 1] = String(n); save.stars = s.join(''); save.unlocked = Math.max(save.unlocked, level + 1); }
    else save.daily = { day: dayKey(new Date()), mistakes };
    persist(); ui();
    setTimeout(() => {
      [0, 2, 4, 5, 7].forEach((k, i) => setTimeout(() => beep(NOTES[k], 0.5, 'sine', 0.15), i * 100));
      $('winTitle').textContent = daily ? 'Daily puzzle #' + dayNumber(new Date()) : 'Board clear!';
      $('bigStars').innerHTML = starText(n);
      $('winText').textContent = mistakes === 0 ? 'Perfect: no mistakes!' : mistakes === 1 ? 'Cleared with 1 mistake' : 'Cleared with ' + mistakes + ' mistakes';
      $('next').style.display = daily ? 'none' : '';
      $('overlay').classList.add('show');
    }, calm ? 200 : 650);
  }
  $('next').addEventListener('click', () => { $('overlay').classList.remove('show'); level++; start(); });
  $('replay').addEventListener('click', () => { $('overlay').classList.remove('show'); start(); });
  $('tabLevel').addEventListener('click', () => { daily = false; level = save.unlocked; start(); });
  $('tabDaily').addEventListener('click', () => { daily = true; start(); });
  $('snd').addEventListener('click', () => { save.sound = !save.sound; persist(); ui(); });
  window.addEventListener('resize', () => { if (p) { layout(); draw(performance.now()); } });
  persist();
  start();
})();
