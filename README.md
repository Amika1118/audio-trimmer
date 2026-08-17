```markdown
<div align="center">

# ✂️ Audio Trimmer

**Precise, in-browser audio editing — no uploads, no backend, no limits.**

[![Static Badge](https://img.shields.io/badge/Status-Stable-brightgreen)](https://github.com/Amika1118/audio-trimmer)
[![Static Badge](https://img.shields.io/badge/Built_With-Vanilla_JS-f7df1e)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Static Badge](https://img.shields.io/badge/Web_Audio_API-✓-4caf50)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Static Badge](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Static Badge](https://img.shields.io/badge/Hugging_Face-Space-yellow)](https://huggingface.co/spaces)

</div>

---

## 📖 Overview

**Audio Trimmer** is a fully client-side web application that lets you load any audio file, visually trim it using draggable waveform handles, and export the result as **WAV** or **MP3** — all within your browser.

Everything — decoding, waveform rendering, playback, and export — runs locally via the **Web Audio API**. No file is ever uploaded to any server, there's no backend, and because it's a static app, it costs nothing to host and has no usage limits.

> 🚀 **Live Demo:** [Try it on Hugging Face Spaces](https://huggingface.co/spaces/your-space-name)

---

## ✨ Features

| Category | Features |
|----------|----------|
| **📂 Loading** | Drag-and-drop or click-to-browse — supports MP3, WAV, M4A, OGG, FLAC, and any format your browser can decode |
| **📊 Waveform** | Interactive waveform view with **adjustable zoom** (1×–24×) and a **minimap overview** for long tracks |
| **✂️ Trimming** | Draggable trim handles with **keyboard support** — arrow keys to nudge, Shift for coarse steps |
| **▶️ Playback** | Play the full track or just the selection, with **optional looping** and a live playhead |
| **📟 Readouts** | Real-time IN / OUT / SEL / POS / TOTAL time displays in a retro tape-counter style |
| **↩️ Undo/Redo** | Full undo / redo support for trim adjustments |
| **🎛️ Fades** | Optional **150 ms fade in/out** on export for smooth cuts |
| **💾 Export** | Export as **lossless WAV** (built-in) or **MP3** (~192 kbps, via a small on-demand library) |
| **⌨️ Shortcuts** | Keyboard-driven workflow — Space, `[` / `]`, arrow keys, Esc |

---

## 🖥️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause |
| `[` | Set **IN** point at playhead |
| `]` | Set **OUT** point at playhead |
| `←` / `→` | Nudge trim handles (fine) |
| `Shift` + `←` / `→` | Nudge trim handles (coarse) |
| `Esc` | Stop playback |

---

## 📁 Project Structure

```
audio-trimmer/
├── index.html          # Application structure
├── style.css           # "Signal bench" visual design — graphite panels, amber splice-bracket handles, mono tape-counter readouts
├── script.js           # All app logic — decoding, waveform drawing, drag interactions, playback, WAV/MP3 export
└── README.md           # You're here!
```

---

## 🚀 Getting Started

### Local Preview

Any static file server works. Choose your favorite:

```bash
# Using npx
npx serve .

# Using Python
python3 -m http.server 8000

# Using Node.js http-server
npx http-server .
```

> **Note:** Opening `index.html` directly via `file://` works in most browsers, but some restrict Web Audio / file APIs more strictly. A local server is the safer bet.

---

## ☁️ Deploy on Hugging Face Spaces

This project is configured as a **Static** Space via the YAML block in `index.html`. To deploy:

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space) — choose **Static** as the SDK.
2. Add the four files (`index.html`, `style.css`, `script.js`, `README.md`) to the Space repo — either upload via the web UI or `git push`.
3. Your Space builds instantly — no server process, just static files being served.

**Zero cost, zero compute quota, zero billing.** Static Spaces are free and unmetered on Hugging Face's side (standard fair-use applies, same as any static site).

---

## 🛠️ Tech Stack

- **HTML5** — Structure
- **CSS3** — Custom "signal bench" design system
- **Vanilla JavaScript** — All logic, no frameworks
- **Web Audio API** — Decoding, playback, waveform rendering
- **Canvas API** — Waveform drawing & minimap
- **lamejs** — On-demand MP3 encoding (loaded only when exporting MP3)

---

## 👩‍💻 Author

**Amika Alankara**

[![GitHub](https://img.shields.io/badge/GitHub-Amika1118-181717?logo=github)](https://github.com/Amika1118)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-Amika1118-ffd21e?logo=huggingface)](https://huggingface.co/Amika1118)

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

<div align="center">

**Made with ❤️ by Amika Alankara**

*100% client-side. Your audio stays with you.*

</div>
```