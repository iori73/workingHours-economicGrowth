# 日本の労働時間と経済成長の可視化ダッシュボード

「なぜ働いていると本が読めなくなるのか」という本をきっかけに、日本の労働時間と経済成長の相関を可視化するインタラクティブなWebダッシュボードです。

## プロジェクト概要

このプロジェクトは、複数の信頼できるデータソースから収集したデータを用いて、日本の労働時間と経済成長指標（GDP成長率、一人当たりGDP、労働生産性）の関係性を可視化します。また、読書時間データもサブ要素として含め、より包括的な分析を提供します。

## 主な機能

- **時系列グラフ**: 労働時間と経済指標の推移を重ねて表示
- **相関分析**: 散布図と相関係数で関係性を可視化
- **国際比較**: 他国（G7、OECD平均等）との比較
- **読書時間との関係**: サブ要素として読書時間データを表示
- **指標切り替え**: GDP成長率、一人当たりGDP、労働生産性を切り替え可能
- **期間フィルター**: 戦後全体、特定の期間を選択可能
- **グラフダウンロード**: 静的なグラフをPNG/SVG/PDF形式でダウンロード
- **解説セクション**: 各指標の特徴、メリット・デメリット、解釈の注意点

## 技術スタック

- **データ分析・前処理**: Python (pandas, numpy, scipy)
- **可視化**: D3.js（メイン）、Observable Plot（補助的）
- **バックエンド**: Flask（データAPI提供）
- **フロントエンド**: バニラJavaScript + D3.js

## データソース

### 労働時間データ
- 厚生労働省: 毎月勤労統計調査、労働力調査
- OECD: Labour Market Statistics
- 総務省統計局: 労働力調査

### 経済成長指標データ
- 内閣府: GDP統計、国民経済計算
- OECD: Economic Outlook
- 日本銀行: 統計データ（労働生産性関連）
- RIETI: 研究論文データ（補完的）

### 読書時間データ
- 総務省統計局: 社会生活基本調査
- 文化庁: 国語に関する世論調査
- 民間調査: 読書に関する各種調査データ（補完的）

## セットアップ

### 必要な環境
- Python 3.9以上
- ウェブブラウザ（Chrome、Firefox、Safari、Edgeなど）

### インストール手順

1. **Python依存関係のインストール**
```bash
pip install -r requirements.txt
```

2. **データ収集（初回実行時）**
```bash
cd scripts/data_collection
python collect_all.py
cd ../..
```

3. **データ前処理**
```bash
cd scripts/data_processing
python process_all.py
cd ../..
```

4. **データ分析（オプション）**
```bash
cd scripts/analysis
python run_all_analysis.py
cd ../..
```

5. **バックエンドサーバーの起動**
```bash
cd backend
python app.py
```

サーバーは `http://localhost:5000` で起動します。

6. **フロントエンドの表示**
- ブラウザで `frontend/index.html` を直接開く
- または、ローカルサーバー（例: `python -m http.server`）を使用して `http://localhost:8000/frontend/index.html` にアクセス

### 注意事項

- バックエンドサーバーが起動している必要があります（フロントエンドがAPIからデータを取得するため）
- 初回実行時はサンプルデータが生成されます。実際のデータを使用する場合は、各データソースのAPIキーや手動ダウンロードが必要な場合があります

## プロジェクト構造

```
workingHours-economicGrowth/
├── data/
│   ├── raw/              # 生データ（CSV、JSON等）
│   ├── processed/        # 前処理済みデータ
│   └── metadata/         # データソースのメタデータ、出典情報
├── scripts/
│   ├── data_collection/  # データ収集スクリプト
│   ├── data_processing/  # データ前処理・統合スクリプト
│   └── analysis/         # 分析スクリプト（相関分析等）
├── backend/
│   ├── app.py           # Flaskアプリケーション
│   ├── api/             # APIエンドポイント
│   └── models/          # データモデル
├── frontend/
│   ├── index.html       # メインHTML
│   ├── css/
│   │   └── style.css    # スタイリング
│   ├── js/
│   │   ├── main.js      # メインアプリケーション
│   │   ├── charts/      # 各チャートコンポーネント
│   │   └── utils/       # ユーティリティ関数
│   └── assets/          # 画像、フォント等
└── docs/
    └── data_sources.md  # データソースの詳細説明
```

## ライセンス

このプロジェクトは教育・研究目的で作成されています。

