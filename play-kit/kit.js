// Play upload kit: unlock with the passcode, then copy buttons, counters and the checklist
(function () {
  "use strict";
  var PASS_KEY = "pk-pass";
  var dataEl = document.getElementById("kit-data");
  var main = document.getElementById("kit");
  var gate = document.getElementById("gate");
  var form = document.getElementById("gate-form");
  var input = document.getElementById("gate-code");
  var msg = document.getElementById("gate-msg");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(kind) {
    try { return kind === "s" ? window.sessionStorage : window.localStorage; } catch (e) { return null; }
  }
  function get(kind, k) { var s = store(kind); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(kind, k, v) { var s = store(kind); try { if (s) s.setItem(k, v); } catch (e) {} }
  function del(kind, k) { var s = store(kind); try { if (s) s.removeItem(k); } catch (e) {} }

  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // passcode -> PBKDF2-SHA256 key -> AES-GCM decrypt
  function decrypt(pass) {
    var d = JSON.parse(dataEl.textContent);
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]).then(function (base) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(d.s), iterations: d.n, hash: "SHA-256" },
        base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    }).then(function (key) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(d.i) }, key, b64(d.c));
    }).then(function (buf) { return new TextDecoder().decode(buf); });
  }

  function say(t, bad) {
    msg.textContent = t;
    msg.className = "gate-msg" + (bad ? " bad" : "");
    if (bad && !reduce) {
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    }
  }

  function open(html, pass) {
    set("s", PASS_KEY, pass);
    main.innerHTML = html;
    var t = main.querySelector("[data-title]");
    if (t) document.title = t.getAttribute("data-title");
    gate.hidden = true;
    main.hidden = false;
    document.body.classList.add("unlocked");
    wire();
  }

  function tryPass(pass, quiet) {
    if (!window.crypto || !crypto.subtle) {
      say("This browser cannot unlock the page here. Open it on https://priya4042.github.io in Chrome.", true);
      return;
    }
    if (!quiet) say("Checking...", false);
    var btn = form.querySelector("button");
    btn.disabled = true;
    decrypt(pass).then(function (html) { open(html, pass); }).catch(function () {
      if (quiet) { del("s", PASS_KEY); say("", false); }
      else say("Wrong passcode. Check it and try again.", true);
    }).then(function () { btn.disabled = false; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = (input.value || "").trim();
    if (!v) { say("Paste the passcode first.", true); return; }
    tryPass(v, false);
  });

  // ---------- after unlock ----------
  function count(s) { return Array.from(s).length; }

  function flash(btn, text) {
    var old = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", old);
    btn.textContent = text;
    btn.classList.add("done");
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = old; btn.classList.remove("done"); }, 1600);
  }

  function copyText(text, btn) {
    function ok() { flash(btn, "Copied"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { fallback(text) ? ok() : flash(btn, "Select and copy"); });
    } else if (fallback(text)) ok(); else flash(btn, "Select and copy");
  }
  function fallback(text) {
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    var r = false;
    try { r = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(t);
    return r;
  }

  function fieldCount(f) {
    var area = f.querySelector("textarea, input");
    var out = f.querySelector(".count b");
    var max = parseInt(f.getAttribute("data-max") || "0", 10);
    if (!area || !out) return;
    var n = count(area.value);
    out.textContent = n;
    f.classList.toggle("over", max > 0 && n > max);
  }

  function grow(area) {
    if (area.tagName !== "TEXTAREA") return;
    area.style.height = "auto";
    area.style.height = Math.min(area.scrollHeight + 4, 520) + "px";
  }

  function wire() {
    var slug = main.querySelector("[data-slug]");
    slug = slug ? slug.getAttribute("data-slug") : "";

    // copy buttons and live counters
    main.querySelectorAll(".field").forEach(function (f) {
      var area = f.querySelector("textarea, input");
      fieldCount(f);
      if (area) {
        grow(area);
        area.addEventListener("input", function () { fieldCount(f); grow(area); });
      }
    });
    main.addEventListener("click", function (e) {
      var b = e.target.closest(".copy");
      if (b) {
        var f = b.closest(".field");
        var src = b.getAttribute("data-copy");
        var text = src !== null ? src : (f ? (f.querySelector("textarea, input") || {}).value : "");
        copyText(text || "", b);
        return;
      }
      var lk = e.target.closest("[data-lock]");
      if (lk) { del("s", PASS_KEY); location.reload(); }
    });

    // language tabs
    main.querySelectorAll("[data-tabs]").forEach(function (box) {
      var btns = box.querySelectorAll("[data-tab]");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-tab");
          btns.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
          box.querySelectorAll("[data-pane]").forEach(function (p) {
            p.hidden = p.getAttribute("data-pane") !== id;
            if (!p.hidden) p.querySelectorAll(".field textarea").forEach(grow);
          });
        });
      });
    });

    // checklist, saved per app in this browser
    if (slug) {
      var KEY = "pk-done-" + slug;
      var done = {};
      try { done = JSON.parse(get("l", KEY) || "{}") || {}; } catch (e) { done = {}; }
      var boxes = main.querySelectorAll("input[data-step]");
      var bar = main.querySelector(".progress i");
      var txt = main.querySelector(".progress-text");
      var update = function () {
        var n = 0;
        boxes.forEach(function (c) {
          if (c.checked) n++;
          var card = c.closest(".step");
          if (card) card.classList.toggle("is-done", c.checked);
        });
        if (bar) bar.style.width = (boxes.length ? (100 * n / boxes.length) : 0) + "%";
        if (txt) txt.textContent = n + " of " + boxes.length + " steps done";
      };
      boxes.forEach(function (c) {
        c.checked = !!done[c.getAttribute("data-step")];
        c.addEventListener("change", function () {
          done[c.getAttribute("data-step")] = c.checked;
          set("l", KEY, JSON.stringify(done));
          update();
        });
      });
      update();
      var reset = main.querySelector("[data-reset]");
      if (reset) reset.addEventListener("click", function () {
        if (!window.confirm("Untick every step for this app?")) return;
        done = {}; set("l", KEY, "{}");
        boxes.forEach(function (c) { c.checked = false; });
        update();
      });

      // AdMob ids she pastes, kept in this browser and turned into one message
      var ids = main.querySelector("[data-ids]");
      if (ids) {
        var IKEY = "pk-ids-" + slug;
        var saved = {};
        try { saved = JSON.parse(get("l", IKEY) || "{}") || {}; } catch (e) { saved = {}; }
        var inputs = ids.querySelectorAll("input[data-id]");
        var out = ids.querySelector("[data-ids-out]");
        var refresh = function () {
          var lines = [ids.getAttribute("data-ids") + " AdMob ids:"], all = true;
          inputs.forEach(function (i) {
            var v = i.value.trim();
            var re = new RegExp(i.getAttribute("data-pattern"));
            var ok = re.test(v);
            i.classList.toggle("bad", v !== "" && !ok);
            i.classList.toggle("good", ok);
            if (!ok) all = false;
            lines.push(i.getAttribute("data-id") + ": " + (v || "(missing)"));
          });
          out.value = lines.join("\n");
          ids.classList.toggle("complete", all);
          fieldCount(out.closest(".field"));
          grow(out);
        };
        inputs.forEach(function (i) {
          i.value = saved[i.getAttribute("data-id")] || "";
          i.addEventListener("input", function () {
            saved[i.getAttribute("data-id")] = i.value.trim();
            set("l", IKEY, JSON.stringify(saved));
            refresh();
          });
        });
        refresh();
      }
    }

    // index: show each app's ticks
    main.querySelectorAll("[data-progress]").forEach(function (el) {
      var s = el.getAttribute("data-progress"), total = parseInt(el.getAttribute("data-total"), 10) || 1, n = 0;
      try {
        var d = JSON.parse(get("l", "pk-done-" + s) || "{}") || {};
        Object.keys(d).forEach(function (k) { if (d[k]) n++; });
      } catch (e) {}
      var i = el.querySelector("i"), t = el.querySelector("span");
      if (i) i.style.width = Math.min(100, 100 * n / total) + "%";
      if (t) t.textContent = n + "/" + total + " steps ticked";
    });

    // one entrance: cards rise in as they come into view
    var items = main.querySelectorAll(".rise");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (x) { x.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -6% 0px" });
      items.forEach(function (x, k) { x.style.transitionDelay = Math.min(k, 6) * 60 + "ms"; io.observe(x); });
    }
    window.scrollTo(0, 0);
    var h = location.hash && document.getElementById(location.hash.slice(1));
    if (h) h.scrollIntoView();
  }

  // remembered for this browser session
  var savedPass = get("s", PASS_KEY);
  if (savedPass) tryPass(savedPass, true); else input.focus();
})();
