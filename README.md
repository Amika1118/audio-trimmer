---
title: Audio Trimmer
emoji: ✂️
colorFrom: yellow
colorTo: gray
sdk: static
pinned: false
---

# Audio Trimmer

A precise, in-browser audio trimmer. Load a track, drag the in/out points on the waveform, and export the cut as WAV or MP3.

**100% client-side.** Everything — decoding, waveform rendering, playback, and export — runs with the Web Audio API in the visitor's own browser. No file is ever uploaded anywhere, there's no backend, and because this is a **Static** Space it costs nothing to host and has no usage limits.

## Features

- Drag-and-drop or click-to-browse file loading (MP3, WAV, M4A, OGG, FLAC — anything the browser can decode)
- Waveform view with adjustable zoom (1×–24×) and a minimap overview for long tracks
- Draggable trim handles with keyboard support (arrow keys to nudge, Shift for coarse steps)
- Play full track or just the selection, with optional looping
- Live playhead + IN / OUT / SEL / POS / TOTAL time readouts
- Undo / redo for trim adjustments
- Optional 150ms fade in/out on export
- Export as lossless WAV (built in, no dependency) or MP3 (~192kbps, via a small on-demand library)
- Keyboard shortcuts: `Space` play/pause, `[` / `]` set in/out at playhead, arrows nudge, `Esc` stop

## Files

- `index.html` — structure
- `style.css` — the "signal bench" visual design (graphite panels, amber splice-bracket trim handles, mono tape-counter readouts)
- `script.js` — all app logic (decoding, waveform drawing, drag interactions, playback, WAV/MP3 export)

## Deploying on Hugging Face Spaces

This repo is already configured as a **Static** Space via the YAML block at the top of this file. To deploy:

1. Create a new Space at huggingface.co/new-space and choose **Static** as the SDK.
2. Add these four files (`index.html`, `style.css`, `script.js`, `README.md`) to the Space repo — either by uploading them in the web UI or `git push`-ing.
3. The Space builds instantly since there's no server process — it's just static files being served.

No API keys, no compute quota, no billing: static Spaces are free and unmetered on Hugging Face's side (standard fair-use applies, same as any static site).

## Local preview

Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Opening `index.html` directly via `file://` also works in most browsers, though some browsers restrict Web Audio/file APIs slightly more strictly under `file://` than `http://` — a local server is the safer bet.
