import { dom } from "../dom.js";
import { state } from "../state.js";
import { PEAK_RESOLUTION } from "../config.js";
import { formatTime, nextPaint } from "../utils.js";
import { ensureAudioCtx } from "../audio/context.js";
import { computePeaks } from "../audio/peaks.js";
import { isVideoFile, extractAudioFromVideo } from "../audio/videoExtract.js";
import { stopPlayback } from "../audio/playback.js";
import { layoutWaveform, drawOverview } from "./waveform.js";
import { updateCounters } from "./counters.js";
import { resetHistory } from "./history.js";
import { setStatus, setDropzoneError, showLoading, hideLoading } from "./status.js";

async function decodeVideo(file) {
  const ctx = state.audioCtx;
  try {
    // Fast path: many MP4 / WebM containers decode directly in Web Audio.
    const raw = await file.arrayBuffer();
    return await ctx.decodeAudioData(raw.slice(0));
  } catch (_) {
    // Fallback: silently play the video and record its audio track.
    showLoading("Extracting audio from video\u2026 0%");
    const audioBlob = await extractAudioFromVideo(file, (frac) => {
      showLoading(`Extracting audio from video\u2026 ${Math.round(frac * 100)}%`);
    });
    showLoading("Decoding extracted audio\u2026");
    await nextPaint();
    return ctx.decodeAudioData(await audioBlob.arrayBuffer());
  }
}

export async function loadFile(file) {
  if (state.isLoading) return;
  state.isLoading = true;

  setDropzoneError("");
  setStatus("");
  const isVideo = isVideoFile(file);

  try {
    ensureAudioCtx();
    let decoded;

    if (isVideo) {
      showLoading("Video detected \u2014 this can take a little while\u2026");
      setStatus("You added a video file \u2014 extracting its audio track before trimming. This may take a bit, especially for longer videos.");
      await nextPaint();
      decoded = await decodeVideo(file);
    } else {
      showLoading("Reading file\u2026");
      const arrayBuffer = await file.arrayBuffer();
      showLoading("Decoding audio\u2026");
      await nextPaint();
      decoded = await state.audioCtx.decodeAudioData(arrayBuffer.slice(0));
    }

    state.audioBuffer = decoded;
    state.duration = decoded.duration;
    state.sourceFileName = file.name.replace(/\.[^/.]+$/, "") || "track";
    state.selStart = 0;
    state.selEnd = state.duration;
    state.playOffset = 0;
    resetHistory();

    dom.fileName.textContent =
      `${file.name}${isVideo ? " \u00b7 audio extracted from video" : ""} \u00b7 ${formatTime(state.duration)}` +
      ` \u00b7 ${decoded.sampleRate} Hz \u00b7 ${decoded.numberOfChannels === 1 ? "mono" : "stereo"}`;

    dom.dropzone.hidden = true;
    dom.bench.hidden = false;

    showLoading("Rendering waveform\u2026");
    await nextPaint();
    state.peaksCache = computePeaks(state.audioBuffer, PEAK_RESOLUTION);

    state.zoom = 1;
    dom.zoomRange.value = "1";
    dom.zoomValue.textContent = "1.0\u00d7";

    await nextPaint();
    layoutWaveform();
    drawOverview();
    updateCounters();
    setStatus(isVideo ? "Audio extracted from your video \u2014 ready to trim." : "");
  } catch (err) {
    console.error(err);
    state.audioBuffer = null;
    dom.bench.hidden = true;
    dom.dropzone.hidden = false;
    setDropzoneError(
      isVideo
        ? "Couldn't extract audio from that video. Try a standard MP4 or WEBM file, or extract the audio yourself first."
        : "Couldn't decode that file. Try a standard MP3, WAV, M4A, OGG or FLAC \u2014 or a video file such as MP4 or WEBM."
    );
  } finally {
    hideLoading();
    state.isLoading = false;
  }
}

export function initLoader() {
  const { dropzone, fileInput, changeFile, bench } = dom;

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("drag-active"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
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
  changeFile.addEventListener("click", () => {
    stopPlayback();
    bench.hidden = true;
    dropzone.hidden = false;
    fileInput.value = "";
    setDropzoneError("");
  });
}
