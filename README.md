<div align="center">

# ✂️ Audio Trimmer

### Precise audio editing, right in your browser.

Trim, preview, and export audio without uploading your files or relying on an audio-processing backend.

[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES%20Modules-f7df1e?logo=javascript&logoColor=222)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-4caf50)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**View source on GitHub**](https://github.com/Amika1118/audio-trimmer) · [**Hugging Face profile**](https://huggingface.co/amika-alankara)

</div>

---

## Overview

**Audio Trimmer** is a lightweight, client-side audio editor for cutting and exporting audio directly in a web browser. Load a file, make a selection on the interactive waveform, preview the result, and export the selected segment as a WAV or MP3 file.

Audio decoding, playback, trimming, and export are handled locally with browser APIs and JavaScript. **Your audio is not uploaded to an application backend.**

## Features

| Area | Capabilities |
|---|---|
| **File import** | Drag and drop or browse for an audio file. Video files in supported formats can also be loaded, with their audio track extracted for editing. |
| **Format support** | MP3, WAV, M4A, OGG, FLAC, and other formats supported by the browser. |
| **Waveform editor** | Interactive waveform with adjustable zoom from **1× to 24×**. |
| **Minimap** | Track overview for navigating longer recordings. |
| **Precise trimming** | Draggable **IN** and **OUT** handles, keyboard adjustments, and live time readouts. |
| **Playback** | Play the full track or only the selected segment, with a live playhead and optional selection looping. |
| **Editing history** | Undo and redo trim adjustments. |
| **Fade effects** | Optional **150 ms fade-in and fade-out** when exporting. |
| **Export** | Save the selected audio as lossless WAV or MP3 encoded at approximately **192 kbps**. |
| **Sample audio** | Generate a short sample beat in the browser to explore the editor without importing a file. |
| **Built-in guidance** | Dedicated Help and Privacy pages, accessible from the application footer. |
| **Privacy-focused design** | Audio processing is local, and the fonts and MP3 encoder are bundled with the application. |

> **Format support note:** The formats listed above depend on the browser and operating system. A format being listed does not guarantee that every browser can decode it.

## How to Use

1. **Import a file** by dragging it into the application or using the file picker.
2. **Wait for decoding** while the browser loads the audio and generates the waveform.
3. **Choose a section** by moving the IN and OUT handles on the waveform.
4. **Refine the selection** using the zoom controls, minimap, time readouts, or keyboard shortcuts.
5. **Preview your edit** by playing the complete track or the selected section. Enable looping or fade effects when needed.
6. **Export the result** as WAV or MP3.

No account or server-side upload is required.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play or pause |
| `[` | Set the IN point at the current playhead position |
| `]` | Set the OUT point at the current playhead position |
| `←` / `→` | Fine adjustment of the trim position |
| `Shift` + `←` / `→` | Coarse adjustment of the trim position |
| `Esc` | Stop playback |

> **Tip:** Shortcuts may not work while you are typing in an input or when another interactive control has focus.

## Export Formats

### WAV

WAV export is handled by the application and preserves the audio as lossless output.

### MP3

MP3 export uses [lamejs](https://github.com/zhuker/lamejs), bundled locally in `vendor/`. The encoder is loaded only when MP3 export is first requested; no CDN is needed. The output is encoded at approximately **192 kbps**.

MP3 is a lossy format, so an exported MP3 may not retain every detail of the original audio.

## Tech Stack

| Technology | Role |
|---|---|
| **HTML5** | Application structure |
| **CSS3** | Responsive layout, styling, and visual design |
| **Vanilla JavaScript (ES modules)** | Application logic, organised into focused modules |
| **Web Audio API** | Audio decoding, playback, and processing |
| **Canvas API** | Waveform and minimap rendering |
| **lamejs** | Client-side MP3 encoding |

The application has **no frontend framework, build step, or audio-processing backend**.

## Project Structure

```text
audio-trimmer/
├── index.html                 # Main application
├── help.html                  # Step-by-step help page
├── privacy.html               # Privacy information
├── manifest.webmanifest       # Install and home-screen metadata
├── favicon.ico
├── robots.txt
├── _headers                   # Optional headers for supported static hosts
├── assets/
│   ├── logo.svg               # Logo used by the preloader and pages
│   └── icons/                  # App and device icons
├── css/
│   ├── preloader.css          # Logo preloader styles
│   ├── noscript.css           # Fallback when JavaScript is disabled
│   ├── base.css               # Fonts, design tokens, layout, and footer
│   ├── app.css                # Editor, waveform, counters, and controls
│   └── pages.css              # Help and privacy page styles
├── fonts/                     # Self-hosted WOFF2 fonts
├── vendor/
│   └── lame.min.js            # Bundled lamejs 1.2.1 encoder
└── js/
    ├── main.js                # Application entry point
    ├── preloader.js           # Preloader dismissal
    ├── help.js                # Help-page navigation highlights
    ├── config.js              # Application constants
    ├── dom.js                 # DOM element references
    ├── state.js               # Shared application state
    ├── utils.js               # Shared utility functions
    ├── audio/                 # Audio context, decoding, playback, trimming, and export
    └── ui/                    # Waveform, handles, controls, history, status, and interface modules
```

## Getting Started

### Requirements

- A modern web browser with support for the **Web Audio API** and **Canvas API**.
- A local web server to serve the application files. The project uses JavaScript ES modules, which generally cannot be loaded directly through `file://`.

### Run locally with Python

Open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

On systems where Python is installed as `python3`, use:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.

### Run locally with Node.js

Alternatively, use:

```bash
npx serve .
```

Open the local address printed by the command.

## Deployment

Audio Trimmer is a static website. **There is no build command**: deploy the project files as they are, with the application files in the published directory.

| Hosting platform | Deployment approach |
|---|---|
| **Hugging Face Spaces** | Create a Space using the **Static** SDK and upload the project files. The YAML metadata at the top of this README is configured for a static Space. |
| **GitHub Pages** | Push the project to GitHub, then configure Pages under **Settings → Pages** to deploy from the branch and folder containing the site. |
| **Netlify / Cloudflare Pages** | Connect the repository or upload the folder. Leave the build command empty and use the project folder as the publish directory. |
| **Other static hosts** | Upload the files while preserving the directory structure. |

The `_headers` file is optional and only applies on hosting platforms that support its format. It can be omitted when deploying to a host that does not use it.

## Privacy and Processing

Audio Trimmer is designed to keep audio processing in the browser:

- Audio files are decoded and processed locally using browser APIs.
- The application does not need an audio-processing server or an application database.
- No user account is required.
- The fonts and MP3 encoder are bundled with the project rather than loaded from a third-party CDN.

This means the application does not upload selected audio files to its own backend. As with other browser-based editors, the size and length of files you can process depend on the available memory and performance of your device.

For more information, see the in-app `privacy.html` page.

## Browser Compatibility

Audio decoding support varies across browsers and operating systems. MP3 and WAV are commonly supported. M4A, OGG, FLAC, and video containers such as MP4, MOV, and WEBM may depend on the browser's available codecs.

If a file cannot be opened, try using a browser that supports its format or converting it to a widely supported format such as WAV or MP3.

## Architecture

The application uses a browser-based processing pipeline:

```text
Audio or Video File
        │
        ▼
     File API
        │
        ▼
   Web Audio API ────────────────┐
        │                       │
        ▼                       ▼
    AudioBuffer             Playback
        │
        ├──────────► Waveform Canvas
        │
        └──────────► Track Minimap
        │
        ▼
   Trim Selection
        │
        ▼
  Audio Processing
        │
        ├──────────► WAV Export
        │
        └──────────► MP3 Export (lamejs)
                         │
                         ▼
                  Downloaded Audio
```

## License

The project is released under the **MIT License**. See [LICENSE](LICENSE) for the complete license text.

Third-party components bundled with the project, including `lamejs` and the self-hosted fonts, may be subject to their own license terms. Their respective notices should be retained when redistributing those components.

## Author

**Amika Alankara**

- **GitHub:** [Amika1118](https://github.com/Amika1118)
- **Hugging Face:** [amika-alankara](https://huggingface.co/amika-alankara)

---
