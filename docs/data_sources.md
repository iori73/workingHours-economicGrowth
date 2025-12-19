# データソース一覧

このドキュメントでは、本プロジェクトで使用するデータソースの詳細を記載します。

## 労働時間データ

### 1. 厚生労働省 - 毎月勤労統計調査
- **URL**: https://www.mhlw.go.jp/toukei/list/30-1.html
- **データ期間**: 1948年〜現在
- **データ形式**: CSV/Excel
- **説明**: 日本の労働時間に関する最も包括的な統計データ

### 2. OECD - Labour Market Statistics
- **URL**: https://stats.oecd.org/
- **データ期間**: 1970年〜現在（国により異なる）
- **データ形式**: CSV/API
- **説明**: 国際比較が可能な労働時間データ

### 3. 総務省統計局 - 労働力調査
- **URL**: https://www.stat.go.jp/data/roudou/index.html
- **データ期間**: 1947年〜現在
- **データ形式**: CSV/Excel
- **説明**: 雇用形態別の詳細な労働時間データ

## 経済成長指標データ

### 1. 内閣府 - GDP統計
- **URL**: https://www.esri.cao.go.jp/jp/sna/menu.html
- **データ期間**: 1955年〜現在
- **データ形式**: CSV/Excel
- **説明**: 日本のGDP統計の公式データ

### 2. OECD - Economic Outlook
- **URL**: https://stats.oecd.org/
- **データ期間**: 1960年〜現在
- **データ形式**: CSV/API
- **説明**: 国際比較可能なGDP成長率、一人当たりGDPデータ

### 3. 日本銀行 - 統計データ
- **URL**: https://www.stat-search.boj.or.jp/
- **データ期間**: 1970年〜現在
- **データ形式**: CSV/Excel
- **説明**: 労働生産性関連の統計データ

### 4. RIETI - 研究論文データ
- **URL**: https://www.rieti.go.jp/jp/publications/dp/19j022.pdf
- **データ期間**: 1970年代〜近年
- **データ形式**: PDF（抽出が必要）
- **説明**: 長時間労働是正と人的資本投資に関する研究データ

## 読書時間データ

### 1. 総務省統計局 - 社会生活基本調査
- **URL**: https://www.stat.go.jp/data/shakai/index.html
- **データ期間**: 1976年〜現在（5年ごと）
- **データ形式**: CSV/Excel
- **説明**: 余暇時間の内訳、読書時間を含む

### 2. 文化庁 - 国語に関する世論調査
- **URL**: https://www.bunka.go.jp/tokei_hakusho_shuppan/tokeichosa/kokugo_yoronchosa/
- **データ期間**: 1995年〜現在（年次）
- **データ形式**: PDF/Excel
- **説明**: 読書に関する世論調査データ

## データ取得方法

各データソースの取得方法は、`scripts/data_collection/` ディレクトリ内のスクリプトを参照してください。

## データの出典表示

ダッシュボード上では、使用したデータソースを明確に表示し、透明性を確保します。

