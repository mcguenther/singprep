// Baut docs/liedquellen/index.html: Quellenübersicht und Hörproben in einer Offline-Datei.
// Die Hörproben laufen in der echten Chorprobe-App (Standalone-Build mit genau diesen Liedern, ohne
// local/scores.js), die per iframe-srcdoc eingebettet und mit openSong() auf das Lied gestellt wird.
// Eingaben: docs/liedquellen/lieder.json (Reihenfolge, Kategorie, Quelle) und lieder/*.json
// (chorprobe/v1), Vorlage tools/liedquellen/vorlage.html.
// Aufruf: node tools/liedquellen/build.mjs
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const list = JSON.parse(read("docs/liedquellen/lieder.json"));

// Bibliotheken wie in tests/support/load.js laden, um jedes Lied zu prüfen und auszuwerten.
for (const f of ["js/core.js", "js/lib/original.js", "js/lib/dynamics.js", "js/lib/score.js"])
  runInThisContext(read(f), { filename: f });
const { validateScore, compileScore, noteName } = globalThis.Chorprobe.score;
const COLORS = ["#6256db", "#cb5d31", "#ad3c72", "#147e91", "#437248", "#856124"];

const songs = list.map((entry) => {
  const data = JSON.parse(read(`docs/liedquellen/lieder/${entry.file}`));
  const compiled = compileScore(validateScore(data));
  return { ...entry, data, compiled };
});

