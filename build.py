"""Build the single-file converter: inline SheetJS into src/app.html.

Usage: python3 build.py
Output: birdreport-to-ebird.html (one file, works offline, share it as is)
        index.html (same file, served by GitHub Pages)
"""
from pathlib import Path

root = Path(__file__).resolve().parent
template = (root / "src" / "app.html").read_text(encoding="utf-8")
lib = (root / "vendor" / "xlsx.full.min.js").read_text(encoding="utf-8")

marker = "<!--SHEETJS-->"
if marker not in template:
    raise SystemExit("marker <!--SHEETJS--> not found in src/app.html")
if "</script" in lib.lower():
    raise SystemExit("library contains </script, cannot inline safely")

out = template.replace(marker, "<script>/* SheetJS 0.18.5 (Apache-2.0) */\n" + lib + "\n</script>")
for name in ("birdreport-to-ebird.html", "index.html"):
    (root / name).write_text(out, encoding="utf-8")
    print(f"wrote {name}: {len(out.encode('utf-8')) / 1024:.0f} KB")
