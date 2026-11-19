import { clamp } from "../utils.js";

const VIDEO_EXT_RE = /\.(mp4|m4v|mov|webm|mkv|avi|3gp|ogv)$/i;

export function isVideoFile(file) {
  if (file.type && file.type.startsWith("video/")) return true;
  if (!file.type && VIDEO_EXT_RE.test(file.name)) return true; // some browsers omit type
  return VIDEO_EXT_RE.test(file.name) && !file.type.startsWith("audio/");
}

// Extracts the audio track from a video by silently playing it back and
// recording its audio stream. Used as a fallback when Web Audio can't decode
// the container directly. Takes roughly as long as the video itself.
export function extractAudioFromVideo(file, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.playsInline = true;
    video.muted = false;  // must stay unmuted for captureStream to carry audio
    video.volume = 0;     // ...but silent locally
    const url = URL.createObjectURL(file);
    video.src = url;

    let settled = false;
    function fail(err) {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      video.pause();
      video.removeAttribute("src");
      video.load();
      reject(err);
    }
    function succeed(blob) {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(blob);
    }

    video.addEventListener("error", () => fail(new Error("Could not read that video file.")));

    video.addEventListener("loadedmetadata", async () => {
      try {
        const capture = video.captureStream || video.mozCaptureStream;
        if (!capture) throw new Error("This browser can't extract audio from video.");
        const stream = capture.call(video);
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks.length) throw new Error("No audio track was found in that video.");

        const audioStream = new MediaStream(audioTracks);
        let mimeType = "audio/webm;codecs=opus";
        if (!(window.MediaRecorder && MediaRecorder.isTypeSupported(mimeType))) mimeType = "audio/webm";
        if (!(window.MediaRecorder && MediaRecorder.isTypeSupported(mimeType))) mimeType = "";

        const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.onerror = (e) => fail(e.error || new Error("Recording the video's audio failed."));
        recorder.onstop = () => succeed(new Blob(chunks, { type: mimeType || "audio/webm" }));

        video.addEventListener("timeupdate", () => {
          if (onProgress && video.duration) onProgress(clamp(video.currentTime / video.duration, 0, 1));
        });
        video.addEventListener("ended", () => { try { recorder.stop(); } catch (_) { /* already stopped */ } });

        recorder.start();
        await video.play();
      } catch (err) {
        fail(err);
      }
    }, { once: true });
  });
}
