"""Make taxonomy/name_table.json, the species-name table that build.py puts into the page.

Input:  taxonomy/cn_to_ebird_2026.json  (Chinese list -> eBird 2026, made in the Bird Finder project;
        see build_mapping.from-bird-finder.py)
Adds:   eBird's own Simplified Chinese name (locale zh_SIM) for every matched species, fetched from the
        public eBird taxonomy API, so the CSV can use the exact name eBird shows to Chinese users.
Output: {"version": ..., "t": {"<Chinese-list Latin name>": [eBird sci, eBird English, eBird 中文, method, 记录中心中文名]}}
        method: "exact" | "english" | "epithet" (check by hand) | "" (no single eBird species)

Usage: python3 taxonomy/build_name_table.py
"""
import json
import time
import urllib.request
from pathlib import Path

here = Path(__file__).resolve().parent
src = json.loads((here / "cn_to_ebird_2026.json").read_text(encoding="utf-8"))
species = src["species"]

codes = sorted({v["ebirdCode"] for v in species.values() if v.get("ebirdCode")})
zh = {}
for i in range(0, len(codes), 150):
    chunk = codes[i:i + 150]
    url = ("https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=zh_SIM&species=" + ",".join(chunk))
    req = urllib.request.Request(url, headers={"User-Agent": "birdreport-to-ebird name table builder"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                rows = json.load(r)
            break
        except Exception as e:  # network hiccup: retry a couple of times
            if attempt == 2:
                raise
            time.sleep(3)
    for row in rows:
        zh[row["speciesCode"]] = row["comName"]
    print(f"zh_SIM names: {len(zh)}/{len(codes)}")

missing = [c for c in codes if c not in zh]
if missing:
    raise SystemExit(f"no zh_SIM name for {len(missing)} codes, e.g. {missing[:5]}")

table = {}
for latin, v in species.items():
    key = " ".join(latin.split())  # the Chinese list has stray spaces in a few names
    if v.get("ebirdCode"):
        table[key] = [v["ebirdSciName"], v["ebirdComName"], zh[v["ebirdCode"]], v["method"], v["cnName"]]
    else:
        table[key] = ["", "", "", "", v["cnName"]]

out = {"version": "eBird taxonomy 2026 + 中国观鸟记录中心名录 Z4 (built " + time.strftime("%Y-%m-%d") + ")", "t": table}
(here / "name_table.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
from collections import Counter
print("entries", len(table), Counter(r[3] or "none" for r in table.values()))
print("Chinese name differs from eBird zh_SIM:", sum(1 for r in table.values() if r[2] and r[2] != r[4]))
