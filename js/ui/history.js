import { dom } from "../dom.js";
import { state } from "../state.js";
import { HISTORY_LIMIT } from "../config.js";
import { layoutHandles } from "./waveform.js";
import { updateCounters } from "./counters.js";

export function pushHistory() {
  state.history.push({ selStart: state.selStart, selEnd: state.selEnd });
  if (state.history.length > HISTORY_LIMIT) state.history.shift();
  state.future = [];
  updateHistoryButtons();
}

export function resetHistory() {
  state.history = [];
  state.future = [];
  updateHistoryButtons();
}

export function updateHistoryButtons() {
  dom.btnUndo.disabled = state.history.length === 0;
  dom.btnRedo.disabled = state.future.length === 0;
}

function applySelection(sel) {
  state.selStart = sel.selStart;
  state.selEnd = sel.selEnd;
  layoutHandles();
  updateCounters();
  updateHistoryButtons();
}

export function initHistory() {
  dom.btnUndo.addEventListener("click", () => {
    if (!state.history.length) return;
    state.future.push({ selStart: state.selStart, selEnd: state.selEnd });
    applySelection(state.history.pop());
  });

  dom.btnRedo.addEventListener("click", () => {
    if (!state.future.length) return;
    state.history.push({ selStart: state.selStart, selEnd: state.selEnd });
    applySelection(state.future.pop());
  });

  dom.btnResetSel.addEventListener("click", () => {
    if (!state.audioBuffer) return;
    pushHistory();
    state.selStart = 0;
    state.selEnd = state.duration;
    layoutHandles();
    updateCounters();
  });
}
