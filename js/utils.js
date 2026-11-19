export function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(ms).padStart(3, "0");
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// Resolves after the browser has had a chance to paint (two rAFs is more
// reliable than one for guaranteeing a layout/paint actually happened).
export function nextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

// Accepts "mm:ss.mmm", "h:mm:ss.mmm", "mm:ss", or plain seconds "12.5".
// A blank segment (e.g. mid-edit, ":23.456") counts as 0 rather than invalid.
export function parseTimeString(str) {
  const s = (str || "").trim();
  if (!s) return null;
  const parts = s.split(":").map((p) => p.trim());
  if (parts.length > 3 || parts.some((p) => p !== "" && isNaN(Number(p)))) return null;
  const nums = parts.map((p) => (p === "" ? 0 : parseFloat(p)));

  let seconds;
  if (nums.length === 1) seconds = nums[0];
  else if (nums.length === 2) seconds = Math.trunc(nums[0]) * 60 + nums[1];
  else seconds = Math.trunc(nums[0]) * 3600 + Math.trunc(nums[1]) * 60 + nums[2];
  return isFinite(seconds) && seconds >= 0 ? seconds : null;
}
