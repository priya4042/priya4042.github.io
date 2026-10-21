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

  // ---------- app filter (home) ----------
  var chips = $$(".filters .chip"), apps = $$(".app-list .app");
  apps.forEach(function (a, i) {
    if (a.querySelector(".peek")) a.classList.add("has-peek");
    a.style.viewTransitionName = "app-" + i;
  });
  function applyFilter(filter) {
    chips.forEach(function (c) {
      var on = c.dataset.filter === filter;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    apps.forEach(function (a) {
      a.hidden = !(filter === "all" || a.dataset.cat === filter);
      a.classList.remove("is-wide");
    });
    // an odd number of small cards leaves a hole - let the last one take the full row
    var small = apps.filter(function (a) { return !a.hidden && !a.classList.contains("app-feature"); });
    if (small.length % 2 === 1) small[small.length - 1].classList.add("is-wide");
  }
  if (apps.length) applyFilter("all");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.dataset.filter;
      if (document.startViewTransition && !reduce) { var vt = document.startViewTransition(function () { applyFilter(f); }); if (vt && vt.ready) vt.ready.catch(function () {}); }
      else applyFilter(f);
    });
  });

  // ---------- hero phone: tap an icon to open the app ----------
  var phone = $(".phone"), screen = $(".app-screen");
  if (phone && screen) {
    var last = null;
    function openApp(btn) {
      var d = btn.dataset;
      last = btn;
      var pr = phone.getBoundingClientRect(), ir = btn.querySelector("img,.tile").getBoundingClientRect();
      screen.style.setProperty("--ox", (ir.left + ir.width / 2 - pr.left) + "px");
      screen.style.setProperty("--oy", (ir.top + ir.height / 2 - pr.top) + "px");
      $(".as-name", screen).textContent = d.name;
      $(".as-icon", screen).src = d.icon || "";
      $(".as-icon", screen).hidden = !d.icon;
      var shot = $(".as-shot", screen), info = $(".as-info", screen);
      if (d.shot) { shot.src = d.shot; shot.alt = d.name + " screen"; shot.hidden = false; info.hidden = true; }
      else {
        shot.hidden = true; info.hidden = false;
        $(".as-line", screen).textContent = t(d.key || "", d.line || "");
      }
      var more = $(".as-more", screen);
      more.href = d.href || "#apps";
      more.textContent = d.href && d.href.indexOf("#contact") === 0 ? t("nav.work", "Work with me") : t("cta.details", "See details");
      screen.hidden = false;
      phone.classList.add("is-open");
      $(".as-close", screen).focus({ preventScroll: true });
    }
    function closeApp() {
      if (screen.hidden) return;
      phone.classList.remove("is-open");
      phone.classList.add("is-closing");
      setTimeout(function () {
        screen.hidden = true; phone.classList.remove("is-closing");
        if (last) last.focus({ preventScroll: true });
      }, reduce ? 0 : 260);
    }
    $$(".home-grid button").forEach(function (b) { b.addEventListener("click", function () { openApp(b); }); });
    $(".as-close", screen).addEventListener("click", closeApp);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeApp(); });
  }

  // ---------- menu: highlight the section on screen ----------
  var navLinks = $$(".top nav a[href^='#']");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
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

// ---------- v3 motion: reveals, header, progress, timeline, tilt, hero parallax ----------
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // hero headline: one span per word so the words can rise in one after another
  function splitHeadline() {
    var h = document.querySelector(".hero h1");
    if (!h || reduce) return;
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + w + "</span>"; }).join(" ");
  }
  splitHeadline();
  document.addEventListener("ptl:lang", splitHeadline);

  // ticker: two copies of the row make the loop seamless
  var track = document.querySelector(".ticker-track");
  if (track) track.innerHTML += track.innerHTML;

  // reveal on scroll, staggered within each group
  var groups = [".section-head", ".app-list .app", ".sites .site", ".upd-list li", ".lab-list li", ".about-photo", ".about-copy",
                ".skills li", ".notify-card", ".contact-card", ".quote-list figure", ".ap-about > div", ".ap-faq", ".ap-more", ".gallery"];
  groups.forEach(function (sel) {
    $$(sel).forEach(function (el, i) {
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", Math.min(i % 6, 5));
    });
  });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    $$("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
  }

  // scroll: progress bar, header over the hero, timeline drawing
  var bar = document.querySelector(".progress i"), top = document.querySelector(".top"),
      band = document.querySelector(".hero-band"), upd = document.querySelector(".upd-list"), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? y / max : 0);
    if (top && band) top.classList.toggle("on-hero", y < band.offsetHeight - 70);
    if (top) top.classList.toggle("at-top", y < 8);
    if (upd) {
      var r = upd.getBoundingClientRect();
      var p = (innerHeight * 0.75 - r.top) / r.height;
      upd.style.setProperty("--draw", Math.max(0, Math.min(1, p)));
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (reduce || !fine) return;

  // cards lean towards the cursor and a soft light follows it
  $$(".app").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
      card.style.setProperty("--rx", ((0.5 - y) * 5).toFixed(2) + "deg"); card.style.setProperty("--ry", ((x - 0.5) * 6).toFixed(2) + "deg");
      card.classList.add("tilt");
    });
    card.addEventListener("pointerleave", function () { card.classList.remove("tilt"); });
  });

  // hero: glow follows the cursor, floating icons drift with depth
  if (band) {
    var fl = $$(".floaters .f"), raf = 0, tx = 0, ty = 0;
    band.addEventListener("pointermove", function (e) {
      var r = band.getBoundingClientRect();
      band.style.setProperty("--gx", (e.clientX - r.left) + "px"); band.style.setProperty("--gy", (e.clientY - r.top) + "px");
      tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5);
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        fl.forEach(function (f, i) {
          var depth = 10 + (i % 4) * 9;
          f.style.transform = "translate3d(" + (-tx * depth).toFixed(1) + "px," + (-ty * depth).toFixed(1) + "px,0)";
        });
      });
    });
  }
})();

