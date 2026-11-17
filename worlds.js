// Section pages: game filters and card tilt, app search, website filters.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hi = function () { return document.documentElement.lang === "hi"; };

  // show matching items and replay a short entrance for the ones that appear
  function filterList(items, keep) {
    var n = 0, shown = 0;
    items.forEach(function (li) {
      var ok = keep(li);
      li.hidden = !ok;
      li.classList.remove("is-in");
      if (ok) {
        shown++;
        if (!reduce && n < 24) { li.style.setProperty("--n", n++); void li.offsetWidth; li.classList.add("is-in"); }
      }
    });
    return shown;
  }

  function chipGroup(chips, attr, onPick) {
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (o) { var on = o === c; o.classList.toggle("is-on", on); o.setAttribute("aria-pressed", on ? "true" : "false"); });
        onPick(c.getAttribute(attr), c);
      });
    });
  }

  // ---------- games: genre chips ----------
  var grid = $("[data-gx-grid]");
  if (grid) {
    var items = $$(".gx-it", grid), status = $("[data-gx-status]"), chips = $$("[data-gf]");
    var pick = function (g) {
      var n = filterList(items, function (li) { return g === "all" || (" " + li.dataset.g + " ").indexOf(" " + g + " ") > -1; });
      status.textContent = hi() ? n + " गेम दिख रहे हैं" : n + (n === 1 ? " game shown" : " games shown");
      try { history.replaceState(null, "", g === "all" ? location.pathname : location.pathname + "?g=" + g); } catch (e) {}
    };
    chipGroup(chips, "data-gf", pick);
    var want = new URLSearchParams(location.search).get("g");
    var start = want && chips.filter(function (c) { return c.getAttribute("data-gf") === want; })[0];
    if (start) start.click();
  }

  // ---------- games: cards lean toward the pointer ----------
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".gx-card").forEach(function (card) {
      var raf = 0, ev = null;
      card.addEventListener("pointermove", function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
          card.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
          card.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
        });
      });
      card.addEventListener("pointerleave", function () { card.style.removeProperty("--rx"); card.style.removeProperty("--ry"); });
    });
  }

  // ---------- apps: search and the shelf in view ----------
  var box = $("[data-ax-search]");
  if (box) {
    var rows = $$(".ax-it"), shelves = $$(".ax-shelf"), st = $("[data-ax-status]"), empty = $("[data-ax-empty]");
    box.addEventListener("input", function () {
      var words = box.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      var n = filterList(rows, function (li) { var q = li.dataset.q; return words.every(function (w) { return q.indexOf(w) > -1; }); });
      shelves.forEach(function (s) { s.hidden = !$$(".ax-it", s).some(function (li) { return !li.hidden; }); });
      empty.hidden = n > 0;
      st.textContent = words.length ? (hi() ? n + " ऐप मिले" : n + (n === 1 ? " app found" : " apps found")) : "";
    });
    var chipLinks = $$(".ax-chip");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          chipLinks.forEach(function (a) { var on = a.getAttribute("href") === "#" + en.target.id; a.classList.toggle("is-here", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        });
      }, { rootMargin: "-140px 0px -60% 0px" });
      shelves.forEach(function (s) { io.observe(s); });
    }
  }

  // ---------- websites: category chips ----------
  var sx = $("[data-sx-grid]");
  if (sx) {
    var sites = $$(".sx-it", sx);
    chipGroup($$("[data-sf]"), "data-sf", function (c) { filterList(sites, function (li) { return c === "all" || li.dataset.cat === c; }); });
  }
})();
