"""
実際のデータソースからデータを取得するスクリプト
e-Stat API、OECD API、または手動ダウンロードしたファイルを使用
"""

import pandas as pd
import requests
import json
from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)


def download_from_estat_api(app_id, stats_data_id, meta_info="N", cnt_get="N"):
    """
    e-Stat APIからデータを取得
    
    Args:
        app_id: e-Stat APIのアプリケーションID（要登録: https://www.e-stat.go.jp/api/）
        stats_data_id: 統計データID
        meta_info: メタ情報取得フラグ
        cnt_get: 件数取得フラグ
    
    Returns:
        pandas.DataFrame: 取得したデータ
    """
    base_url = "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData"
    
    params = {
        "appId": app_id,
        "statsDataId": stats_data_id,
        "metaGetFlg": meta_info,
        "cntGetFlg": cnt_get,
        "lang": "J"
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # JSONデータをDataFrameに変換（実際の構造に応じて調整が必要）
        # ここでは基本的な構造のみを示す
        return None
    except Exception as e:
        print(f"Error fetching e-Stat data: {e}")
        return None


def load_manual_csv(file_path, encoding='utf-8'):
    """
    手動でダウンロードしたCSVファイルを読み込む
    
    Args:
        file_path: CSVファイルのパス
        encoding: 文字エンコーディング
    
    Returns:
        pandas.DataFrame: 読み込んだデータ
    """
    if not os.path.exists(file_path):
        return None
    
    try:
        # 複数のエンコーディングを試す
        for enc in [encoding, 'shift_jis', 'cp932', 'utf-8-sig']:
            try:
                df = pd.read_csv(file_path, encoding=enc)
                return df
            except UnicodeDecodeError:
                continue
        return None
    except Exception as e:
        print(f"Error loading CSV file: {e}")
        return None


def collect_real_labor_hours():
    """
    実際の労働時間データを収集
    
    方法1: e-Stat APIを使用（推奨）
    方法2: 手動でダウンロードしたファイルを使用
    """
    print("Collecting real labor hours data...")
    
    # 方法1: e-Stat APIを使用する場合
    # app_id = os.getenv('ESTAT_APP_ID')  # 環境変数から取得
    # stats_data_id = "0003410379"  # 毎月勤労統計調査の統計データID（例）
    # data = download_from_estat_api(app_id, stats_data_id)
    
    # 方法2: 手動でダウンロードしたファイルを使用
    manual_files = [
        DATA_RAW_DIR / "manual" / "mhlw_labor_hours.csv",
        DATA_RAW_DIR / "manual" / "labor_hours.csv"
    ]
    
    for file_path in manual_files:
        if file_path.exists():
            data = load_manual_csv(file_path)
            if data is not None:
                # データを標準形式に変換
                output_path = DATA_RAW_DIR / "mhlw_labor_hours_real.csv"
                # 必要に応じてデータを整形
                data.to_csv(output_path, index=False)
                print(f"Loaded real labor hours data from {file_path}")
                return data
    
    print("No real labor hours data found. Please:")
    print("1. Register for e-Stat API: https://www.e-stat.go.jp/api/")
    print("2. Or download data manually from:")
    print("   https://www.mhlw.go.jp/toukei/list/30-1.html")
    print("   and save to data/raw/manual/mhlw_labor_hours.csv")
    return None


def collect_real_gdp():
    """
    実際のGDPデータを収集
    """
    print("Collecting real GDP data...")
    
    # 手動でダウンロードしたファイルを使用
    manual_files = [
        DATA_RAW_DIR / "manual" / "cabinet_gdp.csv",
        DATA_RAW_DIR / "manual" / "gdp_data.csv"
    ]
    
    for file_path in manual_files:
        if file_path.exists():
            data = load_manual_csv(file_path)
            if data is not None:
                output_path = DATA_RAW_DIR / "cabinet_gdp_real.csv"
                data.to_csv(output_path, index=False)
                print(f"Loaded real GDP data from {file_path}")
                return data
    
    print("No real GDP data found. Please download from:")
    print("https://www.esri.cao.go.jp/jp/sna/menu.html")
    print("and save to data/raw/manual/cabinet_gdp.csv")
    return None


def collect_real_reading_time():
    """
    実際の読書時間データを収集
    """
    print("Collecting real reading time data...")
    
    manual_files = [
        DATA_RAW_DIR / "manual" / "reading_time.csv",
        DATA_RAW_DIR / "manual" / "shakai_seikatsu.csv"
    ]
    
    for file_path in manual_files:
        if file_path.exists():
            data = load_manual_csv(file_path)
            if data is not None:
                output_path = DATA_RAW_DIR / "reading_time_real.csv"
                data.to_csv(output_path, index=False)
                print(f"Loaded real reading time data from {file_path}")
                return data
    
    print("No real reading time data found. Please download from:")
    print("https://www.stat.go.jp/data/shakai/index.html")
    print("and save to data/raw/manual/reading_time.csv")
    return None


def main():
    """実際のデータを収集"""
    print("=" * 60)
    print("Collecting REAL data from official sources")
    print("=" * 60)
    print("\nNote: This requires either:")
    print("1. e-Stat API key (register at https://www.e-stat.go.jp/api/)")
    print("2. Manual download of data files")
    print("=" * 60)
    
    # 手動ダウンロード用ディレクトリを作成
    (DATA_RAW_DIR / "manual").mkdir(exist_ok=True)
    
    collect_real_labor_hours()
    collect_real_gdp()
    collect_real_reading_time()
    
    print("\n" + "=" * 60)
    print("Real data collection completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()

