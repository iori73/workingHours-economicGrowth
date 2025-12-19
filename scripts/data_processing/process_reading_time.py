"""
読書時間データの前処理
"""

import pandas as pd
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def process_reading_time():
    """読書時間データの処理"""
    print("Processing reading time data...")
    
    # 実データを優先的に使用
    reading_path = DATA_RAW_DIR / "reading_time_real.csv"
    if not reading_path.exists():
        # サンプルデータをフォールバック
        reading_path = DATA_RAW_DIR / "reading_time_sample.csv"
    
    if not reading_path.exists():
        print("No reading time data found. Please run data collection first.")
        return None
    
    if "real" in str(reading_path):
        print("Using REAL reading time data")
    else:
        print("Using SAMPLE reading time data")
    
    df = pd.read_csv(reading_path)
    
    # データクリーニング
    # 欠損値の処理（必要に応じて）
    df = df.dropna(subset=['year', 'reading_minutes_per_day'])
    
    # 年でソート
    df = df.sort_values('year').reset_index(drop=True)
    
    # 保存
    output_path = DATA_PROCESSED_DIR / "reading_time_processed.csv"
    df.to_csv(output_path, index=False)
    print(f"Saved processed reading time data to {output_path}")
    
    # メタデータ
    import json
    metadata = {
        'description': 'Processed reading time data (minutes per day)',
        'source': df['source'].iloc[0] if len(df) > 0 else 'Unknown',
        'year_range': f"{df['year'].min()}-{df['year'].max()}" if len(df) > 0 else "N/A",
        'data_points': len(df),
        'note': 'Data collected every 5 years (社会生活基本調査)'
    }
    
    metadata_path = DATA_PROCESSED_DIR / "reading_time_metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    return df


if __name__ == "__main__":
    process_reading_time()

