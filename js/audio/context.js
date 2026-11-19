import { dom } from "../dom.js";
import { state } from "../state.js";

export function ensureAudioCtx() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.gainNode = state.audioCtx.createGain();
    state.gainNode.gain.value = parseFloat(dom.volumeRange.value);
    state.gainNode.connect(state.audioCtx.destination);
  }
  if (state.audioCtx.state === "suspended") state.audioCtx.resume();
  return state.audioCtx;
}

export function initVolume() {
  dom.volumeRange.addEventListener("input", () => {
    const v = parseFloat(dom.volumeRange.value);
    dom.volumeValue.textContent = Math.round(v * 100) + "%";
    if (state.gainNode) state.gainNode.gain.value = v;
  });
}
