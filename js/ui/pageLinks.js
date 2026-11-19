import { dom } from "../dom.js";
import { state } from "../state.js";

// Help / Privacy links open in the same tab, unless a track is loaded:
// then they open in a new tab so the loaded file and selection aren't lost.
export function initPageLinks() {
  dom.pageLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (!state.audioBuffer) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // browser handles it
      e.preventDefault();
      window.open(link.href, "_blank", "noopener");
    });
  });
}