// App bauen: temporäres Wurzelverzeichnis mit den Lieddateien statt der mitgelieferten Lieder.
function buildApp() {
  const tmp = mkdtempSync(join(tmpdir(), "chorprobe-liedquellen-"));
  try {
    for (const d of ["css", "js", "assets", "docs"]) symlinkSync(join(root, d), join(tmp, d));
    mkdirSync(join(tmp, "tools"));
    mkdirSync(join(tmp, "scores"));
    copyFileSync(join(root, "tools/build-standalone.mjs"), join(tmp, "tools/build-standalone.mjs"));
    const tags = songs.map((s) => {
      const name = s.file.replace(/\.json$/, ".js");
      writeFileSync(
        join(tmp, "scores", name),
        `Chorprobe.registerScore(${JSON.stringify(s.data)});\n`,
      );
      return `<script src="scores/${name}"></script>`;
    });
    let html = read("index.html");
    const before = html;
    html = html.replace(/([ \t]*)<script src="scores\/[^"]+"><\/script>\n/, (_, indent) =>
      tags.map((t) => `${indent}${t}\n`).join(""),
    );
    // Das Favicon braucht die eingebettete App nicht.
    html = html.replace(/[ \t]*<link\s+rel="icon"[^>]*>\n?/, "");
    // Private Lieder gehören nie in diese Datei.
    html = html.replace(/[ \t]*<script src="local\/scores\.js"[^>]*><\/script>\n/, "");
    if (html === before || /<script src="(?:scores\/in-einem|local\/)/.test(html))
      throw new Error("Liedeinträge in index.html nicht gefunden.");
    writeFileSync(join(tmp, "index.html"), html);
    execFileSync(
      process.execPath,
      [join(tmp, "tools/build-standalone.mjs"), join(tmp, "app.html")],
      {
        stdio: "inherit",
      },
    );
    return readFileSync(join(tmp, "app.html"), "utf8");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

// Kleine Klangbahn-Grafik: Zeit nach rechts, Tonhöhe nach oben, Farbe je Stimme wie in der App.
function roll(compiled) {
  const notes = compiled.events.filter((n) => n.midi !== null);
  const lo = Math.min(...notes.map((n) => n.midi)) - 1,
    hi = Math.max(...notes.map((n) => n.midi)) + 1;
  const W = 640,
    H = 96,
    x = (t) => (t / compiled.total) * W,
    y = (m) => H - ((m - lo) / (hi - lo)) * H;
  const ids = compiled.score.voices.map((v) => v.id);
  const rects = notes
    .map(
      (n) =>
        `<rect x="${x(n.start).toFixed(1)}" y="${(y(n.midi) - 1.6).toFixed(1)}" width="${Math.max(1.2, x(n.end) - x(n.start) - 0.8).toFixed(1)}" height="3.2" rx="1.2" fill="${COLORS[ids.indexOf(n.voice) % COLORS.length]}"/>`,
    )
    .join("");
  const bars = compiled.measures
    .slice(1)
    .map(
      (m) => `<line x1="${x(m.start).toFixed(1)}" x2="${x(m.start).toFixed(1)}" y1="0" y2="${H}"/>`,
    )
    .join("");
  return `<svg class="roll" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><g class="bars">${bars}</g>${rects}</svg>`;
}

function card(s, index) {
  const { data, compiled } = s;
  const m0 = data.measures.find((m) => !m.lengthTicks) || data.measures[0];
  const seconds = Math.round(
    ((compiled.total / data.ppq) * 60 * (data.verses?.length || 1)) / data.tempo,
  );
  // Stimmen ohne eigene Noten singen in allen Abschnitten mit einer anderen (unison).
  const shared = Object.assign({}, ...data.sections.map((sec) => sec.unison || {}));
  const voices = data.voices
    .map((v, i) => {
      const own = compiled.events.filter((n) => n.voice === v.id && n.midi !== null);
      const ms = own.length ? own : compiled.events.filter((n) => n.voice === shared[v.id]);
      const lo = ms.reduce((a, n) => (n.midi < a.midi ? n : a)),
        hi = ms.reduce((a, n) => (n.midi > a.midi ? n : a));
      const with_ = own.length
        ? ""
        : ` (mit ${data.voices.find((w) => w.id === shared[v.id]).name})`;
      return `<li><span class="dot" style="--c:${COLORS[i % COLORS.length]}"></span>${esc(v.name)}${esc(with_)} <span class="amb">${esc(noteName(lo.pitch))}–${esc(noteName(hi.pitch))}</span></li>`;
    })
    .join("");
  const k = m0.keyFifths;
  const key = k > 0 ? `${k} ♯` : k < 0 ? `${-k} ♭` : "ohne Vorzeichen";
  return `<article class="song" id="lied-${esc(s.file.replace(/\.json$/, ""))}">
  <header>
    <p class="kicker">${esc(s.kategorie)} · ${esc(s.besetzung)}</p>
    <h3>${esc(data.title)}</h3>
    <p class="by">${esc(data.composer || "")}</p>
  </header>
  ${roll(compiled)}
  <dl class="facts">
    <div><dt>Takt · Vorzeichen</dt><dd>${m0.meter.join("/")} · ${key}</dd></div>
    <div><dt>Umfang</dt><dd>${data.measures.length} Takte · ca. ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} min</dd></div>
  </dl>
  <ul class="voices">${voices}</ul>
  <p class="src">${s.quelle}</p>
  <p class="status status-${esc(s.status)}">${esc(s.statusText)}</p>
  <button class="play" type="button" data-song="${index}">Anhören &amp; üben</button>
</article>`;
}

const appHtml = buildApp();
// Als JS-Zeichenkette einbetten; "<" maskieren, damit kein </script> die Seite beendet.
const appLiteral = JSON.stringify(appHtml).replace(/</g, "\\u003c");
let page = read("tools/liedquellen/vorlage.html");
page = page.replace("<!--HOERPROBEN-->", () => songs.map(card).join("\n"));
page = page.replace('"__APP_HTML__"', () => appLiteral);
page = page.replace("__ANZAHL__", String(songs.length));
writeFileSync(join(root, "docs/liedquellen/index.html"), page);
console.log(
  `docs/liedquellen/index.html: ${(Buffer.byteLength(page) / 1024).toFixed(0)} KB, ${songs.length} Hörproben`,
);
