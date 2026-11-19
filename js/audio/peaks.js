export function computePeaks(buffer, resolution) {
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
export function resamplePeaks(base, outCount) {
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
