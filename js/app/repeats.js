"use strict";
// Notierte Wiederholungszeichen: Paare bilden und je Durchlauf einmal springen (Zustand:
// playedRepeats).
// Pair written repeat signs within the active range. Each pair is taken once per run.
function writtenRepeats() {
  const range = bounds(),
    marks = compiled.measures
      .flatMap((m) =>
        (m.barlines || [])
          .filter((b) => b.kind === "repeatStart" || b.kind === "repeatEnd")
          .map((b) => ({ tick: m.start + b.at, kind: b.kind })),
      )
      .filter((b) => b.tick >= range.start && b.tick <= range.end)
      .sort((a, b) => a.tick - b.tick || (a.kind === "repeatEnd" ? -1 : 1));
  const stack = [],
    pairs = [];
  for (const mark of marks) {
    if (mark.kind === "repeatStart") stack.push(mark.tick);
    else {
      const start = stack.pop() ?? range.start;
      if (start < mark.tick) pairs.push({ start, end: mark.tick, id: `${start}:${mark.tick}` });
    }
  }
  return pairs.sort((a, b) => a.end - b.end);
}
function pendingRepeat(from = cursor) {
  return writtenRepeats().find((r) => !playedRepeats.has(r.id) && r.end > from);
}
function repeatAt(end) {
  return writtenRepeats().find((r) => !playedRepeats.has(r.id) && Math.abs(r.end - end) < 0.01);
}
function resetWrittenRepeats() {
  playedRepeats.clear();
}
