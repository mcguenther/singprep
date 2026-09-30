"use strict";
// Stimmenmischung und Stimmenauswahl für Wiedergabe und Notenbild
// (Zustände: selected, mixMode, rehearsalMode, displayMode, displaySelected, independentDisplay).
function getMix(m, t = cursor) {
  if (
    range &&
    range.mode !== "off" &&
    t >= range.start &&
    t < range.end &&
    range.voices !== "inherit"
  ) {
    const mode = range.voices,
      picked = rangeSelection();
    if (mode === "others")
      return Object.fromEntries(
        Object.entries(voiceMix(score, m, picked, "solo", 0)).map(([id, gain]) => [id, 1 - gain]),
      );
    if (mode === "sing") return voiceMix(score, m, picked, "sing", 1, backingGain(range.guide));
    return voiceMix(score, m, picked, mode === "mine" ? "solo" : mode, backingGain(range.backing));
  }
  return rehearsalMode === "sing"
    ? voiceMix(
        score,
        m,
        selected,
        "sing",
        backingGain($("choirLevel").value),
        backingGain($("guideLevel").value),
      )
    : voiceMix(score, m, selected, mixMode, backingGain($("backing").value));
}
function updateMix() {
  if (!compiled) return;
  audio.setMix(
    cuePlaying ? Object.fromEntries(score.voices.map((v) => [v.id, 1])) : getMix(measureAt(cursor)),
  );
  $("voices").classList.toggle("all", rehearsalMode === "learn" && mixMode === "all");
  document
    .querySelectorAll("[data-practice]")
    .forEach((e) =>
      e.setAttribute(
        "aria-pressed",
        String(e.dataset.practice === (rehearsalMode === "sing" ? "sing" : mixMode)),
      ),
    );
  document
    .querySelectorAll(".voice-button")
    .forEach((e) => e.setAttribute("aria-pressed", String(selected.has(e.dataset.voice))));
  $("singLevels").hidden = rehearsalMode !== "sing";
  $("backingLabel").hidden = rehearsalMode !== "learn" || mixMode !== "focus";
  $("backingValue").textContent = `${$("backing").value} %`;
  $("guideValue").textContent = +$("guideLevel").value ? `${$("guideLevel").value} %` : "Aus";
  $("choirValue").textContent = `${$("choirLevel").value} %`;
  $("voicePrompt").textContent =
    rehearsalMode === "sing"
      ? "Markiere die Stimmen, die du selbst singst."
      : "Eine oder mehrere Stimmen auswählen.";
  const names = [...selected]
    .map((id) => getVoice(id)?.name)
    .filter(Boolean)
    .join(", ");
  $("mixHint").textContent =
    rehearsalMode === "sing"
      ? !selected.size
        ? "Wähle die Stimmen, die du selbst singst."
        : `${names}: du singst${+$("guideLevel").value ? " mit leiser Orientierung." : ", die App übernimmt die anderen Stimmen."}`
      : mixMode === "all"
        ? "Alle Stimmen gleich laut. Für ein Solo deine Stimme antippen."
        : !selected.size
          ? "Wähle mindestens eine Stimme aus."
          : mixMode === "solo"
            ? `Du hörst nur ${names}.`
            : `${names} im Vordergrund, die anderen als leise Begleitung.`;
}
function displaySelectionChanged() {
  if (!independentDisplay) displaySelected = new Set(selected);
  updateDisplayControls();
  renderScore();
}
function practiceSelectionChanged() {
  if (!independentDisplay) {
    displaySelected = new Set(selected);
    updateDisplayControls();
    if (viewMode === "practice" && displayMode !== "all") renderScore();
  }
  updateMix();
}
function updateDisplayControls() {
  if (!score) return;
  document
    .querySelectorAll("[data-display-mode]")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.displayMode === displayMode)));
  document
    .querySelectorAll("[data-display-voice]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(displaySelected.has(b.dataset.displayVoice))),
    );
  $("displayChoices").disabled = viewMode === "original";
  $("practiceAppearance").hidden = viewMode === "original";
  $("displaySelection").hidden = displayMode === "all";
  $("independentDisplay").checked = independentDisplay;
  $("displayVoicePicker").hidden = !independentDisplay;
  $("displayLinkHint").textContent = independentDisplay
    ? "Eigene Auswahl nur für das Notenbild. Deine Wiedergabe bleibt unverändert."
    : "Folgt automatisch „Deine Stimmen“ unter „Deine Probe“.";
  $("displayHint").textContent =
    viewMode === "original"
      ? "Der Stimmenfilter gilt für die Übeansicht. Die Originalfotos bleiben vollständig."
      : displayMode === "all"
        ? "Alle Stimmen sind sichtbar. Die Wiedergabe wird oben eingestellt."
        : displayMode === "selected"
          ? displaySelected.size
            ? `Sichtbar: ${score.voices
                .filter((v) => displaySelected.has(v.id))
                .map((v) => v.name)
                .join(", ")}.`
            : independentDisplay
              ? "Wähle mindestens eine Stimme zum Anzeigen."
              : "Wähle oben unter „Deine Stimmen“ mindestens eine Stimme."
          : "Deine Auswahl hat eigene Notenzeilen. Die übrigen Stimmen stehen zusammen in einer Sammelzeile.";
}
// Regler und Schaltflächen unter „Deine Probe“ und „Sichtbare Stimmen“.
function bindMixControls() {
  $("backing").oninput = updateMix;
  $("choirLevel").oninput = updateMix;
  $("guideLevel").oninput = updateMix;
  document.querySelectorAll("[data-practice]").forEach(
    (b) =>
      (b.onclick = () => {
        const next = b.dataset.practice;
        if ((next === "sing") !== (rehearsalMode === "sing")) stop();
        rehearsalMode = next === "sing" ? "sing" : "learn";
        if (next !== "sing") mixMode = next;
        updateMix();
      }),
  );
  document.querySelectorAll("[data-display-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!independentDisplay) displaySelected = new Set(selected);
        displayMode = b.dataset.displayMode;
        displaySelectionChanged();
      }),
  );
  $("independentDisplay").onchange = () => {
    independentDisplay = $("independentDisplay").checked;
    displaySelectionChanged();
  };
}
