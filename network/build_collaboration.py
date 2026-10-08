"""Generate data/collaboration.json: co-authorship between WPE research themes.

Counts outputs written by people from each pair of themes, including doctoral
researchers, whose theme is taken from their supervisor.

Inputs, both outside this repo (they hold emails and personal data):
    $WPE_DATA/WPE_roster.csv                                        staff + PhD students
    $WPE_DATA/Research_outputs_Civil_Engineering_2018_-_2025.xlsx    Symplectic extract

    export WPE_DATA=~/wpe-data
    python3 network/build_collaboration.py

Themes come from the data-group tags on people.html, so the diagram always matches the
site. A doctoral researcher is included only when their supervisor is one of our people.

Author matching follows pipeline.py: surname plus first initial, accepted only when
exactly one person fits. Surname-only matching produced 5.7% false attributions in the
method-map audit, so it is not used here.

The output holds theme-level counts only: no names, no per-person figures. Never
hand-edit it. The diagram it feeds replaced one that was hand-written and contained
invented people and invented publication counts.
"""
from __future__ import annotations

import collections
import csv
import datetime as dt
import html
import itertools
import json
import os
import re
import unicodedata
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PEOPLE = ROOT / "people.html"
OUT = ROOT / "data" / "collaboration.json"
DATA = Path(os.path.expanduser(os.environ.get("WPE_DATA", "~/wpe-data")))
ROSTER = DATA / "WPE_roster.csv"
OUTPUTS = DATA / "Research_outputs_Civil_Engineering_2018_-_2025.xlsx"

THEMES = {
    "indoor-air": "Indoor Air",
    "water": "Water",
    "sanitation": "Sanitation & WASH",
    "bioresources": "BioResources",
}
PERIOD = "2018 to 2025"
STOP = {"dr", "prof", "professor", "obe", "mr", "mrs", "ms"}


def clean(x: str) -> str:
    return unicodedata.normalize("NFKD", str(x)).encode("ascii", "ignore").decode().lower().strip()


def tokens(name: str) -> set:
    return {t for t in re.split(r"[^a-z]+", clean(name)) if len(t) > 1 and t not in STOP}


def surname_key(s: str) -> str:
    return re.sub(r"[^a-z]", "", clean(s))


def parse_author(token: str):
    """'Camargo-Valero MA' -> ('camargovalero', 'm'). Trailing initials, at most four."""
    t = clean(token)
    if not t or " " not in t:
        return None
    parts = t.split()
    surname, last = parts[:-1], parts[-1]
    initials = re.sub(r"[^a-z]", "", last)
    if not surname or not initials or len(initials) > 4:
        return None
    return surname_key(" ".join(surname)), initials[0]


def email_keys(email: str):
    """'M.A.Camargo-Valero@leeds.ac.uk' -> ('camargovalero', {'m','a'}); opaque IDs give None."""
    local = clean(email).split("@")[0]
    parts = local.split(".")
    if len(parts) == 1:
        return None, set()
    return surname_key(parts[-1]), {p[0] for p in parts[:-1] if p}


def site_themes() -> dict:
    """display name -> theme label, from the person cards on people.html."""
    h = re.sub(r"<!--.*?-->", "", PEOPLE.read_text(encoding="utf-8"), flags=re.S)
    out = {}
    for role, group, body in re.findall(
            r'<div class="person-card" data-role="([^"]+)" data-group="([^"]+)">(.*?)person-profile-link',
            h, re.S):
        m = re.search(r"<h3>(.*?)</h3>", body, re.S)
        if m and group in THEMES:
            name = re.sub(r"^(Dr|Prof|Professor)\.?\s+", "", re.sub(r"\s+", " ", m.group(1)).strip())
            out[name.replace(" OBE", "")] = THEMES[group]
    return out


def read_authors() -> list:
    """The Authors column of the Symplectic extract."""
    z = zipfile.ZipFile(OUTPUTS)
    shared = [html.unescape(re.sub(r"<[^>]+>", "", s)) for s in
              re.findall(r"<si>(.*?)</si>", z.read("xl/sharedStrings.xml").decode("utf-8", "ignore"), re.S)]
    xml = z.read("xl/worksheets/sheet1.xml").decode("utf-8", "ignore")
    rows = []
    for r in re.findall(r"<row[^>]*>(.*?)</row>", xml, re.S):
        cells = {}
        for m in re.finditer(r'<c r="([A-Z]+)\d+"([^>]*)>(.*?)</c>', r, re.S):
            col, attrs, body = m.groups()
            v = re.search(r"<v>(.*?)</v>", body, re.S)
            if v:
                cells[col] = shared[int(v.group(1))] if 't="s"' in attrs else v.group(1)
        if cells:
            rows.append(cells)
    header = {v: k for k, v in rows[0].items()}
    return [r.get(header["Authors"], "") for r in rows[1:]]


