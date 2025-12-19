"""
日本の政府統計データの収集スクリプト
厚生労働省、内閣府、総務省などのデータを取得
"""

import requests
import pandas as pd
import json
import os
from pathlib import Path
from bs4 import BeautifulSoup

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)


def collect_mhlw_labor_hours():
    """
    厚生労働省の労働時間データを収集
    実際の実装では、e-Stat APIまたは手動ダウンロードが必要
    """
    print("Collecting MHLW labor hours data...")
    print("Note: Actual implementation requires e-Stat API key or manual download")
    
    # サンプルデータを作成（開発用）
    create_sample_mhlw_labor_hours()


def collect_cabinet_gdp():
    """
    内閣府のGDPデータを収集
    実際の実装では、e-Stat APIまたは手動ダウンロードが必要
    """
    print("Collecting Cabinet Office GDP data...")
    print("Note: Actual implementation requires e-Stat API key or manual download")
    
    # サンプルデータを作成（開発用）
    create_sample_cabinet_gdp()


def collect_reading_time():
    """
    読書時間データを収集
    総務省の社会生活基本調査から取得
    """
    print("Collecting reading time data...")
    print("Note: Actual implementation requires e-Stat API key or manual download")
    
    # サンプルデータを作成（開発用）
    create_sample_reading_time()


def create_sample_mhlw_labor_hours():
    """開発用のサンプル厚生労働省労働時間データ"""
    years = list(range(1948, 2024))
    
    # 日本の労働時間の歴史的推移（概算値、時間/年）
    # 戦後から高度成長期: 非常に長い労働時間
    # 1980-90年代: 時短政策により減少
    # 2000年代以降: さらに減少傾向
    hours = []
    for year in years:
        if year < 1960:
            h = 2400 - (year - 1948) * 5
        elif year < 1980:
            h = 2300 - (year - 1960) * 3
        elif year < 2000:
            h = 2100 - (year - 1980) * 8
        else:
            h = 1800 - (year - 2000) * 3
        hours.append(max(h, 1600))  # 最低値
    
    df = pd.DataFrame({
        'year': years,
        'average_hours_per_year': hours,
        'source': 'MHLW_sample'
    })
    
    output_path = DATA_RAW_DIR / "mhlw_labor_hours_sample.csv"
    df.to_csv(output_path, index=False)
    print(f"Created sample MHLW labor hours data: {output_path}")


def create_sample_cabinet_gdp():
    """開発用のサンプル内閣府GDPデータ"""
    years = list(range(1955, 2024))
    
    # GDP成長率（%）
    gdp_growth = []
    for year in years:
        if year < 1970:
            growth = 8.0 + (year % 5) * 1.0
        elif year < 1990:
            growth = 4.0 - (year - 1970) * 0.15
        elif year < 2000:
            growth = 1.0 + (year % 3) * 0.5
        else:
            growth = 0.5 + (year % 4) * 0.3
        gdp_growth.append(growth)
    
    # 実質GDP（兆円、1955年基準）
    real_gdp = []
    base = 10.0  # 1955年の実質GDP（兆円、概算）
    for i, year in enumerate(years):
        if i > 0:
            base = base * (1 + gdp_growth[i] / 100)
        real_gdp.append(base)
    
    df = pd.DataFrame({
        'year': years,
        'gdp_growth_rate': gdp_growth,
        'real_gdp_trillion_yen': real_gdp,
        'source': 'Cabinet_Office_sample'
    })
    
    output_path = DATA_RAW_DIR / "cabinet_gdp_sample.csv"
    df.to_csv(output_path, index=False)
    print(f"Created sample Cabinet Office GDP data: {output_path}")


def create_sample_reading_time():
    """開発用のサンプル読書時間データ"""
    # 社会生活基本調査は5年ごと
    years = [1976, 1981, 1986, 1991, 1996, 2001, 2006, 2011, 2016, 2021]
    
    # 1日あたりの読書時間（分、概算値）
    # 労働時間が長いほど読書時間が減る傾向を反映
    reading_minutes = []
    for year in years:
        # 労働時間が長い時期（1976-1996）は読書時間が少ない
        if year < 1990:
            minutes = 15 - (year - 1976) * 0.2
        else:
            minutes = 12 + (year - 1990) * 0.3
        reading_minutes.append(max(minutes, 8))
    
    df = pd.DataFrame({
        'year': years,
        'reading_minutes_per_day': reading_minutes,
        'source': 'Statistics_Bureau_sample'
    })
    
    output_path = DATA_RAW_DIR / "reading_time_sample.csv"
    df.to_csv(output_path, index=False)
    print(f"Created sample reading time data: {output_path}")


if __name__ == "__main__":
    print("Collecting Japanese government statistics...")
    collect_mhlw_labor_hours()
    collect_cabinet_gdp()
    collect_reading_time()
    print("Japanese government data collection completed")

