"""
OECDデータの収集スクリプト
労働時間、GDP成長率、一人当たりGDPなどのデータを取得
"""

import requests
import pandas as pd
import json
import os
from pathlib import Path

# プロジェクトルートのパス
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)


def get_oecd_data(dataset_code, filter_params=None):
    """
    OECD統計データを取得
    
    Args:
        dataset_code: OECDデータセットコード
        filter_params: フィルターパラメータ（辞書形式）
    
    Returns:
        pandas.DataFrame: 取得したデータ
    """
    base_url = "https://stats.oecd.org/SDMX-JSON/data"
    
    # デフォルトのフィルターパラメータ
    if filter_params is None:
        filter_params = {
            "JPN": "JPN",  # 日本
            "all": "all"   # 全期間
        }
    
    # URL構築（簡易版、実際のAPI仕様に合わせて調整が必要）
    # 注意: OECD APIは複雑なため、実際の使用時はSDMXパッケージの使用を推奨
    url = f"{base_url}/{dataset_code}/all"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        # 実際の実装では、SDMX-JSON形式のパースが必要
        # ここでは構造のみを示す
        return None
    except Exception as e:
        print(f"Error fetching OECD data: {e}")
        return None


def collect_labor_hours_oecd():
    """OECDから労働時間データを収集"""
    # OECD労働時間データセットコード（例）
    # 実際のコードはOECD統計サイトで確認が必要
    dataset_code = "ANHRS"  # Average annual hours worked
    
    data = get_oecd_data(dataset_code)
    
    if data is not None:
        output_path = DATA_RAW_DIR / "oecd_labor_hours.csv"
        data.to_csv(output_path, index=False)
        print(f"Saved OECD labor hours data to {output_path}")
    else:
        print("Failed to collect OECD labor hours data")
        # サンプルデータを作成（開発用）
        create_sample_oecd_labor_hours()


def collect_gdp_oecd():
    """OECDからGDPデータを収集"""
    # GDP成長率
    gdp_growth_code = "QNA"  # Quarterly National Accounts
    
    # 一人当たりGDP
    gdp_per_capita_code = "SNA_TABLE1"  # National Accounts
    
    # 実際の実装では、適切なデータセットコードを使用
    print("Note: OECD API requires proper authentication and dataset codes")
    print("For development, using sample data")
    create_sample_oecd_gdp()


def create_sample_oecd_labor_hours():
    """開発用のサンプル労働時間データを作成"""
    # 日本の労働時間の歴史的データ（概算値）
    years = list(range(1970, 2024))
    # 実際のデータに基づく概算値（時間/年）
    hours = [
        2200 - (year - 1970) * 8 + (year - 2000) * 2 if year >= 2000 
        else 2200 - (year - 1970) * 8
        for year in years
    ]
    
    df = pd.DataFrame({
        'year': years,
        'country': 'JPN',
        'average_hours_worked': hours
    })
    
    output_path = DATA_RAW_DIR / "oecd_labor_hours_sample.csv"
    df.to_csv(output_path, index=False)
    print(f"Created sample OECD labor hours data: {output_path}")


def create_sample_oecd_gdp():
    """開発用のサンプルGDPデータを作成"""
    years = list(range(1970, 2024))
    
    # GDP成長率（%）
    gdp_growth = [
        5.0 + (year % 10) * 0.5 - abs(year - 1990) * 0.1
        if 1970 <= year <= 1990
        else 1.0 + (year % 5) * 0.3 - abs(year - 2010) * 0.05
        for year in years
    ]
    
    # 一人当たりGDP（USD、概算）
    base_gdp = 2000
    gdp_per_capita = []
    current = base_gdp
    for year in years:
        if year > 1970:
            current = current * (1 + gdp_growth[years.index(year)] / 100)
        gdp_per_capita.append(current)
    
    df = pd.DataFrame({
        'year': years,
        'country': 'JPN',
        'gdp_growth_rate': gdp_growth,
        'gdp_per_capita_usd': gdp_per_capita
    })
    
    output_path = DATA_RAW_DIR / "oecd_gdp_sample.csv"
    df.to_csv(output_path, index=False)
    print(f"Created sample OECD GDP data: {output_path}")


if __name__ == "__main__":
    print("Collecting OECD data...")
    collect_labor_hours_oecd()
    collect_gdp_oecd()
    print("OECD data collection completed")

