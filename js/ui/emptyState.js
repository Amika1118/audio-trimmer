import { dom } from "../dom.js";
import { debounce } from "../utils.js";
import { loadSample } from "./loader.js";

// Decorative preview of the editor, drawn behind the empty-state copy so the
// start screen shows what the tool does. Purely visual (aria-hidden).
export function drawGhostWaveform() {
  const canvas = dom.ghostCanvas;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width < 1 || height < 1) return; // hidden or not laid out yet

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const mid = height / 2;
  const n = Math.max(40, Math.floor(width / 3.2));
  const barW = Math.max(1, width / n - 1);

  const selA = 0.27, selB = 0.73;
  ctx.fillStyle = "rgba(232,163,61,0.13)";
  ctx.fillRect(selA * width, 0, (selB - selA) * width, height);

  for (let i = 0; i < n; i++) {
    const x = (i / n) * width;
    const p = i / n;
    // beat-like pulses over a slow swell, deterministic so it never flickers
    const pulse = Math.pow(Math.max(0, Math.cos(p * Math.PI * 13)), 3);
    const swell = 0.35 + 0.35 * Math.sin(p * Math.PI * 3 + 0.8) ** 2;
    const jitter = 0.08 * Math.sin(i * 12.9898);
    const amp = Math.min(0.95, 0.12 + swell * 0.5 + pulse * 0.45 + jitter);
    const h = Math.max(2, amp * height * 0.86);
    const inside = p >= selA && p <= selB;
    ctx.fillStyle = inside ? "rgba(95,168,160,0.8)" : "rgba(95,168,160,0.32)";
    ctx.fillRect(x, mid - h / 2, barW, h);
  }

  // amber IN / OUT handles
  for (const p of [selA, selB]) {
    const x = Math.round(p * width);
    ctx.fillStyle = "#e8a33d";
    ctx.fillRect(x - 1, 0, 2, height);
    for (let y = mid - 13; y < mid + 13; y += 6) ctx.fillRect(x - 6, y, 12, 2);
  }
}

export function initEmptyState() {
  dom.btnSample.addEventListener("click", loadSample);
  drawGhostWaveform();
  window.addEventListener("resize", debounce(drawGhostWaveform, 150));
  // fonts/layout can shift after first paint; redraw once everything has settled
  window.addEventListener("load", drawGhostWaveform, { once: true });
}
