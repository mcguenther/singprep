"use strict";
// Wiedergabe: Stopp, Cursor, Abspielen, Mitlaufen, Tipp-Modus und Abschnittswahl
// (Zustände: cursor, playing, playback, step, bpm, taps, tapNext, loop, playRun …).
function stop({ resetTap = true } = {}) {
  playRun++;
  clearTimeout(rangeLoopTimer);
  cancelAnimationFrame(rangeWaitFrame);
  rangeWaiting = false;
  if (audio.running) cursor = audio.stop();
  else audio.stop();
  audio.cancelCue();
  cueRun++;
  cuePlaying = false;
  cueActive = null;
  $("cueList")
    .querySelectorAll(".playing")
    .forEach((e) => e.classList.remove("playing"));
  $("cueStop").hidden = true;
  if (cueOpen) {
    $("cueAgain").hidden = false;
    $("cueStatus").textContent = "Angehalten. Töne einzeln oder alle erneut anhören.";
    paintCueNotes();
  }
  playing = false;
  if (resetTap) {
    taps = [];
    tapNext = null;
  }
  $("playIcon").textContent = "▶";
  $("playText").textContent = "Abspielen";
  $("play").setAttribute("aria-label", "Abspielen");
  if (compiled) {
    setCursor(cursor, false);
    updateRangeStatus();
  }
}
function setCursor(t, follow = false) {
  const range = bounds();
  cursor = Math.min(range.end, Math.max(range.start, t));
  onTick(cursor, follow);
}
function selectPosition(t, n, v, m) {
  stop();
  resetWrittenRepeats();
  setCursor(Math.min(t, bounds().end - 1), false);
  selectedNote = n ? `${m.index}:${v.id}:${(m.voices[v.id] || []).indexOf(n)}` : null;
  document.querySelectorAll(".score-note.selected").forEach((e) => e.classList.remove("selected"));
  if (selectedNote) {
    const e = [...document.querySelectorAll(".score-note")].find(
      (e) => e.dataset.noteId === selectedNote,
    );
    e?.classList.add("selected");
  }
  if (cueOpen) {
    $("selection").hidden = true;
    refreshCues(true);
    return;
  }
  if (range) {
    $("selection").hidden = true;
    return;
  }
  if (n) {
    $("selectionTitle").textContent =
      `${m.voiceLabels?.[v.id] || v.name} · ${noteName(n.pitch)} · Takt ${m.number}`;
    $("selectionText").textContent =
      n.comment ||
      [
        n.lyric ? `„${n.lyric}“` : null,
        `${n.duration / score.ppq} Viertel`,
        "Hier starten oder Einsatztöne holen.",
      ]
        .filter(Boolean)
        .join(" · ");
    $("selection").hidden = false;
  } else $("selection").hidden = true;
}
function onTick(t, follow = true) {
  if (!compiled) return;
  cursor = t;
  const m = measureAt(Math.min(t, compiled.total - 0.001));
  const beat = (t - m.start) / score.ppq;
  const ended = t >= (range?.mode === "isolate" ? range.end : bounds().end);
  $("position").textContent = ended
    ? range?.mode === "isolate"
      ? "Bereich zu Ende"
      : "Abschnitt zu Ende"
    : `Takt ${m.number}`;
  $("beatLabel").textContent = ended
    ? "Bereit für eine neue Runde"
    : `Zählzeit ${Math.floor(beat) + 1}${Math.abs(beat - Math.round(beat)) > 0.4 ? " +" : ""}`;
  const progressRange = range?.mode === "isolate" ? range : bounds();
  $("progress").style.width =
    `${Math.max(0, Math.min(100, (100 * (t - progressRange.start)) / (progressRange.end - progressRange.start)))}%`;
  updateRangeStatus();
  const mixKey = `${m.index}:${range?.mode === "off" ? "off" : range && t >= range.start && t < range.end ? range.voices : "outside"}`;
  if (currentMeasure !== m.index) {
    currentMeasure = m.index;
    document.querySelectorAll(".measure.current").forEach((e) => e.classList.remove("current"));
    $(`measure-${m.index}`)?.classList.add("current");
  }
  if (lastRangeMix !== mixKey) {
    lastRangeMix = mixKey;
    if (!cuePlaying) {
      if (audio.running && audio.mixAt) audio.mix = getMix(m, t);
      else audio.setMix(getMix(m, t));
    }
  }
  if (viewMode === "original" && score.layout) {
    paintOriginal(compiled, m, t, ended);
    if (follow) followCurrent(m);
    return;
  }
  if (follow) followCurrent(m);
  document.querySelectorAll(".score-note.active").forEach((e) => e.classList.remove("active"));
  const card = $(`measure-${m.index}`);
  if (card && !ended) {
    card.querySelectorAll(".score-note").forEach((e) => {
      if (+e.dataset.at <= t && +e.dataset.end > t) e.classList.add("active");
    });
  }
  document.querySelectorAll(".staff .playhead").forEach((e) => e.setAttribute("opacity", "0"));
  if (card && !ended) {
    card.querySelectorAll(".staff").forEach((svg) => {
      const map = JSON.parse(svg.dataset.timeMap);
      const local = Math.min(m.length, Math.max(0, t - m.start));
      const right = map.findIndex((p) => p[0] >= local);
      const pair = right <= 0 ? [map[0], map[0]] : [map[right - 1], map[right]];
      const x =
        pair[0][1] +
        (pair[1][0] === pair[0][0]
          ? 0
          : ((local - pair[0][0]) / (pair[1][0] - pair[0][0])) * (pair[1][1] - pair[0][1]));
      const e = svg.querySelector(".playhead");
      e.setAttribute("x1", x);
      e.setAttribute("x2", x);
      e.setAttribute("opacity", "0.65");
    });
  }
}
function followTarget(measure, t) {
  let card =
    viewMode === "original"
      ? document.querySelector(".original-measure.current")
      : $(`measure-${measure.index}`);
  if (range?.mode === "isolate" && t >= range.end - score.ppq * 0.25) {
    if (!range.loop) return card;
    return viewMode === "original"
      ? document.querySelector(`.original-measure[data-index="${measureAt(range.start).index}"]`)
      : $(`measure-${measureAt(range.start).index}`);
  }
  const upcoming = range?.mode === "isolate" ? null : pendingRepeat();
  const next =
    upcoming && upcoming.end <= measure.end && upcoming.end > measure.start
      ? measureAt(upcoming.start)
      : compiled.measures[measure.index + 1];
  if (!card || !next || next.start >= bounds().end || t < measure.start + measure.length * 0.75)
    return card;
  if (viewMode === "practice") {
    const following = $(`measure-${next.index}`);
    if (following && card.closest(".score-system") !== following.closest(".score-system"))
      return following;
  } else {
    const following = document.querySelector(`.original-measure[data-index="${next.index}"]`);
    if (
      following &&
      (card.closest(".original-page") !== following.closest(".original-page") ||
        following.getBoundingClientRect().top > card.getBoundingClientRect().top + 10)
    )
      return following;
  }
  return card;
}
function followCurrent(measure) {
  if (!$("follow").checked || !(playing || playback === "tap") || performance.now() < followAfter)
    return;
  const card = followTarget(measure, cursor);
  if (!card) return;
  const top = 12,
    bottom =
      Math.min(
        window.innerHeight,
        document.querySelector(".transport").getBoundingClientRect().top,
      ) - 14;
  let rect = card.getBoundingClientRect();
  if (viewMode === "practice" && rect.height > bottom - top) {
    const target = compiled.measures[Number(card.dataset.index)] || measure;
    const aliases = score.sections.find((s) => s.id === target.section)?.unison || {};
    const ids = [...(displayMode === "all" ? selected : displaySelected)].map(
      (id) => aliases[id] || id,
    );
    const row =
      [...card.querySelectorAll(".staff-row")].find((r) => ids.includes(r.dataset.voice)) ||
      card.querySelector(".staff-row");
    if (row) rect = row.getBoundingClientRect();
  }
  const delta = followDelta(rect, top, bottom);
  if (Math.abs(delta) > 2) {
    followAfter = performance.now() + 500;
    window.scrollBy({
      top: delta,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }
}
function onEnd(end) {
  cursor = end;
  if (range?.mode === "isolate") {
    onTick(end);
    if (range.loop) {
      rangeWaiting = true;
      playing = true;
      $("playIcon").textContent = "Ⅱ";
      $("playText").textContent = "Pause";
      $("play").setAttribute("aria-label", "Wiederholung anhalten");
      $("beatLabel").textContent =
        range.pause === "0" ? "Wiederholung beginnt …" : "Pause vor der Wiederholung";
      const delay = rangePauseSeconds() * 1000;
      rangeWaitDeadline = performance.now() + delay;
      const token = playRun;
      const showWait = () => {
        if (!rangeWaiting || token !== playRun) return;
        updateRangeStatus();
        rangeWaitFrame = requestAnimationFrame(showWait);
      };
      showWait();
      rangeLoopTimer = setTimeout(() => {
        if (token !== playRun || !rangeWaiting) return;
        cancelAnimationFrame(rangeWaitFrame);
        rangeWaiting = false;
        rangeRound++;
        cursor = range.start;
        currentMeasure = -1;
        lastRangeMix = null;
        startAuto();
      }, delay);
    } else {
      playing = false;
      $("playIcon").textContent = "▶";
      $("playText").textContent = "Abspielen";
      $("play").setAttribute("aria-label", "Bereich erneut abspielen");
    }
    return;
  }
  const repeat = playback === "auto" ? repeatAt(end) : null;
  if (repeat) {
    playedRepeats.add(repeat.id);
    cursor = repeat.start;
    currentMeasure = -1;
    onTick(cursor);
    startAuto();
    return;
  }
  playing = false;
  $("playIcon").textContent = "▶";
  $("playText").textContent = "Abspielen";
  $("play").setAttribute("aria-label", "Abspielen");
  onTick(end);
  if (playback === "auto" && loop) {
    resetWrittenRepeats();
    cursor = loopStart();
    startAuto();
  } else if (playback === "tap")
    $("tapHint").textContent = repeatAt(end)
      ? "Nächster Tipp: Wiederholung."
      : end >= bounds().end
        ? loop
          ? "Nächster Tipp: neue Runde."
          : "Abschnitt beendet. Nächster Tipp: von vorn."
        : "Wartet auf deinen nächsten Tipp.";
}
async function startAuto() {
  if (rangeAnchor) finishRangePick();
  if (cueOpen) closeCues(false);
  hideRangeMenu();
  const token = ++playRun;
  try {
    const only = range?.mode === "isolate",
      activeRange = range && range.mode !== "off";
    const globalEmpty = (rehearsalMode === "sing" || mixMode !== "all") && !selected.size;
    const localEmpty =
      activeRange && !["inherit", "all"].includes(range.voices) && !rangeSelection().size;
    if ((only ? range.voices === "inherit" && globalEmpty : globalEmpty) || localEmpty) {
      toast("Wähle mindestens eine Stimme für die Wiedergabe aus.");
      return;
    }
    audio.cancelCue();
    playing = true;
    await audio.ready();
    if (token !== playRun) return;
    const sectionRange = bounds();
    if (only) {
      if (cursor < range.start || cursor >= range.end) {
        cursor = range.start;
        rangeRound = 1;
      }
      if (!rangeRound) rangeRound = 1;
    } else if (cursor >= sectionRange.end) {
      resetWrittenRepeats();
      cursor = sectionRange.start;
    }
    lastRangeMix = null;
    audio.setMix(getMix(measureAt(cursor), cursor));
    playing = true;
    $("selection").hidden = true;
    $("playIcon").textContent = "Ⅱ";
    $("playText").textContent = "Pause";
    $("play").setAttribute("aria-label", "Pause");
    audio.play(
      cursor,
      only ? range.end : Math.min(sectionRange.end, pendingRepeat()?.end ?? sectionRange.end),
      bpm,
      {
        tempoRange:
          range?.mode !== "off" && range
            ? { start: range.start, end: range.end, factor: range.tempo }
            : null,
        mixAt: (t) => getMix(measureAt(t), t),
        mixTicks: [
          ...compiled.measures.map((m) => m.start),
          ...(range ? [range.start, range.end] : []),
        ],
      },
    );
  } catch (e) {
    if (token === playRun) {
      stop();
      toast(e.message);
    }
  }
}
async function tap() {
  if (!compiled || playback !== "tap") return;
  if (cueOpen) closeCues(false);
  try {
    if ((rehearsalMode === "sing" || mixMode !== "all") && !selected.size) {
      toast("Wähle zuerst mindestens eine Stimme.");
      return;
    }
    const now = performance.now();
    if (taps.length && now - taps.at(-1) < 80) return;
    await audio.ready();
    const range = bounds();
    if (taps.length && now - taps.at(-1) > 3000) taps = [];
    taps.push(now);
    taps = taps.slice(-7);
    bpm = smoothTempo(estimateTempo(taps, step, bpm), bpm, step);
    $("bpm").value = String(Math.round(bpm));
    let from = tapNext ?? cursor;
    const repeat = repeatAt(from);
    if (repeat) {
      playedRepeats.add(repeat.id);
      from = repeat.start;
      tapNext = null;
    } else if (from >= range.end) {
      resetWrittenRepeats();
      from = loop ? loopStart() : range.start;
      tapNext = null;
    }
    const end = Math.min(range.end, from + step * score.ppq, pendingRepeat(from)?.end ?? range.end);
    tapNext = end;
    playing = true;
    audio.setMix(getMix(measureAt(from)));
    audio.play(from, end, bpm, { carry: true, fermata: false });
    setCursor(from, true);
    $("selection").hidden = true;
    $("tapHint").textContent =
      taps.length < 2
        ? `Starttempo: ${Math.round(bpm)} BPM. Tippe weiter.`
        : `${Math.round(bpm)} BPM · sanft angepasst.`;
    $("tap").classList.add("pulse");
    setTimeout(() => $("tap").classList.remove("pulse"), 110);
  } catch (e) {
    stop();
    toast(e.message);
  }
}
function setPlayback(mode) {
  stop();
  if (mode === "tap" && range && range.mode !== "off") {
    range.mode = "off";
    updateRangeMenu();
    toast("Die Übezone gilt für die automatische Wiedergabe. Die Markierung bleibt erhalten.");
  }
  playback = mode;
  document.body.classList.toggle("tap-mode", mode === "tap");
  $("tapArea").hidden = mode !== "tap";
  $("play").setAttribute("aria-label", mode === "tap" ? "Einen Schritt tippen" : "Abspielen");
  $("playIcon").textContent = mode === "tap" ? "♪" : "▶";
  $("playText").textContent = mode === "tap" ? "Tippen" : "Abspielen";
  document
    .querySelectorAll("[data-playback]")
    .forEach((e) => e.setAttribute("aria-pressed", String(e.dataset.playback === mode)));
}
function setSection(id) {
  if (id !== "all" && !score.sections.some((s) => s.id === id))
    throw new Error("Unbekannter Abschnitt.");
  if (cueOpen) closeCues(false);
  clearRange();
  resetWrittenRepeats();
  section = id;
  cursor = bounds().start;
  currentMeasure = -1;
  renderScore();
  document
    .querySelectorAll("[data-section]")
    .forEach((e) => e.setAttribute("aria-pressed", String(e.dataset.section === id)));
  $("selection").hidden = true;
  onTick(cursor, false);
}
function togglePlayback() {
  if (!compiled) return;
  if (playback === "tap") tap();
  else if (playing) stop();
  else startAuto();
}
// Playerleiste: Abspielen, Zurück, Tippen, Schleife, Lautstärke, Wiedergabeart und Tempo.
function bindTransport() {
  $("reset").onclick = () => {
    if (cueOpen) closeCues(false);
    stop();
    resetWrittenRepeats();
    setCursor(bounds().start, false);
  };
  $("toStart").onclick = () => {
    if (cueOpen) closeCues(false);
    stop();
    resetWrittenRepeats();
    setCursor(bounds().start, false);
    document
      .querySelector(".measure,.original-measure")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  $("cue").onclick = showCues;
  $("tap").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    tap();
  });
  $("tap").addEventListener("click", (e) => {
    if (e.detail === 0) tap();
  });
  $("loop").onclick = () => {
    if (range?.mode === "isolate") {
      range.loop = !range.loop;
      if (rangeWaiting && !range.loop) stop();
      updateRangeMenu();
    } else {
      loop = !loop;
      $("loop").setAttribute("aria-pressed", String(loop));
    }
  };
  $("dismissSelection").onclick = () => {
    $("selection").hidden = true;
  };
  $("volume").oninput = () => audio.setMaster(Number($("volume").value) / 100);
  document
    .querySelectorAll("[data-playback]")
    .forEach((e) => (e.onclick = () => setPlayback(e.dataset.playback)));
  document.querySelectorAll("[data-step]").forEach(
    (e) =>
      (e.onclick = () => {
        stop();
        step = Number(e.dataset.step);
        document
          .querySelectorAll("[data-step]")
          .forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.step) === step)));
        $("tapHint").textContent =
          `Ein Tipp pro ${step === 1 ? "Viertel" : "Achtel"}. Zwischentöne laufen mit.`;
      }),
  );
  $("bpm").onchange = () => {
    const value = Number($("bpm").value);
    if (!Number.isFinite(value) || value < 20 || value > 300) {
      $("bpm").value = String(Math.round(bpm));
      toast("Das Tempo muss zwischen 20 und 300 BPM liegen.");
      return;
    }
    const wasPlaying = playing && playback === "auto";
    stop();
    bpm = value;
    if (wasPlaying) startAuto();
  };
  $("play").onclick = togglePlayback;
}
