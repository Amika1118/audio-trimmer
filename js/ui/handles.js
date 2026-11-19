import { dom } from "../dom.js";
import { state } from "../state.js";
import { MIN_GAP } from "../config.js";
import { clamp } from "../utils.js";
import { layoutHandles, xToTime } from "./waveform.js";
import { updateCounters } from "./counters.js";
import { pushHistory } from "./history.js";

function wireDrag(target, el) {
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    state.dragTarget = target;
    el.classList.add("dragging");
    el.setPointerCapture(e.pointerId);
    pushHistory();
  });

  el.addEventListener("pointermove", (e) => {
    if (state.dragTarget !== target) return;
    const rect = dom.waveformPanel.getBoundingClientRect();
    const t = xToTime(e.clientX - rect.left + dom.waveformPanel.scrollLeft);
    if (target === "start") state.selStart = clamp(t, 0, state.selEnd - MIN_GAP);
    else state.selEnd = clamp(t, state.selStart + MIN_GAP, state.duration);
    layoutHandles();
    updateCounters();
  });

  const end = (e) => {
    if (state.dragTarget !== target) return;
    state.dragTarget = null;
    el.classList.remove("dragging");
    try { el.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);

  el.addEventListener("keydown", (e) => nudge(e, target));
}

function nudge(e, target) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  pushHistory(); // snapshot BEFORE mutating so undo restores the prior position

  const step = e.shiftKey ? 0.5 : 0.01;
  const { selStart, selEnd, duration } = state;

  if (e.key === "ArrowLeft") {
    if (target === "start") state.selStart = clamp(selStart - step, 0, selEnd - MIN_GAP);
    else state.selEnd = clamp(selEnd - step, selStart + MIN_GAP, duration);
  } else if (e.key === "ArrowRight") {
    if (target === "start") state.selStart = clamp(selStart + step, 0, selEnd - MIN_GAP);
    else state.selEnd = clamp(selEnd + step, selStart + MIN_GAP, duration);
  } else if (e.key === "Home") {
    if (target === "start") state.selStart = 0;
  } else if (e.key === "End") {
    if (target === "end") state.selEnd = duration;
  }

  layoutHandles();
  updateCounters();
}

export function initHandles() {
  wireDrag("start", dom.handleStart);
  wireDrag("end", dom.handleEnd);
}
