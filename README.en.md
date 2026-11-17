# China Bird Report → eBird converter

[中文](README.md) | **English** | [ไทย](README.th.md)

Converts the Excel files you export from the [China Bird Report](https://www.birdreport.cn/) (中国观鸟记录中心, birdreport.cn) into a CSV that eBird can import (eBird Record Format, Extended), so your Chinese birding records can move to eBird.

**Use it online: https://songpon123.github.io/birdreport-to-ebird/** (the page is in Chinese)

![Converter page: checking locations before download](docs/screenshot.jpg)

## Features

- **Both record types**: 定点记 (stationary checklists) and 随手记 (incidental sightings). Drop several Excel files at once; the type is detected automatically.
- **Coordinates fixed**: birdreport.cn stores Baidu (BD-09) and "Mars" (GCJ-02) coordinates. They are converted to the GPS coordinates (WGS-84) that eBird uses. Unconverted, points around Beijing land more than 500 m off.
- **Coordinates for 定点记**: the 定点记 export has no coordinates. Upload the point list from 观测点管理 as well and they are filled in.
- **eBird 2026 names**: birdreport.cn uses the Chinese checklist (Zheng Guangmei, 4th ed.), whose scientific names often differ from eBird 2026 (e.g. *Emberiza rutila* → *Schoeniclus rutilus*). 1,523 of its 1,524 species are mapped to eBird's own scientific and common names, so eBird no longer reports them as unknown species.
- **No duplicates**: export only a date range, skipping dates already in eBird. A "try one day first" button exports just the earliest day.
- **1 MB limit handled**: eBird accepts at most 1 MB per import file. Larger exports are split into several files, never splitting a checklist.
- **eBird hotspots** (optional): with your own eBird API key, locations are matched to eBird hotspots.
- **Counts are never invented**: a blank or 0 count becomes `X` (present). Optionally, checklists where every count is 1 become `X`.
- **Nothing is uploaded**: everything runs in your browser. Only hotspot matching downloads the hotspot list for each province from eBird.

## How to use

1. **Export from birdreport.cn** (desktop browser): 用户中心 → 记录管理 → 报告查询 → 定点记, then 随手记. **Don't tick any reports**; click the export icon at the top right of the table → 导出到 Excel 文件. With nothing ticked, the site's export code asks for all records. If you get fewer than expected, untick everything and export again, or set 200 rows per page, select all, and export page by page.
2. **(Recommended) Export your points**: 记录管理 → 观测点管理 → export icon.
3. **Upload** all the Excel files to the [converter](https://songpon123.github.io/birdreport-to-ebird/).
4. **Settings**: pick a date range, and make sure 鸟名写法 (name language) matches the language eBird's website shows when you import (see below). Optionally add an eBird API key to match hotspots.
5. **Check the locations and download the CSV.**
6. **Import into eBird**: in a desktop browser (the eBird app cannot import), go to Submit → Import Data, choose **eBird Record Format (Extended)**, and upload. Then, under Manage Imported Data, use Fix Locations and Fix Species, and click Apply Fixes.

## Things to know when importing

- **The name language must match eBird's page language.** We tested this on 2026-11-17: eBird's importer recognises species by the common name. A correct scientific name does not make up for a name in the wrong language. If eBird shows Chinese pages, use eBird's Chinese names; if English, English names. The converter picks the language from your browser, and you can change it in step 3.
- **Don't import dates that are already in eBird**, or you'll get duplicate checklists. Check [My Checklists](https://ebird.org/mychecklists) first.
- **Import one day first** to check everything works.
- **If Fix Species already shows a green match**, check it and click Apply Fixes. Oriental Turtle-Dove (山斑鸠) is a known quirk: eBird lists it as unknown even though the name and scientific name are identical, then suggests the right match.
- **To undo an import**, open [Manage Imported Data](https://ebird.org/import/status/all.htm) and click Delete import. This removes every record from that file. Then fix the file and import it again.

## How species names are matched

| Match | Species | Notes |
|---|---|---|
| Same scientific name | 1,430 | |
| Same English name | 69 | Different scientific name, same English name, e.g. Chestnut Bunting → *Schoeniclus rutilus* |
| Same species epithet | 10 | e.g. Chinese Sparrowhawk → *Tachyspiza soloensis*; marked 请确认 (please check) |
| Subspecies group / lumped | 14 | Not a full species in eBird; matched by hand, e.g. Alpine Leaf Warbler → *Phylloscopus affinis occisinensis*. See [`taxonomy/groups.json`](taxonomy/groups.json) |
| No match | 1 | Huanjiang Wren-Babbler (not in eBird yet); choose it by hand |

The 鸟种名称对照 table in step 5 lists every species whose name was changed.

## Development

```
src/app.html                     page source (HTML + CSS + JS)
vendor/xlsx.full.min.js          SheetJS 0.18.5 (reads Excel)
taxonomy/cn_to_ebird_2026.json   Chinese checklist → eBird 2026 (scientific / English name / epithet)
taxonomy/groups.json             hand-checked subspecies groups and lumps
taxonomy/build_name_table.py     adds eBird's Simplified Chinese names → name_table.json
taxonomy/name_table.json         the name table the page uses
build.py                         builds index.html and birdreport-to-ebird.html
tests/make_samples.js            makes fake birdreport.cn exports for testing
tests/ebird-name-test.csv        4-row file used to test how eBird matches names
```

- After editing `src/app.html`, run `python3 build.py`. It inlines SheetJS and the name table into `index.html` (GitHub Pages) and `birdreport-to-ebird.html` (offline copy).
- To refresh the names, run `python3 taxonomy/build_name_table.py` (uses the public eBird API), then `python3 build.py`.
- To make the test files, run `node tests/make_samples.js`. Their coordinates are generated from known GPS points; converting them back is accurate to under 0.2 m.

## Credits

- [Jimmy418518/Birding](https://github.com/Jimmy418518/Birding) and [smilewsw/birding-ebird-converter](https://github.com/smilewsw/birding-ebird-converter): the first converter scripts and ideas.
- [TaQini/qBird](https://github.com/TaQini/qBird): research on the birdreport.cn data API.
- The name mapping comes from the Bird Finder project. Name data comes from the [eBird taxonomy](https://ebird.org/science/use-ebird-data/the-ebird-taxonomy) and the China Bird Report checklist.
- [SheetJS](https://sheetjs.com/) (Apache-2.0).

## License

[MIT](LICENSE). `vendor/xlsx.full.min.js` (SheetJS) is Apache-2.0.

Unofficial tool, not affiliated with the China Bird Report, eBird or the Cornell Lab of Ornithology.
