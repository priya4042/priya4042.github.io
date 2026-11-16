// GENERATOR START
// Arrow Connect rules, solver and seeded generator; kept in step with lib/game/puzzle.dart

// openings: N=1 E=2 S=4 W=8; kinds: 0 pipe, 1 source, 2 target, 3 bridge
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const PIPE = 0, SOURCE = 1, TARGET = 2, BRIDGE = 3;
const rot = (m) => ((m << 1) | (m >> 3)) & 15;
const rotBy = (m, k) => { for (let i = 0; i < (k & 3); i++) m = rot(m); return m; };

// taps needed to turn mask a into mask b, or -1
function tapsTo(a, b) { let m = a; for (let k = 0; k < 4; k++) { if (m === b) return k; m = rot(m); } return -1; }

class Rng {
  constructor(seed) { this.s = Rng.mix(seed); for (let i = 0; i < 8; i++) this.next(); }
  static mix(seed) {
    let z = (Math.imul(seed | 0, 0x9E3779B1 | 0) + 0x7F4A7C15) >>> 0;
    z = Math.imul((z ^ (z >>> 16)) | 0, 0x85EBCA6B | 0) >>> 0;
    z = Math.imul((z ^ (z >>> 13)) | 0, 0xC2B2AE35 | 0) >>> 0;
    z = (z ^ (z >>> 16)) >>> 0;
    return z === 0 ? 0x1234567 : z;
  }
  next() { let x = this.s; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (this.s = x >>> 0); }
  int(n) { return n <= 1 ? 0 : this.next() % n; }
  chance(p) { return this.int(100) < p; }
}

// node of a cell for an opening: bridges keep east-west apart from north-south
const nodeOf = (kind, cell, d) => cell * 2 + (kind === BRIDGE && (d === 1 || d === 3) ? 1 : 0);

// what the board shows: loose ends, networks, colour reaching each tile, and the win
function analyse(P, masks) {
  const { w, h, kind, color } = P, n = w * h;
  const parent = new Int32Array(n * 2);
  for (let i = 0; i < n * 2; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  let loose = 0;
  const leaks = []; // [cell, dir]
  for (let i = 0; i < n; i++) {
    const x = i % w, y = (i / w) | 0, m = masks[i];
    for (let d = 0; d < 4; d++) {
      if (!(m & (1 << d))) continue;
      const nx = x + DX[d], ny = y + DY[d];
      const j = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || !(masks[j] & (1 << ((d + 2) & 3)))) { loose++; leaks.push([i, d]); continue; }
      if (d === 1 || d === 2) {
        const a = find(nodeOf(kind[i], i, d)), b = find(nodeOf(kind[j], j, (d + 2) & 3));
        if (a !== b) parent[a] = b;
      }
    }
  }
  // sources and colours of every network
  const srcCount = new Int32Array(n * 2), col = new Int32Array(n * 2).fill(-1), srcColor = new Int32Array(n * 2).fill(-1);
  const clash = new Uint8Array(n * 2);
  for (let i = 0; i < n; i++) {
    if (kind[i] !== SOURCE && kind[i] !== TARGET) continue;
    const r = find(i * 2);
    if (kind[i] === SOURCE) { srcCount[r]++; srcColor[r] = color[i]; }
    if (col[r] === -1) col[r] = color[i]; else if (col[r] !== color[i]) clash[r] = 1;
  }
  const used = (i, ch) => kind[i] === BRIDGE || ch === 0;
  let ok = loose === 0;
  // flow: colour per node, -1 when no single source feeds it
  const flow = new Int32Array(n * 2).fill(-1);
  for (let v = 0; v < n * 2; v++) {
    const i = v >> 1;
    if (!used(i, v & 1)) continue;
    const r = find(v);
    if (srcCount[r] === 1) flow[v] = srcColor[r];
    if (srcCount[r] !== 1 || clash[r]) ok = false;
  }
  const reached = [];
  for (let i = 0; i < n; i++) reached.push(kind[i] === TARGET && flow[i * 2] === color[i]);
  return { ok, loose, leaks, flow, reached };
}

