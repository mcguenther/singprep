import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, readJson } from "./support/load.js";

const Chorprobe = loadChorprobe();
const { score: lib, audio, original, render, glyphs } = Chorprobe;

describe("Module laden ohne DOM", () => {
  test("Namensraum", () => {
    for (const name of ["original", "score", "practice", "glyphs", "render", "audio"])
      assert.equal(typeof Chorprobe[name], "object", name);
    assert.ok(Array.isArray(render.COLORS) && render.COLORS.length > 0);
    assert.ok(glyphs.CLEFS.treble.startsWith("M"));
    assert.ok(Object.keys(audio.VOICE_SOUNDS).includes("choir"));
  });
  test("registerScore", () => {
    const before = Chorprobe.scores.length;
    const data = { title: "X" };
    assert.equal(Chorprobe.registerScore(data), data);
    assert.equal(Chorprobe.scores.length, before + 1);
    assert.equal(Chorprobe.scores.at(-1), data);
    Chorprobe.scores.pop();
  });
});

describe("performanceTimeline", () => {
  test("ohne Fermaten linear", () => {
    const c = lib.compileScore(lib.validateScore(readJson("docs/beispiel.json")));
    const t = audio.performanceTimeline(c);
    assert.equal(t.total, 2880);
    assert.equal(t.toPerformed(1000), 1000);
    assert.equal(t.toScore(1000), 1000);
  });
  test("Fermate verlängert um 1,5", () => {
    const s = readJson("docs/beispiel.json");
    s.measures[1].voices.hoch[3].fermata = true; // 960–1440 im zweiten Takt
    const c = lib.compileScore(lib.validateScore(s));
    const t = audio.performanceTimeline(c);
    assert.equal(t.total, 2880 + 240);
    assert.equal(t.toPerformed(2400), 2400);
    assert.equal(t.toPerformed(2880), 3120);
    for (const tick of [0, 1440, 2400, 2500, 2700, 2879])
      assert.ok(Math.abs(t.toScore(t.toPerformed(tick)) - tick) < 1e-9, String(tick));
  });
});

describe("Originalseiten (layout)", () => {
  const png =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const withLayout = () => {
    const s = readJson("docs/beispiel.json");
    s.layout = {
      pages: [
        {
          id: "p1",
          label: "Seite 1",
          image: png,
          width: 400,
          height: 200,
          measures: [
            { id: "a1", box: [0, 0, 200, 100] },
            {
              id: "a2",
              box: [200, 0, 100, 100],
              toTick: 720,
              anchors: [
                [0, 200],
                [720, 300],
              ],
            },
          ],
        },
        {
          id: "p2",
          label: "Seite 2",
          image: png,
          width: 400,
          height: 200,
          measures: [{ id: "a2", box: [0, 0, 100, 100], fromTick: 720 }],
        },
      ],
    };
    return s;
  };
  test("gültiges Layout, Takt über Seitenwechsel", () => {
    const s = lib.validateScore(withLayout());
    assert.equal(s.layout.pages.length, 2);
    const region = s.layout.pages[0].measures[1];
    assert.deepEqual(original.regionRange(region, 1440), [0, 720]);
    assert.equal(original.originalX(region, 360, 1440), 250);
  });
  test("Lücke in der Taktabdeckung wird abgelehnt", () => {
    const s = withLayout();
    s.layout.pages[1].measures[0].fromTick = 960;
    assert.throws(() => lib.validateScore(s), /Originalansicht/);
  });
  test("externe Bild-URL wird abgelehnt", () => {
    const s = withLayout();
    s.layout.pages[0].image = "https://example.org/seite.png";
    assert.throws(() => lib.validateScore(s), /Originalansicht/);
  });
});
