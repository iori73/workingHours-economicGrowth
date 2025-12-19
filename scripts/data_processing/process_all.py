"""
全データの前処理と統合を行うメインスクリプト
"""

import sys
from pathlib import Path

# スクリプトディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from process_labor_hours import process_labor_hours
from process_economic_indicators import process_economic_indicators
from process_reading_time import process_reading_time
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"


def create_combined_dataset():
    """全てのデータを統合した最終データセットを作成"""
    print("\nCreating combined dataset...")
    
    # 各データを読み込み
    labor_hours_path = DATA_PROCESSED_DIR / "labor_hours_processed.csv"
    economic_path = DATA_PROCESSED_DIR / "economic_indicators_processed.csv"
    reading_path = DATA_PROCESSED_DIR / "reading_time_processed.csv"
    
    combined = pd.DataFrame()
    
    # 労働時間データ
    if labor_hours_path.exists():
        labor_hours = pd.read_csv(labor_hours_path)
        combined = labor_hours[['year', 'hours_per_year']].copy()
    
    # 経済指標データ
    if economic_path.exists():
        economic = pd.read_csv(economic_path)
        if combined.empty:
            combined = economic.copy()
        else:
            combined = pd.merge(combined, economic, on='year', how='outer')
    
    # 読書時間データ（5年ごとのデータなので、年で結合）
    if reading_path.exists():
        reading = pd.read_csv(reading_path)
        # 読書時間は5年ごとのデータなので、最も近い年で結合
        # または、線形補間で年次データに変換
        reading_interpolated = reading.set_index('year')['reading_minutes_per_day']
        # 年次データに補間
        if not combined.empty:
            combined['reading_minutes_per_day'] = combined['year'].map(
                lambda y: reading_interpolated.reindex(
                    range(reading_interpolated.index.min(), 
                          reading_interpolated.index.max() + 1)
                ).interpolate(method='linear').get(y, None)
            )
    
    # 年でソート
    if not combined.empty:
        combined = combined.sort_values('year').reset_index(drop=True)
        
        # 保存
        output_path = DATA_PROCESSED_DIR / "combined_dataset.csv"
        combined.to_csv(output_path, index=False)
        print(f"Saved combined dataset to {output_path}")
        print(f"Total data points: {len(combined)}")
        print(f"Year range: {combined['year'].min()}-{combined['year'].max()}")
        print(f"Columns: {', '.join(combined.columns)}")
    
    return combined


def main():
    """全データの処理メイン関数"""
    print("=" * 60)
    print("Starting data processing for all sources")
    print("=" * 60)
    
    # 労働時間データの処理
    print("\n[1/4] Processing labor hours data...")
    labor_hours = process_labor_hours()
    
    # 経済指標データの処理（労働時間データが必要）
    print("\n[2/4] Processing economic indicators data...")
    economic = process_economic_indicators(labor_hours)
    
    # 読書時間データの処理
    print("\n[3/4] Processing reading time data...")
    reading = process_reading_time()
    
    # 統合データセットの作成
    print("\n[4/4] Creating combined dataset...")
    combined = create_combined_dataset()
    
    print("\n" + "=" * 60)
    print("Data processing completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()

