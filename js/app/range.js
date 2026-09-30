"use strict";
// Übebereich: markieren, Menü, Bereichstempo/-stimmen, Wiederholen
// (Zustände: range, rangeAnchor, rangePicking, rangeDrag, rangeRound …).
function rangeSelection() {
  return new Set(range?.voiceIds ?? [...selected]);
}
function rangeLabel(t) {
  const m = measureAt(Math.min(compiled.total - 0.001, Math.max(0, t)));
  const beat = 1 + (t - m.start) / score.ppq;
  return `Takt ${m.number}${Math.abs(beat - 1) < 0.001 ? "" : `, Schlag ${beat.toLocaleString("de-DE", { maximumFractionDigits: 2 })}`}`;
}
function rangeEndLabel() {
  const m = measureAt(range.end - 0.001);
  return Math.abs(range.end - m.end) < 0.001
    ? `Takt ${m.number} Ende`
    : `${rangeLabel(range.end)} (bis hier)`;
}
function rangeShortLabel() {
  if (!range) return "";
  const a = measureAt(range.start),
    b = measureAt(range.end - 0.001);
  return a.index === b.index ? `Takt ${a.number}` : `Takte ${a.number}–${b.number}`;
}
function rangeNew(point) {
  return {
    start: point.start,
    end: point.end,
    mode: "isolate",
    tempo: 1,
    voices: "inherit",
    voiceIds: null,
    backing: 35,
    guide: 15,
    loop: false,
    pause: "0",
  };
}
function rangePauseSeconds() {
  if (!range) return 0;
  const m = measureAt(range.end - 0.001),
    quarters = range.pause === "bar" ? (m.meter[0] * 4) / m.meter[1] : Number(range.pause);
  return (quarters * 60) / (bpm * range.tempo);
}
function paintRange() {
  document
    .querySelectorAll(".practice-selected,.practice-partial")
    .forEach((el) => el.classList.remove("practice-selected", "practice-partial"));
  document.querySelectorAll(".practice-range-band").forEach((el) => el.remove());
  if (!range) return;
  for (const card of document.querySelectorAll(".measure,.original-measure")) {
    const m = compiled.measures[+card.dataset.index];
    if (!m) continue;
    const a = card.classList.contains("original-measure") ? m.start + +card.dataset.from : m.start,
      b = card.classList.contains("original-measure") ? m.start + +card.dataset.to : m.end;
    if (b <= range.start || a >= range.end) continue;
    card.classList.add(
      range.start <= a && range.end >= b ? "practice-selected" : "practice-partial",
    );
    if (card.classList.contains("practice-partial"))
      for (const svg of card.querySelectorAll(".staff")) {
        const map = JSON.parse(svg.dataset.timeMap),
          xFor = (t) => {
            const i = map.findIndex((p) => p[0] >= t);
            if (i <= 0) return map[0][1];
            const a = map[i - 1],
              b = map[i];
            return a[1] + ((t - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
          };
        const x = xFor(Math.max(0, range.start - m.start)),
          end = xFor(Math.min(m.length, range.end - m.start)),
          band = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
          box = svg.viewBox.baseVal;
        for (const [k, v] of Object.entries({
          x,
          y: box.y,
          width: Math.max(0, end - x),
          height: box.height,
          fill: "#9986ee22",
          class: "practice-range-band",
          "pointer-events": "none",
        }))
          band.setAttribute(k, v);
        svg.insertBefore(band, svg.firstChild);
      }
  }
  document.querySelectorAll(".score-note").forEach((el) => {
    if (+el.dataset.at < range.end && +el.dataset.end > range.start)
      el.classList.add("practice-selected");
  });
}
function placeRangeMenu(target) {
  const menu = $("rangeMenu");
  if (menu.hidden) return;
  if (target?.isConnected) lastRangeTarget = target;
  if (window.innerWidth <= 600) {
    menu.style.removeProperty("top");
    menu.style.removeProperty("left");
    return;
  }
  const anchor = lastRangeTarget?.isConnected
    ? lastRangeTarget
    : document.querySelector(
        ".measure.practice-selected .measure-head,.measure.practice-partial .measure-head,.original-measure.practice-selected",
      );
  const rect = anchor?.getBoundingClientRect(),
    height = menu.getBoundingClientRect().height,
    player = document.querySelector(".transport").getBoundingClientRect().top;
  const below = rect?.bottom + 8,
    above = rect?.top - height - 8;
  const top =
    below && below + height < player - 8
      ? below
      : above >= 8
        ? above
        : Math.max(8, player - height - 8);
  menu.style.top = `${top}px`;
  menu.style.left = `${Math.max(12, Math.min(window.innerWidth - menu.offsetWidth - 12, rect?.left ?? 24))}px`;
}
function updateRangeStatus() {
  const el = $("rangeStatus");
  el.hidden = !range || !!rangeAnchor;
  if (!range) return;
  const active = range.mode !== "off" && cursor >= range.start && cursor < range.end,
    tempo = `${Math.round(range.tempo * 100)} %`,
    mode =
      range.mode === "isolate"
        ? "Nur Bereich"
        : range.mode === "override"
          ? "Im Stück"
          : "Markiert";
  const waiting = rangeWaiting
    ? ` · Pause ${Math.max(0, (rangeWaitDeadline - performance.now()) / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} s`
    : "";
  const label = `${rangeShortLabel()} · ${mode}${range.mode === "off" ? "" : ` · ${tempo}`}${range.mode === "isolate" && range.loop ? ` · Runde ${Math.max(1, rangeRound)}` : ""}${waiting}`;
  el.textContent = label + " · Einstellungen";
  el.classList.toggle("range-active", active && playing && !rangeWaiting);
  el.setAttribute("aria-expanded", String(!$("rangeMenu").hidden));
  $("loop").setAttribute("aria-pressed", String(range.mode === "isolate" ? range.loop : loop));
  $("loop").setAttribute(
    "aria-label",
    range.mode === "isolate" ? "Markierten Bereich wiederholen" : "Abschnitt als Endlosschleife",
  );
}
function updateRangeMenu(target, open = false) {
  $("rangePick").setAttribute("aria-pressed", String(rangePicking));
  $("score").classList.toggle("range-picking", rangePicking);
  $("rangePick").textContent = rangePicking ? "✓ Markierung festlegen" : "▣ Bereich markieren";
  $("rangeEdit").hidden = !range || !!rangeAnchor;
  $("rangeDraft").hidden = !rangePicking;
  $("rangeFinish").hidden = !rangeAnchor;
  $("rangeDraftText").textContent = rangeAnchor
    ? "Ende antippen oder diese Auswahl übernehmen."
    : "Ersten und letzten Takt antippen.";
  $("rangeSummary").textContent = range
    ? `${rangeLabel(range.start)} bis ${rangeEndLabel()}`
    : rangePicking
      ? "Anfang antippen, dann das Ende."
      : "Mit der Maus ziehen oder Anfang und Ende antippen. Umschalt-Klick erweitert die Auswahl.";
  if (!range) {
    $("rangeMenu").hidden = true;
    $("rangeStatus").hidden = true;
    return;
  }
  $("rangeDescription").textContent = `${rangeLabel(range.start)} bis ${rangeEndLabel()}`;
  if (rangeAnchor) {
    $("rangeMenu").hidden = true;
    updateRangeStatus();
    return;
  }
  for (const b of document.querySelectorAll("[data-range-mode]"))
    b.setAttribute("aria-pressed", String(b.dataset.rangeMode === range.mode));
  $("rangeTempo").value = String(range.tempo);
  $("rangeVoices").value = range.voices;
  $("rangeLoop").checked = range.loop;
  $("rangePause").value = range.pause;
  $("rangeConfig").hidden = range.mode === "off";
  $("rangeRepeatFields").hidden = range.mode !== "isolate";
  $("rangePause").disabled = !range.loop;
  $("rangePlay").hidden = range.mode === "off";
  $("rangePlay").textContent =
    range.mode === "override" ? "▶ Ab Cursor starten" : "▶ Bereich abspielen";
  $("rangeLead").hidden = range.mode !== "override";
  $("rangeHint").textContent =
    range.mode === "isolate"
      ? "Nur die Markierung wird gespielt. Mit „Wiederholen“ beginnt sie erneut; notierte Wiederholungen bleiben hier aus."
      : range.mode === "override"
        ? "Startposition durch Klick in die Partitur wählen. Nur in der Markierung gelten diese Einstellungen, davor und danach die normale Wiedergabe."
        : "Nur farbig markieren. Tempo und Stimmen bleiben unverändert.";
  const needsVoices = !["inherit", "all"].includes(range.voices);
  $("rangeVoiceOptions").hidden = !needsVoices;
  $("rangeOwnVoices").checked = range.voiceIds !== null;
  $("rangeVoiceButtons").hidden = range.voiceIds === null;
  const picked = rangeSelection(),
    buttons = $("rangeVoiceButtons");
  buttons.replaceChildren();
  for (const voice of score.voices) {
    const b = escText("button", voice.name, "display-voice");
    b.type = "button";
    b.style.setProperty("--voice", color(voice.id));
    b.dataset.rangeVoice = voice.id;
    b.setAttribute("aria-pressed", String(picked.has(voice.id)));
    b.onclick = () => {
      const ids = rangeSelection();
      if (ids.has(voice.id)) ids.delete(voice.id);
      else ids.add(voice.id);
      range.voiceIds = [...ids];
      lastRangeMix = null;
      updateMix();
      updateRangeMenu();
    };
    buttons.append(b);
  }
  $("rangeVoiceNames").textContent =
    (range.voiceIds === null ? "Deine Stimmen: " : "Ausgewählt: ") +
    (score.voices
      .filter((v) => picked.has(v.id))
      .map((v) => v.name)
      .join(", ") || "keine");
  const level = range.voices === "sing" ? range.guide : range.backing;
  $("rangeLevelLabel").hidden = !["focus", "sing"].includes(range.voices);
  $("rangeLevelName").textContent =
    range.voices === "sing" ? "Meine Stimmen als Orientierung" : "Begleitung";
  $("rangeLevel").value = level;
  $("rangeLevelValue").textContent = level + " %";
  if (open) $("rangeMenu").hidden = false;
  updateRangeStatus();
  requestAnimationFrame(() => {
    placeRangeMenu(target);
    if (open && window.innerWidth <= 600) {
      const card = document.querySelector(
        ".measure.practice-selected,.measure.practice-partial,.original-measure.practice-selected,.original-measure.practice-partial",
      );
      if (card) {
        const rect = card.getBoundingClientRect(),
          limit = $("rangeMenu").getBoundingClientRect().top;
        if (rect.top < 12 || rect.top > limit - 80)
          window.scrollBy({ top: rect.top - 16, behavior: "instant" });
      }
    }
  });
}
function openRangeMenu(target) {
  if (!range || rangeAnchor) return;
  updateRangeMenu(target, true);
  $("rangeHeading").focus({ preventScroll: true });
}
function hideRangeMenu() {
  $("rangeMenu").hidden = true;
  updateRangeStatus();
}
function rangePoint(element, unit = $("rangeUnit").value) {
  const note = element.closest(".score-note"),
    card = element.closest(".measure,.original-measure");
  if (!card) return null;
  const m = compiled.measures[+card.dataset.index];
  return unit === "notes" && note
    ? { start: +note.dataset.at, end: +note.dataset.end }
    : m
      ? { start: m.start, end: m.end }
      : null;
}
function beginRangePick() {
  if (cueOpen) closeCues(false);
  stop();
  rangeBeforePick = range ? structuredClone(range) : null;
  rangeAnchor = null;
  rangePicking = true;
  hideRangeMenu();
  updateRangeMenu();
}
function cancelRangePick() {
  range = rangeBeforePick;
  rangeBeforePick = null;
  rangeAnchor = null;
  rangePicking = false;
  rangeDrag = null;
  paintRange();
  updateRangeMenu();
  updateMix();
}
function finishRangePick(target) {
  if (!rangeAnchor) return;
  rangeAnchor = null;
  rangePicking = false;
  rangeBeforePick = null;
  rangeRound = 0;
  if (playback === "tap") setPlayback("auto");
  resetWrittenRepeats();
  cursor = range.start;
  lastRangeMix = null;
  onTick(cursor, false);
  paintRange();
  updateRangeMenu(target, true);
}
function chooseRange(point, target) {
  if (!point) return;
  if (cueOpen) closeCues(false);
  stop();
  if (!rangeAnchor) {
    if (!rangePicking) rangeBeforePick = range ? structuredClone(range) : null;
    rangeAnchor = point;
    rangePicking = true;
    range = rangeNew(point);
    paintRange();
    updateRangeMenu(target);
  } else {
    range.start = Math.min(rangeAnchor.start, point.start);
    range.end = Math.max(rangeAnchor.end, point.end);
    finishRangePick(target);
  }
  $("selection").hidden = true;
}
function changeRangeMode(mode) {
  if (!range) return;
  stop();
  if (mode !== "off" && playback === "tap") setPlayback("auto");
  range.mode = mode;
  if (mode === "isolate") {
    rangeRound = 0;
    cursor = range.start;
  }
  lastRangeMix = null;
  onTick(cursor, false);
  updateMix();
  updateRangeMenu();
}
function clearRange() {
  stop();
  range = null;
  rangeAnchor = null;
  rangePicking = false;
  rangeBeforePick = null;
  rangeRound = 0;
  lastRangeMix = null;
  paintRange();
  updateRangeMenu();
  updateMix();
  $("loop").setAttribute("aria-pressed", String(loop));
  $("loop").setAttribute("aria-label", "Abschnitt als Endlosschleife");
}
// Markieren per Klick, Umschalt-Klick, Ziehen mit der Maus und das Bereichsmenü.
function bindRangeControls() {
  $("rangePick").onclick = () => {
    if (rangePicking) {
      if (rangeAnchor) finishRangePick();
      else cancelRangePick();
    } else beginRangePick();
  };
  $("rangeFinish").onclick = () => finishRangePick();
  $("rangeCancel").onclick = cancelRangePick;
  $("rangeEdit").onclick = () => openRangeMenu();
  $("rangeStatus").onclick = () => openRangeMenu();
  $("rangeUnit").onchange = () => {
    if (rangePicking) cancelRangePick();
  };
  $("score").addEventListener(
    "click",
    (e) => {
      if (performance.now() < rangeIgnoreClickUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (!rangePicking && !e.shiftKey) return;
      const target = e.target.closest?.(
        ".score-note,.measure-title,.measure-head,.original-measure,.staff",
      );
      if (!target) return;
      const point = rangePoint(target);
      if (!point) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.shiftKey && !rangePicking) {
        rangeBeforePick = range ? structuredClone(range) : null;
        rangeAnchor = range
          ? { start: range.start, end: range.end }
          : $("rangeUnit").value === "notes"
            ? { start: cursor, end: Math.min(bounds().end, cursor + score.ppq) }
            : { start: measureAt(cursor).start, end: measureAt(cursor).end };
        range = range || rangeNew(rangeAnchor);
        rangePicking = true;
      }
      chooseRange(point, target);
    },
    true,
  );
  // Mouse dragging selects without changing ordinary clicks. Touch keeps native scrolling.
  $("score").addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.shiftKey) return;
    const target = e.target.closest?.(".score-note,.measure-head,.original-measure,.staff");
    if (!target) return;
    rangeDrag = { x: e.clientX, y: e.clientY, point: rangePoint(target), target, active: false };
  });
  document.addEventListener("pointermove", (e) => {
    if (!rangeDrag) return;
    const drag = rangeDrag;
    if (!drag.active && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
    if (!drag.active) {
      beginRangePick();
      rangeDrag = drag;
      chooseRange(drag.point, drag.target);
      drag.active = true;
    }
    const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest(".score-note,.measure-title,.measure-head,.original-measure,.staff"),
      point = target ? rangePoint(target) : null;
    if (point) {
      range.start = Math.min(drag.point.start, point.start);
      range.end = Math.max(drag.point.end, point.end);
      lastRangeTarget = target;
      paintRange();
    }
    if (e.clientY < 30) window.scrollBy(0, -14);
    else if (e.clientY > document.querySelector(".transport").getBoundingClientRect().top - 25)
      window.scrollBy(0, 14);
  });
  document.addEventListener("pointerup", () => {
    if (!rangeDrag) return;
    if (rangeDrag.active) {
      rangeIgnoreClickUntil = performance.now() + 400;
      finishRangePick(lastRangeTarget);
    }
    rangeDrag = null;
  });
  document.addEventListener("pointercancel", () => {
    if (rangeDrag?.active) cancelRangePick();
    rangeDrag = null;
  });
  $("score").addEventListener(
    "keydown",
    (e) => {
      if (
        (rangePicking || e.shiftKey) &&
        e.key === "Enter" &&
        e.target.closest(".score-note,.measure-title,.original-measure")
      ) {
        const point = rangePoint(e.target);
        if (point) {
          e.preventDefault();
          e.stopImmediatePropagation();
          chooseRange(point, e.target);
        }
      }
    },
    true,
  );
  document
    .querySelectorAll("[data-range-mode]")
    .forEach((b) => (b.onclick = () => changeRangeMode(b.dataset.rangeMode)));
  $("rangeTempo").onchange = () => {
    if (!range) return;
    stop();
    range.tempo = Number($("rangeTempo").value);
    updateRangeMenu();
  };
  $("rangeVoices").onchange = () => {
    if (!range) return;
    range.voices = $("rangeVoices").value;
    lastRangeMix = null;
    updateMix();
    updateRangeMenu();
  };
  $("rangeOwnVoices").onchange = () => {
    if (!range) return;
    range.voiceIds = $("rangeOwnVoices").checked ? [...selected] : null;
    lastRangeMix = null;
    updateMix();
    updateRangeMenu();
  };
  $("rangeLevel").oninput = () => {
    if (!range) return;
    range[range.voices === "sing" ? "guide" : "backing"] = +$("rangeLevel").value;
    $("rangeLevelValue").textContent = $("rangeLevel").value + " %";
    lastRangeMix = null;
    updateMix();
  };
  $("rangeLoop").onchange = () => {
    if (!range) return;
    range.loop = $("rangeLoop").checked;
    if (rangeWaiting && !range.loop) stop();
    updateRangeMenu();
  };
  $("rangePause").onchange = () => {
    if (!range) return;
    if (rangeWaiting) stop();
    range.pause = $("rangePause").value;
    updateRangeMenu();
  };
  $("rangePlay").onclick = () => {
    if (!range) return;
    stop();
    if (playback !== "auto") setPlayback("auto");
    if (range.mode === "isolate") {
      cursor = range.start;
      rangeRound = 1;
    }
    lastRangeMix = null;
    updateRangeMenu();
    startAuto();
  };
  $("rangeLead").onclick = () => {
    if (!range) return;
    stop();
    if (playback !== "auto") setPlayback("auto");
    range.mode = "override";
    const first = measureAt(range.start),
      previous = compiled.measures[Math.max(0, first.index - 1)];
    cursor = Math.max(bounds().start, previous.start);
    resetWrittenRepeats();
    lastRangeMix = null;
    updateRangeMenu();
    startAuto();
  };
  $("rangeClear").onclick = clearRange;
  $("rangeClose").onclick = () => {
    hideRangeMenu();
    $("rangeStatus").focus({ preventScroll: true });
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!$("rangeMenu").hidden) placeRangeMenu();
    },
    { passive: true },
  );
}