// steps from a source along joined pipes, per node; -1 where no source reaches
function flowDistances(P, masks) {
  const { w, h, kind } = P, n = w * h, dist = new Int32Array(n * 2).fill(-1), q = [];
  for (let i = 0; i < n; i++) if (kind[i] === SOURCE) { dist[i * 2] = 0; q.push(i * 2); }
  for (let qi = 0; qi < q.length; qi++) {
    const v = q[qi], i = v >> 1, x = i % w, y = (i / w) | 0;
    for (let d = 0; d < 4; d++) {
      if (!(masks[i] & (1 << d)) || nodeOf(kind[i], i, d) !== v) continue;
      const nx = x + DX[d], ny = y + DY[d];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx, back = (d + 2) & 3;
      if (!(masks[j] & (1 << back))) continue;
      const u = nodeOf(kind[j], j, back);
      if (dist[u] === -1) { dist[u] = dist[v] + 1; q.push(u); }
    }
  }
  return dist;
}

const turns = (P, i) => P.kind[i] !== BRIDGE && !P.locked[i];

// one piece to fix next and the taps it needs, or null when solved
function hintMove(P, masks) {
  if (isWin(P, masks)) return null;
  const d = designedFrom(P, masks);
  const s = solve(P, masks, d, 150000) || d;
  const goal = s.masks || d.masks;
  for (let i = 0; i < masks.length; i++) if (turns(P, i) && masks[i] !== goal[i]) return [i, tapsTo(masks[i], goal[i])];
  return null;
}

const isWin = (P, masks) => analyse(P, masks).ok;

// cheapest taps from start to any winning board; upper is a known answer to beat
function solve(P, start, upper, cap) {
  const { w, h, kind, color, locked } = P, n = w * h, W1 = w + 1, PN = 1 << W1;
  cap = cap || 400000;
  const opts = [];
  for (let i = 0; i < n; i++) {
    const o = [];
    if (kind[i] === BRIDGE || locked[i]) o.push([start[i], 0]);
    else { let m = start[i]; for (let k = 0; k < 4; k++) { if (!o.some((e) => e[0] === m)) o.push([m, k]); m = rot(m); } }
    opts.push(o);
  }
  const INF = 1 << 29;
  const V = new Int32Array((n + 1) * PN).fill(INF);
  V[n * PN] = 0;
  for (let i = n - 1; i >= 0; i--) {
    const x = i % w, y = (i / w) | 0;
    for (let p = 0; p < PN; p++) {
      const north = (p >> x) & 1, west = (p >> w) & 1;
      if (x === 0 && west) continue;
      let best = INF;
      for (const [m, c] of opts[i]) {
        const N = m & 1, E = (m >> 1) & 1, S = (m >> 2) & 1, Wb = (m >> 3) & 1;
        if (N !== north || Wb !== west) continue;
        if (x === w - 1 && E) continue;
        if (y === h - 1 && S) continue;
        const np = (p & ~(1 << x) & ~(1 << w)) | (S << x) | (E << w);
        const v = c + V[(i + 1) * PN + np];
        if (v < best) best = v;
      }
      V[i * PN + p] = best;
    }
  }
  if (V[0] >= INF) return null;
  // union-find with undo for the network checks
  const parent = new Int32Array(n * 2), src = new Int32Array(n * 2), col = new Int32Array(n * 2), open = new Int32Array(n * 2);
  const log = [];
  const set = (arr, i, v) => { log.push(arr, i, arr[i]); arr[i] = v; };
  const find = (a) => { while (parent[a] !== a) a = parent[a]; return a; };
  const union = (a, b) => {
    let ra = find(a), rb = find(b);
    if (ra === rb) return true;
    if (ra > rb) { const t = ra; ra = rb; rb = t; } // smaller id stays the root
    set(parent, rb, ra);
    set(src, ra, src[ra] + src[rb]);
    set(open, ra, open[ra] + open[rb]);
    if (col[ra] === -1) set(col, ra, col[rb]);
    else if (col[rb] !== -1 && col[rb] !== col[ra]) return false;
    return src[ra] <= 1;
  };
  let bestTaps = upper ? upper.taps : INF, bestMasks = upper ? upper.masks.slice() : null;
  const cur = new Int32Array(n);
  let nodes = 0, capped = false;
  const place = (i, m) => {
    const k = kind[i];
    for (let ch = 0; ch < (k === BRIDGE ? 2 : 1); ch++) {
      const v = i * 2 + ch;
      set(parent, v, v);
      set(src, v, k === SOURCE ? 1 : 0);
      set(col, v, k === SOURCE || k === TARGET ? color[i] : -1);
      set(open, v, 0);
    }
    if (m & 1) { const t = i - w, a = nodeOf(k, i, 0), b = nodeOf(kind[t], t, 2); if (!union(a, b)) return false; const r = find(a); set(open, r, open[r] - 1); }
    if (m & 8) { const l = i - 1, a = nodeOf(k, i, 3), b = nodeOf(kind[l], l, 1); if (!union(a, b)) return false; const r = find(a); set(open, r, open[r] - 1); }
    if (m & 2) { const r = find(nodeOf(k, i, 1)); set(open, r, open[r] + 1); }
    if (m & 4) { const r = find(nodeOf(k, i, 2)); set(open, r, open[r] + 1); }
    for (let ch = 0; ch < (k === BRIDGE ? 2 : 1); ch++) {
      const r = find(i * 2 + ch);
      if (src[r] > 1) return false;
      if (open[r] === 0 && src[r] !== 1) return false;
    }
    return true;
  };
  const rec = (i, p, cost) => {
    if (capped) return;
    if (++nodes > cap) { capped = true; return; }
    if (i === n) { bestTaps = cost; bestMasks = Array.from(cur); return; }
    const x = i % w, y = (i / w) | 0, north = (p >> x) & 1, west = (p >> w) & 1;
    const cand = [];
    for (const [m, c] of opts[i]) {
      const N = m & 1, E = (m >> 1) & 1, S = (m >> 2) & 1, Wb = (m >> 3) & 1;
      if (N !== north || Wb !== west || (x === w - 1 && E) || (y === h - 1 && S)) continue;
      const np = (p & ~(1 << x) & ~(1 << w)) | (S << x) | (E << w);
      const f = cost + c + V[(i + 1) * PN + np];
      if (f >= bestTaps) continue;
      cand.push([f, m, c, np]);
    }
    cand.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    for (const [f, m, c, np] of cand) {
      if (f >= bestTaps) break;
      const mark = log.length;
      if (place(i, m)) { cur[i] = m; rec(i + 1, np, cost + c); }
      while (log.length > mark) { const old = log.pop(), idx = log.pop(), arr = log.pop(); arr[idx] = old; }
      if (capped) return;
    }
  };
  rec(0, 0, 0);
  if (bestMasks === null) return capped ? { taps: -1, masks: null, exact: false, nodes } : null;
  return { taps: bestTaps, masks: bestMasks, exact: !capped, nodes };
}

