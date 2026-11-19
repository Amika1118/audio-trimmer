// Builds a short generated drum-and-bass loop so people can try the trimmer
// without a file. Pure synthesis: nothing is fetched.
export function generateSample(ctx) {
  const sr = 44100;
  const seconds = 8;
  const buffer = ctx.createBuffer(2, sr * seconds, sr);
  const L = buffer.getChannelData(0);
  const R = buffer.getChannelData(1);
  const beat = 0.5; // 120 BPM
  const bass = [55, 43.65, 65.41, 49]; // A1, F1, C2, G1, one note per 2 seconds
  let seed = 7;
  const noise = () => { seed = (seed * 16807) % 2147483647; return seed / 1073741823 - 1; };

  for (let i = 0; i < L.length; i++) {
    const t = i / sr;
    const inBeat = t % beat;
    let v = 0;

    // kick on every beat: fast downward sine sweep
    const kickPhase = 2 * Math.PI * (45 * inBeat + (75 / 28) * (1 - Math.exp(-28 * inBeat)));
    v += Math.sin(kickPhase) * Math.exp(-inBeat * 9) * 0.85;

    // hi-hat on the off-beats
    const off = (t + beat / 2) % beat;
    v += noise() * Math.exp(-off * 60) * 0.22;

    // bass note that changes every two seconds, with a soft swell
    const noteT = t % 2;
    const f = bass[Math.floor(t / 2) % bass.length];
    v += Math.sin(2 * Math.PI * f * t) * 0.35 * Math.min(1, noteT * 20) * (0.75 + 0.25 * Math.sin(Math.PI * noteT / 2));

    L[i] = v;
    R[i] = v;
  }

  // short fade at the very end so the loop doesn't click, then keep headroom
  const tail = Math.floor(sr * 0.05);
  for (let i = 0; i < tail; i++) {
    const g = i / tail;
    L[L.length - 1 - i] *= g;
    R[R.length - 1 - i] *= g;
  }
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]));
  const scale = peak > 0 ? 0.9 / peak : 1;
  for (let i = 0; i < L.length; i++) { L[i] *= scale; R[i] *= scale; }
  return buffer;
}
