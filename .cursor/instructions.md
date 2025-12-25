# プロジェクト詳細仕様

## プロジェクト概要
日本の労働時間と経済成長の関係を可視化するインタラクティブダッシュボード。

## フロントエンド仕様

### HTML構造
- `frontend/index.html`: メインHTMLファイル
- Tailwind CSS + DaisyUIを使用
- レスポンシブデザイン対応

### CSS
- `frontend/css/style.css`: カスタムスタイル
- デジタル庁準拠のNoto Sans JPフォントを使用
- コントラスト比4.5:1以上を満たす

### JavaScript
- `frontend/js/main.js`: メインアプリケーションロジック
- `frontend/js/charts/`: チャートコンポーネント（D3.js）
  - `timeseries.js`: 時系列グラフ
  - `correlation.js`: 相関分析
  - `comparison.js`: 国際比較
  - `reading.js`: 読書時間との関係
- `frontend/js/utils/`: ユーティリティ
  - `api.js`: API通信
  - `download.js`: チャートダウンロード

## バックエンド仕様

### API
- FlaskベースのREST API
- エンドポイント:
  - `/api/data`: データ取得
  - `/api/correlation`: 相関分析データ
  - `/api/metadata`: メタデータ取得
  - `/api/year-range`: 年範囲取得

### データ処理
- `scripts/data_collection/`: データ収集スクリプト
- `scripts/data_processing/`: データ処理スクリプト
- `scripts/analysis/`: 分析スクリプト

## データソース
- 厚生労働省「毎月勤労統計調査」
- 内閣府「国民経済計算」
- 総務省「社会生活基本調査」
- OECD統計

## 開発ワークフロー

1. データ収集: `scripts/data_collection/collect_all.py`
2. データ処理: `scripts/data_processing/process_all.py`
3. 分析実行: `scripts/analysis/run_all_analysis.py`
4. サーバー起動: `python run_server.py`
5. フロントエンド確認: `http://localhost:5000`

