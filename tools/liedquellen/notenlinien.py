#!/usr/bin/env python3
"""Hilfe beim Abschreiben von Notenscans: findet Notensysteme (je 5 Linien) und beschriftet Linien
und Zwischenräume mit Tonnamen, damit eine KI oder ein Mensch Tonhöhen sicher abliest.

Aufruf: python3 notenlinien.py bild.jpg ausgabe.jpg violin,bass [--b-vorzeichen]
Die Schlüsselliste gilt für die gefundenen Systeme von oben nach unten (wird wiederholt).
"""
import sys

from PIL import Image, ImageDraw, ImageFont

TREBLE = ["F5", "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4"]  # oberste Linie bis unterste
BASS = ["A3", "G3", "F3", "E3", "D3", "C3", "B2", "A2", "G2"]


def staff_lines(gray, x0, x1):
    """Notensysteme im senkrechten Streifen x0..x1 als Listen von 5 Linienhöhen."""
    px = gray.load()
    w, h = x1 - x0, gray.size[1]
    dark = [sum(1 for x in range(x0, x1) if px[x, y] < 120) for y in range(h)]
    limit = 0.55 * w
    rows = [y for y in range(h) if dark[y] > limit]
    lines, cur = [], []
    for y in rows:
        if cur and y - cur[-1] > 3:
            lines.append(sum(cur) / len(cur))
            cur = []
        cur.append(y)
    if cur:
        lines.append(sum(cur) / len(cur))
    staves, i = [], 0
    while i + 4 < len(lines):
        group = lines[i : i + 5]
        gaps = [b - a for a, b in zip(group, group[1:])]
        if min(gaps) > 12 and max(gaps) - min(gaps) < 0.3 * min(gaps):
            staves.append(group)
            i += 5
        else:
            i += 1
    return staves


def main():
    src, dst, clefs = sys.argv[1], sys.argv[2], sys.argv[3].split(",")
    img = Image.open(src).convert("RGB")
    gray = img.convert("L")
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    band = 120
    # Streifenweise auswerten, damit leicht schräge Scans trotzdem passen. Jedes gefundene System
    # wird dem nächstgelegenen System des vollständigsten Streifens zugeordnet (für den Schlüssel).
    bands = [(x0, staff_lines(gray, x0, x0 + band)) for x0 in range(0, img.width - band + 1, band)]
    ref = max((st for _, st in bands), key=len, default=[])
    found = len(ref)
    for x0, staves in bands:
        for st in staves:
            k = min(range(len(ref)), key=lambda i: abs(ref[i][2] - st[2]))
            names = TREBLE if clefs[k % len(clefs)].startswith("v") else BASS
            step = (st[-1] - st[0]) / 8
            for j, name in enumerate(names):
                y = st[0] + j * step
                color = (220, 0, 0) if j % 2 == 0 else (0, 90, 220)
                for x in range(x0, x0 + band, 10):
                    d.line([(x, y), (x + 3, y)], fill=color, width=1)
                if x0 % (band * 3) == 0:
                    d.text((x0 + 2, y - 7), name, fill=color, font=font)
    img.save(dst)
    print(f"{dst}: bis zu {found} Systeme je Streifen")


if __name__ == "__main__":
    main()
