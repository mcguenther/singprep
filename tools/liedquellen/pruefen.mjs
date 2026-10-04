// Prüft Lieddateien (chorprobe/v1) mit validateScore/compileScore der App und gibt je Datei eine
// JSON-Zeile mit Kennzahlen aus (Stimmen, Takte, Dauer, Textanteil). Für Importskripte.
// Aufruf: node tools/liedquellen/pruefen.mjs datei.json … (oder eine Liste über stdin mit "-")
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
for (const f of ["js/core.js", "js/lib/original.js", "js/lib/dynamics.js", "js/lib/score.js"])
  runInThisContext(readFileSync(join(root, f), "utf8"), { filename: f });
const { validateScore, compileScore } = globalThis.Chorprobe.score;

let files = process.argv.slice(2);
if (files[0] === "-") files = readFileSync(0, "utf8").split("\n").filter(Boolean);
for (const file of files) {
  const out = { file };
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    const c = compileScore(validateScore(data));
    const notes = c.events.filter((n) => n.midi !== null);
    const withText = notes.filter((n) => n.lyric !== undefined && n.lyric !== null);
    const sounding = new Set(notes.map((n) => n.voice));
    Object.assign(out, {
      ok: true,
      stimmen: data.voices.length,
      klingend: sounding.size,
      takte: data.measures.length,
      strophen: data.verses?.length || 1,
      sekunden: Math.round(((c.total / data.ppq) * 60 * (data.verses?.length || 1)) / data.tempo),
      textanteil: notes.length ? Math.round((withText.length / notes.length) * 100) / 100 : 0,
      stimmenMitText: data.voices.filter((v) => withText.some((n) => n.voice === v.id)).length,
    });
  } catch (e) {
    Object.assign(out, { ok: false, fehler: String(e.message).slice(0, 300) });
  }
  console.log(JSON.stringify(out));
}
