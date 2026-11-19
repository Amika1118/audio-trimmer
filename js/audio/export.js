import { dom } from "../dom.js";
import { state } from "../state.js";
import { formatTime } from "../utils.js";
import { sliceBuffer } from "./slice.js";
import { encodeWav } from "./wav.js";
import { encodeMp3 } from "./mp3.js";
import { setStatus } from "../ui/status.js";

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function initExport() {
  dom.btnExport.addEventListener("click", async () => {
    if (!state.audioBuffer) return;
    const format = dom.formatSelect.value;

    dom.btnExport.disabled = true;
    setStatus(`Rendering ${format.toUpperCase()}\u2026`);

    try {
      const sliced = sliceBuffer(state.audioBuffer, state.selStart, state.selEnd, dom.fadeToggle.checked);
      const ext = format === "mp3" ? "mp3" : "wav";
      const blob = format === "mp3" ? await encodeMp3(sliced) : encodeWav(sliced);
      download(blob, `${state.sourceFileName}-trimmed.${ext}`);
      setStatus(`Exported ${formatTime(state.selEnd - state.selStart)} as ${ext.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      setStatus("Export failed. If you picked MP3, try WAV instead.", true);
    } finally {
      dom.btnExport.disabled = false;
    }
  });
}
