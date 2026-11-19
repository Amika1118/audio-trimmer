import { dom } from "../dom.js";

export function setStatus(msg, isError = false) {
  dom.statusMsg.textContent = msg || "";
  dom.statusMsg.classList.toggle("error", !!isError);
}

export function setDropzoneError(msg) {
  dom.dropzoneStatus.textContent = msg || "";
  dom.dropzoneStatus.hidden = !msg;
}

// The overlay shown while an audio/video file is read and decoded.
export function showLoading(text) {
  dom.loadingText.textContent = text;
  dom.loadingOverlay.hidden = false;
}

export function hideLoading() {
  dom.loadingOverlay.hidden = true;
}
