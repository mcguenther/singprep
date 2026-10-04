#!/usr/bin/env python3
"""Ännchen von Tharau, Satz Friedrich Silcher (TTBB), von Hand bzw. per KI aus dem gemeinfreien Scan
übertragen: Silcher, „Volkslieder, gesammelt und für vier Männerstimmen gesetzt“, Laupp, Tübingen
1902, Nr. 7, S. 11–12 (archive.org/details/SilcherVLMstNA1902, Scan-Seiten n24/n25, Public Domain
Mark). Tenöre im Druck im Violinschlüssel, klingen eine Oktave tiefer.

Aufruf: python3 silcher-aennchen-von-tharau.py ZIEL.json
"""
import json
import re
import sys

Q, H, DQ, E = 480, 960, 720, 240
# Je Takt und Stimme: Noten als "Ton:Dauer", r = Pause. Tenöre wie gedruckt (Violinschlüssel).
A1 = {"t1": "C5:dq D5:e C5:q", "t2": "A4:dq Bb4:e A4:q", "b1": "F3:dq F3:e F3:q", "b2": "F3:dq F3:e F3:q"}
A2 = {"t1": "C5:q F5:q F5:q", "t2": "A4:q C5:q C5:q", "b1": "F3:q A3:q A3:q", "b2": "F3:q F3:q F3:q"}
A3 = {"t1": "G5:dq A5:e G5:q", "t2": "E5:dq F5:e E5:q", "b1": "Bb3:dq C4:e Bb3:q", "b2": "C3:dq C3:e C3:q"}
A4 = {"t1": "F5:h r:q", "t2": "C5:h r:q", "b1": "A3:h r:q", "b2": "F3:h r:q"}
A5 = {"t1": "E5:q E5:q E5:q", "t2": "C5:q C5:q C5:q", "b1": "G3:q G3:q G3:q", "b2": "C3:q C3:q C3:q"}
A6 = {"t1": "G5:dq F5:e E5:q", "t2": "D5:dq D5:e C5:q", "b1": "G3:dq G3:e G3:q", "b2": "B2:dq B2:e C3:q"}
A7 = {"t1": "D5:dq E5:e D5:q", "t2": "B4:dq C5:e B4:q", "b1": "G3:dq G3:e F3:q", "b2": "G2:dq G2:e G2:q"}
A8 = {"t1": "C5:h r:q", "t2": "G4:h r:q", "b1": "E3:h r:q", "b2": "C3:h r:q"}
B1 = {"t1": "C5:dq C5:e D5:q", "t2": "G4:dq C5:e B4:q", "b1": "E3:dq E3:e G3:q", "b2": "C3:dq C3:e G2:q"}
B2 = {"t1": "E5:q C5:q D5:q", "t2": "C5:q G4:q B4:q", "b1": "G3:q G3:q G3:q", "b2": "C3:q E3:q G3:q"}
B3 = {"t1": "E5:q E5:q F5:q", "t2": "C5:q C5:q C5:e F5:e", "b1": "G3:q G3:q A3:q", "b2": "C3:q C3:q C3:q"}
B4 = {"t1": "G5:h r:q", "t2": "E5:h r:q", "b1": "Bb3:h r:q", "b2": "C3:h r:q"}
B5 = {"t1": "F5:q G5:q A5:q", "t2": "D5:q E5:q F5:q", "b1": "A3:q G3:q F3:q", "b2": "D3:q D3:q D3:q"}
B6 = {"t1": "Bb5:dq A5:e G5:q", "t2": "D5:dq D5:e D5:q", "b1": "G3:dq A3:e Bb3:q", "b2": "Bb2:dq Bb2:e Bb2:q"}
B7 = {"t1": "F5:q G5:q E5:q", "t2": "C5:q C5:q C5:q", "b1": "A3:q Bb3:q G3:q", "b2": "C3:q C3:q C3:q"}
B8 = {"t1": "F5:h r:q", "t2": "C5:h r:q", "b1": "A3:h r:q", "b2": "F3:h r:q"}
MUSIC = [A1, A2, A3, A4, A5, A6, A7, A8, A1, A2, A3, A4, A5, A6, A7, A8, B1, B2, B3, B4, B5, B6, B7, B8]

# Silben je Takt und Strophe (Schreibweise des Drucks, „Ae“ als Ä).
TEXT = [
    "Änn- chen von|Tha- rau ist,|die mir ge-|fällt,|sie ist mein|Le- ben, mein|Gut und mein|Geld.|"
    "Änn- chen von|Tha- rau hat|wie- der ihr|Herz|auf mich ge-|rich- tet in|Lieb' und in|Schmerz.",
    "Käm' al- les|Wet- ter gleich|auf uns zu|schlahn,|wir sind ge-|sinnt bei ein-|an- der zu|stahn.|"
    "Krank- heit, Ver-|fol- gung, Be-|trüb- niß und|Pein|soll un- srer|Lie- be Ver-|kno- ti- gung|sein.",
    "Recht als ein|Pal- men- baum|ü- ber sich|steigt,|hat ihn erst|Re- gen und|Sturm- wind ge-|beugt,|"
    "so wird die|Lieb' in uns|mäch- tig und|groß|nach man- chen|Lei- den und|trau- ri- gem|Loos.",
    "Wür- dest du|gleich ein- mal|von mir ge-|trennt,|leb- test da,|wo man die|Son- ne kaum|kennt;|"
    "ich will dir|fol- gen durch|Wäl- der und|Meer,|Ei- sen und|Ker- ker und|feind- li- ches|Heer.",
]
SCHLUSS = "Änn- chen von|Tha- rau, mein|Reich- thum, mein|Gut,|du mei- ne|See- le, mein|Fleisch und mein|Blut."
SCHLUSS4 = "Änn- chen von|Tha- rau, mein|Licht, mei- ne|Sonn',|mein Le- ben|schließt sich um|dei- nes her-|um."
VERSES = [t + "|" + (SCHLUSS4 if i == 3 else SCHLUSS) for i, t in enumerate(TEXT)]
DUR = {"q": Q, "h": H, "dq": DQ, "e": E}


