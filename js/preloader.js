// Dismisses the logo preloader once the page, fonts and scripts are ready.
// Classic (non-module) script, loaded with `defer` ahead of the app module.
(function () {
  "use strict";

  var el = document.getElementById("preloader");
  if (!el) return;

  var MIN_MS = 450;   // measured from navigation start, so a fast load doesn't flash
  var MAX_MS = 4000;  // never trap the user behind the splash
  var finished = false;

  function remove() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  function finish() {
    if (finished) return;
    finished = true;
    var wait = Math.max(0, MIN_MS - performance.now());
    setTimeout(function () {
      el.classList.add("is-done");
      el.setAttribute("aria-hidden", "true");
      el.addEventListener("transitionend", remove, { once: true });
      setTimeout(remove, 800); // safety net if transitionend never fires
    }, wait);
  }

  var pageLoaded = document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(function (resolve) { window.addEventListener("load", resolve, { once: true }); });
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  Promise.all([pageLoaded, fontsReady]).then(finish, finish);
  setTimeout(finish, MAX_MS);
})();
