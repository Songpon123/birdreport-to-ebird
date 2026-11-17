"""Build cn_to_ebird_2026.json: Chinese list (郑光美 4th ed., birdreport.cn) -> eBird 2026, via name_match."""
import json, sys
sys.path.insert(0, sys.argv[1]); import name_match
d = sys.argv[2]
eb = json.load(open(d+'/ebird_2026.json')); br = json.load(open(d+'/birdreport_taxa.json'))
ebird = name_match.NameIndex((r['speciesCode'], r['sciName'], r['comName'], r) for r in eb)
out = {}
for t in {x['id']: x for x in br}.values():
    r, m = ebird.find(t['latinname'], t['englishname'])
    out[t['latinname']] = {'cnName': t['name'], 'cnEnglish': t['englishname'], 'birdreportId': t['id'],
        'ebirdSciName': r['sciName'] if r else None, 'ebirdComName': r['comName'] if r else None,
        'ebirdCode': r['speciesCode'] if r else None, 'method': m}
meta = {'built': '2026-11-17', 'ebirdTaxonomy': 'api.ebird.org/v2/ref/taxonomy/ebird?cat=species (fetched 2026-11-17)',
        'chineseList': 'api.birdreport.cn front/taxon/search version Z4-67FA07177A544FBD96006A7CC7489D25',
        'methods': 'exact | english | epithet (check) | null = no single eBird species, choose by hand'}
json.dump({'meta': meta, 'species': out}, open(d+'/cn_to_ebird_2026.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(v['method'] for v in out.values()))
print('unmatched:', [(k, v['cnName'], v['cnEnglish']) for k, v in out.items() if not v['method']])
