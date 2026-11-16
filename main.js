(function () {
  var S = window.SITE || {};
  var t = window.t || function (k, en) { return en; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- theme ----------
  function setTheme(v) {
    document.documentElement.dataset.theme = v;
    try { localStorage.setItem("ptl-theme", v); } catch (e) {}
  }
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = document.documentElement.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setTheme(cur === "dark" ? "light" : "dark");
    });
  });

  // ---------- menu: highlight the section on screen ----------
  var navLinks = $$(".top nav a[href^='#'], .top nav a[href^='./#']");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").split("#")[1]] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("is-here"); });
          map[en.target.id].classList.add("is-here");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // ---------- forms: Formspree when configured, otherwise the visitor's email app ----------
  function mailto(subject, lines) {
    return "mailto:" + (S.email || "priyatechlabs9@gmail.com") + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }
  function describe(form) {
    var kind = form.dataset.form, app = form.dataset.app || "", fd = new FormData(form);
    var picked = fd.getAll("apps");
    if (kind === "tester") return { subject: "I'd like to test " + app, lines: ["Please add me as a tester for " + app + ".", "My Gmail: " + fd.get("email")] };
    if (kind === "notify") {
      var which = app ? [app] : picked;
      return { subject: "Tell me when " + (which.join(", ") || "your apps") + " launch", lines: ["Please email me when these launch: " + (which.join(", ") || "any app"), "Email: " + fd.get("email")] };
    }
    return { subject: "Project enquiry from " + (fd.get("name") || "the website"),
      lines: ["Name: " + (fd.get("name") || ""), "Email: " + (fd.get("email") || ""), "Needs: " + (fd.get("need") || ""), "", fd.get("message") || ""] };
  }
  $$("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form-msg", form), btn = $("button[type=submit]", form), info = describe(form);
      if (form.dataset.form === "notify" && !form.dataset.app && !new FormData(form).getAll("apps").length) {
        msg.textContent = t("msg.pick", "Tick at least one app."); return;
      }
      if (!S.formEndpoint) {
        msg.textContent = t("msg.mail", "Opening your email app - press send there.");
        window.location.href = mailto(info.subject, info.lines);
        return;
      }
      var fd = new FormData(form);
      fd.append("form", form.dataset.form); fd.append("_subject", info.subject);
      if (form.dataset.app) fd.append("app", form.dataset.app);
      btn.disabled = true; msg.textContent = t("msg.sending", "Sending...");
      fetch(S.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          msg.textContent = t("msg.sent", "Thank you! Got it.");
          form.reset(); form.classList.add("is-done");
        })
        .catch(function () { msg.textContent = t("msg.fail", "That didn't send. Please email priyatechlabs9@gmail.com directly."); })
        .then(function () { btn.disabled = false; });
    });
  });

  // ---------- QuickScan tester counter ----------
  function renderCount() {
    var tc = S.testers || {};
    $$(".tester-count").forEach(function (el) {
      if (typeof tc.joined !== "number") { el.hidden = true; return; }
      var need = tc.needed || 12, n = Math.min(tc.joined, need);
      el.hidden = false;
      $("i", el).style.width = (100 * n / need) + "%";
      $("span", el).textContent = t("msg.testers", "{n} of {m} testers joined").replace("{n}", n).replace("{m}", need);
    });
  }
  renderCount();
  document.addEventListener("ptl:lang", renderCount);

  // ---------- quotes (only real ones, from site.config.js) ----------
  var qs = $("#quotes");
  if (qs && S.quotes && S.quotes.length) {
    var list = $(".quote-list", qs);
    S.quotes.forEach(function (q) {
      var fig = document.createElement("figure");
      var bq = document.createElement("blockquote"); bq.textContent = q.text;
      var cap = document.createElement("figcaption"); cap.textContent = q.name + (q.role ? ", " + q.role : "");
      fig.append(bq, cap); list.append(fig);
    });
    qs.hidden = false;
  }

  // ---------- WhatsApp ----------
  var wa = $(".wa");
  if (wa && S.whatsapp) {
    wa.href = "https://wa.me/" + String(S.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent("Hi Priya, I found you through Priya Tech Labs.");
    wa.target = "_blank"; wa.rel = "noopener"; wa.hidden = false;
  }

  // ---------- About photo: falls back to initials if assets/me.jpg isn't there ----------
  var photo = $(".about-photo img[data-photo]");
  if (photo && S.photo) {
    photo.addEventListener("load", function () { photo.hidden = false; photo.parentNode.classList.remove("no-photo"); });
    photo.src = S.photo;
  }

  // ---------- screenshot gallery (app pages) ----------
  $$(".gallery").forEach(function (g) {
    var track = $(".g-track", g);
    $$(".g-btn", g).forEach(function (b) {
      b.addEventListener("click", function () {
        var w = track.querySelector("li").getBoundingClientRect().width + 16;
        track.scrollBy({ left: w * Number(b.dataset.g), behavior: reduce ? "auto" : "smooth" });
      });
    });
  });

  // ---------- privacy-friendly visit counter ----------
  if (S.goatcounter) {
    var gc = document.createElement("script");
    gc.async = true; gc.src = "https://gc.zgo.at/count.js";
    gc.dataset.goatcounter = "https://" + S.goatcounter + ".goatcounter.com/count";
    document.body.append(gc);
  }
})();

