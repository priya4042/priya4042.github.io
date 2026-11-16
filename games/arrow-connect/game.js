(function () {
  'use strict';
  const WATER = ['#2D7FF9', '#F07E10', '#E0458B', '#1E9E57', '#8B5BE6', '#C39200'];
  const IDLE = '#C3D5D5', BOARD = '#CDE9E3', DEEP = '#0B5C57', INK = '#12343B', SUN = '#F2B233', CORAL = '#E8664F';
  const FREE_HINTS = 3;
  const $ = (id) => document.getElementById(id);
  const canvas = $('board'), ctx = canvas.getContext('2d');
  const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // saved progress; private windows and broken saves fall back to a fresh start
  const KEY = 'arrowconnect_v2';
  function readSave() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
    if (typeof s !== 'object') s = {};
    if (!s.unlocked) {
      try { const old = JSON.parse(localStorage.getItem('arrowconnect_save') || '{}'); if (old && old.level > 1) s.unlocked = s.current = Math.min(old.level | 0, 100000); } catch (e) {}
    }
    return {
      unlocked: Math.max(1, s.unlocked | 0), current: Math.max(1, s.current | 0), stars: typeof s.stars === 'string' ? s.stars.replace(/[^0-3]/g, '') : '',
      dailyLast: s.dailyLast || null, dailyStreak: s.dailyStreak | 0, dailyBest: s.dailyBest | 0, dailyMoves: s.dailyMoves | 0, dailyPar: s.dailyPar | 0,
      hintDay: s.hintDay || null, hintsFree: s.hintsFree === undefined ? FREE_HINTS : s.hintsFree | 0, sound: s.sound !== false,
    };
  }
  const save = readSave();
  if (save.current > save.unlocked) save.current = save.unlocked;
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} };
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const yesterday = (d) => dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const starsOf = (l) => (l >= 1 && l <= save.stars.length ? +save.stars[l - 1] : 0);
  function hintsLeft() { const k = dayKey(new Date()); if (save.hintDay !== k) { save.hintDay = k; save.hintsFree = FREE_HINTS; persist(); } return save.hintsFree; }
  const streakNow = () => { const t = new Date(); return save.dailyLast === dayKey(t) || save.dailyLast === yesterday(t) ? save.dailyStreak : 0; };

  // sounds made in the browser, no files
  let audio = null;
  function tone(kind, n) {
    if (!save.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audio.currentTime;
      const blip = (hz, at, dur, glide, vol, type) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(hz, t0 + at);
        if (glide) o.frequency.exponentialRampToValueAtTime(hz * glide, t0 + at + dur * .5);
        g.gain.setValueAtTime(0.0001, t0 + at);
        g.gain.exponentialRampToValueAtTime(vol, t0 + at + .005);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
        o.connect(g); g.connect(audio.destination); o.start(t0 + at); o.stop(t0 + at + dur + .02);
      };
      const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
      if (kind === 'tap') blip(900, 0, .06, 0, .12, 'triangle');
      else if (kind === 'bump') blip(220, 0, .08, 0, .14);
      else if (kind === 'drop') blip(notes[n % notes.length] / 2, 0, .3, 1.9, .2);
      else if (kind === 'win') { [0, 2, 4, 7].forEach((k, i) => blip(notes[k] / 2, i * .11, .3, 1.9, .16)); blip(notes[5], .46, 1, 0, .1); }
    } catch (e) {}
  }

  // the game on screen
  let P, masks, A, dist, history, mode, level, day, won, litAt, turnFrom, hint = null, hintUntil = 0, tutorial = false, wonAt = 0, cursor = -1, tile = 48, dpr = 1;
  function load(l, d) {
    mode = d ? 'daily' : 'level';
    level = l; day = d || null;
    P = d ? dailyPuzzle(d.getFullYear(), d.getMonth() + 1, d.getDate()) : levelPuzzle(l);
    masks = P.start.slice();
    history = []; won = false; turnFrom = {}; hint = null; cursor = -1;
    A = analyse(P, masks); dist = flowDistances(P, masks);
    litAt = Array.from(A.flow, (c) => (c >= 0 ? -1e9 : null));
    tutorial = !d && l <= 2;
    if (tutorial) { const h = hintMove(P, masks); hint = h ? h[0] : null; hintUntil = Infinity; }
    if (!d) { save.current = l; persist(); }
    $('lvl').textContent = d ? 'Daily #' + dailyNumber(d.getFullYear(), d.getMonth() + 1, d.getDate()) : 'Level ' + l;
    $('par').textContent = P.par;
    layout(); refresh(); kick();
  }
  function refresh() {
    $('moves').textContent = history.length;
    $('undo').disabled = !history.length || won;
    $('restart').disabled = won;
    $('hint').disabled = won;
    $('hints').textContent = hintsLeft();
    $('sound').firstChild.textContent = save.sound ? '\u{1F50A}' : '\u{1F507}';
    $('sound').setAttribute('aria-pressed', save.sound ? 'true' : 'false');
  }
  function reread(now) {
    const before = A;
    A = analyse(P, masks); dist = flowDistances(P, masks);
    let first = 1 << 30;
    for (let v = 0; v < A.flow.length; v++) if (A.flow[v] >= 0 && before.flow[v] !== A.flow[v] && dist[v] >= 0) first = Math.min(first, dist[v]);
    for (let v = 0; v < A.flow.length; v++) {
      if (A.flow[v] < 0) litAt[v] = null;
      else if (before.flow[v] !== A.flow[v]) litAt[v] = now + 55 * Math.max(0, dist[v] - first);
    }
    for (let i = 0; i < P.w * P.h; i++) if (A.reached[i] && !before.reached[i]) tone('drop', P.color[i]);
  }
  function turn(i, back) {
    const now = performance.now();
    const cur = angleOf(i, now);
    if (!calm) turnFrom[i] = [cur + (back ? Math.PI / 2 : -Math.PI / 2), now];
    masks[i] = back ? rotBy(masks[i], 3) : rot(masks[i]);
    reread(now);
  }
  function tap(i) {
    if (won || i < 0) return;
    if (!turns(P, i)) { tone('bump'); return; }
    if (tutorial || hint === i) { tutorial = false; hint = null; }
    turn(i); history.push(i); tone('tap');
    afterMove();
  }
  function afterMove() {
    refresh(); kick();
    if (A.ok) win();
  }
  function undo() { if (won || !history.length) return; turn(history.pop(), true); refresh(); kick(); }
  function restart() { if (won) return; history = []; masks = P.start.slice(); turnFrom = {}; reread(performance.now()); refresh(); kick(); }
  function useHint() {
    if (won) return;
    if (hintsLeft() <= 0) return toast('No hints left today. New hints come tomorrow.');
    const h = hintMove(P, masks);
    if (!h) return;
    save.hintsFree--; persist();
    tutorial = false; hint = h[0]; hintUntil = performance.now() + 1500;
    for (let k = 0; k < h[1]; k++) { turn(h[0]); history.push(h[0]); }
    tone('tap'); afterMove();
  }
  function starsFor(moves, par) { if (moves <= par) return 3; const slack = Math.max(2, par >> 1); return moves <= par + slack ? 2 : 1; }
  function win() {
    won = true; hint = null; wonAt = performance.now();
    tone('win');
    const moves = history.length, s = starsFor(moves, P.par);
    let next = null;
    if (mode === 'level') {
      const st = save.stars.padEnd(level, '0').split('');
      if (s > +st[level - 1]) st[level - 1] = String(s);
      save.stars = st.join('');
      if (level + 1 > save.unlocked) save.unlocked = level + 1;
      save.current = level + 1;
      next = level + 1;
    } else {
      const t = new Date(), first = save.dailyLast !== dayKey(t);
      if (save.dailyLast === dayKey(t)) save.dailyStreak = Math.max(1, save.dailyStreak);
      else if (save.dailyLast === yesterday(t)) save.dailyStreak++;
      else save.dailyStreak = 1;
      if (first || moves < save.dailyMoves) save.dailyMoves = moves;
      save.dailyPar = P.par;
      save.dailyLast = dayKey(t);
      save.dailyBest = Math.max(save.dailyBest, save.dailyStreak);
    }
    persist(); refresh(); kick();
    setTimeout(() => showWin(s, moves, next, mode === 'daily' ? day : null), calm ? 250 : 1250);
  }
  function showWin(s, moves, next, dailyDay) {
    $('bigstars').innerHTML = [0, 1, 2].map((i) => (i < s ? '★' : '<span class="off">★</span>')).join('');
    const b = $('winButtons');
    b.innerHTML = '';
    const add = (label, cls, fn) => { const e = document.createElement('button'); e.className = 'btn' + (cls ? ' ' + cls : ''); e.textContent = label; e.onclick = fn; b.appendChild(e); return e; };
    if (!dailyDay) {
      $('winTitle').textContent = 'Level ' + level + ' connected!';
      $('winText').textContent = moves + ' moves, par ' + P.par + (s === 3 ? '. Perfect!' : '. Solve in ' + P.par + ' moves for 3 stars.');
      add('Next level', 'main', () => { hide('win'); load(next); }).focus();
      add('Play again', '', () => { hide('win'); load(level); });
      add('All levels', '', () => { hide('win'); showLevels(); });
    } else {
      const n = dailyNumber(dailyDay.getFullYear(), dailyDay.getMonth() + 1, dailyDay.getDate());
      const line = 'Arrow Connect daily #' + n + ' solved in ' + moves + ' moves ' + '★'.repeat(s) + '☆'.repeat(3 - s);
      $('winTitle').textContent = 'Daily #' + n + ' connected!';
      $('winText').textContent = line + (streakNow() > 0 ? '  Streak: ' + streakNow() + ' days.' : '') + ' A new daily puzzle comes tomorrow.';
      add('Share result', 'main', () => share(line)).focus();
      add('Play level ' + save.current, '', () => { hide('win'); if (mode === 'daily' || won) load(save.current); });
    }
    show('win');
  }
  async function share(line) {
    const text = line + '\n' + location.href.split('#')[0];
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text); toast('Copied. Paste it anywhere to share.'); } catch (e) { toast(text); }
  }
  function playDaily() {
    const t = new Date();
    if (save.dailyLast === dayKey(t)) {
      const n = dailyNumber(t.getFullYear(), t.getMonth() + 1, t.getDate());
      const s = save.dailyPar ? starsFor(save.dailyMoves, save.dailyPar) : 3;
      showWin(s, save.dailyMoves, null, t);
      $('winTitle').textContent = 'Daily #' + n + ' done';
      return;
    }
    load(0, t);
  }

  // levels list
  function showLevels() {
    const g = $('grid'); g.innerHTML = '';
    const count = (((save.unlocked + 20) / 5 | 0) + 1) * 5;
    let total = 0; for (const c of save.stars) total += +c;
    $('starTotal').textContent = '★ ' + total + ' stars. Streak: ' + streakNow() + ' days.';
    for (let l = 1; l <= count; l++) {
      const e = document.createElement('button'), open = l <= save.unlocked, s = starsOf(l);
      e.className = 'lv' + (l === save.current ? ' here' : '');
      e.disabled = !open;
      e.innerHTML = open ? l + '<small>' + '★'.repeat(s) + '☆'.repeat(3 - s) + '</small>' : '&#128274;';
      e.setAttribute('aria-label', open ? 'Level ' + l + ', ' + s + ' stars' : 'Level ' + l + ', locked');
      if (open) e.onclick = () => { hide('levels'); load(l); };
      g.appendChild(e);
    }
    show('levels');
    const here = g.children[save.current - 1]; if (here) here.scrollIntoView({ block: 'center' });
  }
  function show(id) { $(id).classList.add('show'); }
  function hide(id) { $(id).classList.remove('show'); canvas.focus({ preventScroll: true }); }
  let toastTimer = 0;
  function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => e.classList.remove('show'), 2600); }

  // drawing
  function layout() {
    const wrap = $('wrap');
    const aw = wrap.clientWidth, ah = wrap.clientHeight - 20;
    tile = Math.max(30, Math.floor(Math.min(aw / P.w, ah / P.h, 96)));
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.style.width = tile * P.w + 'px'; canvas.style.height = tile * P.h + 'px';
    canvas.width = Math.round(tile * P.w * dpr); canvas.height = Math.round(tile * P.h * dpr);
  }
  function angleOf(i, now) {
    const f = turnFrom[i];
    if (!f || calm) return 0;
    const t = Math.min(1, (now - f[1]) / 170);
    if (t >= 1) { delete turnFrom[i]; return 0; }
    return f[0] * Math.pow(1 - t, 3);
  }
  const fillOf = (v, now) => (litAt[v] === null ? 0 : calm ? 1 : Math.max(0, Math.min(1, (now - litAt[v]) / 260)));
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function glyph(cx, cy, r, col, color) {
    ctx.fillStyle = color; ctx.beginPath();
    switch (col % 6) {
      case 0: ctx.arc(cx, cy, r * .78, 0, 7); break;
      case 1: ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * .95, cy + r * .72); ctx.lineTo(cx - r * .95, cy + r * .72); break;
      case 2: rr(cx - r * .72, cy - r * .72, r * 1.44, r * 1.44, r * .15); break;
      case 3: ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * .82, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r * .82, cy); break;
      case 4: ctx.rect(cx - r * .9, cy - r * .27, r * 1.8, r * .54); ctx.rect(cx - r * .27, cy - r * .9, r * .54, r * 1.8); break;
      default: for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * .45 : r; ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    }
    ctx.closePath(); ctx.fill();
  }
  function nozzle(cx, cy, r, col, source, filled, pop) {
    const color = WATER[col % 6]; r *= pop;
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.arc(cx, cy, r * 1.08, 0, 7); ctx.fill();
    if (source || filled) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      glyph(cx, cy, r * .48, col, '#fff');
      if (!source) { ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .1; ctx.beginPath(); ctx.arc(cx, cy, r * .8, 0, 7); ctx.stroke(); }
    } else {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = r * .26; ctx.beginPath(); ctx.arc(cx, cy, r * .86, 0, 7); ctx.stroke();
      glyph(cx, cy, r * .42, col, color);
    }
  }
  function inflow(i, ch, spokes) {
    const mine = dist[i * 2 + ch]; if (mine <= 0) return null;
    const x = i % P.w, y = (i / P.w) | 0;
    for (const d of spokes) {
      const nx = x + DX[d], ny = y + DY[d];
      if (nx < 0 || ny < 0 || nx >= P.w || ny >= P.h) continue;
      const j = ny * P.w + nx, back = (d + 2) & 3;
      if (!(masks[j] & (1 << back))) continue;
      if (dist[nodeOf(P.kind[j], j, back)] === mine - 1) return d;
    }
    return null;
  }
  function channel(i, ch, m, c, pw, now, phase) {
    if (!m) return;
    const half = c / 2, spokes = [0, 1, 2, 3].filter((d) => m & (1 << d));
    const ex = (d) => DX[d] * half, ey = (d) => DY[d] * half;
    const corner = spokes.length === 2 && (spokes[0] + 2) % 4 !== spokes[1];
    const whole = () => {
      ctx.beginPath();
      if (corner) { ctx.moveTo(ex(spokes[0]), ey(spokes[0])); ctx.quadraticCurveTo(0, 0, ex(spokes[1]), ey(spokes[1])); }
      else for (const d of spokes) { ctx.moveTo(0, 0); ctx.lineTo(ex(d), ey(d)); }
    };
    const seg = (d, a, b) => { ctx.beginPath(); ctx.moveTo(ex(d) * a, ey(d) * a); ctx.lineTo(ex(d) * b, ey(d) * b); ctx.stroke(); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = IDLE; ctx.lineWidth = pw; whole(); ctx.stroke();
    if (spokes.length >= 3) { ctx.fillStyle = IDLE; ctx.beginPath(); ctx.arc(0, 0, pw * .62, 0, 7); ctx.fill(); }
    const node = i * 2 + ch, col = A.flow[node];
    if (col < 0) return;
    const color = WATER[col % 6], f = fillOf(node, now);
    if (f <= 0) return;
    ctx.strokeStyle = color; ctx.lineWidth = pw * .7;
    const din = inflow(i, ch, spokes), pin = Math.min(1, f * 2), pout = Math.max(0, Math.min(1, (f - .5) * 2));
    if (corner && f >= 1) { whole(); ctx.stroke(); }
    else for (const d of spokes) {
      if (d === din) { if (pin > 0) seg(d, 1, 1 - pin); }
      else if (din === null ? pin > 0 : pout > 0) seg(d, 0, din === null ? pin : pout);
    }
    if (spokes.length >= 3 && pin >= 1) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, pw * .45, 0, 7); ctx.fill(); }
    if (!calm && f >= 1) {
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      for (const d of spokes) for (let k = 0; k < 2; k++) {
        let t = (phase + k * .5) % 1; if (d === din) t = 1 - t;
        ctx.beginPath(); ctx.arc(ex(d) * t, ey(d) * t, pw * .13, 0, 7); ctx.fill();
      }
    }
    for (const [cell, d] of A.leaks) {
      if (cell !== i || !spokes.includes(d)) continue;
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(ex(d) * .9, ey(d) * .9, pw * .45, 0, 7); ctx.fill();
    }
  }
  function draw(now) {
    const c = tile, W = P.w * c, H = P.h * c;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BOARD; rr(0, 0, W, H, c * .28); ctx.fill();
    const phase = (now % 1600) / 1600, wave = won && !calm ? Math.min(1, (now - wonAt) / 1200) : 0;
    const cx0 = P.w / 2, cy0 = P.h / 2, far = Math.hypot(cx0, cy0);
    for (let i = 0; i < P.w * P.h; i++) {
      const x = i % P.w, y = (i / P.w) | 0, k = P.kind[i], fixed = !turns(P, i), m = masks[i];
      let scale = 1;
      if (wave > 0) { const t = wave * 1.6 - Math.hypot(x + .5 - cx0, y + .5 - cy0) / far * .6; if (t > 0 && t < 1) scale = 1 + .09 * Math.sin(Math.PI * t); }
      ctx.save(); ctx.translate((x + .5) * c, (y + .5) * c); ctx.scale(scale, scale);
      const half = c / 2, gap = c * .045;
      ctx.fillStyle = 'rgba(11,92,87,.10)'; rr(-half + gap, -half + gap + c * .025, c - gap * 2, c - gap * 2, c * .17); ctx.fill();
      ctx.fillStyle = fixed ? '#EAF3F1' : '#fff'; rr(-half + gap, -half + gap, c - gap * 2, c - gap * 2, c * .17); ctx.fill();
      if (fixed) { ctx.fillStyle = 'rgba(11,92,87,.28)'; for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.arc(a * (half - gap - c * .1), b * (half - gap - c * .1), c * .028, 0, 7); ctx.fill(); } }
      ctx.save(); ctx.rotate(angleOf(i, now));
      const pw = c * .24;
      if (k === BRIDGE) {
        channel(i, 0, m & 5, c, pw, now, phase);
        ctx.strokeStyle = '#fff'; ctx.lineCap = 'butt'; ctx.lineWidth = pw + c * .1; ctx.beginPath(); ctx.moveTo(-half, 0); ctx.lineTo(half, 0); ctx.stroke();
        channel(i, 1, m & 10, c, pw, now, phase);
      } else channel(i, 0, m, c, pw, now, phase);
      if (k === SOURCE || k === TARGET) {
        const d = [0, 1, 2, 3].find((d) => m & (1 << d)), out = k === SOURCE ? 1 : -1;
        const lit = A.flow[i * 2] >= 0 && fillOf(i * 2, now) >= .5;
        const dx = DX[d] * out, dy = DY[d] * out, px = -dy, py = dx, mx = DX[d] * c * .39, my = DY[d] * c * .39;
        ctx.strokeStyle = lit ? '#fff' : 'rgba(18,52,59,.45)'; ctx.lineWidth = pw * .2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(mx - dx * pw * .2 + px * pw * .32, my - dy * pw * .2 + py * pw * .32);
        ctx.lineTo(mx + dx * pw * .3, my + dy * pw * .3);
        ctx.lineTo(mx - dx * pw * .2 - px * pw * .32, my - dy * pw * .2 - py * pw * .32);
        ctx.stroke();
      }
      ctx.restore();
      if (k === SOURCE || k === TARGET) {
        const reached = k === TARGET && A.reached[i], f = fillOf(i * 2, now);
        nozzle(0, 0, c * .27, P.color[i], k === SOURCE, reached, reached && !calm ? 1 + .18 * Math.sin(Math.PI * Math.min(1, f)) : 1);
        if (k === TARGET && !reached && A.flow[i * 2] >= 0) { ctx.strokeStyle = CORAL; ctx.lineWidth = c * .04; ctx.beginPath(); ctx.arc(0, 0, c * .34, 0, 7); ctx.stroke(); }
      }
      ctx.restore();
    }
    const ring = (cell, color, wdt) => { const x = cell % P.w, y = (cell / P.w) | 0; ctx.strokeStyle = color; ctx.lineWidth = c * wdt; rr(x * c + c * .03, y * c + c * .03, c * .94, c * .94, c * .2); ctx.stroke(); };
    if (hint !== null && now > hintUntil) hint = null;
    if (hint !== null) { ctx.globalAlpha = calm ? 1 : .45 + .55 * (.5 + .5 * Math.sin(now / 240)); ring(hint, SUN, .07); ctx.globalAlpha = 1; }
    if (cursor >= 0) ring(cursor, DEEP, .05);
  }
  let raf = 0, lastFrame = 0;
  function busy(now) {
    if ((hint !== null && !calm) || (won && now - wonAt < 1400) || Object.keys(turnFrom).length) return true;
    for (const t of litAt) if (t !== null && now - t < 400) return true;
    return false;
  }
  function frame(now) {
    raf = 0;
    const b = busy(now);
    if (b || now - lastFrame >= 40) { lastFrame = now; draw(now); }
    if (!calm && !document.hidden) raf = requestAnimationFrame(frame);
    else if (b) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  // input
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / tile), y = Math.floor((e.clientY - r.top) / tile);
    if (x >= 0 && y >= 0 && x < P.w && y < P.h) { cursor = -1; tap(y * P.w + x); }
  });
  canvas.addEventListener('keydown', (e) => {
    const moves = { ArrowUp: -P.w, ArrowDown: P.w, ArrowLeft: -1, ArrowRight: 1 };
    if (cursor < 0 && (moves[e.key] !== undefined || e.key === 'Enter' || e.key === ' ')) { cursor = 0; e.preventDefault(); kick(); return; }
    if (moves[e.key] !== undefined) {
      const x = cursor % P.w, n = cursor + moves[e.key];
      if (n >= 0 && n < P.w * P.h && !(e.key === 'ArrowLeft' && x === 0) && !(e.key === 'ArrowRight' && x === P.w - 1)) cursor = n;
      e.preventDefault(); kick();
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(cursor); }
    else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
  });
  $('undo').onclick = undo;
  $('restart').onclick = restart;
  $('hint').onclick = useHint;
  $('daily').onclick = () => { hide('win'); playDaily(); };
  $('sound').onclick = () => { save.sound = !save.sound; persist(); refresh(); };
  $('levelsBtn').onclick = showLevels;
  $('closeLevels').onclick = () => hide('levels');
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hide('levels'); } });
  document.addEventListener('visibilitychange', kick);
  window.addEventListener('resize', () => { layout(); draw(performance.now()); });
  load(Math.min(save.current, save.unlocked));
})();
