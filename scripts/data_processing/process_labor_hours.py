"""
労働時間データの前処理と統合
複数のデータソースから取得した労働時間データを統合
"""

import pandas as pd
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def load_labor_hours_data():
    """複数のソースから労働時間データを読み込み"""
    data_sources = {}
    
    # 実データを優先的に使用
    # 厚生労働省の実データ
    mhlw_real_path = DATA_RAW_DIR / "mhlw_labor_hours_real.csv"
    if mhlw_real_path.exists():
        mhlw_df = pd.read_csv(mhlw_real_path)
        data_sources['mhlw'] = mhlw_df
        print("Using REAL MHLW labor hours data")
    else:
        # サンプルデータをフォールバック
        mhlw_path = DATA_RAW_DIR / "mhlw_labor_hours_sample.csv"
        if mhlw_path.exists():
            mhlw_df = pd.read_csv(mhlw_path)
            data_sources['mhlw'] = mhlw_df
            print("Using SAMPLE MHLW labor hours data")
    
    # OECDデータ（実データがあれば優先）
    oecd_path = DATA_RAW_DIR / "oecd_labor_hours_sample.csv"
    if oecd_path.exists():
        oecd_df = pd.read_csv(oecd_path)
        data_sources['oecd'] = oecd_df
    
    return data_sources


def normalize_labor_hours(data_sources):
    """労働時間データを正規化・統合"""
    all_data = []
    
    for source_name, df in data_sources.items():
        # データソースごとに列名を統一
        if source_name == 'oecd':
            # OECDデータの処理
            normalized = df.copy()
            if 'average_hours_worked' in normalized.columns:
                normalized = normalized.rename(columns={
                    'average_hours_worked': 'hours_per_year',
                    'year': 'year'
                })
            normalized['source'] = 'OECD'
        elif source_name == 'mhlw':
            # 厚生労働省データの処理
            normalized = df.copy()
            if 'average_hours_per_year' in normalized.columns:
                normalized = normalized.rename(columns={
                    'average_hours_per_year': 'hours_per_year'
                })
            normalized['source'] = 'MHLW'
        
        # 必要な列のみを抽出
        if 'year' in normalized.columns and 'hours_per_year' in normalized.columns:
            normalized = normalized[['year', 'hours_per_year', 'source']]
            all_data.append(normalized)
    
    if not all_data:
        return None
    
    # データを統合
    combined = pd.concat(all_data, ignore_index=True)
    
    # 年ごとに平均を計算（複数ソースがある場合）
    processed = combined.groupby('year').agg({
        'hours_per_year': 'mean',  # 複数ソースの平均
        'source': lambda x: ', '.join(x.unique())  # ソース情報を保持
    }).reset_index()
    
    # 欠損値の補間（線形補間）
    processed['hours_per_year'] = processed['hours_per_year'].interpolate(method='linear')
    
    return processed


def save_processed_labor_hours(df):
    """処理済み労働時間データを保存"""
    output_path = DATA_PROCESSED_DIR / "labor_hours_processed.csv"
    df.to_csv(output_path, index=False)
    print(f"Saved processed labor hours data to {output_path}")
    
    # メタデータも保存
    metadata = {
        'description': 'Processed labor hours data (annual average hours worked)',
        'sources': df['source'].iloc[0] if len(df) > 0 else 'Unknown',
        'year_range': f"{df['year'].min()}-{df['year'].max()}",
        'data_points': len(df)
    }
    
    import json
    metadata_path = DATA_PROCESSED_DIR / "labor_hours_metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    return output_path


def process_labor_hours():
    """労働時間データの処理メイン関数"""
    print("Processing labor hours data...")
    
    # データ読み込み
    data_sources = load_labor_hours_data()
    
    if not data_sources:
        print("No labor hours data found. Please run data collection first.")
        return None
    
    # データ正規化・統合
    processed = normalize_labor_hours(data_sources)
    
    if processed is None:
        print("Failed to process labor hours data.")
        return None
    
    # 保存
    save_processed_labor_hours(processed)
    
    print(f"Processed {len(processed)} data points")
    return processed


if __name__ == "__main__":
    process_labor_hours()

