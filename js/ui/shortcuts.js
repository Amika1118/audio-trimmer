import { state } from "../state.js";
import { MIN_GAP } from "../config.js";
import { clamp } from "../utils.js";
import { stopPlayback, playSelection } from "../audio/playback.js";
import { layoutHandles } from "./waveform.js";
import { updateCounters } from "./counters.js";
import { pushHistory } from "./history.js";

export function initShortcuts() {
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
    if (!state.audioBuffer) return;

    if (e.code === "Space") {
      e.preventDefault();
      if (state.isPlaying) stopPlayback();
      else playSelection();
    } else if (e.key === "[") {
      pushHistory();
      state.selStart = clamp(state.playOffset, 0, state.selEnd - MIN_GAP);
      layoutHandles();
      updateCounters();
    } else if (e.key === "]") {
      pushHistory();
      state.selEnd = clamp(state.playOffset, state.selStart + MIN_GAP, state.duration);
      layoutHandles();
      updateCounters();
    } else if (e.key === "Escape") {
      stopPlayback();
    }
  });
}
