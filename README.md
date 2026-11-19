---
title: Audio Trimmer
emoji: ✂️
colorFrom: yellow
colorTo: gray
sdk: static
pinned: false
license: mit
---

<div align="center">

# ✂️ Audio Trimmer

**Precise, in-browser audio editing - no uploads, no backend.**

[![Status](https://img.shields.io/badge/Status-Stable-brightgreen)](https://github.com/Amika1118/audio-trimmer)
[![Built With](https://img.shields.io/badge/Built%20With-Vanilla%20JavaScript-f7df1e)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-✓-4caf50)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

</div>

---

## 📖 Overview

**Audio Trimmer** is a fully client-side web application for loading, previewing, trimming, and exporting audio directly in your browser.

Load an audio file, select the section you want using the interactive waveform handles, preview the selection, and export it as **WAV** or **MP3**.

All audio processing takes place locally in the browser using the **Web Audio API** and JavaScript. Your audio file is **not uploaded to a backend or third-party server**.

> 🚀 **Live Demo:** Replace this with your actual Hugging Face Space URL once deployed.

---

## ✨ Features

| Category                | Features                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| **📂 Loading**          | Drag-and-drop or file browser support                                       |
| **🎵 Formats**          | MP3, WAV, M4A, OGG, FLAC, and other formats supported by the user's browser |
| **📊 Waveform**         | Interactive waveform with adjustable zoom from **1× to 24×**                |
| **🗺️ Minimap**         | Overview minimap for navigating longer audio tracks                         |
| **✂️ Trimming**         | Draggable IN and OUT handles for precise selection                          |
| **⌨️ Keyboard Control** | Arrow-key trimming and keyboard shortcuts                                   |
| **▶️ Playback**         | Play the complete track or only the selected section                        |
| **🔁 Looping**          | Optional selection looping during playback                                  |
| **📍 Playhead**         | Live playhead showing the current playback position                         |
| **📟 Time Readouts**    | Real-time IN, OUT, SEL, POS, and TOTAL displays                             |
| **↩️ Undo / Redo**      | Undo and redo trim adjustments                                              |
| **🎛️ Fades**           | Optional **150 ms fade-in and fade-out** during export                      |
| **💾 WAV Export**       | Export selections as lossless WAV                                           |
| **🎧 MP3 Export**       | Export selections as MP3 using `lamejs`                                     |
| **🎬 Video**            | Drop a video (MP4, MOV, WEBM) and its audio track is extracted automatically |
| **⏳ Preloader**         | Logo splash while the app loads, separate from the audio-decoding overlay    |
| **🆘 Help & Privacy**   | Built-in `help.html` and `privacy.html` pages, linked from the footer        |
| **🔒 Privacy**          | Audio processing happens locally; fonts and encoder are self-hosted          |

> **Note:** Actual audio format support depends on the browser's built-in audio decoding capabilities.

---

## 🎛️ How It Works

1. **Load an audio file** using drag-and-drop or the file picker.
2. The application decodes the audio locally using the **Web Audio API**.
3. The waveform and minimap are generated using the **Canvas API**.
4. Drag the **IN** and **OUT** handles to select the section you want.
5. Preview the selection using the playback controls.
6. Optionally enable fade-in/fade-out.
7. Export the selection as **WAV** or **MP3**.

No audio file needs to be uploaded to a server.

---

## 🖥️ Keyboard Shortcuts

| Shortcut            | Action                                    |
| ------------------- | ----------------------------------------- |
| `Space`             | Play / Pause                              |
| `[`                 | Set **IN** point at the current playhead  |
| `]`                 | Set **OUT** point at the current playhead |
| `←` / `→`           | Fine adjustment of the trim position      |
| `Shift` + `←` / `→` | Coarse adjustment of the trim position    |
| `Esc`               | Stop playback                             |

> **Tip:** Keyboard shortcuts may be ignored while typing in a text input or when another interactive control has focus.

---

## 🔊 Export Formats

### WAV

WAV export is handled directly by the application and provides **lossless audio output**.

### MP3

MP3 export uses **lamejs**, bundled in `vendor/` and loaded only when MP3 encoding is first needed (no CDN).

The resulting MP3 is encoded at approximately **192 kbps**.

> MP3 is a lossy format, so the exported file may not contain exactly the same audio information as the original.

---

## 📁 Project Structure

```text
audio-trimmer/
├── index.html              # Main app
├── help.html               # Step-by-step help page
├── privacy.html            # Privacy explainer
├── manifest.webmanifest    # Install / home-screen metadata
├── favicon.ico
├── robots.txt
├── _headers                # Optional security + cache headers (Netlify / Cloudflare Pages)
├── assets/
│   ├── logo.svg            # Logo (used by the preloader and pages)
│   └── icons/              # icon-192, icon-512, apple-touch-icon
├── css/
│   ├── preloader.css       # Logo preloader (loaded first)
│   ├── noscript.css        # Hides the preloader when JS is off
│   ├── base.css            # Fonts, design tokens, layout, footer
│   ├── app.css             # Dropzone, waveform, counters, controls
│   └── pages.css           # Help + privacy pages
├── fonts/                  # Self-hosted Space Grotesk, Inter, JetBrains Mono (woff2)
├── vendor/
│   └── lame.min.js         # lamejs 1.2.1 (LGPL) for MP3 export
└── js/
    ├── main.js             # Entry point: wires modules together
    ├── preloader.js        # Dismisses the logo preloader
    ├── help.js             # Highlights the active guide on the help page
    ├── config.js           # Constants
    ├── dom.js              # Element lookups
    ├── state.js            # Shared mutable state
    ├── utils.js            # formatTime, clamp, parseTimeString, ...
    ├── audio/              # context, peaks, playback, videoExtract, slice, wav, mp3, export
    └── ui/                 # loader, waveform, handles, timeInput, history, counters, shortcuts, status, pageLinks
```

---

## 🛠️ Tech Stack

* **HTML5** - Application structure
* **CSS3** - Responsive UI and visual design
* **Vanilla JavaScript (ES modules)** - Application logic, split by responsibility
* **Web Audio API** - Audio decoding and playback
* **Canvas API** - Waveform and minimap rendering
* **lamejs** - Client-side MP3 encoding (bundled)

The application does not require a frontend framework or backend server.

---

## 🚀 Getting Started

### Prerequisites

You only need a modern web browser with support for the **Web Audio API**, **Canvas API**, and the audio formats you want to use.

### Local Preview

The app uses ES modules, which browsers won't load from `file://`, so run it through a local server.

#### Using Python

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

#### Using Node.js

```bash
npx serve .
```

---

## 🌍 Hosting

There is no build step: the folder is the site. All paths are relative, so it works at a domain root or under a sub-path.

| Host                      | How                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Hugging Face Spaces**   | Create a Space with SDK **Static**, upload the folder contents. The README front matter is already set. |
| **GitHub Pages**          | Push the folder, then Settings → Pages → deploy from the branch root.                         |
| **Netlify / Cloudflare Pages** | Drag the folder in, or connect the repo (no build command, publish directory `.`). `_headers` is picked up automatically and applies a strict Content-Security-Policy. |
| **Any static host**       | Upload the files as-is.                                                                       |

> The `_headers` file is optional and ignored by hosts that don't read it. If you remove the
> `README.md` front matter for GitHub-only use, nothing else changes.

---

## 🔐 Privacy

Audio Trimmer is designed to process audio **locally in the browser**.

Your selected audio file is decoded and processed using browser APIs rather than being uploaded to an application backend.

The fonts and the MP3 encoder are bundled with the app, so no third-party CDN is contacted while it runs. The built-in **Privacy** page explains this in plain language.

This means the project does not require:

* A database
* An audio-processing server
* User accounts
* File uploads to an application backend

> Browser memory and performance still impose practical limits on the size and length of audio files that can be processed.

---

## 📱 Browser Compatibility

Audio decoding capabilities vary between browsers.

Common formats such as **MP3** and **WAV** are generally well supported, while formats such as **M4A, OGG, and FLAC** may depend on the browser and operating system.

If a particular file cannot be loaded, try converting it to a browser-compatible format such as WAV or MP3.

---

## 🧩 Architecture

The application follows a simple client-side architecture:

```text
Audio File
    │
    ▼
File API
    │
    ▼
Web Audio API
    │
    ├──► AudioBuffer
    │       │
    │       ├──► Waveform Canvas
    │       │
    │       ├──► Minimap
    │       │
    │       └──► Playback
    │
    ▼
Trim Selection
    │
    ▼
Audio Processing
    │
    ├──► WAV Encoder
    │
    └──► MP3 Encoder (lamejs)
    │
    ▼
Downloaded Audio File
```

---

## 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, distribute, and build upon the project in accordance with the license terms.

See [LICENSE](LICENSE) for the complete license text.

---

## 👩‍💻 Author

**Amika Alankara**

* GitHub: [Amika Alankara](https://github.com/Amika1118)
* Hugging Face: [Amika Alankara](https://huggingface.co/amika-alankara)

---

<div align="center">

**Made with ❤️ by Amika Alankara**

*100% client-side. Your audio stays with you.*

</div>