// ---------- reading progress + header shadow ----------
(function () {
  var bar = document.querySelector(".progress i"), top = document.querySelector(".top"), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? y / max : 0);
    if (top) top.classList.toggle("at-top", y < 8);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();

// ---------- search, share, press kit, back to top ----------
(function () {
  var t = window.t || function (k, en) { return en; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mainSrc = ($('script[src$="main.js"]') || {}).src || location.href;
  var BASE = mainSrc.replace(/main\.js.*$/, "");

  // ---------- search (Ctrl+K, / or the search button) ----------
  var data = null, dlg = null, input, list, cur = 0, shown = [];
  function load() {
    if (data) return Promise.resolve(data);
    return fetch(BASE + "assets/search.json").then(function (r) { return r.json(); }).then(function (d) { data = d; return d; }).catch(function () { data = []; return data; });
  }
  function build() {
    dlg = document.createElement("div");
    dlg.className = "search"; dlg.hidden = true;
    dlg.innerHTML = '<div class="search-back" data-close></div><div class="search-box" role="dialog" aria-modal="true" aria-label="Search">' +
      '<div class="search-in"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>' +
      '<input type="search" placeholder="' + t("search.ph", "Search apps, websites and guides") + '" aria-label="Search" autocomplete="off">' +
      '<kbd>Esc</kbd></div><ul class="search-list" role="listbox"></ul><p class="search-foot">' + t("search.foot", "Enter to open, arrows to move") + "</p></div>";
    document.body.append(dlg);
    input = $("input", dlg); list = $(".search-list", dlg);
    input.addEventListener("input", render);
    dlg.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter" && shown[cur]) { e.preventDefault(); openItem(shown[cur]); }
      else if (e.key === "Escape") close();
    });
  }
  function score(it, words) {
    var hay = (it.t + " " + it.d + " " + (it.x || "")).toLowerCase(), title = it.t.toLowerCase(), desc = it.d.toLowerCase(), s = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (hay.indexOf(w) < 0) return -1;
      s += title.indexOf(w) === 0 ? 6 : title.indexOf(w) >= 0 ? 4 : desc.indexOf(w) >= 0 ? 2 : 1;
    }
    return s + (it.k === "App" ? 0.5 : 0);
  }
  function render() {
    var q = input.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    shown = (data || []).map(function (it) { return [words.length ? score(it, words) : (it.k === "App" ? 1 : 0), it]; })
      .filter(function (x) { return x[0] >= 0; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 8).map(function (x) { return x[1]; });
    cur = 0;
    list.innerHTML = "";
    if (!shown.length) { list.innerHTML = '<li class="search-empty">' + t("search.none", "Nothing found. Try another word.") + "</li>"; return; }
    shown.forEach(function (it, i) {
      var li = document.createElement("li");
      li.setAttribute("role", "option"); li.className = "search-item" + (i === 0 ? " is-cur" : "");
      li.innerHTML = (it.i ? '<img src="' + BASE + it.i + '" alt="" width="36" height="36">' : '<span class="si-k">' + it.k.charAt(0) + "</span>") +
        "<span><b></b><small></small></span><em></em>";
      $("b", li).textContent = it.t; $("small", li).textContent = it.d; $("em", li).textContent = it.k;
      li.addEventListener("click", function () { openItem(it); });
      li.addEventListener("mousemove", function () { if (cur !== i) { cur = i; mark(); } });
      list.append(li);
    });
  }
  function mark() { $$(".search-item", list).forEach(function (li, i) { li.classList.toggle("is-cur", i === cur); if (i === cur) li.scrollIntoView({ block: "nearest" }); }); }
  function move(d) { if (!shown.length) return; cur = (cur + d + shown.length) % shown.length; mark(); }
  function openItem(it) {
    var u = /^https?:/.test(it.u) ? it.u : BASE + it.u;
    close();
    if (/^https?:/.test(it.u) && it.u.indexOf(location.host) < 0) window.open(u, "_blank", "noopener"); else location.href = u;
  }
  var lastFocus = null;
  function open() {
    if (!dlg) build();
    lastFocus = document.activeElement;
    dlg.hidden = false; document.documentElement.classList.add("no-scroll");
    requestAnimationFrame(function () { dlg.classList.add("is-open"); });
    input.value = ""; load().then(render); input.focus();
  }
  function close() {
    if (!dlg || dlg.hidden) return;
    dlg.classList.remove("is-open"); document.documentElement.classList.remove("no-scroll");
    setTimeout(function () { dlg.hidden = true; }, reduce ? 0 : 200);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $$("[data-search-open]").forEach(function (b) { b.addEventListener("click", open); });
  document.addEventListener("keydown", function (e) {
    var typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || "");
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); open(); }
    else if (e.key === "/" && !typing) { e.preventDefault(); open(); }
  });

  // ---------- share buttons (app pages) ----------
  function flash(btn, text) {
    var old = btn.textContent; btn.textContent = text; btn.classList.add("is-done");
    setTimeout(function () { btn.textContent = old; btn.classList.remove("is-done"); }, 1600);
  }
  function copy(text) {
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    var ta = document.createElement("textarea"); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove(); return Promise.resolve();
  }
  $$("[data-copy-link]").forEach(function (b) {
    b.addEventListener("click", function () { copy(b.closest("[data-share-url]").dataset.shareUrl).then(function () { flash(b, t("msg.copied", "Copied")); }); });
  });
  $$("[data-native-share]").forEach(function (b) {
    if (!navigator.share) return;
    b.hidden = false;
    b.addEventListener("click", function () {
      var box = b.closest("[data-share-url]");
      navigator.share({ title: document.title, text: box.dataset.shareText, url: box.dataset.shareUrl }).catch(function () {});
    });
  });

  // ---------- press kit: copy colours and the description ----------
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () { copy(b.dataset.copy).then(function () { var s = $("span", b), o = s.textContent; s.textContent = t("msg.copied", "Copied"); setTimeout(function () { s.textContent = o; }, 1400); }); });
  });
  $$("[data-copy-text]").forEach(function (b) {
    b.addEventListener("click", function () { copy(b.parentNode.querySelector("p").textContent.trim()).then(function () { flash(b, t("msg.copied", "Copied")); }); });
  });

  // ---------- back to top ----------
  var up = $(".to-top");
  if (up) {
    var onS = function () { up.hidden = window.scrollY < 900; };
    window.addEventListener("scroll", onS, { passive: true }); onS();
    up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
  }
})();

