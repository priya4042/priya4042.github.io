// Free tools: QR maker, EMI, SIP, committee (BC) and NIMCET score calculators. Everything runs in the browser.
(function () {
  var box = document.querySelector("[data-tool]");
  if (!box) return;
  var $ = function (s) { return box.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(box.querySelectorAll(s)); };
  var num = function (id) { var v = parseFloat(($("#" + id) || {}).value); return isFinite(v) ? v : 0; };
  var inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  var rs = function (v) { return inr.format(Math.round(v)); };
  var out = function (k, v) { var el = $('[data-o="' + k + '"]'); if (el) el.textContent = v; };
  var hi = function () { return document.documentElement.lang === "hi"; };
  function chips(sel, onpick) {
    $$(sel + " .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(sel + " .chip").forEach(function (x) { x.classList.toggle("is-on", x === c); });
        onpick(c.dataset.v);
      });
    });
  }
  function bump(el) { if (!el) return; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

  var tools = {
    // ---------- QR code maker ----------
    "qr-code-maker": function () {
      var type = "link", last = "";
      function esc(s) { return String(s).replace(/([\\;,:"])/g, "\\$1"); }
      function payload() {
        var v = function (id) { return ($("#" + id).value || "").trim(); };
        if (type === "wifi") return v("q-ssid") ? "WIFI:T:" + $("#q-sec").value + ";S:" + esc(v("q-ssid")) + ";P:" + esc(v("q-pass")) + ";;" : "";
        if (type === "upi") {
          if (!v("q-upi")) return "";
          var p = "upi://pay?pa=" + v("q-upi").replace(/[^\w.@-]/g, "");   // UPI IDs keep a plain @ - some UPI apps reject %40
          if (v("q-payee")) p += "&pn=" + encodeURIComponent(v("q-payee"));
          if (num("q-amt") > 0) p += "&am=" + num("q-amt").toFixed(2);
          return p + "&cu=INR";
        }
        if (type === "phone") return v("q-phone") ? "tel:" + v("q-phone").replace(/[^\d+]/g, "") : "";
        if (type === "email") return v("q-email") ? "mailto:" + v("q-email") + (v("q-subj") ? "?subject=" + encodeURIComponent(v("q-subj")) : "") : "";
        return v("q-text");
      }
      function draw() {
        var o = $("[data-qr-out]"), text = payload();
        if (!text) { o.innerHTML = '<p class="tool-empty">' + (hi() ? "ऊपर जानकारी भरें" : "Fill in the details above") + "</p>"; $("[data-qr-text]").textContent = ""; last = ""; return; }
        if (typeof qrcode === "undefined") return;
        var q = qrcode(0, "M"); q.addData(unescape(encodeURIComponent(text))); q.make();
        var svg = q.createSvgTag({ cellSize: 8, margin: 2, scalable: true }).replace(/fill="black"/g, 'fill="' + $("#q-color").value + '"');
        o.innerHTML = svg; last = svg;
        $("[data-qr-text]").textContent = text.length > 90 ? text.slice(0, 90) + "..." : text;
        bump(o);
      }
      function save(name, blob) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }
      $("[data-qr-svg]").addEventListener("click", function () { if (last) save("qr-code.svg", new Blob([last], { type: "image/svg+xml" })); });
      $("[data-qr-png]").addEventListener("click", function () {
        if (!last) return;
        var img = new Image(), c = document.createElement("canvas"); c.width = c.height = 1024;
        img.onload = function () { var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 1024, 1024); x.drawImage(img, 0, 0, 1024, 1024); c.toBlob(function (b) { save("qr-code.png", b); }); };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(last.replace("<svg ", '<svg width="1024" height="1024" '));
      });
      chips("[data-qr-type]", function (v) {
        type = v; $$("[data-qr-panel]").forEach(function (p) { p.hidden = p.dataset.qrPanel !== v; }); draw();
      });
      box.addEventListener("input", draw); box.addEventListener("change", draw);
      if (typeof qrcode === "undefined") window.addEventListener("load", draw); else draw();
    },

    // ---------- EMI ----------
    "emi-calculator": function () {
      function calc() {
        var P = num("e-p"), yr = num("e-r"), n = Math.round(num("e-n") * 12), r = yr / 12 / 100;
        if (P <= 0 || n <= 0) { ["emi", "interest", "total"].forEach(function (k) { out(k, "-"); }); return; }
        var emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        var total = emi * n, interest = total - P;
        out("emi", rs(emi)); out("interest", rs(interest)); out("total", rs(total));
        $('[data-o="pbar"]').style.width = (100 * P / total).toFixed(1) + "%";
        var rows = "", bal = P;
        for (var y = 1; y <= Math.ceil(n / 12); y++) {
          var pp = 0, ip = 0;
          for (var m = 0; m < 12 && bal > 0.5 && (y - 1) * 12 + m < n; m++) { var i = bal * r, p = Math.min(emi - i, bal); ip += i; pp += p; bal -= p; }
          rows += "<tr><td>" + y + "</td><td>" + rs(pp) + "</td><td>" + rs(ip) + "</td><td>" + rs(Math.max(0, bal)) + "</td></tr>";
        }
        $('[data-o="rows"]').innerHTML = rows;
        bump($('[data-o="emi"]'));
      }
      box.addEventListener("input", calc); calc();
    },

    // ---------- SIP ----------
    "sip-calculator": function () {
      function calc() {
        var P = num("s-p"), i = num("s-r") / 12 / 100, n = Math.round(num("s-n") * 12);
        if (P <= 0 || n <= 0) { ["fv", "inv", "gain"].forEach(function (k) { out(k, "-"); }); return; }
        var fv = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i), inv = P * n;
        out("fv", rs(fv)); out("inv", rs(inv)); out("gain", rs(fv - inv));
        $('[data-o="pbar"]').style.width = (100 * inv / fv).toFixed(1) + "%";
        bump($('[data-o="fv"]'));
      }
      box.addEventListener("input", calc); calc();
    },

    // ---------- Committee (BC) ----------
    "committee-calculator": function () {
      var type = "bid";
      function calc() {
        var N = Math.max(0, Math.round(num("b-n"))), A = num("b-a"), pool = N * A, comm = pool * num("b-c") / 100, w = $('[data-o="warn"]');
        w.hidden = true;
        if (N < 2 || A <= 0) { ["pays", "win", "pool", "comm", "div"].forEach(function (k) { out(k, "-"); }); return; }
        out("pool", rs(pool)); out("comm", rs(comm));
        if (type === "fixed") {
          out("pays", rs(A)); out("win", rs(pool - comm));
        } else {
          var bid = num("b-bid"), div = (bid - comm) / N;
          out("pays", rs(A - div)); out("win", rs(pool - bid)); out("div", rs(div));
          if (bid < comm) { w.hidden = false; w.textContent = hi() ? "बोली कमीशन से कम है, इसलिए सदस्यों को कुछ वापस नहीं मिलता।" : "The bid is smaller than the commission, so nothing comes back to members."; }
          else if (bid >= pool) { w.hidden = false; w.textContent = hi() ? "बोली कुल रकम जितनी या उससे ज़्यादा नहीं हो सकती।" : "The bid can't be as big as the whole pool."; }
        }
        bump($('[data-o="pays"]'));
      }
      chips("[data-bc-type]", function (v) { type = v; $$("[data-bc-bid]").forEach(function (e) { e.hidden = v !== "bid"; }); calc(); });
      box.addEventListener("input", calc); calc();
    },

    // ---------- NIMCET score ----------
    "nimcet-score-calculator": function () {
      function calc() {
        var total = 0, right = 0, tried = 0, problem = "";
        $$("fieldset.sec").forEach(function (f) {
          var k = f.dataset.sec, q = +f.dataset.q, r = Math.max(0, Math.round(num("n-" + k + "-r"))), w = Math.max(0, Math.round(num("n-" + k + "-w")));
          if (r + w > q) problem = (hi() ? "सही + ग़लत " : "Right + wrong is more than ") + q + (hi() ? " सवालों से ज़्यादा है" : " questions") + " (" + f.querySelector("legend span[data-only=" + (hi() ? "hi" : "en") + "]").textContent + ")";
          var s = r * +f.dataset.plus - w * +f.dataset.minus;
          out("s-" + k, (s % 1 ? s.toFixed(1) : s) + " / " + q * +f.dataset.plus);
          total += s; right += r; tried += r + w;
        });
        out("score", total % 1 ? total.toFixed(1) : total);
        out("acc", tried ? Math.round(100 * right / tried) + "%" : "-");
        var w = $('[data-o="warn"]'); w.hidden = !problem; w.textContent = problem;
        bump($('[data-o="score"]'));
      }
      box.addEventListener("input", calc); calc();
    }
  };
  if (tools[box.dataset.tool]) tools[box.dataset.tool]();
  document.addEventListener("ptl:lang", function () { box.dispatchEvent(new Event("input")); });
})();
