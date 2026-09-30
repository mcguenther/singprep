import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, readJson } from "./support/load.js";

const Chorprobe = loadChorprobe();
const p = Chorprobe.practice;

describe("practice", () => {
  test("backingGain: Potenzkurve", () => {
    assert.equal(p.backingGain(0), 0);
    assert.ok(Math.abs(p.backingGain(50) - 0.1) < 1e-12);
    assert.equal(p.backingGain(100), 1);
    assert.equal(p.backingGain(150), 1);
    assert.equal(p.backingGain("abc"), 0);
  });
  test("measureColumns", () => {
    assert.equal(p.measureColumns(1500), 6);
    assert.equal(p.measureColumns(1200), 5);
    assert.equal(p.measureColumns(1000), 4);
    assert.equal(p.measureColumns(700), 3);
    assert.equal(p.measureColumns(500), 2);
    assert.equal(p.measureColumns(1500, "2"), 2);
    assert.equal(p.measureColumns(500, "6"), 3);
    assert.equal(p.measureColumns(1500, "6", true), 3);
    assert.equal(p.measureColumns(1500, "0"), 6);
  });
  test("followDelta", () => {
    assert.equal(p.followDelta({ top: 100, bottom: 200 }, 10, 500), 0);
    assert.equal(p.followDelta({ top: 600, bottom: 700 }, 10, 500), 590);
    assert.equal(p.followDelta({ top: -50, bottom: 50 }, 10, 500), -60);
    assert.equal(p.followDelta({ top: 12, bottom: 900 }, 10, 500), 0);
    assert.equal(p.followDelta({ top: 50, bottom: 900 }, 10, 500), 40);
    assert.equal(p.followDelta({ top: 50, bottom: 60 }, 500, 10), 0);
  });
  test("spaceIsPlayback", () => {
    const target = (sel) => ({ closest: (q) => (sel && q.includes(sel) ? {} : null) });
    const ev = (extra = {}) => ({ code: "Space", key: " ", target: target(null), ...extra });
    assert.equal(p.spaceIsPlayback(ev(), false), true);
    assert.equal(p.spaceIsPlayback(ev(), true), false);
    assert.equal(p.spaceIsPlayback(ev({ ctrlKey: true }), false), false);
    assert.equal(p.spaceIsPlayback(ev({ code: "Enter", key: "Enter" }), false), false);
    assert.equal(p.spaceIsPlayback(ev({ target: target("input") }), false), false);
    assert.equal(p.spaceIsPlayback(ev({ target: target("select") }), false), false);
  });

  const s = Chorprobe.score.validateScore(readJson("docs/beispiel.json"));
  const compiled = Chorprobe.score.compileScore(s);
  test("visibleVoiceGroups und displayRows", () => {
    const m = compiled.measures[0];
    const all = p.visibleVoiceGroups(s, m, new Set(["tief"]), "all");
    assert.deepEqual(
      all.separate.map((v) => v.id),
      ["hoch", "tief"],
    );
    assert.deepEqual(all.combined, []);
    const compact = p.visibleVoiceGroups(s, m, new Set(["tief"]), "compact");
    assert.deepEqual(
      compact.separate.map((v) => v.id),
      ["tief"],
    );
    assert.deepEqual(
      compact.combined.map((v) => v.id),
      ["hoch"],
    );
    const rows = p.displayRows(s, compact);
    assert.deepEqual(
      rows.map((r) => [r.kind, r.voices.map((v) => v.id)]),
      [
        ["chord", ["hoch"]],
        ["voice", ["tief"]],
      ],
    );
  });
  test("groupScoreSystems", () => {
    const one = p.groupScoreSystems(compiled.measures, 1, s, new Set(["hoch"]), "all");
    assert.equal(one.length, 2);
    const two = p.groupScoreSystems(compiled.measures, 4, s, new Set(["hoch"]), "selected");
    assert.equal(two.length, 1);
    assert.deepEqual(
      two[0].voices.separate.map((v) => v.id),
      ["hoch"],
    );
  });
  test("compactStaffWidth", () => {
    assert.equal(p.compactStaffWidth(compiled.measures[0], 100), 200);
    assert.equal(p.compactStaffWidth(compiled.measures[0], 320), 320);
  });
});