def build_roster(themes_by_name: dict):
    rows = list(csv.DictReader(ROSTER.open(encoding="utf-8"), delimiter=";"))
    staff_rows = [r for r in rows if r["Category"].startswith("Staff")]

    people, theme_of_staff, unplaced = [], {}, []
    for r in staff_rows:
        name = f"{r['First name']} {r['Last name']}"
        rt = tokens(name)
        hit = [t for n, t in themes_by_name.items() if len(tokens(n) & rt) >= 2]
        if not hit:
            # the site may use a familiar form of the first name (Andy for Andrew,
            # Jamie for James), so fall back to a surname that is unique on the site
            sk = surname_key(r["Last name"])
            hit = [t for n, t in themes_by_name.items()
                   if sk in {surname_key(x) for x in n.split()}]
        theme = hit[0] if len(set(hit)) == 1 else None
        if not theme:
            unplaced.append(name)
            continue
        theme_of_staff[surname_key(r["Last name"])] = theme
        sn, _ = email_keys(r["Email"])
        sn = sn or surname_key(r["Last name"])
        people.append((sn, clean(r["First name"])[:1], name, theme, "staff"))

    seen = {(sn, ini) for sn, ini, *_ in people}
    students, no_supervisor = [], 0
    for r in rows:
        if r["Category"] != "PhD student":
            continue
        supervisor = r["Research domain / Supervisor"].strip()
        theme = theme_of_staff.get(surname_key(supervisor.split()[-1])) if supervisor else None
        if not theme:
            no_supervisor += 1
            continue
        key = (surname_key(r["Last name"]), clean(r["First name"])[:1])
        if key in seen:           # already on the staff list (finished and stayed)
            continue
        seen.add(key)
        students.append((key[0], key[1], f"{r['First name']} {r['Last name']}", theme, "phd"))

    return people + students, unplaced, no_supervisor


def main() -> int:
    themes_by_name = site_themes()
    roster, unplaced, no_supervisor = build_roster(themes_by_name)
    authors = read_authors()

    lookup = collections.defaultdict(list)
    for sn, ini, name, theme, cat in roster:
        lookup[(sn, ini)].append((name, theme, cat))
    ambiguous = {k for k, v in lookup.items() if len({x[1] for x in v}) > 1}

    pair, within, outputs_with = collections.Counter(), collections.Counter(), collections.Counter()
    seen_people = collections.defaultdict(set)
    for row in authors:
        if not row:
            continue
        hits = []
        for token in row.split(","):
            key = parse_author(token)
            if key and key in lookup and key not in ambiguous:
                hits.append(lookup[key][0])
        if not hits:
            continue
        themes = [t for _, t, _ in hits]
        for name, t, _ in hits:
            seen_people[t].add(name)
        for t in set(themes):
            outputs_with[t] += 1
            if themes.count(t) > 1:
                within[t] += 1
        for a, b in itertools.combinations(sorted(set(themes)), 2):
            pair[(a, b)] += 1

    labels = sorted(THEMES.values())
    payload = {
        "generated": dt.date.today().isoformat(),
        "period": PERIOD,
        "source": "Symplectic research outputs matched to the WPE roster; doctoral researchers "
                  "take the theme of their supervisor",
        "counts": {
            "outputs": sum(1 for a in authors if a),
            "peopleMatched": sum(len(v) for v in seen_people.values()),
            "staff": sum(1 for r in roster if r[4] == "staff"),
            "students": sum(1 for r in roster if r[4] == "phd"),
        },
        "nodes": [{
            "id": t,
            "slug": next(k for k, v in THEMES.items() if v == t),
            "people": len(seen_people[t]),
            "outputs": outputs_with[t],
            "within": within[t],
        } for t in labels],
        "links": [{"source": a, "target": b, "value": pair[(a, b)]}
                  for a, b in itertools.combinations(labels, 2)],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    OUT.with_suffix(".js").write_text(
        "/* Generated by network/build_collaboration.py - do not edit by hand. */\n"
        "window.WPE_COLLABORATION = " + json.dumps(payload, indent=2) + ";\n", encoding="utf-8")

    print(f"roster: {payload['counts']['staff']} staff with a theme, "
          f"{payload['counts']['students']} doctoral researchers placed by supervisor")
    if unplaced:
        print(f"  staff with no theme on people.html ({len(unplaced)}): {', '.join(unplaced)}")
    print(f"  students whose supervisor is not one of ours, skipped: {no_supervisor}")
    if ambiguous:
        print(f"  dropped, same surname and initial in two themes: {len(ambiguous)}")
    print(f"matched {payload['counts']['peopleMatched']} people across "
          f"{payload['counts']['outputs']:,} outputs")
    for a, b in itertools.combinations(labels, 2):
        print(f"   {pair[(a, b)]:3d}  {a} — {b}" + ("   (none)" if not pair[(a, b)] else ""))
    print("   within:", dict(within))
    print(f"wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
