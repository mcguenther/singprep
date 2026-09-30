"use strict";
// Lieder: öffnen, zwischen angemeldeten Liedern wechseln, aus JSON-Datei laden, als JSON
// exportieren
// (Zustände: score, compiled, defaultScore, currentSong, importedScore; setzt Strophe und Dynamik
// zurück).
function loadScore(data, isDefault) {
  const checked = validateScore(data);
  const c = compileScore(checked);
  if (cueOpen) closeCues(false);
  if (compiled) stop();
  range = null;
  rangeAnchor = null;
  rangePicking = false;
  rangeBeforePick = null;
  rangeRound = 0;
  lastRangeMix = null;
  score = checked;
  compiled = c;
  defaultScore = isDefault;
  section = "all";
  cursor = 0;
  resetWrittenRepeats();
  currentMeasure = -1;
  selected = new Set([score.voices[0].id]);
  displaySelected = new Set(selected);
  independentDisplay = false;
  displayMode = "all";
  mixMode = "all";
  if (!score.layout) viewMode = "practice";
  bpm = score.tempo;
  verseChoice = "all";
  verseIndex = 0;
  refreshDynamics();
  taps = [];
  tapNext = null;
  audio.setScore(c);
  renderChrome();
  renderScore();
  updateRangeMenu();
  $("selection").hidden = true;
}
function songLabel(data) {
  return typeof data?.title === "string" && data.title.trim() ? data.title : "Ohne Titel";
}
// Auswahl in der Kopfleiste; nur sichtbar, wenn es mehr als ein Lied zur Auswahl gibt.
function renderSongPicker() {
  const picker = $("songPicker"),
    choices = Chorprobe.scores.map((data, i) => [String(i), songLabel(data)]);
  if (importedScore) choices.push(["file", `${songLabel(importedScore)} · aus Datei`]);
  picker.replaceChildren();
  for (const [value, label] of choices) {
    const option = escText("option", label);
    option.value = value;
    picker.append(option);
  }
  picker.value = currentSong ?? "";
  $("songPickerLabel").hidden = choices.length < 2;
}
function openSong(choice) {
  const data = choice === "file" ? importedScore : Chorprobe.scores[Number(choice)];
  loadScore(data, choice !== "file");
  currentSong = choice;
  renderSongPicker();
}
function downloadJson() {
  const blob = new Blob([JSON.stringify(score, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (score.title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-") || "partitur") + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Liedauswahl, „Lied laden“ und Dateiauswahl.
function bindSongControls() {
  $("songPicker").onchange = () => {
    try {
      openSong($("songPicker").value);
    } catch (e) {
      renderSongPicker();
      toast(e.message);
    }
  };
  $("import").onclick = () => $("fileInput").click();
  $("fileInput").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast("Die Datei darf höchstens 5 MB groß sein.");
      return;
    }
    const gen = ++loadGeneration;
    try {
      const text = await f.text();
      const data = JSON.parse(text);
      if (gen !== loadGeneration) return;
      loadScore(data, false);
      importedScore = data;
      currentSong = "file";
      renderSongPicker();
      toast(`„${score.title}“ geladen.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast(
        e instanceof SyntaxError
          ? "Die Datei enthält kein gültiges JSON. Dein bisheriges Lied bleibt geöffnet."
          : e.message,
      );
    }
  };
}
