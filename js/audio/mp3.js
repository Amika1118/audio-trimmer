import { LAME_SRC, MP3_KBPS } from "../config.js";
import { clamp } from "../utils.js";

// lamejs is a classic (non-module) script, so it's injected on demand the
// first time an MP3 export is requested. It's served from this site.
let lamePromise = null;
function loadLamejs() {
  if (window.lamejs) return Promise.resolve(window.lamejs);
  if (lamePromise) return lamePromise;
  lamePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LAME_SRC;
    script.onload = () => resolve(window.lamejs);
    script.onerror = () => { lamePromise = null; reject(new Error("MP3 encoder failed to load")); };
    document.head.appendChild(script);
  });
  return lamePromise;
}

const toInt16 = (f32) => {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = clamp(f32[i], -1, 1);
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
};

export async function encodeMp3({ channelData, sampleRate, frameCount, channels }) {
  const lamejs = await loadLamejs();
  const encoder = new lamejs.Mp3Encoder(channels, sampleRate, MP3_KBPS);
  const blockSize = 1152;
  const mp3Data = [];

  const left = toInt16(channelData[0]);
  const right = channels > 1 ? toInt16(channelData[1]) : null;

  for (let i = 0; i < frameCount; i += blockSize) {
    const l = left.subarray(i, i + blockSize);
    const buf = right ? encoder.encodeBuffer(l, right.subarray(i, i + blockSize)) : encoder.encodeBuffer(l);
    if (buf.length > 0) mp3Data.push(buf);
  }
  const end = encoder.flush();
  if (end.length > 0) mp3Data.push(end);

  return new Blob(mp3Data, { type: "audio/mpeg" });
}