// taps to reach the designed answer from a board
function designedFrom(P, masks) {
  let taps = 0;
  const out = [];
  for (let i = 0; i < masks.length; i++) {
    const t = tapsTo(masks[i], P.solution[i]);
    taps += t;
    out.push(P.solution[i]);
  }
  return { taps, masks: out };
}

// a random path through every square, mixed with backbite moves
function hamPath(w, h, rng) {
  const n = w * h, path = [];
  for (let y = 0; y < h; y++) for (let k = 0; k < w; k++) path.push(y * w + (y % 2 === 0 ? k : w - 1 - k));
  const pos = new Int32Array(n);
  const sync = () => { for (let i = 0; i < n; i++) pos[path[i]] = i; };
  sync();
  const reverse = (a, b) => { while (a < b) { const t = path[a]; path[a] = path[b]; path[b] = t; pos[path[a]] = a; pos[path[b]] = b; a++; b--; } };
  const moves = 24 * n;
  for (let t = 0; t < moves; t++) {
    const head = rng.int(2) === 0;
    const e = head ? path[0] : path[n - 1];
    const x = e % w, y = (e / w) | 0, nb = [];
    for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < w && ny < h) nb.push(ny * w + nx); }
    const q = nb[rng.int(nb.length)], j = pos[q];
    if (head) { if (j >= 2) reverse(0, j - 1); }
    else if (j <= n - 3) reverse(j + 1, n - 1);
  }
  return path;
}

// how big and busy a level is
function specFor(level) {
  const l = Math.max(1, level);
  let w, h;
  if (l <= 3) { w = 4; h = 4; }
  else if (l <= 10) { w = 4; h = 5; }
  else if (l <= 20) { w = 5; h = 5; }
  else if (l <= 35) { w = 5; h = 6; }
  else if (l <= 55) { w = 6; h = 6; }
  else if (l <= 90) { w = 6; h = 7; }
  else if (l <= 140) { w = 6; h = 8; }
  else if (l <= 220) { w = 7; h = 8; }
  else { w = 7; h = 9; }
  const colors = l <= 6 ? 2 : l <= 20 ? 3 : l <= 60 ? 4 : l <= 150 ? 5 : 6;
  const branches = l < 15 ? 0 : l < 70 ? 1 : l < 200 ? 2 : 3;
  const bridges = l < 30 ? 0 : l < 100 ? 1 : l < 260 ? 2 : 3;
  const locked = l < 45 ? 0 : l < 120 ? 1 : l < 300 ? 2 : 3;
  const scramble = Math.min(100, 20 + l * 2); // share of turnable tiles that start turned
  return { w, h, colors, branches, bridges, locked, scramble };
}