// ---------- v5: install as an app, offline support, social links ----------
(function () {
  var S = window.SITE || {};
  var mainSrc = (document.querySelector('script[src$="main.js"]') || {}).src || location.href;
  var BASE = mainSrc.replace(/main\.js.*$/, "");

  // offline support (only over http(s); browsers refuse service workers on file://)
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register(BASE + "sw.js").catch(function () {}); });
  }

  // "Install as an app" appears only when the browser offers it
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e;
    document.querySelectorAll("[data-install]").forEach(function (b) { b.hidden = false; });
  });
  document.querySelectorAll("[data-install]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; document.querySelectorAll("[data-install]").forEach(function (x) { x.hidden = true; }); });
    });
  });
  window.addEventListener("appinstalled", function () { document.querySelectorAll("[data-install]").forEach(function (x) { x.hidden = true; }); });

  // social profile icons (only the ones filled in site.config.js)
  var ICON = {
    github: '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/>',
    linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>',
    instagram: '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1C3.7 15 3.6 14.7 3.6 12s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.2 4.2-.2zM12 2c-2.7 0-3.1 0-4.2.1C4.2 2.2 2.2 4.2 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.1 3.6 2.1 5.6 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.6-.1 5.6-2.1 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.1-3.6-2.1-5.6-5.7-5.7C15.1 2 14.7 2 12 2z"/>',
    youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/>',
    x: '<path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/>'
  };
  var NAME = { github: "GitHub", linkedin: "LinkedIn", instagram: "Instagram", youtube: "YouTube", x: "X" };
  var soc = S.social || {};
  document.querySelectorAll(".socials").forEach(function (box) {
    Object.keys(ICON).forEach(function (k) {
      if (!soc[k]) return;
      var a = document.createElement("a");
      a.href = soc[k]; a.target = "_blank"; a.rel = "noopener"; a.className = "soc soc-" + k; a.setAttribute("aria-label", NAME[k]); a.title = NAME[k];
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + "</svg>";
      box.append(a);
    });
  });
})();

