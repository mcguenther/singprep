#!/usr/bin/env python3
"""Massenimport aus der Choral Public Domain Library (CPDL) nach bibliothek/cpdl/.

Liest den CPDL-Abzug im Internet Archive (Stand 2026-04-20: Seitentexte und Dateiliste mit SHA-1),
wählt Ausgaben aus (Sprache, freie Lizenz, MusicXML, mindestens zwei Stimmen), lädt die Dateien
einzeln aus dem Bildarchiv (Ersatz: Abzug von 2020), wandelt sie mit musicxml2chorprobe.py um,
prüft sie mit tools/liedquellen/pruefen.mjs und schreibt bibliothek/katalog-cpdl.json.

Aufruf: python3 tools/liedquellen/cpdl_import.py [--sprache German] [--grenze N] [--neu]
Benötigt music21 und zstandard (pip install music21 zstandard). Zwischenstände liegen in
tools/liedquellen/.cache/ (gitignored); ein erneuter Lauf lädt nichts doppelt.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, ".cache", "cpdl")
ZIEL = os.path.join(ROOT, "bibliothek", "cpdl")
KATALOG = os.path.join(ROOT, "bibliothek", "katalog-cpdl.json")

IA = "https://archive.org/download/wiki-www.cpdl.org_wiki-20260420/"
DUMP = IA + "www.cpdl.org_wiki-20260420-history.xml.zst"
DATEILISTE = IA + "www.cpdl.org_wiki-20260420-dumpMeta/www.cpdl.org_wiki-20260420-images.txt.zst"
BILDER_2026 = IA + "www.cpdl.org_wiki-20260420-images.7z/images/"
BILDER_2020 = "https://archive.org/download/wiki-cpdlorg_wiki-with-files/cpdlorg_wiki-20201112-wikidump.7z/images%2F"
CPDL_SEITE = "https://www.cpdl.org/wiki/index.php/"
CPDL_LIZENZ = "https://www.cpdl.org/wiki/index.php/ChoralWiki:CPDL"
UA = {"User-Agent": "Mozilla/5.0 (Chorprobe-Import)"}

# Freie Lizenzen, die Weitergabe und Bearbeitung erlauben (siehe CLAUDE.md, „Rechte“).
LIZENZEN = {
    "public domain": "pd",
    "pd": "pd",
    "cc0": "cc0",
    "creative commons zero": "cc0",
    "creative commons attribution": "cc-by",
    "creative commons attribution share alike": "cc-by-sa",
    "cpdl": "cpdl",
}


def lizenz_von(copy):
    key = re.sub(r"\s+\d(\.\d)?$", "", (copy or "").strip().lower())
    return LIZENZEN.get(key)


def laden(url, ziel):
    if not os.path.exists(ziel):
        os.makedirs(os.path.dirname(ziel), exist_ok=True)
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=600) as r:
            daten = r.read()
        with open(ziel + ".tmp", "wb") as f:
            f.write(daten)
        os.replace(ziel + ".tmp", ziel)
    return ziel


def zst_lesen(pfad):
    import zstandard

    return zstandard.ZstdDecompressor(max_window_size=2**31).stream_reader(open(pfad, "rb"), read_size=1 << 20)


# ------------------------------------------------------------------ Seitentexte auswerten
def vorlage(text, name):
    """Parameter der ersten Vorlage {{name|…}} (ohne verschachtelte Vorlagen)."""
    m = re.search(r"\{\{\s*" + re.escape(name) + r"\s*\|([^{}]*)\}\}", text, re.I)
    return [p.strip() for p in m.group(1).split("|")] if m else None


def klartext(s):
    s = re.sub(r"'{2,}", "", s or "")
    s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", s).strip()


def ausgaben(titel, text):
    """Werkdaten und Ausgaben einer Notenseite."""
    sprachen = vorlage(text, "Language") or []
    if sprachen and sprachen[0].isdigit():
        sprachen = sprachen[1:]
    stimmen = vorlage(text, "Voicing") or []
    werk = {
        "werk": titel,
        "titel": klartext((vorlage(text, "Title") or [""])[0]) or re.sub(r"\s*\([^)]*\)\s*$", "", titel),
        "komponist": klartext((vorlage(text, "Composer") or [""])[0]),
        "dichter": klartext((vorlage(text, "Lyricist") or [""])[0]),
        "sprachen": [klartext(s) for s in sprachen if s],
        "stimmenzahl": int(stimmen[0]) if stimmen and stimmen[0].isdigit() else None,
        "besetzung": klartext(stimmen[1]) if len(stimmen) > 1 else "",
        "gattung": [klartext(g) for g in (vorlage(text, "Genre") or [])],
        "instrumente": klartext("|".join(vorlage(text, "Instruments") or [])),
    }
    pub = vorlage(text, "Pub")
    werk["jahr"] = pub[1] if pub and len(pub) > 1 and re.fullmatch(r"\d{4}", pub[1]) else ""
    musik = text.split("==Music files==", 1)[-1].split("==General Information==", 1)[0]
    result = []
    for block in re.split(r"\n\*(?=\{\{)", "\n" + musik):
        nr = re.search(r"\{\{CPDLno\|(\d+)\}\}", block)
        if not nr:
            continue
        dateien = re.findall(r"\[\[Media:\s*([^|\]]+?\.(?:mxl|musicxml|xml))\s*\|", block, re.I)
        editor = vorlage(block, "Editor") or [""]
        noten = vorlage(block, "EdNotes")
        result.append(
            {
                **werk,
                "nr": int(nr.group(1)),
                "dateien": [d.strip() for d in dateien],
                "herausgeber": klartext(editor[0]),
                "datum": editor[1] if len(editor) > 1 else "",
                "copy": (vorlage(block, "Copy") or [""])[0],
                "hinweis": klartext(noten[0]) if noten else "",
            }
        )
    return result


def seiten_lesen(dump):
    """Letzte Fassung jeder Notenseite aus dem Versionsabzug."""
    titel, letzte = None, None
    for _, el in ET.iterparse(zst_lesen(dump), events=("end",)):
        tag = el.tag.rsplit("}", 1)[-1]
        if tag == "title":
            titel = el.text
        elif tag == "revision":
            t = next((c.text for c in el if c.tag.endswith("}text")), None)
            letzte = t or ""
            el.clear()
        elif tag == "page":
            if letzte and re.search(r"\[\[Category:Sheet music\]\]", letzte, re.I):
                yield titel, letzte
            letzte = None
            el.clear()


# ------------------------------------------------------------------ Dateien laden und umwandeln
def slug(s):
    s = unicodedata.normalize("NFKD", s.replace("ß", "ss")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "lied"


def datei_laden(name, sha1):
    """Erst Bildarchiv 2026 (aktuell, SHA-1 geprüft), sonst Abzug 2020."""
    ziel = os.path.join(CACHE, "dateien", name.replace("/", "_"))
    if os.path.exists(ziel):
        return ziel, "vorhanden"
    stand = None
    for basis, quote_name, jahr in (
        (BILDER_2026, name.replace(" ", "_"), "2026"),
        (BILDER_2020, name.replace("_", " "), "2020"),
    ):
        try:
            url = basis + urllib.parse.quote(quote_name)
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                daten = r.read()
        except Exception:
            continue
        kopf = daten.lstrip(b"\xef\xbb\xbf \r\n\t")[:200].lower()
        if len(daten) < 200 or not (daten[:2] == b"PK" or kopf.startswith(b"<?xml") or kopf.startswith(b"<score")):
            continue  # Fehlerseite statt Notendatei
        if jahr == "2026" and sha1 and hashlib.sha1(daten).hexdigest() != sha1:
            continue
        stand = jahr
        os.makedirs(os.path.dirname(ziel), exist_ok=True)
        with open(ziel, "wb") as f:
            f.write(daten)
        return ziel, stand
    return None, "nicht ladbar"


def lizenz_texte(a, heute):
    seite = CPDL_SEITE + urllib.parse.quote(a["werk"].replace(" ", "_"))
    wer = f"{a['herausgeber'] or 'unbekannt'}, Choral Public Domain Library (CPDL #{a['nr']}, {seite})"
    if lizenz_von(a["copy"]) not in ("pd", "cc0"):
        wer = "© " + wer  # Urhebervermerk der Ausgabe (CC- und CPDL-Lizenz verlangen ihn)
    geaendert = f"Geändert am {heute}: in das Format chorprobe/v1 umgewandelt (Chorprobe-Import)."
    art = lizenz_von(a["copy"])
    if art in ("pd", "cc0"):
        return f"Gemeinfrei. Ausgabe: {wer}, dort als „{a['copy']}“ freigegeben."
    if art == "cc-by":
        return f"Ausgabe: {wer}. Lizenz: {a['copy']} (CC BY), Bedingungen siehe CPDL-Seite. {geaendert}"
    if art == "cc-by-sa":
        return (
            f"Ausgabe: {wer}. Lizenz: {a['copy']} (CC BY-SA), Bedingungen siehe CPDL-Seite. {geaendert} "
            "Diese Datei steht unter derselben Lizenz."
        )
    return (
        f"Ausgabe: {wer}. Lizenz: CPDL-Lizenz (ChoralWiki Public Domain License, {CPDL_LIZENZ}). "
        f"{geaendert} Diese Datei darf unter denselben Bedingungen weitergegeben werden."
    )


def umwandeln(aufgabe):
    """Läuft in einem eigenen Prozess (music21 ist langsam)."""
    sys.path.insert(0, HERE)
    from musicxml2chorprobe import convert

    a, pfad, ziel, heute = aufgabe
    meta = {
        "title": a["titel"][:200],
        "subtitle": " · ".join(x for x in (a["besetzung"], f"CPDL #{a['nr']}") if x),
        "composer": " · ".join(
            x for x in (a["komponist"], f"Text: {a['dichter']}" if a["dichter"] else "", f"Ausgabe: {a['herausgeber']}") if x
        ),
        "copyLyrics": "auto",
        "skipDirections": False,
        "source": {
            "description": (
                f"Automatisch umgewandelt aus der MusicXML-Datei „{os.path.basename(pfad)}“ der CPDL-Seite „{a['werk']}“ "
                f"mit tools/liedquellen/cpdl_import.py. Nicht gegen die Vorlage geprüft."
                + (f" Hinweis der Ausgabe: {a['hinweis']}" if a["hinweis"] else "")
            )[:4000],
            "copyright": lizenz_texte(a, heute),
            "edition": f"Ausgabe {a['herausgeber']} ({a['datum']}), CPDL #{a['nr']}.",
        },
    }
    try:
        data = convert(pfad, meta)
        if len(data["voices"]) < 2:
            return a["nr"], {"status": "fehler", "grund": "weniger als zwei Stimmen"}
        with open(ziel, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        return a["nr"], {"status": "umgewandelt"}
    except Exception as e:  # noqa: BLE001 – jeder Fehler landet im Katalog
        return a["nr"], {"status": "fehler", "grund": f"{type(e).__name__}: {str(e)[:200]}"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sprache", default="German")
    ap.add_argument("--grenze", type=int, default=0, help="nur die ersten N Ausgaben (Test)")
    ap.add_argument("--neu", action="store_true", help="vorhandene Lieddateien neu erzeugen")
    args = ap.parse_args()
    heute = datetime.date.today().isoformat()
    os.makedirs(ZIEL, exist_ok=True)

    dump = laden(DUMP, os.path.join(CACHE, "history.xml.zst"))
    liste = laden(DATEILISTE, os.path.join(CACHE, "images.txt.zst"))
    sha = {}
    for zeile in zst_lesen(liste).read().decode("utf-8", "replace").splitlines():
        teile = zeile.split("\t")
        if len(teile) >= 5:
            sha[teile[0]] = teile[4]

    seiten = dict(seiten_lesen(dump))  # Seiten kommen im Abzug mehrfach vor; die letzte gilt
    auswahl, gesehen, nummern = [], 0, set()
    for titel, text in seiten.items():
        for a in ausgaben(titel, text):
            if a["nr"] in nummern:
                continue
            nummern.add(a["nr"])
            gesehen += 1
            if args.sprache not in a["sprachen"] or not lizenz_von(a["copy"]) or not a["dateien"]:
                continue
            if a["stimmenzahl"] is not None and a["stimmenzahl"] < 2:
                continue
            auswahl.append(a)
    auswahl.sort(key=lambda a: a["nr"])
    if args.grenze:
        auswahl = auswahl[: args.grenze]
    print(f"{gesehen} Ausgaben gelesen, {len(auswahl)} ausgewählt", flush=True)

    # Laden (parallel, schonend)
    def holen(a):
        name = a["dateien"][0]
        name = name[:1].upper() + name[1:]  # MediaWiki speichert Dateinamen mit großem Anfangsbuchstaben
        pfad, stand = datei_laden(name, sha.get(name.replace(" ", "_")))
        return a, pfad, stand

    geladen = []
    with ThreadPoolExecutor(6) as pool:
        for k, (a, pfad, stand) in enumerate(pool.map(holen, auswahl), 1):
            a["stand"] = stand
            geladen.append((a, pfad))
            if k % 200 == 0:
                print(f"  geladen {k}/{len(auswahl)}", flush=True)

    # Umwandeln (Prozesse)
    ergebnis = {}
    aufgaben = []
    for a, pfad in geladen:
        a["datei"] = f"cpdl/{a['nr']}-{slug(a['titel'])}.json"
        ziel = os.path.join(ROOT, "bibliothek", a["datei"])
        if not pfad:
            ergebnis[a["nr"]] = {"status": "fehler", "grund": "Datei nicht ladbar"}
        elif os.path.exists(ziel) and not args.neu:
            ergebnis[a["nr"]] = {"status": "umgewandelt"}
        else:
            aufgaben.append((a, pfad, ziel, heute))
    with ProcessPoolExecutor(max(1, (os.cpu_count() or 2))) as pool:
        futures = [pool.submit(umwandeln, t) for t in aufgaben]
        for k, f in enumerate(as_completed(futures), 1):
            nr, res = f.result()
            ergebnis[nr] = res
            if k % 100 == 0:
                print(f"  umgewandelt {k}/{len(aufgaben)}", flush=True)

    # Prüfen mit der App-Validierung
    pfade = [os.path.join(ROOT, "bibliothek", a["datei"]) for a, _ in geladen if ergebnis[a["nr"]]["status"] == "umgewandelt"]
    pruef = {}
    if pfade:
        out = subprocess.run(
            ["node", os.path.join(HERE, "pruefen.mjs"), "-"], input="\n".join(pfade), capture_output=True, text=True, check=True
        ).stdout
        for zeile in out.splitlines():
            r = json.loads(zeile)
            pruef[os.path.relpath(r.pop("file"), os.path.join(ROOT, "bibliothek"))] = r

    katalog = []
    for a, _ in geladen:
        e = {
            "id": f"cpdl-{a['nr']}",
            "quelle": "CPDL",
            "nr": a["nr"],
            "titel": a["titel"],
            "werk": a["werk"],
            "komponist": a["komponist"],
            "dichter": a["dichter"],
            "besetzung": a["besetzung"],
            "sprachen": a["sprachen"],
            "gattung": a["gattung"],
            "instrumente": a["instrumente"],
            "jahr": a["jahr"],
            "herausgeber": a["herausgeber"],
            "lizenz": lizenz_von(a["copy"]),
            "url": CPDL_SEITE + urllib.parse.quote(a["werk"].replace(" ", "_")),
            "stand": a.get("stand"),
            **ergebnis[a["nr"]],
        }
        if e["status"] == "umgewandelt":
            p = pruef.get(a["datei"], {"ok": False, "fehler": "nicht geprüft"})
            if p.pop("ok"):
                e.update(p)
                e["datei"] = a["datei"]
                hinweise = []
                if e["klingend"] < 2:
                    hinweise.append("weniger als zwei klingende Stimmen")
                if e["textanteil"] < 0.3:
                    hinweise.append("wenig oder kein Text")
                if a["stimmenzahl"] and e["stimmen"] != a["stimmenzahl"]:
                    hinweise.append(f"{e['stimmen']} Stimmen, laut CPDL {a['stimmenzahl']}")
                e["status"] = "warnung" if hinweise else "ok"
                if hinweise:
                    e["hinweise"] = hinweise
            else:
                e.update(status="fehler", grund=p.get("fehler", ""))
                os.remove(os.path.join(ROOT, "bibliothek", a["datei"]))
        katalog.append(e)
    with open(KATALOG, "w", encoding="utf-8") as f:
        json.dump(katalog, f, ensure_ascii=False, indent=1)
    zaehl = {}
    for e in katalog:
        zaehl[e["status"]] = zaehl.get(e["status"], 0) + 1
    print("Fertig:", zaehl)


if __name__ == "__main__":
    main()
