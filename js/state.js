// Mutable app state, shared by reference between modules.
export const state = {
  audioCtx: null,
  gainNode: null,
  audioBuffer: null,
  duration: 0,
  sourceFileName: "track",

  selStart: 0,
  selEnd: 0,

  zoom: 1,
  pxPerSec: 1,        // recomputed on layout
  peaksCache: null,   // Float32Array of peak values

  isPlaying: false,
  isLooping: false,
  playingSelectionOnly: true,
  playSource: null,
  playCtxStartTime: 0,
  playOffset: 0,
  rafId: null,

  dragTarget: null,   // 'start' | 'end' | null
  history: [],
  future: [],

  isLoading: false,   // prevents concurrent loads
};
