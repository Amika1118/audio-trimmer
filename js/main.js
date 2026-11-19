// Entry point: wires the modules together.
import { initVolume } from "./audio/context.js";
import { initPlayback } from "./audio/playback.js";
import { initExport } from "./audio/export.js";
import { initWaveform } from "./ui/waveform.js";
import { initHandles } from "./ui/handles.js";
import { initHistory } from "./ui/history.js";
import { initTimeInputs } from "./ui/timeInput.js";
import { initLoader } from "./ui/loader.js";
import { initShortcuts } from "./ui/shortcuts.js";
import { initPageLinks } from "./ui/pageLinks.js";

initVolume();
initWaveform();
initHandles();
initHistory();
initTimeInputs();
initPlayback();
initExport();
initLoader();
initShortcuts();
initPageLinks();
