// Baut eine einzelne Offline-HTML-Datei (dist/chorprobe.html) aus index.html:
// Stylesheets und Skripte werden eingebettet, Downloads im Hilfedialog als data:-URIs.
// Fehlt local/scores.js, entfällt das Tag; ist die Datei vorhanden, werden ihre Lieder mit eingebettet.
// Seitenbilder, die Lieder als relativen Pfad angeben (layout.pages[].image), werden zu data:-URIs.
// Aufruf: node tools/build-standalone.mjs [Zieldatei]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2] ?? join(root, "dist", "chorprobe.html");
const read = (path) => readFileSync(join(root, path), "utf8");
const MIME = {
  ".md": "text/markdown;charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain;charset=utf-8",
};

let html = read("index.html");
const replaceOrFail = (pattern, replacer) => {
  const before = html;
  html = html.replace(pattern, replacer);
  if (html === before) throw new Error(`Muster nicht gefunden: ${pattern}`);
};

// Alle Stylesheets in Ladereihenfolge zu einem <style> zusammenfassen (Kaskade bleibt erhalten).
const styles = [];
replaceOrFail(/[ \t]*<link rel="stylesheet" href="([^"]+)"\s*\/?>\n?/g, (_, href) => {
  styles.push(`/* ${href} */\n${read(href)}`);
  return styles.length === 1 ? "<!--STYLES-->\n" : "";
});
html = html.replace("<!--STYLES-->", () => `<style>\n${styles.join("\n")}</style>`);

// Ende des JSON-Werts ab Position i (Klammern zählen, Zeichenketten überspringen).
function jsonEnd(text, i) {
  let depth = 0,
    inString = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === "\\") i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") if (--depth === 0) return i + 1;
  }
  throw new Error("Unvollständiger registerScore-Aufruf.");
}
// Relative Seitenbilder (wie in js/lib/original.js) relativ zu index.html einlesen.
const IMAGE_PATH = /^(?!\/)(?!.*\.\.)[A-Za-z0-9._/-]+\.(?:jpe?g|png|webp)$/;
const IMAGE_MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
let inlinedImages = 0;
function inlinePageImages(code, src) {
  const call = "Chorprobe.registerScore(";
  let out = "",
    from = 0;
  for (let at = code.indexOf(call); at !== -1; at = code.indexOf(call, from)) {
    const start = at + call.length,
      end = jsonEnd(code, start);
    const data = JSON.parse(code.slice(start, end));
    let changed = false;
    for (const page of data.layout?.pages ?? []) {
      if (!IMAGE_PATH.test(page.image ?? "")) continue;
      const file = join(root, page.image);
      if (!existsSync(file)) throw new Error(`${src}: Seitenbild ${page.image} fehlt.`);
      const mime = IMAGE_MIME[extname(page.image).toLowerCase()];
      page.image = `data:${mime};base64,${readFileSync(file).toString("base64")}`;
      changed = true;
      inlinedImages++;
    }
    out += code.slice(from, start) + (changed ? JSON.stringify(data) : code.slice(start, end));
    from = end;
  }
  return out + code.slice(from);
}

// Skripte einbetten. "</script" in Zeichenketten wird maskiert, damit das Tag nicht endet.
const inlineScript = (code) => `<script>\n${code.replace(/<\/(script)/gi, "<\\/$1")}</script>`;
const included = [];
replaceOrFail(/[ \t]*<script src="([^"]+)"[^>]*><\/script>/g, (tag, src) => {
  if (src.startsWith("local/") && !existsSync(join(root, src))) return "";
  included.push(src);
  const code = read(src);
  return inlineScript(/^(?:scores|local)\//.test(src) ? inlinePageImages(code, src) : code);
});

// Downloads im Hilfedialog (docs/, assets/) als data:-URIs einbetten.
replaceOrFail(/href="((?:docs|assets)\/[^"]+)"/g, (_, href) => {
  const mime = MIME[extname(href)] ?? "application/octet-stream";
  return `href="data:${mime};base64,${readFileSync(join(root, href)).toString("base64")}"`;
});

const date = new Date().toISOString().slice(0, 10);
html = html.replace(
  /<!-- Chorprobe\.[^>]*-->/,
  `<!-- Standalone export of Chorprobe, ${date}. Bravura glyph outlines: Steinberg, SIL OFL 1.1; license embedded in Help. -->`,
);
if (/<(?:link rel="stylesheet"|script src=)/.test(html))
  throw new Error("Nicht alle Dateien wurden eingebettet.");

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, html);
console.log(
  `${relative(process.cwd(), target) || target}: ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, ` +
    `${styles.length} Stylesheets, ${included.length} Skripte, ${inlinedImages} Seitenbilder` +
    (included.includes("local/scores.js") ? " (inkl. local/scores.js)" : ""),
);
