(() => {
  "use strict";

  /* ---------------- DOM ---------------- */

  const dropzone     = document.getElementById("dropzone");
  const fileInput    = document.getElementById("fileInput");
  const bench        = document.getElementById("bench");
  const fileNameEl   = document.getElementById("fileName");
  const changeFileBtn= document.getElementById("changeFile");

  const waveformPanel= document.getElementById("waveformPanel");
  const waveCanvas   = document.getElementById("waveCanvas");
  const handlesLayer = document.getElementById("handles");
  const regionShade  = document.getElementById("regionShade");
  const handleStart  = document.getElementById("handleStart");
  const handleEnd    = document.getElementById("handleEnd");
  const playhead     = document.getElementById("playhead");

  const overviewCanvas = document.getElementById("overviewCanvas");
  const overviewRegion = document.getElementById("overviewRegion");
  const overviewWindow = document.getElementById("overviewWindow");
  const overviewShell   = overviewCanvas.parentElement;

  const counterIn    = document.getElementById("counterIn");
  const counterOut   = document.getElementById("counterOut");
  const counterSel   = document.getElementById("counterSel");
  const counterPos   = document.getElementById("counterPos");
  const counterTotal = document.getElementById("counterTotal");

  const btnPlaySel = document.getElementById("btnPlaySel");
  const btnPlayAll = document.getElementById("btnPlayAll");
  const btnStop    = document.getElementById("btnStop");
  const btnLoop    = document.getElementById("btnLoop");

  const zoomRange   = document.getElementById("zoomRange");
  const zoomValue   = document.getElementById("zoomValue");
  const volumeRange = document.getElementById("volumeRange");
  const volumeValue = document.getElementById("volumeValue");
  const fadeToggle  = document.getElementById("fadeToggle");

  const btnUndo     = document.getElementById("btnUndo");
  const btnRedo     = document.getElementById("btnRedo");
  const btnResetSel = document.getElementById("btnResetSel");

  const formatSelect = document.getElementById("formatSelect");
  const btnExport     = document.getElementById("btnExport");
  const statusMsg      = document.getElementById("statusMsg");

  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingText     = document.getElementById("loadingText");
  const dropzoneStatus  = document.getElementById("dropzoneStatus");

  /* ---------------- State ---------------- */

  let audioCtx = null;
  let gainNode = null;
  let audioBuffer = null;
  let duration = 0;
  let sourceFileName = "track";

  let selStart = 0;
  let selEnd = 0;

  let zoom = 1;
  let pxPerSec = 1; // recomputed on layout

  let peaksCache = null;      // Float32Array of per-pixel peak values at max zoom resolution
  let overviewDrawn = false;

  let isPlaying = false;
  let isLooping = false;
  let playingSelectionOnly = true;
  let playSource = null;
  let playCtxStartTime = 0;
  let playOffset = 0;
  let rafId = null;

  let dragTarget = null; // 'start' | 'end' | null
  let history = [];
  let future = [];

  const MIN_GAP = 0.005; // seconds, minimum selection width

  let isLoading = false; // prevent concurrent loads

  /* ---------------- Utilities ---------------- */

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.round((sec - Math.floor(sec)) * 1000);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(ms).padStart(3, "0");
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function setStatus(msg, isError = false) {
    statusMsg.textContent = msg || "";
    statusMsg.classList.toggle("error", !!isError);
  }

  function setDropzoneError(msg) {
    dropzoneStatus.textContent = msg || "";
    dropzoneStatus.hidden = !msg;
  }

  function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.hidden = false;
  }

  function hideLoading() {
    loadingOverlay.hidden = true;
  }

  // Resolves after the browser has had a chance to paint (two rAFs is more
  // reliable than one for guaranteeing a layout/paint actually happened).
  function nextPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = parseFloat(volumeRange.value);
      gainNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  /* ---------------- File loading ---------------- */

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  ["dragenter", "dragover"].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("drag-active"); })
  );
  ["dragleave", "drop"].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("drag-active"); })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadFile(file);
  });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) loadFile(file);
  });
  changeFileBtn.addEventListener("click", () => {
    stopPlayback();
    bench.hidden = true;
    dropzone.hidden = false;
    fileInput.value = "";
    setDropzoneError("");
  });

  async function loadFile(file) {
    if (isLoading) return;
    isLoading = true;

    setDropzoneError("");
    showLoading("Reading file\u2026");
    try {
      ensureAudioCtx();
      const arrayBuffer = await file.arrayBuffer();

      showLoading("Decoding audio\u2026");
      await nextPaint();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

      audioBuffer = decoded;
      duration = decoded.duration;
      sourceFileName = file.name.replace(/\.[^/.]+$/, "") || "track";

      selStart = 0;
      selEnd = duration;
      history = [];
      future = [];
      updateHistoryButtons();

      fileNameEl.textContent = `${file.name} \u00b7 ${formatTime(duration)} \u00b7 ${decoded.sampleRate} Hz \u00b7 ${decoded.numberOfChannels === 1 ? "mono" : "stereo"}`;

      dropzone.hidden = true;
      bench.hidden = false;

      showLoading("Rendering waveform\u2026");
      await nextPaint();
      peaksCache = computePeaks(audioBuffer, 20000);
      overviewDrawn = false;

      zoom = 1;
      zoomRange.value = "1";
      zoomValue.textContent = "1.0\u00d7";

      await nextPaint();
      layoutWaveform();
      drawOverview();
      updateCounters();
      setStatus("");
    } catch (err) {
      console.error(err);
      audioBuffer = null;
      bench.hidden = true;
      dropzone.hidden = false;
      setDropzoneError("Couldn't decode that file. Try a standard MP3, WAV, M4A, OGG or FLAC.");
    } finally {
      hideLoading();
      isLoading = false;
    }
  }

  /* ---------------- Peak computation ---------------- */

  function computePeaks(buffer, resolution) {
    const channels = buffer.numberOfChannels;
    const length = buffer.length;
    const samplesPerBucket = Math.max(1, Math.floor(length / resolution));
    const bucketCount = Math.ceil(length / samplesPerBucket);
    const peaks = new Float32Array(bucketCount);

    const chData = [];
    for (let c = 0; c < channels; c++) chData.push(buffer.getChannelData(c));

    for (let b = 0; b < bucketCount; b++) {
      const start = b * samplesPerBucket;
      const end = Math.min(length, start + samplesPerBucket);
      let max = 0;
      for (let c = 0; c < channels; c++) {
        const data = chData[c];
        for (let i = start; i < end; i++) {
          const v = Math.abs(data[i]);
          if (v > max) max = v;
        }
      }
      peaks[b] = max;
    }
    return peaks;
  }

  // Resample a peaks array to exactly outCount buckets (max-aggregation).
  // Works for both downsampling (outCount < base.length) and upsampling.
  function resamplePeaks(base, outCount) {
    const m = base.length;
    outCount = Math.max(1, Math.floor(outCount));
    if (m === 0) return new Float32Array(outCount);
    const out = new Float32Array(outCount);
    for (let i = 0; i < outCount; i++) {
      const startIdx = Math.floor((i / outCount) * m);
      const endIdx = Math.max(startIdx + 1, Math.floor(((i + 1) / outCount) * m));
      let max = 0;
      for (let j = startIdx; j < endIdx && j < m; j++) {
        if (base[j] > max) max = base[j];
      }
      out[i] = max;
    }
    return out;
  }

  /* ---------------- Waveform layout & drawing ---------------- */

  function layoutWaveform() {
    if (!audioBuffer) return;
    const baseWidth = waveformPanel.clientWidth;
    if (baseWidth < 1) return;          // guard against zero-width
    const width = Math.max(baseWidth, Math.round(baseWidth * zoom));
    const height = waveformPanel.clientHeight || 1; // fallback
    const dpr = window.devicePixelRatio || 1;

    pxPerSec = width / duration;        // duration > 0 guaranteed

    waveCanvas.width = Math.round(width * dpr);
    waveCanvas.height = Math.round(height * dpr);
    waveCanvas.style.width = width + "px";
    waveCanvas.style.height = height + "px";
    handlesLayer.style.width = width + "px";
    handlesLayer.style.height = height + "px";

    drawWave(width, height, dpr);
    layoutHandles();
    layoutPlayheadFromTime(playOffset);
  }

  function drawWave(width, height, dpr) {
    const ctx = waveCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const mid = height / 2;
    const barPxWidth = 2.2;
    const n = Math.max(80, Math.floor(width / barPxWidth));
    const peaks = resamplePeaks(peaksCache, n);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(95,168,160,0.55)";
    ctx.lineWidth = 1;

    const barGap = 1;
    const barWidth = Math.max(1, width / n - barGap);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(95,168,160,0.85)");
    grad.addColorStop(0.5, "rgba(95,168,160,0.35)");
    grad.addColorStop(1, "rgba(95,168,160,0.85)");
    ctx.fillStyle = grad;

    for (let i = 0; i < n; i++) {
      const x = (i / n) * width;
      const v = peaks[i];
      const h = Math.max(1.5, v * (height * 0.92));
      ctx.fillRect(x, mid - h / 2, barWidth, h);
    }

    // center line
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.stroke();
  }

  function drawOverview() {
    if (!overviewCanvas) return;
    const width = overviewCanvas.clientWidth;
    if (width < 1) return;
    const height = overviewCanvas.clientHeight || 1;
    const dpr = window.devicePixelRatio || 1;
    overviewCanvas.width = Math.round(width * dpr);
    overviewCanvas.height = Math.round(height * dpr);
    const ctx = overviewCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const n = Math.max(80, Math.floor(width / 2));
    const peaks = resamplePeaks(peaksCache, n);
    const mid = height / 2;
    ctx.fillStyle = "rgba(141,147,163,0.55)";
    const barWidth = Math.max(1, width / n);
    for (let i = 0; i < n; i++) {
      const x = (i / n) * width;
      const v = peaks[i];
      const h = Math.max(1, v * (height * 0.85));
      ctx.fillRect(x, mid - h / 2, barWidth, h);
    }
    overviewDrawn = true;
  }

  function layoutHandles() {
    const sx = timeToX(selStart);
    const ex = timeToX(selEnd);
    handleStart.style.transform = `translateX(${sx}px)`;
    handleEnd.style.transform = `translateX(${ex}px)`;
    regionShade.style.left = sx + "px";
    regionShade.style.width = Math.max(0, ex - sx) + "px";
    handleStart.setAttribute("aria-valuenow", selStart.toFixed(3));
    handleEnd.setAttribute("aria-valuenow", selEnd.toFixed(3));
    handleStart.setAttribute("aria-valuemax", String(selEnd));
    handleEnd.setAttribute("aria-valuemax", String(duration));

    // overview region + window
    if (duration > 0) {
      const ow = overviewShell.clientWidth;
      overviewRegion.style.left = (selStart / duration) * ow + "px";
      overviewRegion.style.width = Math.max(1, ((selEnd - selStart) / duration) * ow) + "px";

      const scrollW = waveformPanel.scrollWidth || 1;
      const winLeft = (waveformPanel.scrollLeft / scrollW) * ow;
      const winWidth = (waveformPanel.clientWidth / scrollW) * ow;
      overviewWindow.style.left = winLeft + "px";
      overviewWindow.style.width = winWidth + "px";
    }
  }

  function timeToX(t) { return t * pxPerSec; }
  function xToTime(x) { return clamp(x / pxPerSec, 0, duration); }

  window.addEventListener("resize", debounce(() => {
    if (audioBuffer) { layoutWaveform(); drawOverview(); }
  }, 150));

  waveformPanel.addEventListener("scroll", () => layoutHandles());

  function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  /* ---------------- Zoom / Volume ---------------- */

  zoomRange.addEventListener("input", () => {
    zoom = parseFloat(zoomRange.value);
    zoomValue.textContent = zoom.toFixed(1) + "\u00d7";
    if (audioBuffer) layoutWaveform();
  });

  volumeRange.addEventListener("input", () => {
    const v = parseFloat(volumeRange.value);
    volumeValue.textContent = Math.round(v * 100) + "%";
    if (gainNode) gainNode.gain.value = v;
  });

  /* ---------------- Handle dragging ---------------- */

  function beginDrag(target, pointerId, el) {
    dragTarget = target;
    el.classList.add("dragging");
    el.setPointerCapture(pointerId);
  }

  function onHandlePointerDown(target, el) {
    return (e) => {
      e.preventDefault();
      beginDrag(target, e.pointerId, el);
      pushHistory();
    };
  }

  function onHandlePointerMove(target, el) {
    return (e) => {
      if (dragTarget !== target) return;
      const rect = waveformPanel.getBoundingClientRect();
      const x = e.clientX - rect.left + waveformPanel.scrollLeft;
      const t = xToTime(x);
      if (target === "start") {
        selStart = clamp(t, 0, selEnd - MIN_GAP);
      } else {
        selEnd = clamp(t, selStart + MIN_GAP, duration);
      }
      layoutHandles();
      updateCounters();
    };
  }

  function onHandlePointerUp(target, el) {
    return (e) => {
      if (dragTarget !== target) return;
      dragTarget = null;
      el.classList.remove("dragging");
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    };
  }

  handleStart.addEventListener("pointerdown", onHandlePointerDown("start", handleStart));
  handleStart.addEventListener("pointermove", onHandlePointerMove("start", handleStart));
  handleStart.addEventListener("pointerup", onHandlePointerUp("start", handleStart));
  handleStart.addEventListener("pointercancel", onHandlePointerUp("start", handleStart));

  handleEnd.addEventListener("pointerdown", onHandlePointerDown("end", handleEnd));
  handleEnd.addEventListener("pointermove", onHandlePointerMove("end", handleEnd));
  handleEnd.addEventListener("pointerup", onHandlePointerUp("end", handleEnd));
  handleEnd.addEventListener("pointercancel", onHandlePointerUp("end", handleEnd));

  handleStart.addEventListener("keydown", (e) => handleKeyNudge(e, "start"));
  handleEnd.addEventListener("keydown", (e) => handleKeyNudge(e, "end"));

  function handleKeyNudge(e, target) {
    const step = e.shiftKey ? 0.5 : 0.01;
    const isRelevantKey = ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key);
    if (!isRelevantKey) return;

    e.preventDefault();
    pushHistory(); // snapshot BEFORE mutating so undo restores the prior position

    if (e.key === "ArrowLeft") {
      if (target === "start") selStart = clamp(selStart - step, 0, selEnd - MIN_GAP);
      else selEnd = clamp(selEnd - step, selStart + MIN_GAP, duration);
    } else if (e.key === "ArrowRight") {
      if (target === "start") selStart = clamp(selStart + step, 0, selEnd - MIN_GAP);
      else selEnd = clamp(selEnd + step, selStart + MIN_GAP, duration);
    } else if (e.key === "Home") {
      if (target === "start") selStart = 0;
    } else if (e.key === "End") {
      if (target === "end") selEnd = duration;
    }

    layoutHandles();
    updateCounters();
  }

  // Click on overview to jump / scroll
  overviewShell.addEventListener("click", (e) => {
    if (!audioBuffer) return;
    const rect = overviewShell.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const targetScroll = ratio * waveformPanel.scrollWidth - waveformPanel.clientWidth / 2;
    waveformPanel.scrollLeft = clamp(targetScroll, 0, waveformPanel.scrollWidth);
  });

  /* ---------------- Undo / redo ---------------- */

  function pushHistory() {
    history.push({ selStart, selEnd });
    if (history.length > 100) history.shift();
    future = [];
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    btnUndo.disabled = history.length === 0;
    btnRedo.disabled = future.length === 0;
  }

  btnUndo.addEventListener("click", () => {
    if (!history.length) return;
    future.push({ selStart, selEnd });
    const prev = history.pop();
    selStart = prev.selStart;
    selEnd = prev.selEnd;
    layoutHandles();
    updateCounters();
    updateHistoryButtons();
  });

  btnRedo.addEventListener("click", () => {
    if (!future.length) return;
    history.push({ selStart, selEnd });
    const next = future.pop();
    selStart = next.selStart;
    selEnd = next.selEnd;
    layoutHandles();
    updateCounters();
    updateHistoryButtons();
  });

  btnResetSel.addEventListener("click", () => {
    if (!audioBuffer) return;
    pushHistory();
    selStart = 0;
    selEnd = duration;
    layoutHandles();
    updateCounters();
  });

  /* ---------------- Counters ---------------- */

  function updateCounters() {
    counterIn.value = formatTime(selStart);
    counterOut.value = formatTime(selEnd);
    counterSel.textContent = formatTime(Math.max(0, selEnd - selStart));
    counterTotal.textContent = formatTime(duration);
  }

  /* ---------------- Typed time entry (IN / OUT) ---------------- */

  // Accepts "mm:ss.mmm", "h:mm:ss.mmm", "mm:ss", or plain seconds "12.5".
  // A blank segment (e.g. mid-edit, ":23.456") counts as 0 rather than
  // invalid, since segment editing can briefly leave a part empty.
  function parseTimeString(str) {
    const s = (str || "").trim();
    if (!s) return null;
    const parts = s.split(":").map((p) => p.trim());
    if (parts.length > 3 || parts.some((p) => p !== "" && isNaN(Number(p)))) return null;
    const nums = parts.map((p) => (p === "" ? 0 : parseFloat(p)));

    let seconds;
    if (nums.length === 1) {
      seconds = nums[0];
    } else if (nums.length === 2) {
      seconds = Math.trunc(nums[0]) * 60 + nums[1];
    } else {
      seconds = Math.trunc(nums[0]) * 3600 + Math.trunc(nums[1]) * 60 + nums[2];
    }
    return isFinite(seconds) && seconds >= 0 ? seconds : null;
  }

  function commitTypedTime(target) {
    if (!audioBuffer) return;
    const el = target === "start" ? counterIn : counterOut;
    const parsed = parseTimeString(el.value);

    if (parsed === null) {
      setStatus("Enter a time like 1:23.500 or a number of seconds.", true);
      updateCounters(); // revert to last valid value
      return;
    }

    let clamped, changed;
    if (target === "start") {
      clamped = clamp(parsed, 0, Math.max(0, selEnd - MIN_GAP));
      changed = Math.abs(clamped - selStart) > 0.0005;
      if (changed) { pushHistory(); selStart = clamped; }
    } else {
      clamped = clamp(parsed, selStart + MIN_GAP, duration);
      changed = Math.abs(clamped - selEnd) > 0.0005;
      if (changed) { pushHistory(); selEnd = clamped; }
    }

    if (changed) layoutHandles();
    updateCounters();
    setStatus("");
  }

  // Splits a rendered "MM:SS.mmm" string into its three editable parts,
  // by locating the separators rather than assuming fixed widths (MM can
  // be more than 2 digits for long tracks).
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

  // Which segment a caret index falls in (a click/caret landing exactly on
  // a separator snaps to the segment right after it).
  function segmentAt(segments, index) {
    for (const seg of segments) if (index <= seg.end) return seg;
    return segments[segments.length - 1];
  }

  function wireTypedTimeInput(el, target) {
    let skipNextBlurCommit = false;
    let activeSeg = null;    // segment currently scoped for editing
    let freshEntry = true;   // next digit overwrites the segment vs. appending to it
    let activeMaxLen = 2;    // digit cap for the active segment, captured once at entry

    function selectSegment(seg) {
      activeSeg = seg;
      freshEntry = true;
      el.setSelectionRange(seg.start, seg.end);
    }

    // Rewrites just one segment's text in place and returns its new
    // {name, start, end}, since replacing it can shift later segments.
    function writeSegment(seg, digits) {
      el.value = el.value.slice(0, seg.start) + digits + el.value.slice(seg.end);
      return { name: seg.name, start: seg.start, end: seg.start + digits.length };
    }

    el.addEventListener("focus", () => {
      // Keyboard focus (Tab) has no click position to derive a segment
      // from, so land on minutes by default; a mouse click is handled
      // by the mouseup listener below instead, once the click lands.
      if (el.dataset.mouseFocusing === "1") return;
      const segs = timeSegments(el.value);
      if (segs) selectSegment(segs[0]);
    });

    el.addEventListener("mousedown", () => {
      el.dataset.mouseFocusing = "1";
    });

    el.addEventListener("mouseup", (e) => {
      // Browsers finalize the click's caret position on mouseup, which
      // would otherwise instantly collapse any selection we set — so
      // clicking a specific group never actually selected it. Overriding
      // that default is what lets a click on "23" select just the seconds
      // (and a click on "456" select just the milliseconds, etc.).
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
      if (!segs) return; // shouldn't happen, but don't fight an unexpected value

      const s = el.selectionStart, en = el.selectionEnd;
      const seg = segmentAt(segs, s);
      // Only intercept the keystroke when the selection sits inside one
      // segment; a broader selection (e.g. after Ctrl+A) falls through to
      // normal free-form text editing, which commitTypedTime still accepts.
      if (s !== en && segmentAt(segs, en) !== seg) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const sameSeg = activeSeg && activeSeg.name === seg.name && !freshEntry;
        // Capture the digit cap fresh the moment a segment starts being
        // edited (2 for mm/ss, 3 for ms — or wider if mm is already long).
        // Reusing that same cap for every keystroke in this session (rather
        // than re-measuring the segment's current, already-shrunk text)
        // is what lets "9" then "0" produce "90" instead of just "0".
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
        let digits = el.value.slice(seg.start, seg.end);
        if (digits.length > 0) {
          digits = digits.slice(0, -1);
          const newSeg = writeSegment(seg, digits);
          activeSeg = newSeg;
          freshEntry = false;
          el.setSelectionRange(newSeg.end, newSeg.end);
        } else if (e.key === "Backspace") {
          const idx = segs.findIndex((sg) => sg.name === seg.name);
          if (idx > 0) {
            const prevSeg = segs[idx - 1];
            const newSeg = writeSegment(prevSeg, el.value.slice(prevSeg.start, prevSeg.end).slice(0, -1));
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
        const newSeg = writeSegment(seg, String(val).padStart(width, "0"));
        selectSegment(newSeg);
        return;
      }

      if (e.key === ":" || e.key === ".") {
        // Typing the literal separator jumps to the next segment, a nice
        // shorthand so users don't have to reach for the arrow keys.
        e.preventDefault();
        const idx = segs.findIndex((sg) => sg.name === seg.name);
        if (idx < segs.length - 1) selectSegment(segs[idx + 1]);
        return;
      }
      // Anything else (Tab, Home/End, etc.) is left to default behavior.
    });
  }

  wireTypedTimeInput(counterIn, "start");
  wireTypedTimeInput(counterOut, "end");

  /* ---------------- Playback ---------------- */

  function stopPlayback() {
    if (playSource) {
      try { playSource.onended = null; playSource.stop(); } catch (_) {}
      playSource.disconnect();
      playSource = null;
    }
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    isPlaying = false;
    btnPlaySel.textContent = "\u25b6 Play selection";
  }

  function playRange(from, to, { loop = false, label } = {}) {
    if (!audioBuffer) return;
    // Guard against zero-length or negative durations
    if (to - from < 0.001) {
      setStatus("Selection too short to play.", true);
      return;
    }
    ensureAudioCtx();
    stopPlayback();

    const src = audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(gainNode);

    if (loop) {
      src.loop = true;
      src.loopStart = from;
      src.loopEnd = to;
      src.start(0, from);
    } else {
      src.start(0, from, Math.max(0.001, to - from));
      src.onended = () => {
        if (playSource === src) stopPlayback();
      };
    }

    playSource = src;
    playCtxStartTime = audioCtx.currentTime;
    playOffset = from;
    playingSelectionOnly = (label === "selection");
    isPlaying = true;
    if (label === "selection") btnPlaySel.textContent = "\u23f8 Pause selection";

    tickPlayhead(from, to, loop);
  }

  function tickPlayhead(from, to, loop) {
    function step() {
      if (!isPlaying) return;
      let elapsed = audioCtx.currentTime - playCtxStartTime;
      let pos = from + elapsed;
      if (loop && pos > to) {
        const span = to - from;
        pos = from + ((pos - from) % span);
      }
      if (!loop && pos >= to) {
        layoutPlayheadFromTime(to);
        counterPos.textContent = formatTime(to);
        stopPlayback();
        return;
      }
      layoutPlayheadFromTime(pos);
      counterPos.textContent = formatTime(pos);
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  function layoutPlayheadFromTime(t) {
    playhead.style.transform = `translateX(${timeToX(t)}px)`;
  }

  btnPlaySel.addEventListener("click", () => {
    if (!audioBuffer) return;
    if (isPlaying && playingSelectionOnly) { stopPlayback(); return; }
    playRange(selStart, selEnd, { loop: isLooping, label: "selection" });
  });

  btnPlayAll.addEventListener("click", () => {
    if (!audioBuffer) return;
    playRange(0, duration, { loop: false, label: "full" });
  });

  btnStop.addEventListener("click", stopPlayback);

  btnLoop.addEventListener("click", () => {
    isLooping = !isLooping;
    btnLoop.setAttribute("aria-pressed", String(isLooping));
    if (isPlaying && playingSelectionOnly) {
      playRange(selStart, selEnd, { loop: isLooping, label: "selection" });
    }
  });

  // Click waveform to move playhead / seek
  waveformPanel.addEventListener("click", (e) => {
    if (!audioBuffer || dragTarget) return;
    if (e.target === handleStart || e.target === handleEnd) return;
    const rect = waveformPanel.getBoundingClientRect();
    const x = e.clientX - rect.left + waveformPanel.scrollLeft;
    const t = xToTime(x);
    layoutPlayheadFromTime(t);
    counterPos.textContent = formatTime(t);
    playOffset = t;
  });

  /* ---------------- Keyboard shortcuts (global) ---------------- */

  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
    if (!audioBuffer) return;

    if (e.code === "Space") {
      e.preventDefault();
      if (isPlaying) stopPlayback();
      else playRange(selStart, selEnd, { loop: isLooping, label: "selection" });
    } else if (e.key === "[") {
      pushHistory();
      selStart = clamp(playOffset, 0, selEnd - MIN_GAP);
      layoutHandles();
      updateCounters();
    } else if (e.key === "]") {
      pushHistory();
      selEnd = clamp(playOffset, selStart + MIN_GAP, duration);
      layoutHandles();
      updateCounters();
    } else if (e.key === "Escape") {
      stopPlayback();
    }
  });

  /* ---------------- Export: WAV ---------------- */

  function sliceBuffer(buffer, startSec, endSec, applyFade) {
    const sampleRate = buffer.sampleRate;
    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.min(buffer.length, Math.ceil(endSec * sampleRate));
    const frameCount = Math.max(1, endSample - startSample);
    const channels = buffer.numberOfChannels;

    const out = [];
    const fadeSamples = applyFade ? Math.min(Math.floor(0.15 * sampleRate), Math.floor(frameCount / 2)) : 0;

    for (let c = 0; c < channels; c++) {
      const src = buffer.getChannelData(c);
      const dst = new Float32Array(frameCount);
      for (let i = 0; i < frameCount; i++) {
        dst[i] = src[startSample + i] || 0;
      }
      if (fadeSamples > 0) {
        for (let i = 0; i < fadeSamples; i++) {
          const g = i / fadeSamples;
          dst[i] *= g;
          dst[frameCount - 1 - i] *= g;
        }
      }
      out.push(dst);
    }
    return { channelData: out, sampleRate, frameCount, channels };
  }

  function encodeWav({ channelData, sampleRate, frameCount, channels }) {
    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const dataSize = frameCount * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeStr(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < frameCount; i++) {
      for (let c = 0; c < channels; c++) {
        let s = channelData[c][i];
        s = clamp(s, -1, 1);
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([buffer], { type: "audio/wav" });
  }

  /* ---------------- Export: MP3 (lamejs, loaded on demand) ---------------- */

  let lamejsPromise = null;
  function loadLamejs() {
    if (window.lamejs) return Promise.resolve(window.lamejs);
    if (lamejsPromise) return lamejsPromise;
    lamejsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js";
      script.onload = () => resolve(window.lamejs);
      script.onerror = () => reject(new Error("lamejs failed to load"));
      document.head.appendChild(script);
    });
    return lamejsPromise;
  }

  async function encodeMp3({ channelData, sampleRate, frameCount, channels }) {
    const lamejs = await loadLamejs();
    const kbps = 192;
    const encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    const blockSize = 1152;
    const mp3Data = [];

    const toInt16 = (f32) => {
      const i16 = new Int16Array(f32.length);
      for (let i = 0; i < f32.length; i++) {
        const s = clamp(f32[i], -1, 1);
        i16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return i16;
    };

    const left = toInt16(channelData[0]);
    const right = channels > 1 ? toInt16(channelData[1]) : null;

    for (let i = 0; i < frameCount; i += blockSize) {
      const l = left.subarray(i, i + blockSize);
      let mp3buf;
      if (right) {
        const r = right.subarray(i, i + blockSize);
        mp3buf = encoder.encodeBuffer(l, r);
      } else {
        mp3buf = encoder.encodeBuffer(l);
      }
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }
    const end = encoder.flush();
    if (end.length > 0) mp3Data.push(end);

    return new Blob(mp3Data, { type: "audio/mpeg" });
  }

  /* ---------------- Export button ---------------- */

  btnExport.addEventListener("click", async () => {
    if (!audioBuffer) return;
    const format = formatSelect.value;
    const applyFade = fadeToggle.checked;

    btnExport.disabled = true;
    setStatus(`Rendering ${format.toUpperCase()}\u2026`);

    try {
      const sliced = sliceBuffer(audioBuffer, selStart, selEnd, applyFade);
      let blob, ext;
      if (format === "mp3") {
        blob = await encodeMp3(sliced);
        ext = "mp3";
      } else {
        blob = encodeWav(sliced);
        ext = "wav";
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sourceFileName}-trimmed.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus(`Exported ${formatTime(selEnd - selStart)} as ${ext.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      setStatus("Export failed. If you picked MP3, try WAV instead.", true);
    } finally {
      btnExport.disabled = false;
    }
  });

})();