// ---------- v6: guide topic filter ----------
(function () {
  var chips = document.querySelectorAll("[data-gfilter]"), cards = document.querySelectorAll("[data-gcat]");
  if (!chips.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  cards.forEach(function (c, i) { c.style.viewTransitionName = "g-" + i; });
  function apply(f) {
    chips.forEach(function (c) { var on = c.dataset.gfilter === f; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
    cards.forEach(function (c) { c.hidden = !(f === "all" || c.dataset.gcat === f); });
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.dataset.gfilter;
      if (document.startViewTransition && !reduce) { var vt = document.startViewTransition(function () { apply(f); }); if (vt && vt.ready) vt.ready.catch(function () {}); } else apply(f);
    });
  });
})();

// ---------- v10: phone menu drawer ----------
(function () {
  var drawer = document.getElementById("drawer"), btn = document.querySelector("[data-menu-open]");
  if (!drawer || !btn) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function open() {
    drawer.hidden = false; btn.setAttribute("aria-expanded", "true"); document.documentElement.classList.add("no-scroll");
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    var first = drawer.querySelector("summary, a, button"); if (first) first.focus({ preventScroll: true });
  }
  function close() {
    if (drawer.hidden) return;
    drawer.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("no-scroll");
    setTimeout(function () { drawer.hidden = true; }, reduce ? 0 : 300);
    btn.focus({ preventScroll: true });
  }
  btn.addEventListener("click", open);
  drawer.querySelectorAll("[data-menu-close]").forEach(function (b) { b.addEventListener("click", close); });
  drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();

// ---------- v11: app page screenshot slideshow + guide contents highlight ----------
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var slides = document.querySelector("[data-slides]");
  if (slides && !reduce) {
    var imgs = slides.querySelectorAll("img"), i = 0;
    if (imgs.length > 1) setInterval(function () {
      if (document.hidden) return;
      imgs[i].classList.remove("on"); i = (i + 1) % imgs.length; imgs[i].classList.add("on");
    }, 3000);
  }
  // highlight the section being read in the guide's contents list
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (links.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-here", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll(".guide-body h2[id]").forEach(function (h) { io.observe(h); });
  }
})();

