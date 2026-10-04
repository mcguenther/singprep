#!/usr/bin/env python3
"""Import deutschsprachiger Chorstücke des Mutopia Project nach bibliothek/mutopia/.

Holt das Mutopia-Repository (nur .ly-Dateien, sparse) in tools/liedquellen/.cache/, wählt
Chorstücke mit freier Lizenz und deutschem Liedtext aus, wandelt sie mit lilypond2chorprobe.py um,
prüft sie mit pruefen.mjs und schreibt bibliothek/katalog-mutopia.json (auch Fehlschläge mit Grund).

Aufruf: python3 tools/liedquellen/mutopia_import.py [--neu]
"""
import argparse
import datetime
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
REPO = os.path.join(HERE, ".cache", "mutopia", "repo")
ZIEL = os.path.join(ROOT, "bibliothek", "mutopia")
KATALOG = os.path.join(ROOT, "bibliothek", "katalog-mutopia.json")
GIT = "https://github.com/MutopiaProject/MutopiaProject.git"
CHOR = re.compile(r"(?i:choir|chorus|\bvoices\b)|\b[SATB]{2,}\b")
DEUTSCH = re.compile(r"\b(und|nicht|ich|ist|mein|dein|sich|auch|mit|zu|dem|den|der|wie|wir|ihr|Gott|Herr)\b")
NIEDERLAENDISCH = re.compile(r"\b(het|een|niet|ik|van|zijn|mijn|wat|als)\b")
LIZENZ = {"public domain": "pd", "creative commons attribution": "cc-by", "creative commons attribution-sharealike": "cc-by-sa"}

sys.path.insert(0, HERE)
from lilypond2chorprobe import convert  # noqa: E402
from cpdl_import import slug  # noqa: E402


