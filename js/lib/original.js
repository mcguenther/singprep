"use strict";
// Originalseiten: Validierung des optionalen layout-Felds und Darstellung der Fotos mit
// anklickbaren Taktbereichen.
Chorprobe.original = (function () {
  // Original pages and musical measures are separate: a measure can span pages.
  function regionRange(region, length) {
    return [region.fromTick ?? 0, region.toTick ?? length];
  }
  function validateLayout(layout, score) {
    if (layout === undefined) return;
    const fail = (m) => {
      throw new Error(`Originalansicht: ${m}`);
    };
    const keys = (v, allowed) => {
      if (!v || typeof v !== "object" || Array.isArray(v)) fail("Objekt erwartet.");
      for (const k of Object.keys(v)) if (!allowed.includes(k)) fail(`Unbekanntes Feld „${k}“.`);
    };
    keys(layout, ["pages"]);
    if (!Array.isArray(layout.pages) || !layout.pages.length || layout.pages.length > 20)
      fail("1 bis 20 Seiten erwartet.");
    const pages = new Set(),
      coverage = new Map(),
      measures = new Map(score.measures.map((m) => [m.id, m]));
    for (const p of layout.pages) {
      keys(p, ["id", "label", "image", "width", "height", "measures"]);
      if (typeof p.id !== "string" || !p.id || pages.has(p.id))
        fail("Jede Seite braucht eine eindeutige ID.");
      pages.add(p.id);
      if (typeof p.label !== "string" || p.label.length > 100) fail("Ungültiger Seitentitel.");
      if (
        !Number.isInteger(p.width) ||
        !Number.isInteger(p.height) ||
        p.width < 1 ||
        p.height < 1 ||
        p.width > 20000 ||
        p.height > 20000
      )
        fail("Ungültige Seitengröße.");
      if (
        typeof p.image !== "string" ||
        !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(p.image) ||
        p.image.length > 7000000
      )
        fail("Seitenbilder müssen als JPEG, PNG oder WebP eingebettet sein.");
      if (!Array.isArray(p.measures) || !p.measures.length)
        fail("Anklickbare Taktbereiche fehlen.");
      for (const r of p.measures) {
        keys(r, ["id", "box", "anchors", "fromTick", "toTick"]);
        const m = measures.get(r.id);
        if (!m) fail(`Unbekannter Takt ${r.id}.`);
        const len = m.lengthTicks ?? (score.ppq * m.meter[0] * 4) / m.meter[1],
          [from, to] = regionRange(r, len);
        if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to > len || to <= from)
          fail(`Ungültiger Taktabschnitt in ${r.id}.`);
        const ranges = coverage.get(r.id) || [];
        ranges.push([from, to]);
        coverage.set(r.id, ranges);
        if (!Array.isArray(r.box) || r.box.length !== 4 || !r.box.every(Number.isFinite))
          fail("box muss [x, y, Breite, Höhe] enthalten.");
        const [x, y, w, h] = r.box;
        if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > p.width || y + h > p.height)
          fail(`Takt ${r.id} liegt außerhalb der Seite.`);
        if (r.anchors !== undefined) {
          if (!Array.isArray(r.anchors) || r.anchors.length < 2 || r.anchors.length > 300)
            fail("Mindestens zwei Positionsanker erwartet.");
          let tick = -1,
            px = -1;
          for (const a of r.anchors) {
            if (
              !Array.isArray(a) ||
              a.length !== 2 ||
              !Number.isInteger(a[0]) ||
              !Number.isFinite(a[1]) ||
              a[0] <= tick ||
              a[0] < from ||
              a[0] > to ||
              a[1] < x ||
              a[1] > x + w ||
              a[1] <= px
            )
              fail(`Ungültige Positionsanker in ${r.id}.`);
            [tick, px] = a;
          }
          if (r.anchors[0][0] !== from || r.anchors.at(-1)[0] !== to)
            fail("Positionsanker müssen den dargestellten Taktabschnitt abdecken.");
        }
      }
    }
    for (const m of score.measures) {
      const len = m.lengthTicks ?? (score.ppq * m.meter[0] * 4) / m.meter[1];
      let end = 0;
      for (const [a, b] of (coverage.get(m.id) || []).sort((a, b) => a[0] - b[0])) {
        if (a !== end) fail(`Takt ${m.id}: Bereiche überlappen oder lassen eine Lücke.`);
        end = b;
      }
      if (end !== len) fail(`Takt ${m.id} ist nicht vollständig auf den Originalseiten abgedeckt.`);
    }
  }
  function originalX(region, localTick, length) {
    const [from, to] = regionRange(region, length),
      points = region.anchors ?? [
        [from, region.box[0]],
        [to, region.box[0] + region.box[2]],
      ];
    const t = Math.max(from, Math.min(to, localTick));
    const next = points.findIndex((p) => p[0] >= t);
    if (next <= 0) return points[0][1];
    const [a, b] = [points[next - 1], points[next]];
    return a[1] + ((t - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
  }
  function drawOriginalPages(container, compiled, section, onSelect) {
    const ns = "http://www.w3.org/2000/svg";
    container.replaceChildren();
    const available = new Map(
      compiled.measures
        .filter((m) => section === "all" || m.section === section)
        .map((m) => [m.id, m]),
    );
    for (const page of compiled.score.layout.pages) {
      const regions = page.measures.filter((r) => available.has(r.id));
      if (!regions.length) continue;
      const card = document.createElement("article");
      card.className = "original-page";
      const caption = document.createElement("div");
      caption.className = "original-caption";
      caption.textContent = page.label;
      card.append(caption);
      const sheet = document.createElement("div");
      sheet.className = "original-sheet";
      sheet.style.aspectRatio = `${page.width} / ${page.height}`;
      const img = document.createElement("img");
      img.src = page.image;
      img.alt = `${compiled.score.title}, ${page.label}`;
      img.width = page.width;
      img.height = page.height;
      img.draggable = false;
      sheet.append(img);
      const overlay = document.createElementNS(ns, "svg");
      overlay.setAttribute("viewBox", `0 0 ${page.width} ${page.height}`);
      overlay.setAttribute("aria-hidden", "true");
      overlay.classList.add("original-overlay");
      for (const region of regions) {
        const m = available.get(region.id),
          [from, to] = regionRange(region, m.length),
          b = document.createElement("button");
        b.type = "button";
        b.className = "original-measure";
        b.id = `measure-${m.index}${from ? `-part-${from}` : ""}`;
        b.dataset.index = m.index;
        b.dataset.from = from;
        b.dataset.to = to;
        const [x, y, w, h] = region.box;
        b.style.left = `${(100 * x) / page.width}%`;
        b.style.top = `${(100 * y) / page.height}%`;
        b.style.width = `${(100 * w) / page.width}%`;
        b.style.height = `${(100 * h) / page.height}%`;
        const label = `Takt ${m.number}${from ? `, Fortsetzung ab Zählzeit ${1 + from / compiled.score.ppq}` : ""}: hier beginnen`;
        b.setAttribute("aria-label", label);
        b.title = label;
        b.onclick = () => onSelect(m.start + from, null, null, m);
        const badge = document.createElement("span");
        badge.className = "original-takt-label";
        badge.textContent = m.number + (from ? " ↪" : "");
        b.append(badge);
        sheet.append(b);
        const line = document.createElementNS(ns, "line");
        line.setAttribute("y1", y);
        line.setAttribute("y2", y + h);
        line.setAttribute("stroke", "#6c4be2");
        line.setAttribute("stroke-width", "2.4");
        line.setAttribute("vector-effect", "non-scaling-stroke");
        line.setAttribute("opacity", "0");
        line.dataset.index = m.index;
        line.dataset.from = from;
        line.dataset.to = to;
        line.classList.add("original-playhead");
        overlay.append(line);
      }
      sheet.append(overlay);
      card.append(sheet);
      container.append(card);
    }
  }
  function paintOriginal(compiled, measure, tick, ended) {
    document
      .querySelectorAll(".original-measure.current")
      .forEach((e) => e.classList.remove("current"));
    document.querySelectorAll(".original-playhead").forEach((e) => e.setAttribute("opacity", "0"));
    const local = Math.max(0, Math.min(measure.length - 0.001, tick - measure.start));
    const active = (element) =>
      +element.dataset.index === measure.index &&
      local >= +element.dataset.from &&
      local < +element.dataset.to;
    const button = [...document.querySelectorAll(".original-measure")].find(active);
    button?.classList.add("current");
    if (ended) return;
    for (const p of compiled.score.layout.pages) {
      const r = p.measures.find((r) => {
        const [a, b] = regionRange(r, measure.length);
        return r.id === measure.id && local >= a && local < b;
      });
      if (!r) continue;
      const x = originalX(r, local, measure.length),
        line = [...document.querySelectorAll(".original-playhead")].find(active);
      if (line) {
        line.setAttribute("x1", x);
        line.setAttribute("x2", x);
        line.setAttribute("opacity", "0.85");
      }
      break;
    }
  }

  return { regionRange, validateLayout, originalX, drawOriginalPages, paintOriginal };
})();