// ---------- home: the toran (garland of app icons) ----------
(function () {
  var box = document.querySelector("[data-toran]");
  if (!box) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var list = box.querySelector(".toran-list"), path = box.querySelector(".toran-cord path");
  var lis = Array.prototype.slice.call(list.children), pend = [], lastW = 0, raf = 0, last = 0;

  function cordY(x, w, k, top, dip) {
    var seg = w / k, t = (x % seg) / seg;
    return top + dip * 4 * t * (1 - t);
  }
  function layout() {
    var w = box.clientWidth, h = box.clientHeight;
    if (!w || w === lastW) return;
    lastW = w;
    var m = Math.max(12, Math.min(40, w * 0.03)), s = Math.max(34, Math.min(54, w / 28));
    var n = Math.min(lis.length, Math.floor((w - 2 * m) / (s * 0.62)));
    var k = Math.max(2, Math.round(w / 320)), top = 4, dip = Math.min(30, h * 0.12);
    var step = (w - 2 * m) / n, gap = s + 10, base = Math.max(10, h * 0.05);
    var d = "M0 " + top;
    for (var j = 0; j < k; j++) {
      var x0 = j * w / k, x1 = (j + 1) * w / k;
      d += " Q" + ((x0 + x1) / 2).toFixed(1) + " " + (top + 2 * dip).toFixed(1) + " " + x1.toFixed(1) + " " + top;
    }
    box.querySelector(".toran-cord").setAttribute("viewBox", "0 0 " + w + " " + h);
    path.setAttribute("d", d); path.setAttribute("pathLength", "1");
    Array.prototype.slice.call(box.querySelectorAll(".genda")).forEach(function (g) { g.remove(); });
    pend = [];
    var levels = [0, 2, 1];
    lis.forEach(function (li, i) {
      if (i >= n) { li.hidden = true; return; }
      li.hidden = false;
      var x = m + step * (i + 0.5), y = cordY(x, w, k, top, dip);
      var len = base + levels[i % 3] * gap + (i * 7 % 5);
      if (len + s + y > h - 30) len = Math.max(base, h - 30 - s - y);
      li.style.setProperty("--x", x.toFixed(1) + "px"); li.style.setProperty("--y", y.toFixed(1) + "px");
      li.style.setProperty("--len", len.toFixed(1) + "px"); li.style.setProperty("--s", s.toFixed(1) + "px"); li.style.setProperty("--i", i);
      var a = li.firstElementChild;
      pend.push({ el: a, x: x, bottom: y + len + s, a: 0, v: 0, k: 9000 / (len + s * 0.6) });
      if (i < n - 1) {
        var gx = x + step / 2, g = document.createElement("i");
        g.className = "genda" + (i % 4 === 1 ? " leaf" : ""); g.setAttribute("aria-hidden", "true");
        g.style.setProperty("--x", gx.toFixed(1) + "px"); g.style.setProperty("--y", cordY(gx, w, k, top, dip).toFixed(1) + "px"); g.style.setProperty("--i", i);
        box.appendChild(g);
      }
    });
    box.classList.add("is-ready");
  }
  function tick(now) {
    var dt = Math.min(0.032, (now - last) / 1000 || 0.016), moving = false;
    last = now;
    pend.forEach(function (p) {
      p.v += (-p.k * p.a - 3.2 * p.v) * dt;
      p.a += p.v * dt;
      if (Math.abs(p.a) > 0.05 || Math.abs(p.v) > 0.05) moving = true; else { p.a = 0; p.v = 0; }
      p.el.style.setProperty("--r", p.a.toFixed(2) + "deg");
    });
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function run() { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); } }

  layout();
  if (!reduce) {
    // one entrance: the cord draws, flowers open, every app drops in and swings to rest
    box.classList.add("is-dropping");
    pend.forEach(function (p, i) { p.a = (i % 2 ? -1 : 1) * (10 + (i % 5) * 2); p.v = 0; });
    setTimeout(run, 520);
    setTimeout(function () { box.classList.remove("is-dropping"); }, 2600);
    var px = null, pt = 0;
    box.addEventListener("pointermove", function (e) {
      var r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = e.timeStamp;
      if (px !== null && now > pt) {
        var vx = (x - px) / Math.max(8, now - pt) * 1000;
        pend.forEach(function (p) { if (Math.abs(p.x - x) < 46 && y < p.bottom + 8) p.v += Math.max(-160, Math.min(160, vx * 0.09)); });
        run();
      }
      px = x; pt = now;
    });
    box.addEventListener("pointerleave", function () { px = null; });
    box.addEventListener("focusin", function (e) {
      pend.forEach(function (p) { if (p.el === e.target) { p.v += 70; run(); } });
    });
  }
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
})();