def sounding(pitch, vid):
    if vid.startswith("t"):  # Tenor im Violinschlüssel: klingt eine Oktave tiefer
        m = re.fullmatch(r"([A-G][#b]?)(\d)", pitch)
        return f"{m.group(1)}{int(m.group(2)) - 1}"
    return pitch


def build():
    syl = [[m.split() for m in v.split("|")] for v in VERSES]
    measures = []
    for i, music in enumerate(MUSIC):
        voices = {}
        for vid, line in music.items():
            at, evs, k = 0, [], 0
            for tok in line.split():
                p, d = tok.split(":")
                ev = {"at": at, "duration": DUR[d], "pitch": None if p == "r" else sounding(p, vid)}
                # Eine Silbe je Notenkopf in Taktreihenfolge; die zweite Achtel in Tenor II, T. 19, bleibt frei.
                if p != "r" and not (i == 18 and vid == "t2" and at == 1200):
                    words = [syl[v][i][k] for v in range(4)]
                    ev["lyric"] = words[0] if len(set(words)) == 1 else words
                    k += 1
                evs.append(ev)
                at += DUR[d]
            voices[vid] = evs
        m = {"id": f"m{i + 1}", "number": str(i + 1), "section": "a" if i < 8 else "b" if i < 16 else "c",
             "meter": [3, 4], "keyFifths": -1, "voices": voices}
        if i == 0:
            m["directions"] = [{"at": 0, "text": "Mäßig"}]
        measures.append(m)
    measures[-1]["barlines"] = [{"at": 1440, "kind": "final"}]
    for v in range(4):
        assert all(len(syl[v][i]) == sum(1 for t in MUSIC[i]["t1"].split() if not t.startswith("r")) for i in range(24)), v
    return {
        "format": "chorprobe/v1",
        "title": "Ännchen von Tharau (Silcher)",
        "subtitle": "Silchers eigener Satz für Männerchor · Volkslieder für vier Männerstimmen, Nr. 7",
        "composer": "Text: Simon Dach, 1637 · Melodie und Satz: Friedrich Silcher (1789–1860)",
        "tempo": 96,
        "ppq": 480,
        "comment": "Vierstimmiger Männerchor (TTBB). Im Druck stehen beide Tenöre im Violinschlüssel und klingen eine Oktave tiefer; hier oktavierter Violinschlüssel, klingende Tonhöhen. Vier Strophen, die dritte Zeile (Takt 17–24) ist in den Strophen 1–3 gleich. Tempoangabe der Vorlage: „Mäßig“.",
        "source": {
            "description": "Aus dem Scan übertragen (KI-gestützt, jede Stimme gegen das Notenbild gelesen und harmonisch geprüft): Friedrich Silcher, „Volkslieder, gesammelt und für vier Männerstimmen gesetzt“, Neue Ausgabe, H. Laupp, Tübingen 1902, Nr. 7, S. 11–12. Digitalisat: https://archive.org/details/SilcherVLMstNA1902 (Public Domain Mark), Scan-Seiten n24 und n25.",
            "copyright": "Gemeinfrei: Simon Dach (1605–1659), Friedrich Silcher (1789–1860). Übertragung für Chorprobe, gemeinfrei.",
            "edition": "Übepartitur nach dem Druck von 1902; Schreibweise des Liedtexts wie im Druck (z. B. „Reichthum“, „Loos“).",
            "complete": True,
        },
        "voices": [
            {"id": "t1", "name": "Tenor I", "short": "T1", "clef": "treble", "displayOctave": 1},
            {"id": "t2", "name": "Tenor II", "short": "T2", "clef": "treble", "displayOctave": 1},
            {"id": "b1", "name": "Bass I", "short": "B1", "clef": "bass"},
            {"id": "b2", "name": "Bass II", "short": "B2", "clef": "bass"},
        ],
        "verses": [{"id": str(k + 1), "name": f"{k + 1}. Strophe"} for k in range(4)],
        "sections": [{"id": "a", "name": "Zeile 1–2"}, {"id": "b", "name": "Zeile 3–4"}, {"id": "c", "name": "Zeile 5–6"}],
        "measures": measures,
    }


if __name__ == "__main__":
    with open(sys.argv[1], "w", encoding="utf-8") as f:
        json.dump(build(), f, ensure_ascii=False)
    print(sys.argv[1])
