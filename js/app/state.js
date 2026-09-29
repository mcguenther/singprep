"use strict";
// Gemeinsamer Zustand der App. Klassische Skripte teilen sich einen Top-Level-Scope:
// alle veränderlichen Zustände liegen hier, Funktionen in den übrigen Dateien von js/app/.
// Bibliotheken aus js/lib/.
const {
  backingGain,
  measureColumns,
  followDelta,
  spaceIsPlayback,
  visibleVoiceGroups,
  compactStaffWidth,
  displayRows,
  groupScoreSystems,
} = Chorprobe.practice;
const { validateScore, compileScore, cueNotes, noteName, estimateTempo, smoothTempo, voiceMix } =
  Chorprobe.score;
const { ChoirAudio, VOICE_SOUNDS } = Chorprobe.audio;
const { drawStaff, drawCombinedStaff, COLORS, measureSpacing, chordEvents, chordClef } =
  Chorprobe.render;
const { drawOriginalPages, paintOriginal } = Chorprobe.original;
let score,
  compiled,
  section = "all",
  mixMode = "all",
  selected = new Set(["s"]),
  playback = "auto",
  step = 1,
  bpm = 96,
  cursor = 0,
  playing = false,
  loop = false,
  taps = [],
  tapNext = null,
  currentMeasure = -1,
  selectedNote = null,
  defaultScore = true,
  loadGeneration = 0,
  resizeTimer,
  toastTimer,
  cuePlaying = false,
  viewMode = "practice",
  cueRun = 0,
  playRun = 0,
  followAfter = 0,
  spaceHandled = false,
  rehearsalMode = "learn",
  displayMode = "all",
  displaySelected = new Set(["s"]),
  independentDisplay = false,
  playedRepeats = new Set(),
  cueOpen = false,
  cueMode = "onset",
  cueAnchor = 0,
  cueItems = [],
  cueActive = null,
  cuePreviousView = null;
let range = null,
  rangeAnchor = null,
  rangePicking = false,
  rangeLoopTimer = 0,
  rangeWaiting = false,
  lastRangeMix = null,
  rangeBeforePick = null,
  rangeRound = 0,
  rangeWaitDeadline = 0,
  rangeWaitFrame = 0,
  rangeDrag = null,
  rangeIgnoreClickUntil = 0,
  lastRangeTarget = null;
// Liedauswahl: geöffnetes Lied als Index in Chorprobe.scores oder "file" für die zuletzt geladene
// JSON-Datei (importedScore). defaultScore oben ist true für angemeldete Lieder, false für Dateien.
let currentSong = null,
  importedScore = null;
// onTick/onEnd werden erst in playback.js deklariert; die Pfeilfunktionen lösen sie beim Aufruf
// auf.
const audio = new ChoirAudio(
  (...args) => onTick(...args),
  (...args) => onEnd(...args),
);
