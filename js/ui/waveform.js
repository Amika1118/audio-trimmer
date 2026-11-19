import { dom } from "../dom.js";
import { state } from "../state.js";
import { clamp, debounce } from "../utils.js";
import { resamplePeaks } from "../audio/peaks.js";

export function timeToX(t) { return t * state.pxPerSec; }
export function xToTime(x) { return clamp(x / state.pxPerSec, 0, state.duration); }

export function layoutPlayheadFromTime(t) {
  dom.playhead.style.transform = `translateX(${timeToX(t)}px)`;
}

export function layoutWaveform() {
  if (!state.audioBuffer) return;
  const baseWidth = dom.waveformPanel.clientWidth;
  if (baseWidth < 1) return; // guard against zero-width
  const width = Math.max(baseWidth, Math.round(baseWidth * state.zoom));
  const height = dom.waveformPanel.clientHeight || 1;
  const dpr = window.devicePixelRatio || 1;

  state.pxPerSec = width / state.duration;

  dom.waveCanvas.width = Math.round(width * dpr);
  dom.waveCanvas.height = Math.round(height * dpr);
  dom.waveCanvas.style.width = width + "px";
  dom.waveCanvas.style.height = height + "px";
  dom.handlesLayer.style.width = width + "px";
  dom.handlesLayer.style.height = height + "px";

  drawWave(width, height, dpr);
  layoutHandles();
  layoutPlayheadFromTime(state.playOffset);
}

function drawWave(width, height, dpr) {
  const ctx = dom.waveCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const mid = height / 2;
  const barPxWidth = 2.2;
  const n = Math.max(80, Math.floor(width / barPxWidth));
  const peaks = resamplePeaks(state.peaksCache, n);

  const barGap = 1;
  const barWidth = Math.max(1, width / n - barGap);
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "rgba(95,168,160,0.85)");
  grad.addColorStop(0.5, "rgba(95,168,160,0.35)");
  grad.addColorStop(1, "rgba(95,168,160,0.85)");
  ctx.fillStyle = grad;

  for (let i = 0; i < n; i++) {
    const x = (i / n) * width;
    const h = Math.max(1.5, peaks[i] * (height * 0.92));
    ctx.fillRect(x, mid - h / 2, barWidth, h);
  }

  // centre line
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(width, mid);
  ctx.stroke();
}

export function drawOverview() {
  const canvas = dom.overviewCanvas;
  const width = canvas.clientWidth;
  if (width < 1) return;
  const height = canvas.clientHeight || 1;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const n = Math.max(80, Math.floor(width / 2));
  const peaks = resamplePeaks(state.peaksCache, n);
  const mid = height / 2;
  ctx.fillStyle = "rgba(141,147,163,0.55)";
  const barWidth = Math.max(1, width / n);
  for (let i = 0; i < n; i++) {
    const x = (i / n) * width;
    const h = Math.max(1, peaks[i] * (height * 0.85));
    ctx.fillRect(x, mid - h / 2, barWidth, h);
  }
}

export function layoutHandles() {
  const { selStart, selEnd, duration } = state;
  const sx = timeToX(selStart);
  const ex = timeToX(selEnd);
  dom.handleStart.style.transform = `translateX(${sx}px)`;
  dom.handleEnd.style.transform = `translateX(${ex}px)`;
  dom.regionShade.style.left = sx + "px";
  dom.regionShade.style.width = Math.max(0, ex - sx) + "px";
  dom.handleStart.setAttribute("aria-valuenow", selStart.toFixed(3));
  dom.handleEnd.setAttribute("aria-valuenow", selEnd.toFixed(3));
  dom.handleStart.setAttribute("aria-valuemax", String(selEnd));
  dom.handleEnd.setAttribute("aria-valuemax", String(duration));

  // overview region + viewport window
  if (duration > 0) {
    const ow = dom.overviewShell.clientWidth;
    dom.overviewRegion.style.left = (selStart / duration) * ow + "px";
    dom.overviewRegion.style.width = Math.max(1, ((selEnd - selStart) / duration) * ow) + "px";

    const scrollW = dom.waveformPanel.scrollWidth || 1;
    dom.overviewWindow.style.left = (dom.waveformPanel.scrollLeft / scrollW) * ow + "px";
    dom.overviewWindow.style.width = (dom.waveformPanel.clientWidth / scrollW) * ow + "px";
  }
}

// Keep the same moment centred in view after the pixel scale changes.
function recenterOn(anchorTime) {
  const panel = dom.waveformPanel;
  const newCenterX = timeToX(anchorTime);
  panel.scrollLeft = clamp(newCenterX - panel.clientWidth / 2, 0, panel.scrollWidth - panel.clientWidth);
}

function currentCenterTime() {
  const centerX = dom.waveformPanel.scrollLeft + dom.waveformPanel.clientWidth / 2;
  return xToTime(centerX);
}

export function initWaveform() {
  window.addEventListener("resize", debounce(() => {
    if (!state.audioBuffer) return;
    const anchorTime = currentCenterTime();
    layoutWaveform();
    drawOverview();
    recenterOn(anchorTime);
    layoutHandles();
  }, 150));

  dom.waveformPanel.addEventListener("scroll", layoutHandles);

  dom.zoomRange.addEventListener("input", () => {
    const label = () => { dom.zoomValue.textContent = state.zoom.toFixed(1) + "\u00d7"; };
    if (!state.audioBuffer) {
      state.zoom = parseFloat(dom.zoomRange.value);
      label();
      return;
    }
    // scrollLeft is a raw pixel offset but pxPerSec changes with zoom, so
    // anchor on the time currently centred (old scale) and restore it after.
    const anchorTime = currentCenterTime();
    state.zoom = parseFloat(dom.zoomRange.value);
    label();
    layoutWaveform();
    recenterOn(anchorTime);
    layoutHandles();
  });

  // Click the minimap to scroll the main view
  dom.overviewShell.addEventListener("click", (e) => {
    if (!state.audioBuffer) return;
    const rect = dom.overviewShell.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const target = ratio * dom.waveformPanel.scrollWidth - dom.waveformPanel.clientWidth / 2;
    dom.waveformPanel.scrollLeft = clamp(target, 0, dom.waveformPanel.scrollWidth);
  });
}
