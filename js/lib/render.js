"use strict";
// SVG-Notensatz der Übeansicht: Einzelstimmen und Sammelzeile, Strophentexte, Dynamik und
// Vortragsangaben.
Chorprobe.render = (function () {
  const { noteName, midi, lyricFor, lyricTexts } = Chorprobe.score;
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
  // Accessible name and tooltip of a note; the syllable is that of the given verse.
  function noteLabel(voice, n, ppq, verseIndex = 0, voiceNames = false) {
    const lyric = lyricFor(n, verseIndex);
    return `${voiceNames ? voice.name + ": " : ""}${noteName(n.pitch)}, ${n.duration / ppq} Viertel${lyric ? ", " + lyric : ""}${n.fermata ? ", Fermate" : ""}${n.comment ? ". " + n.comment : ""}`;
  }
  function noteTitle(voice, n, verseIndex = 0, voiceNames = false) {
    return [
      voiceNames ? voice.name : null,
      noteName(n.pitch),
      lyricFor(n, verseIndex),
      n.fermata ? "Fermate" : null,
      n.comment,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  function measureSpacing(
    measure,
    {
      showClef = true,
      showMeter = false,
      compact = false,
      lyricSize = 12,
      chordVoices = [],
      verseLabels = false,
      boldLyrics = false,
    } = {},
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
    // With verses, the highlighted (bolder) verse must fit as well.
    lyricMeasure.font = `${boldLyrics ? "650 " : ""}${lyricSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
    const half = times.map((t) =>
      Math.max(
        0,
        ...events
          .filter((n) => n.at === t)
          .flatMap(lyricTexts)
          .map((text) => lyricMeasure.measureText(text).width / 2),
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
      half[0] + (verseLabels && showClef ? 17 : 6),
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
  // Ties and slurs are filled outlines that taper towards their ends, as in engraved scores.
  // The centre line is a cubic Bezier p0–c1–c2–p3; `dir` is -1 for above, 1 for below the notes.
  // An open end (a slur piece continuing into the neighbouring bar) keeps the full thickness, so
  // the pieces of adjacent bars join at the barline.
  const CURVE_THICKNESS = 2.2;
  function curvePath({ p0, c1, c2, p3, dir, openStart = false, openEnd = false }) {
    const half = (dir * CURVE_THICKNESS) / 2,
      shift = (p, d) => [p[0], p[1] + d],
      f = (p) => `${+p[0].toFixed(2)} ${+p[1].toFixed(2)}`;
    const outer = [openStart ? shift(p0, half) : p0, shift(c1, half), shift(c2, half)],
      inner = [openStart ? shift(p0, -half) : p0, shift(c1, -half), shift(c2, -half)],
      end = [openEnd ? shift(p3, half) : p3, openEnd ? shift(p3, -half) : p3];
    return (
      `M${f(outer[0])} C${f(outer[1])} ${f(outer[2])} ${f(end[0])} ` +
      `L${f(end[1])} C${f(inner[2])} ${f(inner[1])} ${f(inner[0])} Z`
    );
  }
  // Symmetric arc between two points whose middle lies `height` away from the chord.
  function arcCurve(p0, p3, height, dir) {
    const c = (dir * height * 4) / 3,
      at = (t) => [p0[0] + (p3[0] - p0[0]) * t, p0[1] + (p3[1] - p0[1]) * t + c];
    return { p0, c1: at(0.25), c2: at(0.75), p3, dir };
  }
  function bezierPoint({ p0, c1, c2, p3 }, t) {
    const u = 1 - t,
      k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    return [0, 1].map((i) => k[0] * p0[i] + k[1] * c1[i] + k[2] * c2[i] + k[3] * p3[i]);
  }
  // Largest distance by which the curve's inner edge lies on the wrong side of an obstacle
  // point (x, y), with the x position as a fraction of the curve's width.
  function curveDeficit(curve, obstacles) {
    const samples = Array.from({ length: 33 }, (_, i) => bezierPoint(curve, i / 32));
    let worst = { amount: 0, t: 0.5 };
    for (const [x, y] of obstacles) {
      const i = samples.findIndex((p) => p[0] >= x);
      if (i <= 0) continue;
      const [a, b] = [samples[i - 1], samples[i]],
        cy = a[1] + ((x - a[0]) / (b[0] - a[0] || 1)) * (b[1] - a[1]),
        amount = CURVE_THICKNESS / 2 + 0.5 - curve.dir * (cy - y);
      if (amount > worst.amount)
        worst = { amount, t: (x - curve.p0[0]) / (curve.p3[0] - curve.p0[0] || 1) };
    }
    return worst;
  }
  // One piece of a slur within a bar. `from`/`to` are attachment points [x, y] next to the first
  // and last notehead (or stem end); null means the slur enters at `left` (height `levels[0]`)
  // or continues past `right` (height `levels[1]`); the neighbouring bar uses the same height at
  // that barline. `obstacles` are points of inner notes that the curve must clear. `limit` is the
  // outermost usable y (top or bottom of the reserved space).
  function slurPiece({ from, to, left, right, levels = [], dir, obstacles = [], limit }) {
    const x0 = from ? from[0] : left,
      x3 = to ? to[0] : right,
      w = Math.max(1, x3 - x0),
      [levelIn, levelOut] = levels;
    let p0 = from || [left, levelIn],
      p3 = to || [right, levelOut],
      height = Math.min(9, Math.max(3.5, 2.5 + w * 0.06));
    const build = () => {
      if (from && to) return arcCurve(p0, p3, height, dir);
      if (!from && !to)
        return { p0, c1: [x0 + w / 3, levelIn], c2: [x0 + (2 * w) / 3, levelOut], p3, dir };
      // Half piece: leaves the notehead and flattens out towards the barline, or the reverse.
      return from
        ? { p0, c1: [x0 + w * 0.3, levelOut], c2: [x0 + w * 0.65, levelOut], p3, dir }
        : { p0, c1: [x3 - w * 0.65, levelIn], c2: [x3 - w * 0.3, levelIn], p3, dir };
    };
    let curve = build();
    for (let round = 0; round < 4; round++) {
      const { amount, t } = curveDeficit(curve, obstacles);
      if (amount <= 0.01) break;
      if (from && to) {
        // Rounder first (up to a height of 12), then move the whole slur away from the notes.
        const k = Math.max(0.35, 4 * t * (1 - t)),
          grow = Math.min(12 - height, amount / k),
          rest = amount - grow * k;
        height += grow;
        if (rest > 0.01) {
          p0 = [p0[0], p0[1] + dir * rest];
          p3 = [p3[0], p3[1] + dir * rest];
        }
      } else if (from) p0 = [p0[0], p0[1] + (dir * amount) / Math.max(0.3, 1 - t)];
      else if (to) p3 = [p3[0], p3[1] + (dir * amount) / Math.max(0.3, t)];
      else break;
      curve = build();
    }
    // Stay inside the reserved space: flatten towards the limit instead of leaving the staff box.
    if (limit !== undefined)
      for (const key of ["p0", "c1", "c2", "p3"])
        if (dir * curve[key][1] + CURVE_THICKNESS / 2 > dir * limit)
          curve[key] = [curve[key][0], limit - (dir * CURVE_THICKNESS) / 2];
    return { ...curve, openStart: !from, openEnd: !to };
  }
  // Height of a slur where it crosses the barline at `tick`: an arc over the whole slur in tick
  // space (bars have different widths), kept clear of the notes on both sides of the barline.
  // `heights` are the attachment heights of `notes`. Both bars compute the same value.
  function slurLevel(notes, heights, dir, tick) {
    const s0 = notes[0].start,
      span = Math.max(1, notes.at(-1).start - s0),
      frac = (t) => Math.min(1, Math.max(0, (t - s0) / span)),
      base = (t) => heights[0] + (heights.at(-1) - heights[0]) * t,
      bulge = (t) => 4 * t * (1 - t);
    let height = 7;
    notes.forEach((n, i) => {
      const t = frac(n.start);
      if (bulge(t) > 0.3) height = Math.max(height, (dir * (heights[i] - base(t)) + 3) / bulge(t));
    });
    height = Math.min(height, 14);
    let level = base(frac(tick)) + dir * height * bulge(frac(tick));
    const before = notes.findLast((n) => n.start < tick),
      after = notes.find((n) => n.start >= tick);
    for (const n of [before, after]) {
      const clear = n && heights[notes.indexOf(n)] + dir * 3;
      if (n && dir * (clear - level) > 0) level = clear;
    }
    return level;
  }
  // Lowest possible start of the lyric line for a clef: a slur below the notes must end above it
  // in every system, so all pieces of a slur choose the same side.
  function lyricTop(voice, dense, lyricSize = 12) {
    const base = voice.clef === "treble" ? (voice.displayOctave ? 73 : 66) : 58;
    return Math.max(dense ? 68 : 79, base + (dense ? 10 : 15)) - lyricSize * 0.8;
  }
  // Side of a slur, as usual on the side of the noteheads opposite the stems: below only if every
  // stem points up, no tie runs below and the curve stays clear of the lyrics; otherwise above.
  function slurSide(notes, voice, { stemUp, dense = false, lyricSize = 12 } = {}) {
    const ys = notes.filter((n) => n.pitch !== null).map((n) => [n, pitchY(n.pitch, voice)]);
    if (!ys.length) return -1;
    const below =
      ys.every(([, y]) => stemUp ?? y >= 37) &&
      !ys.some(([n]) => n.tie) &&
      Math.max(...ys.map(([, y]) => y)) + 5.5 + 8 <= lyricTop(voice, dense, lyricSize);
    return below ? 1 : -1;
  }
  // Where a slur meets a note: next to the notehead, or at the stem end if the stem points to the
  // slur's side (mixed stems with the slur above).
  function slurAttach(n, x, voice, dir, { stemUp, ppq }) {
    if (n.pitch === null) return [x, dir < 0 ? 22 : 52];
    const y = pitchY(n.pitch, voice),
      up = stemUp ?? y >= 37,
      stem = rhythm(n.duration, ppq).base < 4;
    if (dir < 0 && up && stem) return [x + 4.5, y - 27.5];
    return [x, y + dir * 5.5];
  }
  // Notes of this row that lie under a slur, from the slur marks in the row's events: a slur may
  // begin before or end after the row. Used to reserve space above the staff for every bar.
  function slurRowSpans(events) {
    const spans = [];
    let current = null,
      seen = false;
    for (const n of events) {
      if (n.slur === "start") current = [];
      else if (n.slur === "end" && !seen && !current)
        current = [...events.slice(0, events.indexOf(n))];
      if (n.slur) seen = true;
      current?.push(n);
      if (n.slur === "end" && current) {
        spans.push(current);
        current = null;
      }
    }
    if (current) spans.push(current);
    return spans;
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
    const noteTops = options.dense ? stemBounds.map((b) => b[0]) : ys.map((y) => y - 29);
    // Room for slurs above the notes, from the whole row so that every bar has the same height.
    const slurOptions = {
      stemUp: options.stemUp,
      dense: options.dense,
      lyricSize: options.lyricSize || 12,
      ppq,
    };
    const slurTops = options.combined
      ? []
      : slurRowSpans(rangeEvents).flatMap((span) =>
          slurSide(span, displayVoice, slurOptions) < 0
            ? span.map((n) => slurAttach(n, 0, displayVoice, -1, slurOptions)[1] - 10)
            : [],
        );
    let top = Math.min(options.dense ? 3 : 0, ...noteTops, ...fermataTop, ...slurTops);
    // Choir staves carry dynamics above the staff (lyrics are below), directions above those.
    // The reserve flags are set per system row, so all bars of a row keep the same height.
    const markTop = Math.min(19, ...noteTops, ...fermataTop, ...slurTops),
      dynamicY = markTop - 3,
      directionY = options.reserveDynamics ? dynamicY - 16 : markTop - 3;
    if (options.reserveDynamics) top = Math.min(top, dynamicY - 12);
    if (options.reserveDirections) top = Math.min(top, directionY - 12);
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
    const lyricSize = options.lyricSize || 12,
      verseCount = options.verseCount || 0,
      currentVerse = options.verseIndex ?? 0,
      stacked = (options.lyricRows || 1) > 1,
      laneY = (lane) => lyricY + ((options.lyricLane || 0) + lane) * lyricSize * 1.15;
    // Verse texts: stacked as in print, or all on one lane (only the current one visible via CSS).
    // A plain string applies to every verse and is repeated in each stacked line.
    const verseText = (text, x, verse) =>
      el(
        "text",
        {
          x,
          y: laneY(stacked && verse !== "all" ? verse : 0),
          "font-size": lyricSize,
          "text-anchor": "middle",
          class: `lyric verse-lyric${verse === "all" || verse === currentVerse ? " current-verse" : ""}`,
          "data-verse": verse,
        },
        text,
      );
    function lyricElements(n, x) {
      if (!verseCount)
        return n.lyric
          ? [
              el(
                "text",
                {
                  x,
                  y: laneY(0),
                  "font-size": lyricSize,
                  "text-anchor": "middle",
                  class: "lyric",
                },
                n.lyric,
              ),
            ]
          : [];
      if (Array.isArray(n.lyric))
        return n.lyric.flatMap((text, k) => (text ? [verseText(text, x, k)] : []));
      if (!n.lyric) return [];
      return stacked
        ? Array.from({ length: verseCount }, (_, k) => verseText(n.lyric, x, k))
        : [verseText(n.lyric, x, "all")];
    }
    if (verseCount && options.verseLabels && showClef && !options.hideLyrics)
      for (let k = 0; k < verseCount; k++)
        svg.append(
          el(
            "text",
            {
              x: 3,
              y: laneY(stacked ? k : 0),
              "font-size": lyricSize - 1,
              class: `verse-number${k === currentVerse ? " current-verse" : ""}`,
              "data-verse": k,
            },
            `${k + 1}.`,
          ),
        );
    drawMarks(svg, measure, options.dynamics || [], options.directions || [], {
      xFor,
      width,
      right,
      dynamicY,
      directionY,
      showClef,
      connected: options.connected,
    });
    const accState = {},
      accidentalAt = new Set();
    events.forEach((n, i) => {
      if (options.suppressRests && n.pitch === null) return;
      const x = xFor(n.at) + (options.offsetFor?.(n) || 0),
        y = n.pitch === null ? 37 : pitchY(n.pitch, displayVoice),
        r = rhythm(n.duration, ppq);
      const g = el("g", {
        class: `score-note${n.confidence === "uncertain" ? " uncertain" : ""}`,
        tabindex: 0,
        role: "button",
        "aria-label": noteLabel(voice, n, ppq, currentVerse, options.voiceNames),
        "data-note-id": `${measure.index}:${voice.id}:${i}`,
        "data-at": measure.start + n.at,
        "data-end": measure.start + n.at + n.duration,
        "data-voice": voice.id,
        style: `--voice:${color};color:${options.voiceColors ? color : "#252f42"}`,
      });
      if (options.voiceNames) g.dataset.voiceNames = "1";
      g.append(el("title", {}, noteTitle(voice, n, currentVerse, options.voiceNames)));
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
        if (acc) accidentalAt.add(n.at);
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
              d: curvePath(arcCurve([x + 4, y + 9], [end - 4, y + 9], 5.5, 1)),
              fill: "currentColor",
              class: "tie",
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
      if (!options.hideLyrics) for (const text of lyricElements(n, xFor(n.at))) g.append(text);
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
    // Slurs: one piece per bar. A slur that begins or ends in another bar runs to or from the
    // barline at a common height, so the pieces of a system join up.
    for (const slur of options.combined ? [] : measure.slurs?.[voice.id] || []) {
      const dir = slurSide(slur.notes, displayVoice, slurOptions),
        attach = (n, x = xFor(n.at)) => slurAttach(n, x, displayVoice, dir, slurOptions),
        heights = slur.notes.map((n) => attach(n, 0)[1]),
        here = slur.notes.filter((n) => n.measureIndex === measure.index),
        first = slur.notes[0],
        last = slur.notes.at(-1);
      const obstacles = [
        ...here.filter((n) => n !== first && n !== last).map((n) => attach(n)),
        ...here
          .filter((n) => n !== first && n.pitch !== null && accidentalAt.has(n.at))
          .map((n) => [xFor(n.at) - 13, pitchY(n.pitch, displayVoice) + dir * 11.5]),
      ];
      const piece = slurPiece({
        from: first.measureIndex === measure.index ? attach(first) : null,
        to: last.measureIndex === measure.index ? attach(last) : null,
        // After the clef (and time signature) of a new system, or at the barline.
        left: showClef
          ? Math.max(inset - 18, showMeter ? 62 : 36)
          : options.connected
            ? 0
            : inset - 12,
        right: options.connected ? width : right + 8,
        levels: [measure.start, measure.end].map((t) => slurLevel(slur.notes, heights, dir, t)),
        dir,
        obstacles,
        limit: dir < 0 ? top + 0.5 : lyricY - lyricSize * 0.8,
      });
      svg.append(
        el("path", {
          d: curvePath(piece),
          class: "slur",
          fill: "currentColor",
          stroke: "currentColor",
          "stroke-width": 0.3,
          "stroke-linejoin": "round",
          "pointer-events": "none",
          "aria-hidden": "true",
          style: `color:${options.voiceColors ? color : "#252f42"}`,
          "data-slur": `${first.id}-${last.id}`,
        }),
      );
    }
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

  // Dynamics (serif bold italic, hairpins as wedges) and directions of one bar. Marks are relative
  // to the bar; a hairpin may begin before (at < 0) or end after the bar and is drawn in parts.
  function drawMarks(svg, measure, dynamics, directions, geo) {
    const { xFor, width, right, dynamicY, directionY, showClef, connected } = geo;
    for (const d of directions)
      svg.append(
        el(
          "text",
          {
            x: d.at === 0 ? (showClef ? 6 : 4) : xFor(d.at) - 4,
            y: directionY,
            "font-size": 12.5,
            "font-weight": 700,
            class: "direction-text",
          },
          d.text,
        ),
      );
    const onsets = new Set(dynamics.filter((d) => !d.hairpin).map((d) => d.at));
    for (const d of dynamics) {
      const g = el("g", {
        class: `dynamic${d.verses ? " verse-only" : ""}`,
        "data-mark": d.mark,
        "aria-hidden": "true",
      });
      if (d.verses) g.dataset.dynamicVerses = d.verses.join(" ");
      if (d.hairpin) {
        const from = Math.max(0, d.at),
          to = Math.min(measure.length, d.end),
          span = d.end - d.at,
          open = (t) => 4.5 * (d.mark === "cresc" ? (t - d.at) / span : 1 - (t - d.at) / span);
        const x1 =
            d.at < 0 ? (connected ? 0 : xFor(0) - 8) : xFor(from) + (onsets.has(d.at) ? 12 : 0),
          x2 =
            d.end > measure.length
              ? connected
                ? width
                : right + 8
              : xFor(to) - (onsets.has(d.end) ? 10 : 0),
          y = dynamicY - 4;
        if (x2 - x1 < 2) continue;
        for (const sign of [-1, 1])
          line(g, x1, y + sign * open(from), x2, y + sign * open(to), {
            "stroke-width": 1.2,
            "stroke-linecap": "round",
          });
      } else {
        const text = el(
          "text",
          {
            x: xFor(d.at),
            y: dynamicY,
            "font-size": 14,
            "text-anchor": "middle",
            class: "dynamic-mark",
          },
          d.mark,
        );
        if (d.label) {
          const small = el("tspan", { class: "dynamic-verses", "font-size": 9 }, ` ${d.label}`);
          text.append(small);
        }
        g.append(text);
      }
      svg.append(g);
    }
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
                d: curvePath(arcCurve([x + 4, y + 8], [end - 4, y + 8], 5.5, 1)),
                fill: "currentColor",
                class: "tie",
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

  return {
    COLORS,
    drawStaff,
    drawCombinedStaff,
    measureSpacing,
    chordEvents,
    chordClef,
    noteLabel,
    noteTitle,
    curvePath,
    slurPiece,
    slurLevel,
    slurSide,
    slurRowSpans,
  };
})();
