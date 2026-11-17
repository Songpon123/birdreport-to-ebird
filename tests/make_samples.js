// Make fake birdreport.cn exports for testing. Column headers and order copy the site's own
// export code (member/search/page.html, member/handy/page.html, member/point/search.html).
// Coordinates are made from known GPS (WGS-84) points so the converter's output can be checked.
// Run: node tests/make_samples.js   -> writes tests/samples/* and tests/samples/truth.json
const path = require('path');
const fs = require('fs');
const XLSX = require(path.join(__dirname, '..', 'vendor', 'xlsx.full.min.js'));
const out = path.join(__dirname, 'samples');
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) fs.unlinkSync(path.join(out, f));

function save(name, aoa, bookType = 'xlsx') {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'sheet1');
  fs.writeFileSync(path.join(out, name), XLSX.write(wb, { type: 'buffer', bookType }));
  console.log('wrote', name);
}

// --- WGS-84 -> GCJ-02 -> BD-09 (forward transforms, to fake what the site stores) ---
const A = 6378245.0, EE = 0.00669342162296594323, XPI = Math.PI * 3000 / 180;
const tLat = (x, y) => -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  + (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3
  + (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3
  + (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
const tLng = (x, y) => 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  + (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3
  + (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3
  + (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
function wgsToGcj([lat, lng]) {
  let dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
  const rad = lat / 180 * Math.PI; let m = Math.sin(rad); m = 1 - EE * m * m; const sq = Math.sqrt(m);
  dLat = (dLat * 180) / ((A * (1 - EE)) / (m * sq) * Math.PI);
  dLng = (dLng * 180) / (A / sq * Math.cos(rad) * Math.PI);
  return [lat + dLat, lng + dLng];
}
function gcjToBd([lat, lng]) {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * XPI);
  const t = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * XPI);
  return [z * Math.sin(t) + 0.006, z * Math.cos(t) + 0.0065];
}
const r6 = x => Math.round(x * 1e6) / 1e6;

// Ground truth GPS points
const T = {
  olympic: [40.01720, 116.38920],   // 奥林匹克森林公园
  yuanming: [40.00810, 116.29850],  // 圆明园
  wangtian: [21.61500, 101.58600],  // 望天树景区
  shp1: [39.99860, 116.26350],      // 随手记 point 1 (near 颐和园)
  shp2: [40.00690, 116.29600],      // 随手记 point 2
};
const G = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, wgsToGcj(v)]));
const B = Object.fromEntries(Object.entries(G).map(([k, v]) => [k, gcjToBd(v)]));
fs.writeFileSync(path.join(out, 'truth.json'), JSON.stringify({ wgs: T, gcj: G, bd: B }, null, 2));

// 定点记 export: exactly the site's header row and column order. Values come from the API as strings.
const SH = ['报告编号', '观测开始时间', '观测结束时间', '中文名', '拉丁名', '省', '州/市', '区/县', '观测点名称', 'IUCN受胁级别', '国家保护等级', 'CITES保护等级', '鸟种数量'];
const s = (id, a, b, cn, sci, prov, city, dist, pt, n) => [id, a, b, cn, sci, prov, city, dist, pt, 'LC', '', '', n];
save('定点记报告记录导出.xlsx', [SH,
  s('BR001', '2025-05-01 06:30:00', '2025-05-01 09:00:00', '白喉冠鹎', 'Alophoixus pallidus', '云南省', '西双版纳傣族自治州', '勐腊县', '望天树景区', '4'),
  s('BR001', '2025-05-01 06:30:00', '2025-05-01 09:00:00', '鹗', 'Pandion haliaetus', '云南省', '西双版纳傣族自治州', '勐腊县', '望天树景区', '1'),
  s('BR001', '2025-05-01 06:30:00', '2025-05-01 09:00:00', '大盘尾', 'Dicrurus paradiseus', '云南省', '西双版纳傣族自治州', '勐腊县', '望天树景区', ''),
  s('BR002', '2025-05-02 07:00:00', '2025-05-02 08:30:00', '灰喜鹊', 'Cyanopica cyanus', '北京市', '北京市', '朝阳区', '奥林匹克森林公园', '1'),
  s('BR002', '2025-05-02 07:00:00', '2025-05-02 08:30:00', '珠颈斑鸠', 'Spilopelia chinensis', '北京市', '北京市', '朝阳区', '奥林匹克森林公园', '1'),
  s('BR003', '2025-05-03 10:00:00', '2025-05-03 09:00:00', '黑脸琵鹭', 'Platalea minor', '香港特别行政区', '香港', '元朗区', '米埔自然保护区', '30'),
  s('BR004', '2025-05-04', '', '苍鹭', 'Ardea cinerea', '广东省', '深圳市', '福田区', '福田红树林', '约20'),
  s('BR005', '2025-05-05 15:00:00', '2025-05-05 16:00:00', '鸳鸯', 'Aix galericulata', '北京市', '北京市', '海淀区', '圆明园', '6'),
]);

// 随手记 export: site's header row (百度 + 火星 coordinates), as old .xls to test that format too.
const IH = ['报告编号', '中文名', '拉丁名', '省', '州/市', '区/县', 'IUCN受胁级别', '国家保护等级', 'CITES保护等级', '经度（百度）', '纬度（百度）', '经度（火星）', '纬度（火星）', '鸟种数量', '记录时间', '描述'];
const i = (id, cn, sci, k, n, t, note = '') => [id, cn, sci, '北京市', '北京市', '海淀区', 'LC', '', '', r6(B[k][1]), r6(B[k][0]), r6(G[k][1]), r6(G[k][0]), n, t, note];
save('随手记报告记录导出.xls', [IH,
  i('SS01', '黑天鹅', 'Cygnus atratus', 'shp1', 2, '2025-06-01 06:10:00', '逃逸个体'),
  i('SS02', '鸳鸯', 'Aix galericulata', 'shp1', 6, '2025-06-01 06:45:00'),
  i('SS03', '灰喜鹊', 'Cyanopica cyanus', 'shp2', 0, '2025-06-01 07:30:00'),
  i('SS04', '普通翠鸟', 'Alcedo atthis', 'shp1', 1, '2025-06-02 17:20:00'),
], 'biff8');

// 随手记 with only Baidu columns (fallback path) + one duplicate of SS01 (should be ignored).
const IB = ['报告编号', '中文名', '拉丁名', '省', '州/市', '区/县', '经度（百度）', '纬度（百度）', '鸟种数量', '记录时间', '描述'];
save('随手记-仅百度坐标.xlsx', [IB,
  ['SS01', '黑天鹅', 'Cygnus atratus', '北京市', '北京市', '海淀区', r6(B.shp1[1]), r6(B.shp1[0]), 2, '2025-06-01 06:10:00', '逃逸个体'],
  ['SS05', '白鹭', 'Egretta garzetta', '北京市', '北京市', '海淀区', r6(B.shp2[1]), r6(B.shp2[0]), 3, '2025-06-03 08:00:00', ''],
]);

// 观测点管理 export (layui table export): CSV with BOM and quoted cells, like layui writes it.
const PH = ['省份', '州/市', '县/区', '观测点名称', '经度', '纬度', '状态', '日期'];
const p = (prov, city, dist, name, k) => [prov, city, dist, name, r6(B[k][1]), r6(B[k][0]), '公开', '2024-03-01'];
const pts = [PH,
  p('北京市', '北京市', '朝阳区', '奥林匹克森林公园', 'olympic'),
  p('北京市', '北京市', '海淀区', '圆明园', 'yuanming'),
  p('云南省', '西双版纳傣族自治州', '勐腊县', '望天树景区', 'wangtian'),
];
fs.writeFileSync(path.join(out, '观测点导出.csv'), '﻿' + pts.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '\t"').join(',')).join('\r\n'));
console.log('wrote 观测点导出.csv');

