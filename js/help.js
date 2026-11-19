// Help page: highlight the guide card that matches the current section.
const picks = Array.from(document.querySelectorAll(".guide-pick"));
const ids = picks.map((p) => p.getAttribute("href").slice(1));

function setActive(id) {
  picks.forEach((p) => {
    if (p.getAttribute("href") === "#" + id) p.setAttribute("aria-current", "true");
    else p.removeAttribute("aria-current");
  });
}

function fromHash() {
  const id = location.hash.slice(1);
  setActive(ids.includes(id) ? id : ids[0]);
}

window.addEventListener("hashchange", fromHash);
fromHash();
