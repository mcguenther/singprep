"use strict";
// Dynamik ohne DOM: Zeichen, relative Pegel und die Lautstärke jeder Note (pro Strophe).
Chorprobe.dynamics = (function () {
  const LEVELS = { pp: 0.3, p: 0.45, mp: 0.6, mf: 0.75, f: 0.9, ff: 1 };
  const MARKS = ["pp", "p", "mp", "mf", "f", "ff", "fp", "sfz"];
  const HAIRPINS = ["cresc", "dim"];
  const DEFAULT = LEVELS.mf;
  const LADDER = Object.values(LEVELS);
  const clamp = (v) => Math.max(LEVELS.pp, Math.min(1, v));

  // One step on the pp…ff ladder from any (also interpolated) level.
  function stepLevel(level, direction) {
    if (direction > 0) return LADDER.find((v) => v > level + 1e-9) ?? level;
    return [...LADDER].reverse().find((v) => v < level - 1e-9) ?? level;
  }
  function targetLevel(mark) {
    return mark === "fp" ? LEVELS.f : LEVELS[mark];
  }

  // Does a dynamic mark apply to this voice in this verse? In sections with shared voices
  // (unison), a mark for the merged voice also applies to the line that is actually stored.
  function appliesTo(d, voiceId, verseId, unison = {}) {
    if (d.verses && (verseId === null || verseId === undefined || !d.verses.includes(verseId)))
      return false;
    if (!d.voices) return true;
    return d.voices.some((id) => id === voiceId || unison[id] === voiceId);
  }

  // Marks of a compiled score for one voice and verse, in time order.
  function marksFor(compiled, voiceId, verseId) {
    return (compiled.dynamics || []).filter((d) => {
      const m = compiled.measures[d.measureIndex];
      const unison = compiled.score.sections.find((s) => s.id === m.section)?.unison || {};
      return appliesTo(d, voiceId, verseId, unison);
    });
  }

  // Level curve of one voice as breakpoints [tick, level]: a mark is a step (two points on the same
  // tick), a hairpin a ramp between two points. Accents (fp, sfz) only affect the note at their tick.
  function levelCurve(compiled, voiceId, verseId = null) {
    const marks = marksFor(compiled, voiceId, verseId),
      ppq = compiled.score.ppq,
      points = [[0, DEFAULT]],
      accents = new Map();
    let base = DEFAULT,
      ramp = null;
    const current = (t) => (ramp && t < ramp.end ? rampLevel(ramp, t) : base);
    // A ramp ends at its end or where a later mark takes over.
    const closeRamp = (t) => {
      if (!ramp) return;
      if (t >= ramp.end) {
        points.push([ramp.end, ramp.to]);
        base = ramp.to;
      } else points.push([t, rampLevel(ramp, t)]);
      ramp = null;
    };
    for (const [i, d] of marks.entries()) {
      if (ramp && d.tick >= ramp.end) closeRamp(d.tick);
      if (HAIRPINS.includes(d.mark)) {
        const from = current(d.tick),
          end = d.tick + d.duration;
        const next = marks.find(
          (x, j) =>
            j > i &&
            x.tick > d.tick &&
            x.tick <= end + ppq &&
            !HAIRPINS.includes(x.mark) &&
            x.mark !== "sfz",
        );
        const to = next ? targetLevel(next.mark) : stepLevel(from, d.mark === "cresc" ? 1 : -1);
        closeRamp(d.tick);
        base = from;
        points.push([d.tick, from]);
        ramp = { start: d.tick, end, from, to };
      } else if (d.mark === "sfz") accents.set(d.tick, "sfz");
      else {
        const level = d.mark === "fp" ? LEVELS.p : LEVELS[d.mark];
        closeRamp(d.tick);
        points.push([d.tick, current(d.tick)], [d.tick, level]);
        base = level;
        if (d.mark === "fp") accents.set(d.tick, "fp");
      }
    }
    closeRamp(Infinity);
    return { points, accents };
  }
  // Hairpins sound even to the ear: the level changes by the same number of dB per tick.
  function rampLevel(r, t) {
    return r.from * (r.to / r.from) ** ((t - r.start) / (r.end - r.start));
  }
  // Level at tick t; on a step the new level applies (the mark sits on that tick).
  function levelAt(points, t) {
    let i = 0;
    while (i + 1 < points.length && points[i + 1][0] <= t) i++;
    const [t0, a] = points[i],
      next = points[i + 1];
    if (!next || next[0] === t0) return a;
    return a * (next[1] / a) ** ((t - t0) / (next[0] - t0));
  }

  // Level arriving at tick t (before a step on t takes effect): the end level of a held note.
  function levelBefore(points, t) {
    const j = points.findIndex(([tick]) => tick >= t);
    if (j < 0) return points.at(-1)[1];
    if (points[j][0] === t || j === 0) return points[j][1];
    return levelAt(points.slice(0, j + 1), t);
  }

  // Relative level per sounding event (tied notes are one event), keyed by event id:
  // { level, attack, curve? }. level applies at the onset; fp and sfz differ at the onset only.
  // curve lists [tick, level] from the start to the end of the note when the level changes while
  // it is held (hairpins, marks during a long note).
  function noteLevels(compiled, verseId = null) {
    const result = new Map();
    for (const v of compiled.score.voices) {
      const { points, accents } = levelCurve(compiled, v.id, verseId);
      for (const n of compiled.events.filter((e) => e.voice === v.id)) {
        const onset = levelAt(points, n.start),
          accent = accents.get(n.start);
        const level = accent === "sfz" ? clamp(onset + 0.25) : onset;
        const inner = points.filter(([t]) => t > n.start && t < n.end),
          scale = level / onset,
          curve = [[n.start, onset], ...inner, [n.end, levelBefore(points, n.end)]]
            .filter((p, i, all) => i === 0 || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1])
            .map(([t, l]) => [t, l * scale]);
        const entry = { level, attack: accent === "fp" ? LEVELS.f : level };
        if (curve.some(([, l]) => Math.abs(l - level) > 1e-6)) entry.curve = curve;
        result.set(n.id, entry);
      }
    }
    return result;
  }

  return {
    LEVELS,
    MARKS,
    HAIRPINS,
    DEFAULT,
    stepLevel,
    appliesTo,
    marksFor,
    levelCurve,
    levelAt,
    noteLevels,
  };
})();