// Same points as an HTML table saved as .xls (another way layui exports)
const html = '<table>' + pts.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</table>';
fs.writeFileSync(path.join(out, '观测点导出.xls'), '<html><head><meta charset="utf-8"></head><body>' + html + '</body></html>');
console.log('wrote 观测点导出.xls');

// Species-name test: the 9 species eBird's importer flagged on 2026-11-17, plus edge cases
// (one-character eBird name, no eBird species, epithet match, eBird Chinese name differs, not in list, stray spaces).
const nm = (cn, sci, n = '1') => s('BR900', '2025-07-01 06:00:00', '2025-07-01 08:00:00', cn, sci, '北京市', '北京市', '海淀区', '圆明园', n);
save('鸟名测试-定点记.xlsx', [SH,
  nm('华西柳莺', 'Phylloscopus occisinensis'), nm('栗鹀', 'Emberiza rutila', '2'), nm('灰头鹀', 'Emberiza spodocephala', '3'),
  nm('牛背鹭', 'Bubulcus coromandus', '4'), nm('白眉鹀', 'Emberiza tristrami'), nm('赤腹鹰', 'Accipiter soloensis'),
  nm('黄眉鹀', 'Emberiza chrysophrys'), nm('黄胸鹀', 'Emberiza aureola'), nm('山斑鸠', 'Streptopelia orientalis', '5'),
  nm('鹗', 'Pandion haliaetus'), nm('大山雀', 'Parus minor', '6'), nm('蒙古沙鸻', 'Charadrius mongolus'),
  nm('白骨顶', 'Fulica atra', '7'), nm('鹰属未知种', 'Accipiter sp.'), nm('云石斑鸭', 'Marmaronetta  angustirostris '),
]);

// numbers for the page's built-in example
console.log('example BD', JSON.stringify({ olympic: B.olympic.map(r6), yuanming: B.yuanming.map(r6) }));
