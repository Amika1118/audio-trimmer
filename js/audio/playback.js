import { dom } from "../dom.js";
import { state } from "../state.js";
import { ensureAudioCtx } from "./context.js";
import { layoutPlayheadFromTime, xToTime } from "../ui/waveform.js";
import { setPositionCounter } from "../ui/counters.js";
import { setStatus } from "../ui/status.js";

export function stopPlayback() {
  if (state.playSource) {
    try { state.playSource.onended = null; state.playSource.stop(); } catch (_) { /* already stopped */ }
    state.playSource.disconnect();
    state.playSource = null;
  }
  if (state.rafId) cancelAnimationFrame(state.rafId);
  state.rafId = null;
  state.isPlaying = false;
  dom.btnPlaySel.textContent = "\u25b6 Play selection";
}

export function playRange(from, to, { loop = false, label } = {}) {
  if (!state.audioBuffer) return;
  if (to - from < 0.001) {
    setStatus("Selection too short to play.", true);
    return;
  }
  const ctx = ensureAudioCtx();
  stopPlayback();

  const src = ctx.createBufferSource();
  src.buffer = state.audioBuffer;
  src.connect(state.gainNode);

  if (loop) {
    src.loop = true;
    src.loopStart = from;
    src.loopEnd = to;
    src.start(0, from);
  } else {
    src.start(0, from, Math.max(0.001, to - from));
    src.onended = () => { if (state.playSource === src) stopPlayback(); };
  }

  state.playSource = src;
  state.playCtxStartTime = ctx.currentTime;
  state.playOffset = from;
  state.playingSelectionOnly = label === "selection";
  state.isPlaying = true;
  if (label === "selection") dom.btnPlaySel.textContent = "\u23f8 Pause selection";

  tickPlayhead(from, to, loop);
}

function tickPlayhead(from, to, loop) {
  function step() {
    if (!state.isPlaying) return;
    const elapsed = state.audioCtx.currentTime - state.playCtxStartTime;
    let pos = from + elapsed;
    if (loop && pos > to) pos = from + ((pos - from) % (to - from));
    if (!loop && pos >= to) {
      layoutPlayheadFromTime(to);
      setPositionCounter(to);
      stopPlayback();
      return;
    }
    layoutPlayheadFromTime(pos);
    setPositionCounter(pos);
    state.rafId = requestAnimationFrame(step);
  }
  state.rafId = requestAnimationFrame(step);
}

export function playSelection() {
  playRange(state.selStart, state.selEnd, { loop: state.isLooping, label: "selection" });
}

export function initPlayback() {
  dom.btnPlaySel.addEventListener("click", () => {
    if (!state.audioBuffer) return;
    if (state.isPlaying && state.playingSelectionOnly) { stopPlayback(); return; }
    playSelection();
  });

  dom.btnPlayAll.addEventListener("click", () => {
    if (!state.audioBuffer) return;
    playRange(0, state.duration, { loop: false, label: "full" });
  });

  dom.btnStop.addEventListener("click", stopPlayback);

  dom.btnLoop.addEventListener("click", () => {
    state.isLooping = !state.isLooping;
    dom.btnLoop.setAttribute("aria-pressed", String(state.isLooping));
    if (state.isPlaying && state.playingSelectionOnly) playSelection();
  });

  // Click the waveform to move the playhead / set the position marker
  dom.waveformPanel.addEventListener("click", (e) => {
    if (!state.audioBuffer || state.dragTarget) return;
    if (e.target === dom.handleStart || e.target === dom.handleEnd) return;
    const rect = dom.waveformPanel.getBoundingClientRect();
    const t = xToTime(e.clientX - rect.left + dom.waveformPanel.scrollLeft);
    layoutPlayheadFromTime(t);
    setPositionCounter(t);
    state.playOffset = t;
  });
}

