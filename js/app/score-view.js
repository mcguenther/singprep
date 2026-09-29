"use strict";
// Partituransicht: Notensysteme aufbauen, Kopfbereich/Klang/Stimmenknöpfe füllen, Ansicht wechseln
// (Zustände: viewMode, currentMeasure).
function renderScore() {
  const container = $("score");
  container.replaceChildren();
  container.className = viewMode === "original" ? "original-grid" : "practice-grid";
  const mobile = window.innerWidth <= 840,
    dense = !$("showCounts").checked,
    setting = $("measuresPerRow").value;
  const columns = measureColumns(container.clientWidth, setting, mobile);
  for (const option of $("measuresPerRow").options)
    option.disabled = mobile && Number(option.value) > 3;
  $("showCounts").disabled = viewMode === "original";
  $("measuresPerRow").disabled = viewMode === "original";
  container.classList.toggle("dense-score", dense);
  container.classList.toggle("mobile-compact", mobile && columns > 1);
  container.style.setProperty("--measure-columns", columns);
  $("layoutHint").textContent =
    viewMode === "original"
      ? "Darstellung der Originalseiten."
      : setting === "auto"
        ? `Passt sich der Fensterbreite an: aktuell ${columns} ${columns === 1 ? "Takt" : "Takte"} pro Zeile.`
        : `${columns} ${columns === 1 ? "Takt" : "Takte"} pro Zeile${mobile ? " · mobil bis zu 3" : ""}.`;
  $("layoutSummary").textContent =
    viewMode === "original"
      ? "Originalseiten"
      : `${displayMode === "all" ? "Alle Stimmen" : displayMode === "selected" ? "Nur Auswahl" : "Mit Sammelzeile"} · ${columns} ${columns === 1 ? "Takt" : "Takte"}${dense ? "" : " · Zählzeiten"}`;
  if (viewMode === "original" && score.layout) {
    drawOriginalPages(container, compiled, section, selectPosition);
    currentMeasure = -1;
    lastRangeMix = null;
    onTick(cursor, false);
    paintRange();
    updateRangeMenu();
    return;
  }
  const visible = compiled.measures.filter((m) => section === "all" || m.section === section);
  const systems = groupScoreSystems(
      visible,
      columns,
      score,
      displaySelected,
      cueOpen && displayMode === "selected" ? "all" : displayMode,
    ),
    lyricSize = dense ? 11 : 12;
  const gutter = window.innerWidth <= 600 ? 26 : 76,
    available = Math.max(100, container.clientWidth - gutter - 2);
  const plans = systems.map((system) => {
    const rows = displayRows(score, system.voices);
    const spacings = system.measures.map((m, i) => {
      const previous = compiled.measures[m.index - 1];
      const showMeter =
        m.index === visible[0].index ||
        !previous ||
        m.meter[0] !== previous.meter[0] ||
        m.meter[1] !== previous.meter[1];
      return measureSpacing(m, {
        showClef: i === 0,
        showMeter,
        lyricSize,
        chordVoices: system.voices.combined,
      });
    });
    const minimum = spacings.reduce((n, s) => n + s.minWidth, 0),
      targetWidth = (available * system.measures.length) / columns;
    return { system, rows, spacings, minimum, targetWidth };
  });
  const scale = Math.min(1, ...plans.map((p) => p.targetWidth / p.minimum));
  for (const { system, rows, spacings, minimum, targetWidth } of plans) {
    const outer = escText("section", "", "score-system");
    outer.setAttribute("aria-label", `Takte ${system.measures.map((m) => m.number).join(", ")}`);
    outer.dataset.first = system.measures[0].index;
    outer.dataset.last = system.measures.at(-1).index;
    const rowCount = Math.max(1, rows.length) + 2;
    outer.style.setProperty("--system-columns", system.measures.length);
    outer.style.setProperty("--system-rows", rowCount);
    outer.style.width = `${gutter + targetWidth + 2}px`;
    container.append(outer);
    const extra = Math.max(0, targetWidth / scale - minimum) / system.measures.length;
    const widths = spacings.map((s) => s.minWidth + extra);
    outer.style.gridTemplateColumns = `${gutter}px ${widths.map((w) => `${w}fr`).join(" ")}`;
    const rowPlans = rows.map((row) => {
      const rangeEvents = system.measures.flatMap((m) =>
        row.kind === "chord" ? chordEvents(row.voices, m) : m.voices[row.voices[0].id] || [],
      );
      return {
        ...row,
        rangeEvents,
        chordClef: row.kind === "chord" ? chordClef(rangeEvents) : null,
      };
    });
    rowPlans.forEach((row, index) => {
      const m = system.measures[0],
        v = row.voices[0],
        label = escText("div", "", "system-voice-label");
      label.style.gridColumn = "1";
      label.style.gridRow = String(index + 2);
      label.style.setProperty("--voice", row.kind === "chord" ? "#687286" : color(v.id));
      label.dataset.voices = row.voices.map((v) => v.id).join(" ");
      const names = row.voices.map((v) => m.voiceLabels?.[v.id] || v.name).join(", ");
      label.append(
        escText("span", row.kind === "chord" ? "Übrige" : m.voiceLabels?.[v.id] || v.name),
      );
      label.title = names;
      label.setAttribute("aria-label", row.kind === "chord" ? `Übrige Stimmen: ${names}` : names);
      outer.append(label);
    });
    for (const [column, m] of system.measures.entries()) {
      const card = escText("article", "", "measure");
      card.id = `measure-${m.index}`;
      card.dataset.index = m.index;
      card.style.gridColumn = String(column + 2);
      card.style.gridRow = `1 / span ${rowCount - 1}`;
      outer.append(card);
      const head = escText("div", "", "measure-head"),
        title = escText("button", "", "measure-title");
      title.setAttribute("aria-label", `Bei Takt ${m.number} beginnen`);
      title.append(escText("span", String(m.number).padStart(2, "0"), "measure-number"));
      if (column === 0)
        title.append(escText("strong", score.sections.find((s) => s.id === m.section)?.name || ""));
      title.onclick = () => selectPosition(m.start, null, null, m);
      head.append(title);
      card.append(head);
      const previous = compiled.measures[m.index - 1],
        showMeter =
          m.index === visible[0].index ||
          !previous ||
          m.meter[0] !== previous.meter[0] ||
          m.meter[1] !== previous.meter[1];
      const width = widths[column],
        renderWidth = width * scale,
        shared = {
          connected: true,
          showClef: column === 0,
          showMeter,
          renderWidth,
          compact: mobile && columns > 1,
          dense,
          lyricSize,
          spacing: spacings[column],
        };
      for (const rowPlan of rowPlans) {
        const row = escText(
            "div",
            "",
            `staff-row${rowPlan.kind === "chord" ? " combined-row" : ""}`,
          ),
          v = rowPlan.voices[0];
        row.dataset.voices = rowPlan.voices.map((v) => v.id).join(" ");
        row.style.setProperty("--voice", rowPlan.kind === "chord" ? "#687286" : color(v.id));
        card.append(row);
        if (rowPlan.kind === "chord")
          row.append(
            drawCombinedStaff(rowPlan.voices, m, score.ppq, width, selectPosition, color, {
              ...shared,
              rangeEvents: rowPlan.rangeEvents,
              chordClef: rowPlan.chordClef,
            }),
          );
        else {
          row.dataset.voice = v.id;
          row.append(
            drawStaff(v, m, m.voices[v.id] || [], score.ppq, width, selectPosition, color(v.id), {
              ...shared,
              rangeEvents: rowPlan.rangeEvents,
            }),
          );
        }
      }
      if (!rows.length)
        card.append(escText("p", "Wähle Stimmen unter „Darstellung“.", "measure-note"));
    }
    const comments = system.measures.filter((m) => m.comment);
    if (comments.length) {
      const notes = escText(dense ? "details" : "div", "", "system-notes");
      notes.style.gridColumn = "1 / -1";
      notes.style.gridRow = String(rowCount);
      if (dense)
        notes.append(
          escText("summary", `Hinweise · Takt ${comments.map((m) => m.number).join(", ")}`),
        );
      for (const m of comments) notes.append(escText("p", `Takt ${m.number}: ${m.comment}`));
      outer.append(notes);
    }
  }
  updateMix();
  currentMeasure = -1;
  lastRangeMix = null;
  onTick(cursor, false);
  paintRange();
  updateRangeMenu();
  if (cueOpen) {
    paintCueNotes();
    revealCue(cueActive || cueItems[0], true);
  }
}
function renderSoundControls() {
  const select = $("scoreSound");
  select.replaceChildren();
  for (const [id, p] of Object.entries(VOICE_SOUNDS)) {
    const option = escText("option", p.name);
    option.value = id;
    select.append(option);
  }
  select.value = audio.soundFor();
  select.onchange = () => {
    audio.setSound(select.value);
    try {
      localStorage.setItem("chorprobe.sound.v1", select.value);
    } catch {}
    $("soundSummary").textContent =
      `${VOICE_SOUNDS[select.value].name.split(" · ")[0]} · alle Stimmen`;
  };
  $("soundSummary").textContent =
    `${VOICE_SOUNDS[select.value].name.split(" · ")[0]} · alle Stimmen`;
  $("previewSound").onclick = async () => {
    try {
      await audio.preview({ voice: score.voices[0].id, midi: 60, start: 0, end: score.ppq });
      $("soundStatus").textContent = `Klangprobe: ${VOICE_SOUNDS[audio.soundFor()].name}`;
    } catch (e) {
      toast(e.message);
    }
  };
}
function renderChrome() {
  renderSoundControls();
  document.title = `Chorprobe · ${score.title}`;
  $("title").textContent = score.title;
  $("subtitle").textContent = [score.subtitle, score.composer].filter(Boolean).join(" · ");
  $("scoreComment").textContent = score.comment || "Keine Anmerkungen zur Partitur.";
  $("sourceDescription").textContent = score.source?.description || "";
  $("sourceSummary").textContent = `Zum Stück · ${score.measures.length} Takte`;
  $("performanceText").textContent = score.source?.performanceNotes || "";
  $("performanceBlock").hidden = !score.source?.performanceNotes;
  $("sourceCredit").textContent = [score.source?.copyright, score.source?.edition]
    .filter(Boolean)
    .join(" · ");
  $("sourceCredit").hidden = !$("sourceCredit").textContent;
  $("source").hidden = !score.layout;
  const comments = $("contextComments");
  comments.replaceChildren();
  for (const group of [...score.sections, ...score.voices])
    if (group.comment) comments.append(escText("p", `${group.name}: ${group.comment}`));
  const vs = $("voices");
  vs.replaceChildren();
  for (const v of score.voices) {
    const b = escText("button", "", "voice-button");
    b.dataset.voice = v.id;
    b.style.setProperty("--voice", color(v.id));
    b.setAttribute("aria-pressed", String(selected.has(v.id)));
    b.setAttribute("aria-label", `${v.name} auswählen`);
    b.append(
      escText("span", v.short || v.name.slice(0, 2), "voice-mark"),
      escText("span", v.name, "voice-name"),
    );
    b.onclick = () => {
      if (rehearsalMode === "learn" && mixMode === "all") {
        mixMode = "solo";
        selected = new Set([v.id]);
      } else if (selected.has(v.id)) selected.delete(v.id);
      else selected.add(v.id);
      practiceSelectionChanged();
    };
    vs.append(b);
  }
  vs.style.gridTemplateColumns = "";
  const displayVoices = $("displayVoices");
  displayVoices.replaceChildren();
  for (const v of score.voices) {
    const b = escText("button", v.name, "display-voice");
    b.type = "button";
    b.dataset.displayVoice = v.id;
    b.style.setProperty("--voice", color(v.id));
    b.onclick = () => {
      if (displayMode === "all") {
        displayMode = "selected";
        displaySelected = new Set([v.id]);
      } else if (displaySelected.has(v.id)) displaySelected.delete(v.id);
      else displaySelected.add(v.id);
      displaySelectionChanged();
    };
    displayVoices.append(b);
  }
  updateDisplayControls();
  const tabs = $("sections");
  tabs.replaceChildren();
  for (const s of [{ id: "all", name: "Ganzes Stück" }, ...score.sections]) {
    const b = escText("button", s.name);
    b.dataset.section = s.id;
    b.setAttribute("aria-pressed", String(s.id === section));
    b.onclick = () => setSection(s.id);
    tabs.append(b);
  }
  $("bpm").value = String(bpm);
  const repeatEnds = score.measures.flatMap((m) =>
    (m.barlines || []).filter((b) => b.kind === "repeatEnd"),
  ).length;
  $("endLabel").textContent =
    repeatEnds === 0
      ? "Ende der Partitur"
      : repeatEnds === 1
        ? "Ende der Partitur · Die notierte Wiederholung wird einmal gespielt."
        : "Ende der Partitur · Notierte Wiederholungen werden je einmal gespielt.";
  updateViewControls();
}
function updateViewControls() {
  updateDisplayControls();
  document.body.classList.toggle("original-mode", viewMode === "original");
  document.querySelectorAll("[data-view]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.view === viewMode));
    if (b.dataset.view === "original") {
      b.disabled = !score.layout;
      b.title = score.layout
        ? "Originalfotos mit anklickbaren Takten"
        : "Dieses Lied enthält keine Originalseiten.";
    }
  });
  $("viewHint").textContent =
    viewMode === "original"
      ? "Originalseiten · einen Takt anklicken, um dort zu beginnen."
      : "Noten und Text passen sich an die Bildschirmbreite an.";
  $("scoreCaptionText").textContent =
    viewMode === "original"
      ? "Takt anklicken, um dort zu beginnen oder einen Bereich zu markieren."
      : "Note oder Takt anklicken, um dort zu beginnen. Umschalt-Klick markiert.";
}
function setView(mode) {
  if (mode === "original" && !score.layout) return;
  if (mode === "original" && cueOpen) closeCues(false);
  viewMode = mode;
  updateViewControls();
  renderScore();
}
// Ansicht, Takte pro Zeile und Zählzeiten (mit gespeicherter Einstellung).
function bindLayoutControls() {
  document
    .querySelectorAll("[data-view]")
    .forEach((b) => (b.onclick = () => setView(b.dataset.view)));

  $("measuresPerRow").onchange = () => {
    renderScore();
    try {
      localStorage.setItem("chorprobe.layout.columns.v2", $("measuresPerRow").value);
    } catch {}
  };
  try {
    const saved = localStorage.getItem("chorprobe.layout.columns.v2");
    if (["auto", "1", "2", "3", "4", "5", "6"].includes(saved)) $("measuresPerRow").value = saved;
  } catch {}
  $("showCounts").onchange = () => {
    renderScore();
    try {
      localStorage.setItem("chorprobe.layout.showCounts", String($("showCounts").checked));
    } catch {}
  };
  try {
    $("showCounts").checked = localStorage.getItem("chorprobe.layout.showCounts") === "true";
  } catch {}
}
