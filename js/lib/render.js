"use strict";
// SVG-Notensatz der Übeansicht: Einzelstimmen und Sammelzeile.
Chorprobe.render = (function () {
  const { noteName, midi } = Chorprobe.score;
  const { CLEFS } = Chorprobe.glyphs;
  const COLORS = [
    "#6256db",
    "#cb5d31",
    "#ad3c72",
    "#147e91",
    "#437248",
    "#856124",
    "#4e60a3",
    "#916659",
  ];
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs = {}, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function line(svg, x1, y1, x2, y2, attrs = {}) {
    svg.append(el("line", { x1, y1, x2, y2, stroke: "currentColor", "stroke-width": 1, ...attrs }));
  }
  function pitchY(pitch, voice) {
    const m = /^([A-G])([#b]*)(-?\d+)$/.exec(pitch);
    const diat =
      (+m[3] + (voice.displayOctave || 0)) * 7 + { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }[m[1]];
    const bottom = { treble: 30, bass: 18, alto: 24, tenor: 22 }[voice.clef];
    return 53 - (diat - bottom) * 4;
  }
  function accidental(pitch, key, state) {
    const m = /^([A-G])([#b]*)(-?\d+)$/.exec(pitch);
    const actual = [...m[2]].reduce((a, c) => a + (c === "#" ? 1 : -1), 0);
    const defaults = {};
    for (const c of (key > 0 ? "FCGDAEB" : "BEADGCF").slice(0, Math.abs(key)))
      defaults[c] = key > 0 ? 1 : -1;
    const id = m[1] + m[3];
    const previous = state[id] ?? defaults[m[1]] ?? 0;
    state[id] = actual;
    if (previous === actual) return "";
    return actual === 0 ? "♮" : actual === 1 ? "♯" : actual === -1 ? "♭" : actual === 2 ? "𝄪" : "𝄫";
  }
  function rhythm(duration, ppq) {
    const q = duration / ppq;
    let base = q,
      dot = false;
    for (const v of [4, 2, 1, 0.5, 0.25, 0.125, 0.0625])
      if (Math.abs(q - v * 1.5) < 1e-6) {
        base = v;
        dot = true;
        break;
      }
    const standard = [4, 2, 1, 0.5, 0.25, 0.125, 0.0625].some((v) => Math.abs(v - base) < 1e-6);
    if (!standard) base = Math.min(4, 2 ** Math.ceil(Math.log2(q)));
    return { base, dot, standard };
  }
  // Canvas for lyric widths, created on first use so the module also loads without a DOM.
  let lyricCanvas = null;
  const lyricContext = () => (lyricCanvas ??= document.createElement("canvas").getContext("2d"));
  function measureSpacing(
    measure,
    { showClef = true, showMeter = false, compact = false, lyricSize = 12, chordVoices = [] } = {},
  ) {
    const times = [
      ...new Set([
        0,
        measure.length,
        ...Object.values(measure.voices).flatMap((ns) => ns.map((n) => n.at)),
      ]),
    ].sort((a, b) => a - b);
    const events = Object.values(measure.voices).flat();
    const lyricMeasure = lyricContext();
    lyricMeasure.font = `${lyricSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
    const half = times.map((t) =>
      Math.max(
        0,
        ...events
          .filter((n) => n.at === t && n.lyric)
          .map((n) => lyricMeasure.measureText(n.lyric).width / 2),
      ),
    );
    const chordAt = chordEvents(chordVoices, measure),
      accState = {},
      extents = new Map();
    for (const t of times) {
      const chord = chordAt.filter((n) => n.at === t),
        geometry = chordGeometry(chord),
        lanes = [];
      let left = 8,
        right = 8;
      for (const n of chord) {
        const y = pitchY(n.pitch, { clef: "treble" }),
          acc = accidental(n.pitch, 0, accState);
        right = Math.max(right, geometry.get(n) + 12);
        if (acc) {
          let lane = 0;
          while (lanes[lane]?.some((a) => Math.abs(a - y) < 22)) lane++;
          (lanes[lane] ??= []).push(y);
          left = Math.max(left, 18 + lane * 9);
        }
      }
      extents.set(t, { left, right });
    }
    const inset = Math.max(
      showClef ? (showMeter ? 73 : 47) : showMeter ? 38 : 22,
      half[0] + 6,
      (extents.get(0)?.left || 0) + 3,
    );
    const gaps = times
      .slice(1)
      .map((t, i) =>
        Math.max(
          25,
          half[i] + half[i + 1] + 7,
          (extents.get(times[i])?.right || 0) + (extents.get(t)?.left || 0) + 3,
        ),
      );
    const rightPad = 18;
    return {
      times,
      gaps,
      inset,
      rightPad,
      minWidth: inset + gaps.reduce((a, b) => a + b, 0) + rightPad,
    };
  }
  function fermataY(n, voice, stemUp) {
    const y = n.pitch === null ? 37 : pitchY(n.pitch, voice);
    return Math.min(13, y - ((stemUp ?? y >= 37) ? 35 : 13));
  }
  function drawStaff(voice, measure, events, ppq, width, onSelect, color, options = {}) {
    const displayVoice = {
      ...voice,
      clef: options.clef || voice.clef,
      displayOctave: options.displayOctave ?? voice.displayOctave,
    };
    const rangeEvents = options.rangeEvents || events;
    const ys = (
      options.rangePitches || rangeEvents.filter((n) => n.pitch !== null).map((n) => n.pitch)
    ).map((p) => pitchY(p, displayVoice));
    const stemBounds = ys.map((y) => {
      const up = options.stemUp ?? y >= 37;
      return [y - (options.combined || up ? 28 : 6), y + (options.combined || !up ? 28 : 6)];
    });
    const fermataTop = rangeEvents
      .filter((n) => n.fermata)
      .map((n) => fermataY(n, displayVoice, options.combined ? true : options.stemUp) - 11);
    const top = Math.min(
      options.dense ? 3 : 0,
      ...(options.dense ? stemBounds.map((b) => b[0]) : ys.map((y) => y - 29)),
      ...fermataTop,
    );
    const noteBottom = Math.max(
      displayVoice.clef === "treble" ? (displayVoice.displayOctave ? 73 : 66) : 58,
      ...stemBounds.map((b) => b[1]),
    );
    const lyricY = Math.max(options.dense ? 68 : 79, noteBottom + (options.dense ? 10 : 15));
    const lyricRows = options.lyricRows || 1;
    const contentBottom = options.collapseLyrics
      ? noteBottom + 3
      : lyricY + (lyricRows - 1) * (options.lyricSize || 12) * 1.15 + 3;
    const beatY = contentBottom + 13;
    const height = (options.dense ? contentBottom + 4 : beatY + 5) - top;
    const svg = el("svg", {
      viewBox: `0 ${top} ${width} ${height}`,
      style: `height:${options.renderWidth ? (height * options.renderWidth) / width : height}px`,
      role: "group",
      "aria-label": `${voice.name}, Takt ${measure.number}`,
    });
    svg.classList.add("staff");
    const showClef = options.showClef !== false,
      showMeter = options.showMeter ?? !options.compact;
    const spacing = options.spacing || measureSpacing(measure, { ...options, showClef, showMeter });
    const { inset } = spacing,
      right = width - spacing.rightPad,
      barX = options.connected ? width - 0.5 : right + 8,
      usable = right - inset;
    const extra = Math.max(0, width - spacing.minWidth);
    let base = inset;
    const timeMap = spacing.times.map((t, i) => {
      if (i) base += spacing.gaps[i - 1];
      return [t, base + (extra * t) / measure.length];
    });
    const xFor = (t) => {
      const i = timeMap.findIndex((p) => p[0] >= t);
      if (i <= 0) return inset;
      const [a, b] = [timeMap[i - 1], timeMap[i]];
      return a[1] + ((t - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
    };
    svg.dataset.timeMap = JSON.stringify(timeMap);
    for (let i = 0; i < 5; i++)
      line(
        svg,
        options.connected ? 0 : options.compact ? 3 : 7,
        21 + i * 8,
        options.connected ? width : right + 8,
        21 + i * 8,
        { stroke: "#b8bec9", "stroke-width": 0.85, class: "staff-line" },
      );
    const clef =
      displayVoice.clef === "bass"
        ? "bass"
        : ["alto", "tenor"].includes(displayVoice.clef)
          ? "c"
          : "treble";
    const clefY = { treble: 45, bass: 29, alto: 37, tenor: 29 }[displayVoice.clef];
    if (showClef)
      svg.append(
        el("path", {
          d: CLEFS[clef],
          transform: `translate(9 ${clefY}) scale(0.032 -0.032)`,
          fill: "#41495a",
          class: "clef-glyph",
        }),
      );
    if (!(measure.barlines || []).some((b) => b.at === measure.length))
      line(svg, barX, 21, barX, 53, { stroke: "#667184" });
    if (showClef && displayVoice.displayOctave)
      svg.append(
        el(
          "text",
          { x: 21, y: displayVoice.displayOctave > 0 ? 68 : 8, "font-size": 11, fill: "#626c7d" },
          Math.abs(displayVoice.displayOctave) === 1 ? "8" : "15",
        ),
      );
    // Key is announced in text; explicit accidentals on every altered note keep imported keys
    // unambiguous.
    if (showMeter) {
      const x = showClef ? 52 : 16;
      const meter = el("g", {
        class: "meter-sign",
        "aria-label": `${measure.meter[0]}/${measure.meter[1]}-Takt`,
      });
      meter.append(
        el(
          "text",
          {
            x,
            y: 31,
            "font-size": 15,
            "font-weight": 650,
            "text-anchor": "middle",
            fill: "#41495a",
          },
          String(measure.meter[0]),
        ),
        el(
          "text",
          {
            x,
            y: 47,
            "font-size": 15,
            "font-weight": 650,
            "text-anchor": "middle",
            fill: "#41495a",
          },
          String(measure.meter[1]),
        ),
      );
      svg.append(meter);
    }

    const cursor = el("line", {
      x1: inset,
      y1: top + 5,
      x2: inset,
      y2: lyricY - 8,
      stroke: color,
      "stroke-width": 2,
      opacity: 0,
      class: "playhead",
    });
    svg.append(cursor);
    if (!options.dense)
      for (let beat = 0; beat < measure.length / ppq; beat++) {
        const x = xFor(beat * ppq);
        svg.append(
          el(
            "text",
            {
              x,
              y: beatY,
              "font-size": 10,
              fill: "#87909d",
              "text-anchor": "middle",
              class: "beat-number",
            },
            String(beat + 1),
          ),
        );
      }
    const accState = {};
    events.forEach((n, i) => {
      if (options.suppressRests && n.pitch === null) return;
      const x = xFor(n.at) + (options.offsetFor?.(n) || 0),
        y = n.pitch === null ? 37 : pitchY(n.pitch, displayVoice),
        r = rhythm(n.duration, ppq);
      const g = el("g", {
        class: `score-note${n.confidence === "uncertain" ? " uncertain" : ""}`,
        tabindex: 0,
        role: "button",
        "aria-label": `${options.voiceNames ? voice.name + ": " : ""}${noteName(n.pitch)}, ${n.duration / ppq} Viertel${n.lyric ? ", " + n.lyric : ""}${n.fermata ? ", Fermate" : ""}${n.comment ? ". " + n.comment : ""}`,
        "data-note-id": `${measure.index}:${voice.id}:${i}`,
        "data-at": measure.start + n.at,
        "data-end": measure.start + n.at + n.duration,
        "data-voice": voice.id,
        style: `--voice:${color};color:${options.voiceColors ? color : "#252f42"}`,
      });
      const title = el(
        "title",
        {},
        [
          options.voiceNames ? voice.name : null,
          noteName(n.pitch),
          n.lyric,
          n.fermata ? "Fermate" : null,
          n.comment,
        ]
          .filter(Boolean)
          .join(" · "),
      );
      g.append(title);
      const h = xFor(n.at + n.duration) - xFor(n.at);
      g.append(
        el("rect", {
          x: xFor(n.at) - 13,
          y: top + 3,
          width: h,
          height: contentBottom - top + 3,
          rx: 6,
          fill: "none",
          "pointer-events": options.combined ? "none" : "all",
          class: "hit",
        }),
      );
      if (n.pitch === null) {
        if (r.base >= 2)
          g.append(
            el("rect", {
              x: x - 5,
              y: r.base >= 4 ? 29 : 33,
              width: 10,
              height: 4,
              fill: "currentColor",
            }),
          );
        else if (r.base >= 1)
          g.append(
            el("path", {
              d: `M${x - 3} 24 l6 7 -5 7 5 5 -3 6 -2 -5 -4 -4 5 -6 -5 -7 z`,
              fill: "currentColor",
            }),
          );
        else {
          const flags = Math.max(1, Math.round(Math.log2(1 / r.base)));
          for (let f = 0; f < Math.min(4, flags); f++) {
            g.append(el("circle", { cx: x - 2, cy: 30 + f * 6, r: 2.7, fill: "currentColor" }));
            line(g, x + 4, 26 + f * 6, x - 2, 49, {
              stroke: "currentColor",
              "stroke-width": 1.5,
            });
          }
        }
      } else {
        for (let ly = 61; ly <= y + 1; ly += 8)
          line(g, x - 9, ly, x + 9, ly, { stroke: "#636d7d" });
        for (let ly = 13; ly >= y - 1; ly -= 8)
          line(g, x - 9, ly, x + 9, ly, { stroke: "#636d7d" });
        // Show all chromatic alterations, including key-signature tones, because no key glyphs are
        // drawn.
        const acc = accidental(n.pitch, 0, accState);
        if (acc)
          g.append(
            el("path", {
              d: CLEFS[acc],
              transform: `translate(${x - 16 - (options.accidentalShiftFor?.(n) || 0)} ${y}) scale(0.032 -0.032)`,
              fill: "currentColor",
            }),
          );
        g.append(
          el("ellipse", {
            cx: x,
            cy: y,
            rx: r.base >= 4 ? 6 : 5.3,
            ry: 3.6,
            transform: `rotate(-18 ${x} ${y})`,
            fill: r.base >= 2 ? "white" : "currentColor",
            stroke: "currentColor",
            "stroke-width": 1.5,
            class: "notehead",
          }),
        );
        if (r.base < 4) {
          const up = options.stemUp ?? y >= 37,
            sx = x + (up ? 4.5 : -4.5),
            sy = y + (up ? -25 : 25);
          line(g, sx, y, sx, sy, { "stroke-width": 1.3 });
          if (r.base < 1) {
            const flags = Math.max(1, Math.round(Math.log2(1 / r.base)));
            for (let f = 0; f < Math.min(flags, 4); f++) {
              const fy = sy + (up ? f * 5 : -f * 5);
              g.append(
                el("path", {
                  d: up
                    ? `M${sx} ${fy} q13 8 3 16 q5 -8 -3 -11`
                    : `M${sx} ${fy} q-13 -8 -3 -16 q-5 8 3 11`,
                  fill: "currentColor",
                }),
              );
            }
          }
        }
        if (n.tie) {
          const end = Math.min(right, xFor(n.at + n.duration));
          g.append(
            el("path", {
              d: `M${x + 4} ${y + 9} Q${(x + end) / 2} ${y + 21} ${end - 4} ${y + 9}`,
              stroke: "currentColor",
              fill: "none",
              "stroke-width": 1.2,
            }),
          );
        }
      }
      if (r.dot) g.append(el("circle", { cx: x + 9, cy: y - 3, r: 1.6, fill: "currentColor" }));
      if (!r.standard)
        g.append(
          el(
            "text",
            { x, y: 9, "text-anchor": "middle", "font-size": 10 },
            `${Number((n.duration / ppq).toFixed(3))} ♩`,
          ),
        );
      if (n.fermata) {
        const fy = fermataY(n, displayVoice, options.stemUp),
          fx = xFor(n.at);
        const mark = el("g", {
          class: "fermata",
          "data-at": n.at,
          "data-top": fy,
          "aria-label": "Fermate",
        });
        mark.append(
          el("path", {
            d: `M${fx - 7} ${fy} Q${fx} ${fy - 14} ${fx + 7} ${fy}`,
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 1.7,
            "stroke-linecap": "round",
          }),
          el("circle", { cx: fx, cy: fy - 2.5, r: 1.7, fill: "currentColor" }),
        );
        g.append(mark);
      }
      if (n.lyric && !options.hideLyrics)
        g.append(
          el(
            "text",
            {
              x: xFor(n.at),
              y: lyricY + (options.lyricLane || 0) * (options.lyricSize || 12) * 1.15,
              "font-size": options.lyricSize || 12,
              "text-anchor": "middle",
              class: "lyric",
            },
            n.lyric,
          ),
        );
      if (n.confidence === "uncertain")
        g.append(el("circle", { cx: x + 10, cy: y - 12, r: 3, fill: "#d08d20" }));
      const select = () => onSelect(measure.start + n.at, n, voice, measure);
      g.addEventListener("click", select);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          select();
        }
      });
      svg.append(g);
    });
    if (!events.length && !options.hideEmpty)
      svg.append(
        el(
          "text",
          {
            x: (inset + right) / 2,
            y: 40,
            "text-anchor": "middle",
            fill: "#98a1ad",
            "font-size": 13,
          },
          "Pause",
        ),
      );
    for (const b of measure.barlines || []) {
      const x = b.at === measure.length ? barX : b.at === 0 ? inset - 11 : xFor(b.at) - 18;
      const mark = el("g", {
        class: "barline-mark",
        "data-kind": b.kind,
        "aria-label":
          b.kind === "repeatStart"
            ? "Wiederholungsbeginn"
            : b.kind === "repeatEnd"
              ? "Wiederholungsende"
              : "Doppelter Taktstrich",
      });
      if (b.kind === "repeatStart") {
        line(mark, x - 4, 21, x - 4, 53, { "stroke-width": 3 });
        line(mark, x, 21, x, 53, { "stroke-width": 1 });
        for (const y of [33, 41])
          mark.append(el("circle", { cx: x + 5, cy: y, r: 1.7, fill: "currentColor" }));
      } else {
        line(mark, x - 5, 21, x - 5, 53, { "stroke-width": 1 });
        line(mark, x, 21, x, 53, { "stroke-width": b.kind === "double" ? 1 : 3 });
        if (b.kind === "repeatEnd")
          for (const y of [33, 41])
            mark.append(el("circle", { cx: x - 10, cy: y, r: 1.7, fill: "currentColor" }));
      }
      svg.append(mark);
    }
    svg.addEventListener("click", (e) => {
      if (e.target.closest(".score-note")) return;
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * width;
      const i = timeMap.findIndex((p) => p[1] >= px);
      const a = timeMap[Math.max(0, i - 1)],
        b = timeMap[i < 0 ? timeMap.length - 1 : Math.max(0, i)];
      const t =
        i < 0
          ? measure.length - 1
          : Math.max(
              0,
              Math.min(
                measure.length - 1,
                a[0] + (b[1] === a[1] ? 0 : ((px - a[1]) / (b[1] - a[1])) * (b[0] - a[0])),
              ),
            );
      onSelect(measure.start + Math.round(t / (ppq / 4)) * (ppq / 4), null, voice, measure);
    });
    svg.dataset.inset = inset;
    svg.dataset.usable = usable;
    return svg;
  }

  function chordEvents(voices, measure) {
    const merged = new Map();
    for (const v of voices)
      for (const [index, n] of (measure.voices[v.id] || []).entries()) {
        if (n.pitch === null) continue;
        const key = `${n.at}:${midi(n.pitch)}`,
          source = { voice: v, note: n, index };
        if (merged.has(key)) {
          const e = merged.get(key);
          e.sources.push(source);
          e.duration = Math.max(e.duration, n.duration);
          e.fermata = e.fermata || n.fermata;
        } else merged.set(key, { ...n, sources: [source] });
      }
    return [...merged.values()].sort((a, b) => a.at - b.at || midi(b.pitch) - midi(a.pitch));
  }
  function chordGeometry(chord) {
    const placed = [],
      offsets = new Map();
    for (const n of [...chord].sort(
      (a, b) => pitchY(a.pitch, { clef: "treble" }) - pitchY(b.pitch, { clef: "treble" }),
    )) {
      const y = pitchY(n.pitch, { clef: "treble" });
      let x = 0;
      while (placed.some((p) => Math.abs(p.y - y) < 8 && Math.abs(p.x - x) < 11)) x += 12;
      placed.push({ x, y });
      offsets.set(n, x);
    }
    return offsets;
  }
  function chordClef(events) {
    const pitches = events.filter((n) => n.pitch !== null).map((n) => n.pitch);
    const cost = (clef) =>
      pitches.reduce((sum, p) => {
        const y = pitchY(p, { clef });
        return sum + Math.max(0, 21 - y, y - 53) ** 2;
      }, 0);
    return cost("bass") < cost("treble") ? "bass" : "treble";
  }
  function drawCombinedStaff(voices, measure, ppq, width, onSelect, colorFor, options = {}) {
    const events = chordEvents(voices, measure),
      clef = options.chordClef || chordClef(options.rangeEvents || events);
    const voice = { id: "combined", name: "Übrige Stimmen", clef, displayOctave: 0 };
    const svg = drawStaff(voice, measure, [], ppq, width, onSelect, "#697589", {
      ...options,
      clef,
      displayOctave: 0,
      combined: true,
      rangeEvents: options.rangeEvents || events,
      hideLyrics: true,
      collapseLyrics: true,
      hideEmpty: true,
    });
    svg.classList.add("combined-staff");
    svg.setAttribute(
      "aria-label",
      `Übrige Stimmen als Akkorde, Takt ${measure.number}: ${voices.map((v) => v.name).join(", ")}`,
    );
    const map = JSON.parse(svg.dataset.timeMap),
      xFor = (t) => {
        const i = map.findIndex((p) => p[0] >= t);
        if (i <= 0) return map[0][1];
        const a = map[i - 1],
          b = map[i];
        return a[1] + ((t - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
      };
    const accState = {};
    for (const at of [...new Set(events.map((n) => n.at))]) {
      const chord = events.filter((n) => n.at === at),
        geometry = chordGeometry(chord),
        durations = [...new Set(chord.map((n) => n.duration))].sort((a, b) => a - b);
      const chordRoot = el("g", { class: "chord", "data-at": measure.start + at });
      svg.append(chordRoot);
      const accidentalYs = [];
      for (const [rhythmIndex, duration] of durations.entries()) {
        const notes = chord
          .filter((n) => n.duration === duration)
          .sort((a, b) => pitchY(a.pitch, voice) - pitchY(b.pitch, voice));
        const r = rhythm(duration, ppq),
          up = rhythmIndex % 2 === 0,
          stemX = xFor(at) + (up ? 4.5 : -4.5) + (up ? 1 : -1) * Math.floor(rhythmIndex / 2) * 3;
        const high = pitchY(notes[0].pitch, voice),
          low = pitchY(notes.at(-1).pitch, voice),
          stemEnd = up ? high - 25 : low + 25;
        // Different rhythms share attack positions, with opposing stems instead of empty columns.
        if (r.base < 4) {
          line(chordRoot, stemX, up ? low : high, stemX, stemEnd, {
            stroke: "#6b7484",
            "stroke-width": 1.3,
            class: "chord-stem",
          });
          if (r.base < 1)
            for (let f = 0; f < Math.min(4, Math.round(Math.log2(1 / r.base))); f++) {
              const y = stemEnd + (up ? f * 5 : -f * 5);
              chordRoot.append(
                el("path", {
                  d: up
                    ? `M${stemX} ${y} q13 8 3 16 q5 -8 -3 -11`
                    : `M${stemX} ${y} q-13 -8 -3 -16 q-5 8 3 11`,
                  fill: "#6b7484",
                }),
              );
            }
        }
        for (const n of notes) {
          const y = pitchY(n.pitch, voice),
            displaced = geometry.get(n) > 0;
          const x = xFor(at) + geometry.get(n),
            source = n.sources[0],
            color = colorFor(source.voice.id);
          const names = n.sources
            .map((e) => measure.voiceLabels?.[e.voice.id] || e.voice.name)
            .join(", ");
          const g = el("g", {
            class: "score-note chord-note",
            role: "button",
            tabindex: 0,
            "data-at": measure.start + n.at,
            "data-end": measure.start + n.at + n.duration,
            "data-note-id": `${measure.index}:${source.voice.id}:${source.index}`,
            "data-voice": source.voice.id,
            "data-voices": n.sources.map((e) => e.voice.id).join(" "),
            "data-cue-ids": n.sources
              .map((e) => `${measure.index}:${e.voice.id}:${e.index}`)
              .join(" "),
            "data-pitch": n.pitch,
            "data-duration": n.duration,
            "aria-label": `${names}: ${noteName(n.pitch)}, ${n.duration / ppq} Viertel${n.fermata ? ", Fermate" : ""}`,
            style: `--voice:${color};color:${color}`,
          });
          g.append(
            el("title", {}, `${names} · ${noteName(n.pitch)} · ${n.duration / ppq} Viertel`),
          );
          g.append(
            el("rect", {
              x: xFor(at) - 8,
              y: y - 7,
              width: Math.max(10, xFor(Math.min(measure.length, at + n.duration)) - xFor(at)),
              height: 14,
              rx: 4,
              fill: "none",
              class: "hit",
              "pointer-events": "none",
            }),
          );
          for (let ly = 61; ly <= y + 1; ly += 8)
            line(g, x - 8, ly, x + 8, ly, { stroke: "#8c94a2" });
          for (let ly = 13; ly >= y - 1; ly -= 8)
            line(g, x - 8, ly, x + 8, ly, { stroke: "#8c94a2" });
          const acc = accidental(n.pitch, 0, accState);
          if (acc) {
            let lane = 0;
            while (accidentalYs[lane]?.some((ay) => Math.abs(ay - y) < 22)) lane++;
            (accidentalYs[lane] ??= []).push(y);
            g.append(
              el("path", {
                d: CLEFS[acc],
                transform: `translate(${xFor(at) - 18 - lane * 9} ${y}) scale(0.032 -0.032)`,
                fill: "currentColor",
                class: "accidental",
              }),
            );
          }
          g.append(
            el("ellipse", {
              cx: x,
              cy: y,
              rx: r.base >= 4 ? 6 : 5.3,
              ry: 3.6,
              transform: `rotate(-18 ${x} ${y})`,
              fill: r.base >= 2 ? "white" : "currentColor",
              stroke: "currentColor",
              "stroke-width": 1.5,
              class: "notehead",
            }),
          );
          if (r.base < 4 && (displaced || rhythmIndex >= 2))
            line(g, stemX, y, x, y, { "stroke-width": 1.2 });
          if (r.dot)
            g.append(
              el("circle", {
                cx: x + 9,
                cy: y % 8 === 5 ? y - 4 : y,
                r: 1.6,
                fill: "currentColor",
              }),
            );
          if (n.sources.some((e) => e.note.tie)) {
            const end = xFor(Math.min(measure.length, at + n.duration));
            g.append(
              el("path", {
                d: `M${x + 4} ${y + 8} Q${(x + end) / 2} ${y + 19} ${end - 4} ${y + 8}`,
                stroke: "currentColor",
                fill: "none",
                "stroke-width": 1.1,
              }),
            );
          }
          const select = () => onSelect(measure.start + n.at, source.note, source.voice, measure);
          g.addEventListener("click", select);
          g.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              select();
            }
          });
          chordRoot.append(g);
        }
      }
      if (chord.some((n) => n.fermata)) {
        const fx = xFor(at),
          fy = Math.min(13, ...chord.map((n) => pitchY(n.pitch, voice) - 35));
        const mark = el("g", { class: "fermata", "aria-label": "Fermate" });
        mark.append(
          el("path", {
            d: `M${fx - 7} ${fy} Q${fx} ${fy - 14} ${fx + 7} ${fy}`,
            fill: "none",
            stroke: "#566174",
            "stroke-width": 1.7,
          }),
          el("circle", { cx: fx, cy: fy - 2.5, r: 1.7, fill: "#566174" }),
        );
        chordRoot.append(mark);
      }
    }
    if (!events.length)
      svg.append(
        el(
          "text",
          {
            x: (map[0][1] + width - 18) / 2,
            y: 40,
            "text-anchor": "middle",
            fill: "#929bab",
            "font-size": 11,
          },
          "Pause",
        ),
      );
    return svg;
  }

  return { COLORS, drawStaff, drawCombinedStaff, measureSpacing, chordEvents, chordClef };
})();
