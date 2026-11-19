// Single place that looks up every element the app touches.
// Loaded as a module (deferred), so the DOM is ready when this runs.
const $ = (id) => document.getElementById(id);

export const dom = {
  dropzone: $("dropzone"),
  fileInput: $("fileInput"),
  bench: $("bench"),
  fileName: $("fileName"),
  changeFile: $("changeFile"),

  waveformPanel: $("waveformPanel"),
  waveCanvas: $("waveCanvas"),
  handlesLayer: $("handles"),
  regionShade: $("regionShade"),
  handleStart: $("handleStart"),
  handleEnd: $("handleEnd"),
  playhead: $("playhead"),

  overviewCanvas: $("overviewCanvas"),
  overviewRegion: $("overviewRegion"),
  overviewWindow: $("overviewWindow"),

  counterIn: $("counterIn"),
  counterOut: $("counterOut"),
  counterSel: $("counterSel"),
  counterPos: $("counterPos"),
  counterTotal: $("counterTotal"),

  btnPlaySel: $("btnPlaySel"),
  btnPlayAll: $("btnPlayAll"),
  btnStop: $("btnStop"),
  btnLoop: $("btnLoop"),

  zoomRange: $("zoomRange"),
  zoomValue: $("zoomValue"),
  volumeRange: $("volumeRange"),
  volumeValue: $("volumeValue"),
  fadeToggle: $("fadeToggle"),

  btnUndo: $("btnUndo"),
  btnRedo: $("btnRedo"),
  btnResetSel: $("btnResetSel"),

  formatSelect: $("formatSelect"),
  btnExport: $("btnExport"),
  statusMsg: $("statusMsg"),

  loadingOverlay: $("loadingOverlay"),
  loadingText: $("loadingText"),
  dropzoneStatus: $("dropzoneStatus"),

  pageLinks: document.querySelectorAll("[data-page-link]"),
};

dom.overviewShell = dom.overviewCanvas.parentElement;
