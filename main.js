// app filter: Money / Study / Tools
(function () {
  var chips = document.querySelectorAll(".filters .chip");
  var apps = document.querySelectorAll(".app-list .app");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  apps.forEach(function (a, i) {
    if (a.querySelector(".peek")) a.classList.add("has-peek");
    a.style.viewTransitionName = "app-" + i;
  });

  function apply(filter) {
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
    var small = Array.prototype.filter.call(apps, function (a) { return !a.hidden && !a.classList.contains("app-feature"); });
    if (small.length % 2 === 1) small[small.length - 1].classList.add("is-wide");
  }
  apply("all");

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.dataset.filter;
      if (document.startViewTransition && !reduce) document.startViewTransition(function () { apply(f); });
      else apply(f);
    });
  });
})();
