"use strict";
// Strophen und Dynamik: Strophenwahl, Durchlauf „Alle nacheinander“, Hervorhebung der aktuellen
// Strophe im Notenbild, Liedtext-Anzeige, Dynamik je Notenzeile und Pegel für die Wiedergabe
// (Zustände: verseChoice, verseIndex, lyricMode, playDynamics, dynamicLevels).
function hasVerses() {
  return !!score?.verses?.length;
}
function currentVerse() {
  return hasVerses() ? score.verses[verseIndex] : null;
}
// Ohne eigene Wahl zeigen schmale Bildschirme nur die aktuelle Strophe.
function lyricDisplay() {
  return lyricMode ?? (window.innerWidth <= 600 ? "current" : "all");
}
function refreshDynamics() {
  dynamicLevels =
    playDynamics && compiled?.dynamics.length
      ? noteLevels(compiled, currentVerse()?.id ?? null)
      : null;
}
function setVerseIndex(index) {
  if (!hasVerses()) return;
  verseIndex = Math.max(0, Math.min(score.verses.length - 1, index));
  refreshDynamics();
  paintVerse();
  updateVerseControls();
}
// Bei „Alle nacheinander“: zur nächsten Strophe wechseln, falls noch eine folgt.
function nextVerse() {
  if (!hasVerses() || verseChoice !== "all" || verseIndex >= score.verses.length - 1) return false;
  setVerseIndex(verseIndex + 1);
  return true;
}
function hasNextVerse() {
  return hasVerses() && verseChoice === "all" && verseIndex < score.verses.length - 1;
}
// Atempause vor der nächsten Strophe oder Runde; „ein ganzer Takt“ misst die volle Taktart des
// Schlusstakts, auch wenn dieser (wie bei Auftakten) verkürzt ist.
function versePauseSeconds() {
  const m = measureAt(bounds().end - 0.001),
    quarters = versePause === "bar" ? (m.meter[0] * 4) / m.meter[1] : Number(versePause);
  return (quarters * 60) / bpm;
}
// Wiedergabe nach der Atempause fortsetzen. Die Anzeige steht währenddessen schon am Anfang.
function afterVersePause(resume) {
  const delay = versePauseSeconds() * 1000;
  if (!delay) return resume();
  const token = playRun;
  playing = true;
  $("playIcon").textContent = "Ⅱ";
  $("playText").textContent = "Pause";
  $("play").setAttribute("aria-label", "Anhalten");
  $("beatLabel").textContent = "Atempause …";
  verseWaitTimer = setTimeout(() => {
    if (token === playRun) resume();
  }, delay);
}
// Neuer Durchlauf von vorn: bei „Alle nacheinander“ wieder mit der ersten Strophe.
function restartVerses() {
  if (hasVerses() && verseChoice === "all" && verseIndex !== 0) setVerseIndex(0);
}
function setVerseChoice(choice) {
  if (choice !== "all" && !score.verses?.some((v) => v.id === choice))
    throw new Error("Unbekannte Strophe.");
  stop();
  verseChoice = choice;
  setVerseIndex(choice === "all" ? 0 : score.verses.findIndex((v) => v.id === choice));
  onTick(cursor, false);
}
// Hervorhebung ohne Neuaufbau: Textzeilen, Strophennummern, strophenabhängige Dynamik und die
// Beschriftung der Noten folgen der aktuellen Strophe.
function paintVerse() {
  const k = String(verseIndex);
  document
    .querySelectorAll("#score [data-verse]")
    .forEach((e) =>
      e.classList.toggle("current-verse", e.dataset.verse === "all" || e.dataset.verse === k),
    );
  document
    .querySelectorAll("#score [data-dynamic-verses]")
    .forEach((e) =>
      e.classList.toggle("inactive-verse", !e.dataset.dynamicVerses.split(" ").includes(k)),
    );
  if (!hasVerses()) return;
  for (const e of document.querySelectorAll("#score .score-note[data-note-id]:not(.chord-note)")) {
    const [measure, voiceId, index] = e.dataset.noteId.split(":"),
      n = compiled.measures[+measure]?.voices[voiceId]?.[+index],
      v = getVoice(voiceId);
    if (!n || !v || !Array.isArray(n.lyric)) continue;
    const names = e.dataset.voiceNames === "1";
    e.setAttribute("aria-label", noteLabel(v, n, score.ppq, verseIndex, names));
    const title = e.querySelector("title");
    if (title) title.textContent = noteTitle(v, n, verseIndex, names);
  }
}
// Dynamik, die in Takt m auf einer Notenzeile mit diesen Stimmen steht (Gabeln auch als
// Fortsetzung aus früheren Takten), relativ zum Takt.
function measureDynamics(m, voices) {
  const unison = score.sections.find((s) => s.id === m.section)?.unison || {};
  return compiled.dynamics
    .filter((d) => (d.duration ? d.tick < m.end && d.end > m.start : d.measureIndex === m.index))
    .filter((d) => voices.some((v) => appliesTo({ voices: d.voices }, v.id, null, unison)))
    .map((d) => {
      const verses = d.verses?.map((id) => score.verses.findIndex((v) => v.id === id));
      return {
        mark: d.mark,
        hairpin: !!d.duration,
        at: d.tick - m.start,
        end: d.end - m.start,
        verses,
        label: verses ? `(${verses.map((i) => `${i + 1}.`).join(", ")})` : null,
      };
    });
}
function renderVerseControls() {
  const verses = score.verses || [];
  $("versePicker").hidden = !verses.length;
  $("lyricOptions").hidden = !verses.length;
  $("dynamicsOption").hidden = !compiled.dynamics.length;
  const tabs = $("verses");
  tabs.replaceChildren();
  if (!verses.length) return;
  for (const [i, v] of [{ id: "all", name: "Alle nacheinander" }, ...verses].entries()) {
    const b = escText("button", "");
    b.type = "button";
    b.dataset.verseChoice = v.id;
    if (i === 0) b.textContent = v.name;
    else {
      b.append(escText("span", v.name, "verse-long"), escText("span", String(i), "verse-short"));
      b.setAttribute("aria-label", v.name);
      b.title = v.name;
    }
    b.onclick = () => setVerseChoice(v.id);
    tabs.append(b);
  }
  updateVerseControls();
}
function updateVerseControls() {
  if (!score) return;
  document.querySelectorAll("[data-verse-choice]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.verseChoice === verseChoice));
    b.classList.toggle(
      "verse-now",
      verseChoice === "all" && b.dataset.verseChoice === currentVerse()?.id,
    );
  });
  const mode = lyricDisplay();
  document
    .querySelectorAll("[data-lyric-mode]")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lyricMode === mode)));
  $("lyricHint").textContent =
    mode === "all"
      ? "Alle Strophen untereinander, die aktuelle hervorgehoben."
      : "Nur der Text der aktuellen Strophe. Die Hervorhebung folgt der Wiedergabe.";
  $("playDynamics").checked = playDynamics;
  $("versePause").value = versePause;
}
// Strophenwahl, Liedtext-Anzeige und Schalter „Dynamik abspielen“ (mit gespeicherter Einstellung).
function bindVerseControls() {
  try {
    const saved = localStorage.getItem("chorprobe.lyrics.v1");
    if (["all", "current"].includes(saved)) lyricMode = saved;
    playDynamics = localStorage.getItem("chorprobe.dynamics.v1") !== "false";
    const pause = localStorage.getItem("chorprobe.versePause.v1");
    if (["0", "1", "2", "bar"].includes(pause)) versePause = pause;
  } catch {}
  $("versePause").onchange = () => {
    versePause = $("versePause").value;
    try {
      localStorage.setItem("chorprobe.versePause.v1", versePause);
    } catch {}
  };
  document.querySelectorAll("[data-lyric-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        lyricMode = b.dataset.lyricMode;
        try {
          localStorage.setItem("chorprobe.lyrics.v1", lyricMode);
        } catch {}
        updateVerseControls();
        renderScore();
      }),
  );
  $("playDynamics").onchange = () => {
    playDynamics = $("playDynamics").checked;
    try {
      localStorage.setItem("chorprobe.dynamics.v1", String(playDynamics));
    } catch {}
    refreshDynamics();
    // Laufende Wiedergabe mit den neuen Pegeln fortsetzen.
    if (playing && playback === "auto" && !rangeWaiting) {
      stop({ resetTap: false });
      startAuto();
    }
  };
}
