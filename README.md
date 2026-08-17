<div align="center">

# ✂️ Audio Trimmer

**Precise, in-browser audio editing — no uploads, no backend.**

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
| **🔒 Privacy**          | Audio processing happens locally in the browser                             |

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

MP3 export uses **lamejs**, which is loaded when MP3 encoding is required.

The resulting MP3 is encoded at approximately **192 kbps**.

> MP3 is a lossy format, so the exported file may not contain exactly the same audio information as the original.

---

## 📁 Project Structure

```text
audio-trimmer/
├── index.html          # Application structure
├── style.css           # Application styling
├── script.js           # Audio processing, waveform, playback and export logic
└── README.md           # Project documentation
```

---

## 🛠️ Tech Stack

* **HTML5** — Application structure
* **CSS3** — Responsive UI and visual design
* **Vanilla JavaScript** — Application logic
* **Web Audio API** — Audio decoding and playback
* **Canvas API** — Waveform and minimap rendering
* **lamejs** — Client-side MP3 encoding

The application does not require a frontend framework or backend server.

---

## 🚀 Getting Started

### Prerequisites

You only need a modern web browser with support for the **Web Audio API**, **Canvas API**, and the audio formats you want to use.

### Local Preview

Because browser security policies can restrict some functionality when opening HTML files directly, running the application through a local server is recommended.

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

or:

```bash
npx http-server .
```

---

## ☁️ Deploying to Hugging Face Spaces

Audio Trimmer can be hosted as a **Static Space** because it does not require a backend server.

### Steps

1. Create a new Space on Hugging Face.
2. Select **Static** as the Space SDK.
3. Upload or push the project files:

   * `index.html`
   * `style.css`
   * `script.js`
   * `README.md`
4. Wait for the Space to build and deploy.
5. Open the generated Space URL.

Since all processing is performed in the browser, the application does not require a dedicated backend or server-side audio processing.

> **Important:** Hosting availability, quotas, and platform policies can change. Check Hugging Face's current Space documentation for the latest limits and terms.

---

## 🔐 Privacy

Audio Trimmer is designed to process audio **locally in the browser**.

Your selected audio file is decoded and processed using browser APIs rather than being uploaded to an application backend.

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

* GitHub: [Amika1118](https://github.com/Amika1118)
* Hugging Face: [Amika1118](https://huggingface.co/Amika1118)

---

<div align="center">

**Made with ❤️ by Amika Alankara**

*100% client-side. Your audio stays with you.*

</div>
