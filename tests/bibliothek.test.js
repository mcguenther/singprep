// bibliothek/: Jeder Katalogeintrag mit Datei verweist auf ein gültiges Lied mit freier Lizenz und
// Lizenzvermerk; jede Lieddatei steht im Katalog (siehe CLAUDE.md, „Rechte“).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { loadChorprobe, readJson, root } from "./support/load.js";

const FREI = new Set(["pd", "cc0", "cc-by", "cc-by-sa", "cpdl"]);
const kataloge = existsSync(root + "bibliothek")
  ? readdirSync(root + "bibliothek").filter((f) => /^katalog-.*\.json$/.test(f))
  : [];

describe("bibliothek/", () => {
  for (const name of kataloge)
    test(name, () => {
      const { score } = loadChorprobe();
      const katalog = readJson(`bibliothek/${name}`);
      const dateien = new Set();
      const fehler = [];
      for (const e of katalog) {
        assert.ok(e.id && e.status, `Eintrag ohne id/status: ${JSON.stringify(e).slice(0, 80)}`);
        if (!e.datei) continue;
        dateien.add(e.datei);
        try {
          assert.ok(FREI.has(e.lizenz), `Lizenz ${e.lizenz}`);
          const data = readJson(`bibliothek/${e.datei}`);
          assert.ok(data.source?.copyright, "Lizenzvermerk fehlt");
          score.compileScore(score.validateScore(data));
        } catch (err) {
          fehler.push(`${e.datei}: ${err.message}`);
        }
      }
      assert.deepEqual(fehler, []);
      const ordner = name.replace(/^katalog-|\.json$/g, "");
      if (existsSync(`${root}bibliothek/${ordner}`))
        for (const f of readdirSync(`${root}bibliothek/${ordner}`))
          assert.ok(dateien.has(`${ordner}/${f}`), `${ordner}/${f} fehlt im Katalog`);
    });
});
