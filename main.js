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
      if (document.startViewTransition && !reduce) document.startViewTransition(function () { applyFilter(f); });
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
  var photo = $(".about-photo img");
  if (photo) {
    var fail = function () { photo.parentNode.classList.add("no-photo"); };
    if (photo.complete && !photo.naturalWidth) fail(); else photo.addEventListener("error", fail);
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