// ---------- home: showcase search and shelves ----------
(function () {
  var shelf = document.querySelector("[data-shelf]");
  if (!shelf) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(shelf.children);
  var chips = Array.prototype.slice.call(document.querySelectorAll(".sc-chips .chip"));
  var input = document.querySelector("[data-sc-search]"), status = document.querySelector("[data-sc-status]");
  var empty = document.querySelector("[data-sc-empty]"), more = document.querySelector("[data-sc-more]");
  var filter = "all", query = "", capped = true;

  function cap() {
    var cols = getComputedStyle(shelf).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    return Math.max(6, cols * 3);
  }
  function apply(animate) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean), shown = 0, limit = cap(), k = 0, matched = 0;
    var limited = capped && filter === "all" && !words.length;
    items.forEach(function (it) {
      var hay = it.dataset.q, ok = (filter === "all" || it.dataset.cat === filter);
      for (var i = 0; ok && i < words.length; i++) if (hay.indexOf(words[i]) < 0) ok = false;
      var wasHidden = it.classList.contains("is-out") || it.classList.contains("is-cut");
      if (ok) matched++;
      var cut = ok && limited && matched > limit;
      it.classList.toggle("is-out", !ok);
      it.classList.toggle("is-cut", cut);
      if (ok && !cut) {
        shown++;
        if (animate && !reduce && (wasHidden || animate === "all") && k < 18) {
          it.style.setProperty("--k", k++);
          it.classList.remove("is-enter"); void it.offsetWidth; it.classList.add("is-enter");
        }
      }
    });
    more.hidden = !(limited && matched > limit);
    empty.hidden = matched > 0;
    var hi = window.PTL_LANG === "hi";
    status.textContent = !matched ? "" : (shown === items.length ? (hi ? "सभी " + shown + " दिख रहे हैं" : "Showing all " + shown)
      : (hi ? items.length + " में से " + shown + " दिख रहे हैं" : "Showing " + shown + " of " + items.length));
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      filter = c.dataset.f;
      chips.forEach(function (x) { var on = x === c; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      apply("all");
    });
  });
  var timer = 0;
  input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { query = input.value.trim(); apply(true); }, 90); });
  input.addEventListener("keydown", function (e) { if (e.key === "Escape" && input.value) { e.stopPropagation(); input.value = ""; query = ""; apply(true); } });
  document.querySelector("[data-sc-clear]").addEventListener("click", function () { input.value = ""; query = ""; apply(true); input.focus(); });
  more.addEventListener("click", function () {
    var first = items.filter(function (it) { return it.classList.contains("is-cut"); })[0];
    capped = false; apply(true);
    if (first) first.querySelector("a").focus({ preventScroll: true });
  });
  // links marked data-sc-filter open that shelf
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-sc-filter]");
    if (!a) return;
    var c = chips.filter(function (x) { return x.dataset.f === a.dataset.scFilter; })[0];
    if (c) c.click();
  });
  apply(false);
  document.addEventListener("ptl:lang", function () { apply(false); });
  var lastCols = 0;
  window.addEventListener("resize", function () { var c = cap(); if (c !== lastCols) { lastCols = c; apply(false); } });
})();
