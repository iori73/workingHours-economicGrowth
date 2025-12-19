# 手動ダウンロードデータ用ディレクトリ

このディレクトリには、公式データソースから手動でダウンロードしたデータファイルを配置してください。

## 必要なファイル

### 1. 労働時間データ
- **ファイル名**: `mhlw_labor_hours.csv` または `labor_hours.csv`
- **データソース**: 厚生労働省 毎月勤労統計調査
- **URL**: https://www.mhlw.go.jp/toukei/list/30-1.html
- **必要な列**: `year` (年), `hours_per_year` (年間労働時間)

### 2. GDPデータ
- **ファイル名**: `cabinet_gdp.csv` または `gdp_data.csv`
- **データソース**: 内閣府 国民経済計算
- **URL**: https://www.esri.cao.go.jp/jp/sna/menu.html
- **必要な列**: `year` (年), `gdp_growth_rate` (GDP成長率), `real_gdp_trillion_yen` (実質GDP)

### 3. 読書時間データ
- **ファイル名**: `reading_time.csv` または `shakai_seikatsu.csv`
- **データソース**: 総務省統計局 社会生活基本調査
- **URL**: https://www.stat.go.jp/data/shakai/index.html
- **必要な列**: `year` (年), `reading_minutes_per_day` (1日あたり読書時間)

## データ形式

CSVファイルは以下の形式を推奨します：

```csv
year,hours_per_year
1948,2400
1949,2395
...
```

または、元のデータ形式のままでも、データ処理スクリプトで対応できる場合があります。

## 注意事項

- ファイルの文字エンコーディングは UTF-8 または Shift-JIS に対応しています
- データの年は西暦で統一してください
- 欠損値は空欄または `NaN` としてください

