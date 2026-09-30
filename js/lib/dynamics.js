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

  // Relative level per sounding event (tied notes are one event), keyed by event id:
  // { level, attack }. level is held after the attack; fp and sfz differ at the onset only.
  function noteLevels(compiled, verseId = null) {
    const result = new Map();
    const ppq = compiled.score.ppq;
    for (const v of compiled.score.voices) {
      const marks = marksFor(compiled, v.id, verseId);
      const events = compiled.events.filter((n) => n.voice === v.id);
      let base = DEFAULT,
        ramp = null,
        i = 0;
      const current = (t) =>
        ramp && t < ramp.end
          ? ramp.from + ((ramp.to - ramp.from) * (t - ramp.start)) / (ramp.end - ramp.start)
          : base;
      const finishRamp = (t) => {
        if (ramp && t >= ramp.end) {
          base = ramp.to;
          ramp = null;
        }
      };
      for (const n of events) {
        let accent = null;
        for (; i < marks.length && marks[i].tick <= n.start; i++) {
          const d = marks[i];
          finishRamp(d.tick);
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
            base = from;
            ramp = { start: d.tick, end, from, to };
          } else if (d.mark === "sfz") {
            if (d.tick === n.start) accent = "sfz";
          } else {
            ramp = null;
            base = d.mark === "fp" ? LEVELS.p : LEVELS[d.mark];
            if (d.mark === "fp") accent = d.tick === n.start ? "fp" : null;
          }
        }
        finishRamp(n.start);
        const level = current(n.start);
        if (accent === "sfz") {
          const loud = clamp(level + 0.25);
          result.set(n.id, { level: loud, attack: loud });
        } else if (accent === "fp") result.set(n.id, { level, attack: LEVELS.f });
        else result.set(n.id, { level, attack: level });
      }
    }
    return result;
  }

  return { LEVELS, MARKS, HAIRPINS, DEFAULT, stepLevel, appliesTo, marksFor, noteLevels };
})();
