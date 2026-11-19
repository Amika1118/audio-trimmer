import { dom } from "../dom.js";
import { state } from "../state.js";
import { formatTime } from "../utils.js";

export function updateCounters() {
  dom.counterIn.value = formatTime(state.selStart);
  dom.counterOut.value = formatTime(state.selEnd);
  dom.counterSel.textContent = formatTime(Math.max(0, state.selEnd - state.selStart));
  dom.counterTotal.textContent = formatTime(state.duration);
}

export function setPositionCounter(t) {
  dom.counterPos.textContent = formatTime(t);
}
