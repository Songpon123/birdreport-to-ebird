# 观鸟记录中心 → eBird 转换器

**中文** | [English](README.en.md) | [ไทย](README.th.md)

把[中国观鸟记录中心](https://www.birdreport.cn/)（birdreport.cn）导出的 Excel 转换成 eBird 可以直接导入的 CSV（eBird Record Format, Extended），把你在记录中心的观鸟记录搬到 eBird。

**在线使用：https://songpon123.github.io/birdreport-to-ebird/**

![转换器界面：检查地点和下载](docs/screenshot.jpg)

## 功能

- **两种记录都支持**：定点记、随手记；可以一次放多个 Excel 文件，自动识别类型。
- **坐标自动校正**：记录中心用百度坐标（BD-09）和火星坐标（GCJ-02），会自动转换成 eBird 使用的 GPS 坐标（WGS-84）。不转换的话，北京一带会偏 500 多米。
- **定点记补坐标**：定点记的导出文件里没有坐标；一起上传「观测点管理」导出的列表，就能补上。
- **鸟名换成 eBird 2026**：记录中心用的是郑光美第四版名录，eBird 2026 改了不少学名（例如 栗鹀 *Emberiza rutila* → *Schoeniclus rutilus*）。名录 1,524 种中 1,523 种会自动换成 eBird 的学名和鸟名，导入时不再显示「未知鸟种」。
- **避免重复**：可以只导出某段日期，跳过已经在 eBird 记过的观鸟；有「试导入：只要最早的一天」按钮。
- **自动分文件**：eBird 每个导入文件最多 1 MB，超过时按清单自动分成几个文件，同一份清单不会被拆开。
- **匹配 eBird 热点**（可选）：填入自己的 eBird API Key，地点会自动对应到 eBird 热点。
- **数量不编造**：数量为空或 0 写成 `X`（只记出现）；可选把「全部都是 1」的清单改成 `X`。
- **不上传数据**：所有处理都在你自己的浏览器里完成。只有匹配热点时，会从 eBird 下载各省的热点列表。

## 使用方法

1. **从记录中心导出**：用电脑浏览器打开 birdreport.cn 网页版并登录 → 用户中心 → 记录管理 → 报告查询，分别打开「定点记」和「随手记」。**不要勾选任何报告**，直接点表格右上角的导出图标 → 导出到 Excel 文件。
   - 网站的导出代码在没有勾选时会请求全部记录。如果导出的数量比网站上少，先取消所有勾选再导出；或者每页改为 200 条，全选，逐页导出。
2. **（推荐）导出观测点**：记录管理 → 观测点管理，用表格右上角的导出图标导出观测点列表。
3. **上传**：打开[转换器](https://songpon123.github.io/birdreport-to-ebird/)，把所有 Excel 拖进去。
4. **设置**：选日期范围；确认「鸟名写法」和你导入时 eBird 网页的语言一致（见下文）；可选填入 eBird API Key 匹配热点。
5. **检查地点，下载 CSV**。
6. **导入 eBird**：用电脑浏览器登录 eBird（手机 App 没有导入功能）→ 顶部 Submit（提交）→ Import Data（导入数据），格式选 **eBird Record Format (Extended)**，上传 CSV。然后在「管理导入的数据」里修正地点（Fix Locations）和鸟种（Fix Species），点 Apply Fixes（应用修正）。

网页里每一步都有详细说明。

## 导入 eBird 时要注意

- **鸟名的语言要和 eBird 网页一致。** 实测（2026-11-17）：eBird 导入时按鸟名识别鸟种，学名正确也不能代替鸟名。eBird 网页是中文时用 eBird 中文名，是英文时用英文名。转换器会按浏览器语言自动选，可以在第 3 步「鸟名写法」里改。
- **已经在 eBird 记过的日期不要再导入**，否则会产生重复清单。可以先到 eBird 的 [我的清单](https://ebird.org/mychecklists) 看看。
- **第一次先试导入一天**，确认没问题再导入全部。
- **修正鸟种页面右边已经有绿色匹配时**，确认后直接点「应用修正」。已知 山斑鸠 即使名称完全一致，eBird 也会先显示为「未知」，点应用修正即可。
- **导错了**：在 eBird 的 [管理导入的数据](https://ebird.org/import/status/all.htm) 点那次导入的 Delete import，会删除这个文件导入的全部记录，改好后重新导入。

## 鸟名是怎么对应的

| 对应方式 | 数量 | 说明 |
|---|---|---|
| 学名相同 | 1,430 | 直接对应 |
| 英文名相同 | 69 | 学名不同但英文名一致，例如 栗鹀 → *Schoeniclus rutilus* |
| 学名种加词相同 | 10 | 例如 赤腹鹰 → *Tachyspiza soloensis*；转换结果里标「请确认」 |
| 亚种组 / 并入的种 | 14 | eBird 里不是独立种，人工对应，例如 华西柳莺 → *Phylloscopus affinis occisinensis*；见 [`taxonomy/groups.json`](taxonomy/groups.json) |
| 没有对应 | 1 | 环江鹪鹛（eBird 还没收录），导入时手动选 |

第 5 步的「鸟种名称对照」会列出这次转换中所有改了名称的鸟种。

## 记录中心导出文件的格式

来自网站自己的导出代码：

| 文件 | 列 | 坐标 |
|---|---|---|
| 定点记 `定点记报告记录导出.xlsx` | 报告编号、观测开始时间、观测结束时间、中文名、拉丁名、省、州/市、区/县、观测点名称、IUCN受胁级别、国家保护等级、CITES保护等级、鸟种数量 | 没有 |
| 随手记 `随手记报告记录导出.xlsx` | 报告编号、中文名、拉丁名、省、州/市、区/县、IUCN受胁级别、国家保护等级、CITES保护等级、经度（百度）、纬度（百度）、经度（火星）、纬度（火星）、鸟种数量、记录时间、描述 | 百度 BD-09（原始）和火星 GCJ-02（网站换算） |
| 观测点管理 | 省份、州/市、县/区、观测点名称、经度、纬度…… | 百度 BD-09 |

## 转换规则

| 项目 | 做法 |
|---|---|
| 定点记 | 一份报告 = 一份清单。观测方式 Stationary（可改为 Historical），时长 = 结束 − 开始；没有时间或时间不合理时改用 Historical，并在清单备注里写明原时间 |
| 随手记 | 同一天、同一地点的记录合并成一份 Incidental 清单（非完整记录），开始时间取最早一条 |
| 数量 | 空或 0 → `X`；同一清单里同一鸟种出现两次 → 合并相加 |
| 省份 | 使用 eBird 的代码（例如 云南 `53`）；香港、澳门、台湾分别填国家 `HK`、`MO`、`TW` |
| 热点 | 定点记按地点名称匹配；随手记按距离匹配，范围可选 200 米 – 2 公里（默认 500 米） |
| 重复记录 | 不同文件里完全相同的记录只保留一次（按报告编号） |
| 清单备注 | `Imported from birdreport.cn (中国观鸟记录中心). Report ID: …` |

## 分享和离线使用

- **发网址**：https://songpon123.github.io/birdreport-to-ebird/ ，请在电脑浏览器里打开（微信内置浏览器不能下载文件）。
- **离线使用**：下载 [`birdreport-to-ebird.html`](birdreport-to-ebird.html) 这一个文件，双击用浏览器打开就能用，不需要联网（只有匹配热点要联网）。网址打不开时，可以直接把这个文件通过微信、QQ 发给别人。

## 开发

```
src/app.html                 页面源文件（HTML + CSS + JS）
vendor/xlsx.full.min.js      Excel 读取组件 SheetJS 0.18.5
taxonomy/cn_to_ebird_2026.json   名录 → eBird 2026 对照（学名 / 英文名 / 种加词三步匹配）
taxonomy/groups.json         人工对应的亚种组和并入的种
taxonomy/build_name_table.py 加上 eBird 简体中文名，生成 name_table.json
taxonomy/name_table.json     页面使用的鸟名表
build.py                     生成 index.html 和 birdreport-to-ebird.html
tests/make_samples.js        生成测试用的假导出文件
tests/ebird-name-test.csv    测试 eBird 按哪种鸟名识别的 4 行文件
```

- 修改 `src/app.html` 后运行 `python3 build.py`，会把 SheetJS 和鸟名表内联进 `index.html`（GitHub Pages 用）和 `birdreport-to-ebird.html`（离线用）。
- 更新鸟名表：`python3 taxonomy/build_name_table.py`（从 eBird 公开 API 取名称），然后 `python3 build.py`。
- 生成测试文件：`node tests/make_samples.js`。测试文件的坐标由已知 GPS 点正向换算，转换回来的误差小于 0.2 米。

## 更新记录

- **2026-11-17**：华西柳莺、四川林鸮、斑腰燕、中华长尾雀等 14 种在 eBird 里是亚种组或被合并的种，现在会自动对应。
- **2026-11-17**：学名改用 eBird 2026 分类，鸟名改用 eBird 自己的写法；「鸟名写法」按浏览器语言自动选（实测 eBird 按网页语言识别鸟名）。
- **2026-11-17**：增加日期范围和「试导入一天」、超过 1 MB 自动分文件、观测点坐标、百度坐标转换、导入步骤说明。
- **2026-11-16**：第一版。

## 致谢

- [Jimmy418518/Birding](https://github.com/Jimmy418518/Birding) 和 [smilewsw/birding-ebird-converter](https://github.com/smilewsw/birding-ebird-converter)：最早的转换脚本和思路。
- [TaQini/qBird](https://github.com/TaQini/qBird)：记录中心数据接口的研究。
- 鸟名对照表来自 Bird Finder 项目，名称数据来自 [eBird 分类](https://ebird.org/science/use-ebird-data/the-ebird-taxonomy) 和记录中心名录。
- [SheetJS](https://sheetjs.com/)（Apache-2.0）。

## 许可

代码使用 [MIT 许可](LICENSE)，欢迎修改和转发。`vendor/xlsx.full.min.js`（SheetJS）使用 Apache-2.0 许可。

非官方工具，与中国观鸟记录中心、eBird 及康奈尔鸟类学实验室无关。
