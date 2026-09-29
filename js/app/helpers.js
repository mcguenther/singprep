"use strict";
// Kleine DOM- und Partitur-Helfer: $, escText, toast, Abschnittsgrenzen, Taktsuche, Stimmfarben.
const $ = (id) => document.getElementById(id);
const escText = (tag, text, className) => {
  const e = document.createElement(tag);
  e.textContent = text;
  if (className) e.className = className;
  return e;
};
function toast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 5500);
}
function bounds() {
  const ms =
    section === "all" ? compiled.measures : compiled.measures.filter((m) => m.section === section);
  return { start: ms[0].start, end: ms.at(-1).end };
}
function loopStart() {
  const repeat = score.sections.find((s) => s.id === section)?.repeatFrom;
  return repeat
    ? compiled.measures.find((m) => m.id === repeat.measure).start + repeat.tick
    : bounds().start;
}
function measureAt(t) {
  return compiled.measures.find((m) => t >= m.start && t < m.end) || compiled.measures.at(-1);
}
function getVoice(id) {
  return score.voices.find((v) => v.id === id);
}
function color(id) {
  return COLORS[score.voices.findIndex((v) => v.id === id) % COLORS.length];
}