// ---------- v4: quiz, search, share, press kit, back to top ----------
(function () {
  var t = window.t || function (k, en) { return en; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mainSrc = ($('script[src$="main.js"]') || {}).src || location.href;
  var BASE = mainSrc.replace(/main\.js.*$/, "");

  // reveal the new blocks too
  var newGroups = [".prom", ".guide-card", ".proc-list li", ".client-faq", ".quiz-card", ".press-block", ".press-hero", ".ap-share", ".guide article", ".guide-more"];
  newGroups.forEach(function (sel) {
    $$(sel).forEach(function (el, i) { if (!el.hasAttribute("data-reveal")) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", Math.min(i % 6, 5)); } });
  });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$("[data-reveal]:not(.in)").forEach(function (el) { io.observe(el); });
  } else { $$("[data-reveal]").forEach(function (el) { el.classList.add("in"); }); }

  // ---------- "which app is right for me?" ----------
  var APPS = {
    "quickscan": ["QuickScan", "Scan or create any QR code or barcode, fast and offline."],
    "spendly": ["Spendly", "A private, offline money manager for income, spending, budgets and savings."],
    "committee-book": ["Committee Book", "Run your committee, BC or chit group: who paid, whose turn it is, and how much cash is in hand."],
    "dues": ["Dues", "Never miss a bill, recharge, EMI, subscription or warranty date again."],
    "mca-entrance-prep": ["MCA Entrance Prep", "Complete preparation for NIMCET and 10 other MCA entrance exams, with no ads."],
    "daily-english": ["Daily English", "Learn to speak English with a coach that listens and checks your pronunciation."],
    "dotnet-prep": ["DotNet Interview Prep", "About 1,300 .NET, C#, SQL, DSA and system design interview questions with answers, offline."],
    "reelcut": ["ReelCut", "Turn your own long videos into Shorts, Reels and TikToks, entirely on your phone."]
  };
  var Q = {
    start: { q: ["quiz.q1", "What do you want help with?"], o: [
      [["quiz.o.money", "Money"], "money"], [["quiz.o.study", "Studying"], "study"],
      [["quiz.o.tools", "Everyday tools"], "tools"], [["quiz.o.video", "Making videos"], "=reelcut"]] },
    money: { q: ["quiz.q2", "Which one sounds like you?"], o: [
      [["quiz.o.track", "I want to see where my money goes"], "=spendly"], [["quiz.o.bills", "I keep forgetting bills and EMIs"], "=dues"],
      [["quiz.o.bc", "I run a committee or BC"], "=committee-book"]] },
    study: { q: ["quiz.q2", "Which one sounds like you?"], o: [
      [["quiz.o.mca", "I'm preparing for an MCA entrance exam"], "=mca-entrance-prep"], [["quiz.o.eng", "I want to speak English confidently"], "=daily-english"],
      [["quiz.o.net", "I have .NET job interviews coming up"], "=dotnet-prep"]] },
    tools: { q: ["quiz.q2", "Which one sounds like you?"], o: [
      [["quiz.o.qr", "I scan or make QR codes"], "=quickscan"], [["quiz.o.due", "I need reminders for due dates"], "=dues"],
      [["quiz.o.short", "I want Shorts from my long videos"], "=reelcut"]] }
  };
  var quiz = $("[data-quiz]");
  function swap(fn) {
    if (!quiz) return;
    if (reduce) { fn(); return; }
    quiz.classList.add("q-out");
    setTimeout(function () { fn(); quiz.classList.remove("q-out"); quiz.classList.add("q-in"); setTimeout(function () { quiz.classList.remove("q-in"); }, 450); }, 220);
  }
  function step(key, n) {
    var s = Q[key];
    quiz.innerHTML = '<p class="q-step">' + t("quiz.step", "Question") + " " + n + " / 2</p><h3 class=\"q-q\">" + t(s.q[0], s.q[1]) + '</h3><div class="q-opts"></div>';
    var box = $(".q-opts", quiz);
    s.o.forEach(function (o, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "q-opt"; b.style.setProperty("--d", i); b.textContent = t(o[0][0], o[0][1]);
      b.addEventListener("click", function () {
        var go = o[1];
        swap(function () { if (go.charAt(0) === "=") result(go.slice(1)); else step(go, n + 1); });
      });
      box.append(b);
    });
  }
  function result(slug) {
    var a = APPS[slug];
    quiz.innerHTML = '<div class="q-result"><img src="' + BASE + "assets/apps/" + slug + '.png" alt="" width="84" height="84">' +
      '<div><p class="q-step">' + t("quiz.pick", "Your app") + "</p><h3>" + a[0] + "</h3><p>" + t("app." + slug, a[1]) + "</p>" +
      '<div class="q-actions"><a class="btn btn-primary" href="' + BASE + "apps/" + slug + '.html">' + t("cta.details", "See details") + "</a>" +
      '<button class="btn btn-ghost q-again" type="button">' + t("quiz.again", "Start again") + "</button></div></div></div>";
    $(".q-again", quiz).addEventListener("click", function () { swap(function () { step("start", 1); }); });
  }
  if (quiz) { step("start", 1); document.addEventListener("ptl:lang", function () { step("start", 1); }); }

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