def repo_holen():
    if not os.path.isdir(REPO):
        os.makedirs(os.path.dirname(REPO), exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", "--filter=blob:none", "--sparse", GIT, REPO], check=True)
        subprocess.run(["git", "-C", REPO, "sparse-checkout", "set", "--no-cone", "/ftp/**/*.ly"], check=True)


def kopf(text):
    h = text[text.find("\\header") :]
    return {k: v for k, v in re.findall(r'^\s*(\w+)\s*=\s*"([^"]*)"', h, re.M)}


def lizenz_von(s):
    s = re.sub(r"\s+\d(\.\d)?$", "", (s or "").strip().lower())
    return LIZENZ.get(s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--neu", action="store_true")
    args = ap.parse_args()
    repo_holen()
    heute = datetime.date.today().isoformat()
    os.makedirs(ZIEL, exist_ok=True)
    katalog, pfade = [], {}
    for base, _, files in sorted(os.walk(os.path.join(REPO, "ftp"))):
        for name in sorted(files):
            if not name.endswith(".ly"):
                continue
            pfad = os.path.join(base, name)
            text = open(pfad, encoding="utf-8", errors="replace").read()
            h = kopf(text)
            if "mutopiatitle" not in h and "title" not in h:
                continue  # Teildatei eines mehrteiligen Stücks
            if not CHOR.search(h.get("mutopiainstrument", "")):
                continue
            lied = " ".join(re.findall(r"\\lyricmode\s*\{([^}]*)\}", text))
            woerter = re.findall(r"[A-Za-zÄÖÜäöüß]+", lied)
            deutsch = len(DEUTSCH.findall(lied))
            if deutsch < 10 or deutsch < 0.08 * max(1, len(woerter)) or len(NIEDERLAENDISCH.findall(lied)) > deutsch / 3:
                continue
            rel = os.path.relpath(pfad, REPO)
            nr = re.search(r"-(\d+)\s*$", h.get("footer", ""))
            mid = nr.group(1) if nr else slug(rel)
            lic = lizenz_von(h.get("license") or h.get("copyright"))  # ältere Dateien: Lizenz in copyright
            e = {
                "id": f"mutopia-{mid}",
                "quelle": "Mutopia",
                "nr": int(mid) if mid.isdigit() else None,
                "titel": h.get("title") or h.get("mutopiatitle", ""),
                "komponist": h.get("composer", "").rstrip(", "),
                "bearbeiter": h.get("arranger", ""),
                "dichter": h.get("poet", ""),
                "besetzung": h.get("mutopiainstrument", ""),
                "sprachen": ["German"],
                "vorlage": h.get("source", ""),
                "herausgeber": h.get("maintainer", ""),
                "lizenz": lic,
                "url": f"https://www.mutopiaproject.org/cgibin/piece-info.cgi?id={mid}" if mid.isdigit() else "",
                "ly": rel,
            }
            if not lic:
                e.update(status="fehler", grund=f"Lizenz nicht frei oder fehlt: {h.get('license') or h.get('copyright')}")
                katalog.append(e)
                continue
            datei = f"mutopia/{mid}-{slug(e['titel'])}.json"
            ziel = os.path.join(ROOT, "bibliothek", datei)
            if not os.path.exists(ziel) or args.neu:
                lizenztext = {
                    "pd": "Gemeinfrei (Mutopia: Public Domain).",
                    "cc-by": f"Lizenz: {h.get('license') or h.get('copyright')} (CC BY).",
                    "cc-by-sa": f"Lizenz: {h.get('license') or h.get('copyright')} (CC BY-SA). Diese Datei steht unter derselben Lizenz.",
                }[lic]
                meta = {
                    "subtitle": " · ".join(x for x in (e["besetzung"], f"Mutopia {mid}") if x),
                    "composer": " · ".join(
                        x for x in (e["komponist"], e["bearbeiter"], f"Text: {e['dichter']}" if e["dichter"] else "") if x
                    ),
                    "source": {
                        "description": f"Automatisch umgewandelt aus der LilyPond-Datei {rel} des Mutopia Project ({e['url']}) mit tools/liedquellen/mutopia_import.py. Vorlage der Ausgabe: {e['vorlage'] or 'unbekannt'}. Nicht gegen die Vorlage geprüft.",
                        "copyright": f"Notensatz: {e['herausgeber'] or 'unbekannt'}, Mutopia Project. {lizenztext} Geändert am {heute}: in das Format chorprobe/v1 umgewandelt.",
                        "edition": f"Mutopia Project, Stück {mid}.",
                    },
                }
                try:
                    data = convert(pfad, meta)
                    if len(data["voices"]) < 2:
                        raise ValueError("weniger als zwei Stimmen")
                    with open(ziel, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
                except Exception as ex:  # noqa: BLE001 – Fehlschlag landet im Katalog
                    e.update(status="fehler", grund=f"{type(ex).__name__}: {str(ex)[:200]}")
                    katalog.append(e)
                    continue
            e["datei"] = datei
            pfade[ziel] = e
            katalog.append(e)
    if pfade:
        out = subprocess.run(
            ["node", os.path.join(HERE, "pruefen.mjs"), "-"], input="\n".join(pfade), capture_output=True, text=True, check=True
        ).stdout
        for zeile in out.splitlines():
            r = json.loads(zeile)
            e = pfade[r.pop("file")]
            if r.pop("ok"):
                e.update(r)
                hinweise = [h for h, c in (("wenig oder kein Text", r["textanteil"] < 0.3),) if c]
                e["status"] = "warnung" if hinweise else "ok"
                if hinweise:
                    e["hinweise"] = hinweise
            else:
                e.update(status="fehler", grund=r.get("fehler", ""))
                os.remove(os.path.join(ROOT, "bibliothek", e.pop("datei")))
    katalog.sort(key=lambda e: (e["nr"] is None, e["nr"] or 0, e["id"]))
    with open(KATALOG, "w", encoding="utf-8") as f:
        json.dump(katalog, f, ensure_ascii=False, indent=1)
    zaehl = {}
    for e in katalog:
        zaehl[e["status"]] = zaehl.get(e["status"], 0) + 1
    print(f"{len(katalog)} deutsche Chorstücke:", zaehl)


if __name__ == "__main__":
    main()
