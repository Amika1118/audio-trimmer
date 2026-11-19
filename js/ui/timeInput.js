import { dom } from "../dom.js";
import { state } from "../state.js";
import { MIN_GAP } from "../config.js";
import { clamp, parseTimeString } from "../utils.js";
import { layoutHandles } from "./waveform.js";
import { updateCounters } from "./counters.js";
import { pushHistory } from "./history.js";
import { setStatus } from "./status.js";

function commitTypedTime(target) {
  if (!state.audioBuffer) return;
  const el = target === "start" ? dom.counterIn : dom.counterOut;
  const parsed = parseTimeString(el.value);

  if (parsed === null) {
    setStatus("Enter a time like 1:23.500 or a number of seconds.", true);
    updateCounters(); // revert to last valid value
    return;
  }

  let changed;
  if (target === "start") {
    const clamped = clamp(parsed, 0, Math.max(0, state.selEnd - MIN_GAP));
    changed = Math.abs(clamped - state.selStart) > 0.0005;
    if (changed) { pushHistory(); state.selStart = clamped; }
  } else {
    const clamped = clamp(parsed, state.selStart + MIN_GAP, state.duration);
    changed = Math.abs(clamped - state.selEnd) > 0.0005;
    if (changed) { pushHistory(); state.selEnd = clamped; }
  }

  if (changed) layoutHandles();
  updateCounters();
  setStatus("");
}

// Splits a rendered "MM:SS.mmm" string into its three editable parts by
// locating the separators (MM can exceed 2 digits for long tracks).
function timeSegments(value) {
  const colon = value.indexOf(":");
  const dot = value.indexOf(".", colon + 1);
  if (colon === -1 || dot === -1) return null;
  return [
    { name: "mm", start: 0, end: colon },
    { name: "ss", start: colon + 1, end: dot },
    { name: "ms", start: dot + 1, end: value.length },
  ];
}

// A caret landing exactly on a separator snaps to the segment right after it.
function segmentAt(segments, index) {
  for (const seg of segments) if (index <= seg.end) return seg;
  return segments[segments.length - 1];
}

function wireTypedTimeInput(el, target) {
  let skipNextBlurCommit = false;
  let activeSeg = null;   // segment currently scoped for editing
  let freshEntry = true;  // next digit overwrites the segment vs. appending
  let activeMaxLen = 2;   // digit cap for the active segment, captured once at entry

  function selectSegment(seg) {
    activeSeg = seg;
    freshEntry = true;
    el.setSelectionRange(seg.start, seg.end);
  }

  // Rewrites one segment in place and returns its new range (later segments may shift).
  function writeSegment(seg, digits) {
    el.value = el.value.slice(0, seg.start) + digits + el.value.slice(seg.end);
    return { name: seg.name, start: seg.start, end: seg.start + digits.length };
  }

  el.addEventListener("focus", () => {
    // Keyboard focus has no click position, so land on minutes; a mouse
    // click is handled in mouseup once the caret position is known.
    if (el.dataset.mouseFocusing === "1") return;
    const segs = timeSegments(el.value);
    if (segs) selectSegment(segs[0]);
  });

  el.addEventListener("mousedown", () => { el.dataset.mouseFocusing = "1"; });

  el.addEventListener("mouseup", (e) => {
    // Browsers finalise the caret on mouseup, collapsing any selection we
    // set. Overriding that lets a click on "23" select just the seconds.
    delete el.dataset.mouseFocusing;
    e.preventDefault();
    const segs = timeSegments(el.value);
    if (segs) selectSegment(segmentAt(segs, el.selectionStart));
  });

  el.addEventListener("blur", () => {
    if (skipNextBlurCommit) { skipNextBlurCommit = false; return; }
    commitTypedTime(target);
  });

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTypedTime(target);
      skipNextBlurCommit = true; // avoid committing a second time on blur
      el.blur();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      updateCounters(); // discard edits
      skipNextBlurCommit = true;
      el.blur();
      return;
    }
    // Leave copy/paste/select-all and other modified shortcuts to the browser.
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const segs = timeSegments(el.value);
    if (!segs) return;

    const s = el.selectionStart, en = el.selectionEnd;
    const seg = segmentAt(segs, s);
    // Only intercept when the selection sits inside one segment; a broader
    // selection (e.g. after Ctrl+A) falls through to free-form editing.
    if (s !== en && segmentAt(segs, en) !== seg) return;

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const sameSeg = activeSeg && activeSeg.name === seg.name && !freshEntry;
      // Capture the digit cap when a segment starts being edited and reuse it
      // for the whole session, so "9" then "0" gives "90" and not "0".
      const maxLen = sameSeg ? activeMaxLen : Math.max(seg.end - seg.start, 1);
      let digits = sameSeg ? el.value.slice(seg.start, seg.end) + e.key : e.key;
      if (digits.length > maxLen) digits = digits.slice(-maxLen);
      activeMaxLen = maxLen;
      const newSeg = writeSegment(seg, digits);

      if (digits.length >= maxLen) {
        const freshSegs = timeSegments(el.value);
        const idx = freshSegs.findIndex((sg) => sg.name === newSeg.name);
        if (idx < freshSegs.length - 1) selectSegment(freshSegs[idx + 1]);
        else { activeSeg = newSeg; freshEntry = true; el.setSelectionRange(newSeg.end, newSeg.end); }
      } else {
        activeSeg = newSeg;
        freshEntry = false;
        el.setSelectionRange(newSeg.end, newSeg.end);
      }
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const digits = el.value.slice(seg.start, seg.end);
      if (digits.length > 0) {
        const newSeg = writeSegment(seg, digits.slice(0, -1));
        activeSeg = newSeg;
        freshEntry = false;
        el.setSelectionRange(newSeg.end, newSeg.end);
      } else if (e.key === "Backspace") {
        const idx = segs.findIndex((sg) => sg.name === seg.name);
        if (idx > 0) {
          const prev = segs[idx - 1];
          const newSeg = writeSegment(prev, el.value.slice(prev.start, prev.end).slice(0, -1));
          activeSeg = newSeg;
          freshEntry = false;
          el.setSelectionRange(newSeg.end, newSeg.end);
        }
      }
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const idx = segs.findIndex((sg) => sg.name === seg.name);
      const nextIdx = idx + (e.key === "ArrowLeft" ? -1 : 1);
      if (nextIdx >= 0 && nextIdx < segs.length) selectSegment(segs[nextIdx]);
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const width = seg.end - seg.start || (seg.name === "ms" ? 3 : 2);
      const capMax = seg.name === "ss" ? 59 : seg.name === "ms" ? 999 : Infinity;
      let val = parseInt(el.value.slice(seg.start, seg.end) || "0", 10) || 0;
      val = clamp(val + (e.key === "ArrowUp" ? 1 : -1), 0, capMax);
      selectSegment(writeSegment(seg, String(val).padStart(width, "0")));
      return;
    }

    if (e.key === ":" || e.key === ".") {
      // Typing the separator jumps to the next segment.
      e.preventDefault();
      const idx = segs.findIndex((sg) => sg.name === seg.name);
      if (idx < segs.length - 1) selectSegment(segs[idx + 1]);
    }
    // Anything else (Tab, Home/End, etc.) keeps default behaviour.
  });
}

export function initTimeInputs() {
  wireTypedTimeInput(dom.counterIn, "start");
  wireTypedTimeInput(dom.counterOut, "end");
}
