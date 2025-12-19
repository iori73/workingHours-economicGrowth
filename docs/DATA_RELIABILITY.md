# データの信頼性について

## 現在の状況

**重要**: 現在のダッシュボードは**開発用のサンプルデータ**を使用しています。これらのデータは実際の統計値に基づいた概算値ですが、**研究や発表には使用しないでください**。

## サンプルデータの特徴

現在使用されているサンプルデータは以下の特徴があります：

1. **労働時間データ**: 日本の労働時間の歴史的傾向を反映した概算値
   - 高度成長期: 約2,400時間/年
   - 1980-90年代: 時短政策により減少傾向
   - 2000年代以降: さらに減少

2. **GDPデータ**: 日本の経済成長の一般的な傾向を反映
   - 高度成長期: 高成長率
   - バブル期: 中程度の成長
   - 失われた20年: 低成長

3. **読書時間データ**: 5年ごとの概算値

## 実際のデータを使用する方法

### 方法1: e-Stat APIを使用（推奨）

1. **e-Stat APIに登録**
   - https://www.e-stat.go.jp/api/ にアクセス
   - 無料でアプリケーションIDを取得

2. **環境変数を設定**
   ```bash
   export ESTAT_APP_ID="your_app_id_here"
   ```

3. **データ収集スクリプトを実行**
   ```bash
   python scripts/data_collection/collect_real_data.py
   ```

### 方法2: 手動でデータをダウンロード

1. **労働時間データ**
   - 厚生労働省: https://www.mhlw.go.jp/toukei/list/30-1.html
   - ダウンロードしたCSV/Excelファイルを `data/raw/manual/mhlw_labor_hours.csv` に保存

2. **GDPデータ**
   - 内閣府: https://www.esri.cao.go.jp/jp/sna/menu.html
   - ダウンロードしたファイルを `data/raw/manual/cabinet_gdp.csv` に保存

3. **読書時間データ**
   - 総務省統計局: https://www.stat.go.jp/data/shakai/index.html
   - ダウンロードしたファイルを `data/raw/manual/reading_time.csv` に保存

4. **データ収集スクリプトを実行**
   ```bash
   python scripts/data_collection/collect_real_data.py
   ```

### 方法3: OECDデータを使用

OECDの公式データを使用する場合：

1. **OECD.Statからデータをダウンロード**
   - https://stats.oecd.org/
   - 労働時間: "Labour Market Statistics" > "Average annual hours worked"
   - GDP: "National Accounts" > "GDP and GDP per capita"

2. **CSV形式でエクスポート**
   - ファイルを `data/raw/manual/` に保存

3. **データ処理スクリプトを実行**
   ```bash
   python scripts/data_processing/process_all.py
   ```

## データの信頼性を確保するために

### 推奨されるデータソース（信頼性の高い順）

1. **政府統計（最高の信頼性）**
   - 厚生労働省: 毎月勤労統計調査
   - 内閣府: 国民経済計算（GDP統計）
   - 総務省統計局: 労働力調査、社会生活基本調査

2. **国際機関の統計**
   - OECD: Labour Market Statistics, Economic Outlook
   - ILO: Labour Statistics

3. **研究機関のデータ**
   - RIETI: 経済産業研究所の研究論文
   - 日本労働研究機構（JILPT）の調査データ

### データの出典を明記する

実際のデータを使用する場合、以下の情報を必ず記録してください：

- データソース（機関名、調査名）
- データ取得日
- データの期間
- データの定義・範囲（例: 労働時間の定義、GDPの基準年など）

## データ品質チェック

実際のデータを使用する前に、以下を確認してください：

1. **欠損値の確認**: データに欠損がないか
2. **異常値の確認**: 明らかに異常な値がないか
3. **期間の確認**: 必要な期間のデータが揃っているか
4. **定義の確認**: データの定義が一貫しているか

## 次のステップ

実際のデータを使用するには：

1. 上記の方法1または2でデータを取得
2. `scripts/data_collection/collect_real_data.py` を実行
3. `scripts/data_processing/process_all.py` でデータを処理
4. バックエンドサーバーを再起動

データの信頼性を確保することで、より正確な分析と可視化が可能になります。