// one try at a board; null when the dice did not fit
function attempt(spec, rng) {
  const { w, h } = spec, n = w * h;
  const path = hamPath(w, h, rng);
  const adj = []; // adjacency per node; nodes n.. are the second channel of bridges
  const cellOf = [];
  for (let i = 0; i < n; i++) { adj.push([]); cellOf.push(i); }
  const link = (a, b) => { adj[a].push(b); adj[b].push(a); };
  const unlink = (a, b) => { adj[a].splice(adj[a].indexOf(b), 1); adj[b].splice(adj[b].indexOf(a), 1); };
  for (let i = 0; i + 1 < n; i++) link(path[i], path[i + 1]);
  const guard = new Set(); // edges that must stay
  const key = (a, b) => (a < b ? a * 512 + b : b * 512 + a);
  const bridgeCell = new Uint8Array(n);
  const dirTo = (a, b) => { const ca = cellOf[a], cb = cellOf[b]; const d = cb - ca; return d === -w ? 0 : d === 1 ? 1 : d === w ? 2 : 3; };
  // nodes reachable from a, and the route to b
  const route = (a, b) => {
    const prev = new Map([[a, -1]]), q = [a];
    while (q.length) { const v = q.shift(); if (v === b) break; for (const u of adj[v]) if (!prev.has(u)) { prev.set(u, v); q.push(u); } }
    if (!prev.has(b)) return null;
    const r = [b]; while (r[r.length - 1] !== a) r.push(prev.get(r[r.length - 1]));
    return r.reverse();
  };
  const compOf = (a) => { const seen = new Set([a]), q = [a]; while (q.length) { const v = q.pop(); for (const u of adj[v]) if (!seen.has(u)) { seen.add(u); q.push(u); } } return seen; };
  const cutFree = (v, skip) => adj[v].filter((u) => u !== skip && !guard.has(key(u, v)));

  for (let b = 0; b < spec.bridges; b++) {
    let done = false;
    for (let t = 0; t < 40 && !done; t++) {
      const X = rng.int(n), x = X % w, y = (X / w) | 0;
      if (bridgeCell[X] || adj[X].length !== 2) continue;
      const d0 = dirTo(X, adj[X][0]), d1 = dirTo(X, adj[X][1]);
      if ((d0 + 2) % 4 !== d1) continue;
      const pd = (d0 + 1) % 4; // perpendicular
      const ax = x + DX[pd], ay = y + DY[pd], bx = x - DX[pd], by = y - DY[pd];
      if (ax < 0 || ay < 0 || ax >= w || ay >= h || bx < 0 || by < 0 || bx >= w || by >= h) continue;
      const A = ay * w + ax, B = by * w + bx;
      if (bridgeCell[A] || bridgeCell[B]) continue;
      const r = route(A, B);
      // break the old link between A and B next to A, else next to B
      if (r) {
        if (!guard.has(key(r[0], r[1]))) unlink(r[0], r[1]);
        else if (!guard.has(key(r[r.length - 2], r[r.length - 1]))) unlink(r[r.length - 2], r[r.length - 1]);
        else continue;
      }
      const Xb = adj.length;
      adj.push([]); cellOf.push(X);
      link(Xb, A); link(Xb, B);
      for (const v of [A, B]) {
        if (adj[v].length > 2) {
          const c = cutFree(v, Xb);
          if (!c.length) return null;
          unlink(v, c[rng.int(c.length)]);
        }
      }
      guard.add(key(X, adj[X][0])); guard.add(key(X, adj[X][1]));
      guard.add(key(Xb, A)); guard.add(key(Xb, B));
      bridgeCell[X] = 1;
      done = true;
    }
    if (!done) return null;
  }
  const N = adj.length;
  const comps = () => { const seen = new Uint8Array(N), out = []; for (let v = 0; v < N; v++) if (!seen[v]) { const c = compOf(v); for (const u of c) seen[u] = 1; out.push(c); } return out; };
  const minSize = 3;
  if (comps().some((c) => c.size < minSize)) return null;
  // cut into colours plus the pieces that will join as branches
  const want = spec.colors + spec.branches;
  let have = comps().length;
  if (have > want) return null;
  for (let tries = 0; have < want && tries < 200; tries++) {
    const edges = [];
    for (let v = 0; v < N; v++) for (const u of adj[v]) if (v < u && !guard.has(key(u, v))) edges.push([v, u]);
    if (!edges.length) return null;
    const [a, b] = edges[rng.int(edges.length)];
    unlink(a, b);
    if (compOf(a).size < minSize || compOf(b).size < minSize) { link(a, b); continue; }
    have++;
  }
  if (have < want) return null;
  // branches: a piece's end joins the middle of another piece
  for (let t = 0; t < spec.branches; t++) {
    const cand = [];
    for (let Y = 0; Y < N; Y++) {
      if (adj[Y].length !== 1) continue;
      const cy = cellOf[Y], yx = cy % w, yy = (cy / w) | 0;
      const cY = compOf(Y);
      for (let d = 0; d < 4; d++) {
        const nx = yx + DX[d], ny = yy + DY[d];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const X = ny * w + nx;
        if (bridgeCell[X] || adj[X].length !== 2 || cY.has(X)) continue;
        cand.push([Y, X]);
      }
    }
    if (!cand.length) return null;
    const [Y, X] = cand[rng.int(cand.length)];
    link(Y, X);
  }
  const parts = comps();
  if (parts.length !== spec.colors) return null;
  // colours and arrows
  const order = []; for (let i = 0; i < spec.colors; i++) order.push(i);
  for (let i = order.length - 1; i > 0; i--) { const j = rng.int(i + 1); const t = order[i]; order[i] = order[j]; order[j] = t; }
  const kind = new Array(n).fill(PIPE), color = new Array(n).fill(-1), solution = new Array(n).fill(0);
  parts.forEach((c, pi) => {
    const leaves = [...c].filter((v) => adj[v].length === 1).sort((a, b) => a - b);
    const s = leaves[rng.int(leaves.length)];
    for (const v of leaves) { kind[cellOf[v]] = v === s ? SOURCE : TARGET; color[cellOf[v]] = order[pi]; }
  });
  for (let v = 0; v < N; v++) for (const u of adj[v]) solution[cellOf[v]] |= 1 << dirTo(v, u);
  for (let i = 0; i < n; i++) if (bridgeCell[i]) kind[i] = BRIDGE;
  // locked pieces
  const locked = new Array(n).fill(false);
  const pipes = []; for (let i = 0; i < n; i++) if (kind[i] === PIPE && solution[i] !== 5 && solution[i] !== 10) pipes.push(i);
  for (let k = 0; k < spec.locked && pipes.length; k++) locked[pipes.splice(rng.int(pipes.length), 1)[0]] = true;
  const P = { w, h, kind, color, locked, solution, start: null, par: 0 };
  if (!isWin(P, solution)) return null;
  // scramble
  const turnable = []; for (let i = 0; i < n; i++) if (kind[i] !== BRIDGE && !locked[i] && rot(solution[i]) !== solution[i]) turnable.push(i);
  const start = solution.slice();
  for (const i of turnable) if (rng.chance(spec.scramble)) start[i] = rotBy(solution[i], 1 + rng.int(3));
  while (isWin(P, start)) { const i = turnable[rng.int(turnable.length)]; start[i] = rot(start[i]); }
  const designed = designedFrom(P, start);
  const s = solve(P, start, designed, 300000);
  if (!s || !s.exact || s.taps < 1) return null;
  P.start = start;
  P.par = s.taps;
  return P;
}

function generate(spec, seed) {
  const rng = new Rng(seed);
  let s = Object.assign({}, spec);
  for (let round = 0; round < 10; round++) {
    for (let a = 0; a < 60; a++) { const p = attempt(s, rng); if (p) return p; }
    // too tight for this grid: ease off one feature
    s = Object.assign({}, s, { bridges: Math.max(0, s.bridges - (round % 2 === 0 ? 1 : 0)), branches: Math.max(0, s.branches - (round % 2 === 1 ? 1 : 0)) });
  }
  throw new Error('no board for seed ' + seed);
}

const levelPuzzle = (level) => generate(specFor(level), 1000003 * level + 17);
// day number of the daily puzzle; day 1 is 1 November 2026
function dailyNumber(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 10, 1)) / 86400000) + 1; }
function weekday(y, m, d) { const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return wd === 0 ? 7 : wd; }
// easy on Monday, hardest on Sunday
function dailyPuzzle(y, m, d) { return generate(specFor(30 + (weekday(y, m, d) - 1) * 25), 0x5EED0000 + y * 10000 + m * 100 + d); }

function starsFor(moves, par) { if (moves <= par) return 3; const slack = Math.max(2, par >> 1); return moves <= par + slack ? 2 : 1; }
// GENERATOR END
