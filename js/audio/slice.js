import { FADE_SECONDS } from "../config.js";

// Copies [startSec, endSec) out of an AudioBuffer, optionally with short fades.
export function sliceBuffer(buffer, startSec, endSec, applyFade) {
  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(buffer.length, Math.ceil(endSec * sampleRate));
  const frameCount = Math.max(1, endSample - startSample);
  const channels = buffer.numberOfChannels;
  const fadeSamples = applyFade
    ? Math.min(Math.floor(FADE_SECONDS * sampleRate), Math.floor(frameCount / 2))
    : 0;

  const channelData = [];
  for (let c = 0; c < channels; c++) {
    const src = buffer.getChannelData(c);
    const dst = new Float32Array(frameCount);
    for (let i = 0; i < frameCount; i++) dst[i] = src[startSample + i] || 0;
    for (let i = 0; i < fadeSamples; i++) {
      const g = i / fadeSamples;
      dst[i] *= g;
      dst[frameCount - 1 - i] *= g;
    }
    channelData.push(dst);
  }
  return { channelData, sampleRate, frameCount, channels };
}
