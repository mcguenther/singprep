"use strict";
// Einsatztöne: Leiste mit Tönen an der aktuellen Stelle, Markierung in Gold
// (Zustände: cueOpen, cueMode, cueAnchor, cueItems, cueActive, cuePlaying, cuePreviousView).
function cueNoteIds(n) {
  // A held or tied note is marked at the visible segment containing the anchor.
  const parts = (compiled.byVoice[n.voice] || []).filter((p) =>
    (n.noteIds || [n.id]).includes(p.id),
  );
  const part = parts.find((p) => p.start <= cueAnchor && p.end > cueAnchor) || parts[0];
  return part ? [part.id] : [n.id];
}
function cueElements(n) {
  const ids = new Set(cueNoteIds(n));
  return [...document.querySelectorAll(".score-note")].filter((e) =>
    (e.dataset.cueIds || e.dataset.noteId || "").split(" ").some((id) => ids.has(id)),
  );
}
function paintCueNotes() {
  document
    .querySelectorAll(".cue-target,.cue-sounding")
    .forEach((e) => e.classList.remove("cue-target", "cue-sounding"));
  if (!cueOpen) return;
  for (const n of cueItems)
    for (const el of cueElements(n)) {
      el.classList.add("cue-target");
      if (n.id === cueActive?.id) el.classList.add("cue-sounding");
    }
  $("cueViewHint").hidden = displayMode !== "selected" && !cuePreviousView;
  $("cueViewHint").textContent = cuePreviousView
    ? "Übeansicht für markierte Einsatztöne."
    : displayMode === "selected"
      ? "Hier vorübergehend alle Stimmen sichtbar."
      : "";
}
function revealCue(n, force = false) {
  requestAnimationFrame(() => {
    if (!cueOpen || (n && !cueItems.some((item) => item.id === n.id))) return;
    const el = n ? cueElements(n)[0] : $(`measure-${measureAt(cueAnchor).index}`);
    if (!el) return;
    const rect = el.getBoundingClientRect(),
      bottom = document.querySelector(".transport").getBoundingClientRect().top - 18,
      top = 18;
    const delta =
      force || rect.top < top || rect.bottom > bottom
        ? rect.top - (top + Math.max(12, (bottom - top) * 0.15))
        : 0;
    if (Math.abs(delta) > 2)
      window.scrollBy({
        top: delta,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
  });
}
function stopCues() {
  cueRun++;
  audio.cancelCue();
  cuePlaying = false;
  cueActive = null;
  $("cueStop").hidden = true;
  $("cueAgain").hidden = false;
  $("cueList")
    .querySelectorAll(".playing")
    .forEach((e) => e.classList.remove("playing"));
  $("cueStatus").textContent = cueItems.length
    ? "Markierte Töne einzeln oder alle erneut anhören."
    : "Keine Einsatztöne in dieser Auswahl.";
  if (compiled) updateMix();
  paintCueNotes();
}
function closeCues(focus = true) {
  if (!cueOpen) return;
  stopCues();
  cueOpen = false;
  cueItems = [];
  cueActive = null;
  $("cuePanel").hidden = true;
  $("cue").setAttribute("aria-expanded", "false");
  const restore = cuePreviousView;
  cuePreviousView = null;
  if (restore) {
    viewMode = restore;
    updateViewControls();
  }
  renderScore();
  paintCueNotes();
  if (focus) $("cue").focus({ preventScroll: true });
}
async function runCues(chosen) {
  stopCues();
  if (!chosen.length) return;
  const token = ++cueRun;
  cuePlaying = true;
  $("cueStop").hidden = false;
  $("cueAgain").hidden = true;
  audio.setMix(Object.fromEntries(score.voices.map((v) => [v.id, 1])));
  try {
    await audio.cue(chosen, (n) => {
      if (token !== cueRun || !cueOpen) return;
      cueActive = n || null;
      $("cueList")
        .querySelectorAll(".cue-item")
        .forEach((row) => row.classList.toggle("playing", row.dataset.cueId === n?.id));
      paintCueNotes();
      const m = n ? compiled.measures[n.measureIndex] : null;
      $("cueStatus").textContent = n
        ? `${m.voiceLabels?.[n.voice] || getVoice(n.voice).name}: ${noteName(n.pitch)}`
        : "Fertig. Die markierten Töne kannst du einzeln erneut anhören.";
      if (n) {
        revealCue(n);
        const row = [...$("cueList").children].find((e) => e.dataset.cueId === n.id);
        if (row) {
          const list = $("cueList");
          if (
            row.offsetLeft < list.scrollLeft ||
            row.offsetLeft + row.offsetWidth > list.scrollLeft + list.clientWidth
          )
            list.scrollTo({
              left: Math.max(0, row.offsetLeft - (list.clientWidth - row.offsetWidth) / 2),
              behavior: "smooth",
            });
        }
      } else {
        cuePlaying = false;
        $("cueStop").hidden = true;
        $("cueAgain").hidden = false;
        updateMix();
      }
    });
  } catch (e) {
    if (token === cueRun) {
      stopCues();
      $("cueStatus").textContent = e.message;
    }
  }
}
function refreshCues(autoplay = false) {
  stopCues();
  cueAnchor = cursor;
  const m = measureAt(cueAnchor),
    range = bounds(),
    sectionEnd = compiled.measures.filter((mm) => mm.section === m.section).at(-1).end;
  const ids = score.voices.filter((v) => Object.hasOwn(m.voices, v.id)).map((v) => v.id);
  cueItems = cueNotes(compiled, cueAnchor, ids, Math.min(range.end, sectionEnd), cueMode);
  $("cueIntro").textContent =
    `Takt ${m.number} · Schlag ${(1 + (cueAnchor - m.start) / score.ppq).toLocaleString("de-DE", { maximumFractionDigits: 2 })}`;
  document
    .querySelectorAll("[data-cue-mode]")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cueMode === cueMode)));
  $("cueModeHint").textContent =
    cueMode === "onset"
      ? "Nur Töne, die hier neu beginnen. Gehaltene Töne bleiben aus."
      : "Klingende Töne, bei Pausen der nächste Einsatz im Abschnitt.";
  const list = $("cueList");
  list.replaceChildren();
  for (const n of cueItems) {
    const target = compiled.measures[n.measureIndex],
      name = target.voiceLabels?.[n.voice] || getVoice(n.voice).name,
      row = escText("button", "", "cue-item");
    row.type = "button";
    row.dataset.cueId = n.id;
    row.style.setProperty("--voice", color(n.voice));
    const detail =
      n.start < cueAnchor
        ? "Klingt bereits"
        : `Takt ${target.number} · Schlag ${(1 + (n.start - target.start) / score.ppq).toLocaleString("de-DE", { maximumFractionDigits: 2 })}`;
    row.setAttribute("aria-label", `${name}: ${noteName(n.pitch)}, ${detail}, anhören`);
    const label = escText("span", name, "cue-voice-label");
    label.append(escText("small", detail));
    row.append(
      escText("span", "", "cue-dot"),
      label,
      escText("strong", noteName(n.pitch)),
      escText("span", "▶", "cue-play-icon"),
    );
    row.onclick = () => runCues([n]);
    list.append(row);
  }
  $("cueAgain").disabled = !cueItems.length;
  $("cueStatus").textContent = cueItems.length
    ? "Gold markiert: Einsatztöne. Einen Ton antippen oder alle anhören."
    : cueMode === "onset"
      ? "Hier beginnt kein Ton. Wähle einen anderen Schlag oder „Nächste Einsätze“."
      : "Bis zum Abschnittsende gibt es keine Einsatztöne.";
  paintCueNotes();
  revealCue(cueItems[0], true);
  if (autoplay && cueItems.length) runCues(cueItems);
}
function showCues() {
  if (!compiled) return;
  if (rangePicking) cancelRangePick();
  hideRangeMenu();
  stop();
  const range = bounds();
  if (cursor >= range.end) setCursor(range.start, false);
  // Preserve exact clicked onsets (including eighths); snap a paused playhead to its beat.
  const m = measureAt(cursor),
    atOnset = Object.values(compiled.byVoice)
      .flat()
      .some((n) => Math.abs(n.start - cursor) < 0.01);
  if (!atOnset)
    setCursor(
      m.start +
        Math.floor((cursor - m.start) / ((score.ppq * 4) / m.meter[1])) *
          ((score.ppq * 4) / m.meter[1]),
      false,
    );
  if (!cueOpen) {
    cuePreviousView = viewMode === "original" ? viewMode : null;
    cueOpen = true;
    if (cuePreviousView) {
      viewMode = "practice";
      updateViewControls();
    }
    renderScore();
  }
  $("selection").hidden = true;
  $("cuePanel").hidden = false;
  $("cue").setAttribute("aria-expanded", "true");
  refreshCues(true);
  $("cueHeading").focus({ preventScroll: true });
}
// Schaltflächen der Einsatztöne-Leiste.
function bindCues() {
  $("cueStop").onclick = stopCues;
  $("cueClose").onclick = () => closeCues();
  $("cueAgain").onclick = () => runCues(cueItems);
  document.querySelectorAll("[data-cue-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        cueMode = b.dataset.cueMode;
        refreshCues(true);
      }),
  );
}
