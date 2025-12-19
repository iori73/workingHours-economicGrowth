"""
経済指標データの前処理と統合
GDP成長率、一人当たりGDP、労働生産性などのデータを統合
"""

import pandas as pd
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def load_economic_data():
    """複数のソースから経済指標データを読み込み"""
    data_sources = {}
    
    # 実データを優先的に使用
    # 内閣府の実GDPデータ
    cabinet_real_path = DATA_RAW_DIR / "cabinet_gdp_real.csv"
    if cabinet_real_path.exists():
        cabinet_gdp = pd.read_csv(cabinet_real_path)
        data_sources['cabinet_gdp'] = cabinet_gdp
        print("Using REAL Cabinet Office GDP data")
    else:
        # サンプルデータをフォールバック
        cabinet_gdp_path = DATA_RAW_DIR / "cabinet_gdp_sample.csv"
        if cabinet_gdp_path.exists():
            cabinet_gdp = pd.read_csv(cabinet_gdp_path)
            data_sources['cabinet_gdp'] = cabinet_gdp
            print("Using SAMPLE Cabinet Office GDP data")
    
    # OECD GDPデータ
    oecd_gdp_path = DATA_RAW_DIR / "oecd_gdp_sample.csv"
    if oecd_gdp_path.exists():
        oecd_gdp = pd.read_csv(oecd_gdp_path)
        data_sources['oecd_gdp'] = oecd_gdp
    
    return data_sources


def normalize_economic_data(data_sources):
    """経済指標データを正規化・統合"""
    # GDP成長率
    gdp_growth_data = []
    
    # OECDデータ
    if 'oecd_gdp' in data_sources:
        oecd_df = data_sources['oecd_gdp'].copy()
        if 'gdp_growth_rate' in oecd_df.columns:
            gdp_growth = oecd_df[['year', 'gdp_growth_rate']].copy()
            gdp_growth['source'] = 'OECD'
            gdp_growth_data.append(gdp_growth)
    
    # 内閣府データ
    if 'cabinet_gdp' in data_sources:
        cabinet_df = data_sources['cabinet_gdp'].copy()
        if 'gdp_growth_rate' in cabinet_df.columns:
            gdp_growth = cabinet_df[['year', 'gdp_growth_rate']].copy()
            gdp_growth['source'] = 'Cabinet_Office'
            gdp_growth_data.append(gdp_growth)
    
    # GDP成長率を統合
    if gdp_growth_data:
        gdp_growth_combined = pd.concat(gdp_growth_data, ignore_index=True)
        gdp_growth_processed = gdp_growth_combined.groupby('year').agg({
            'gdp_growth_rate': 'mean',
            'source': lambda x: ', '.join(x.unique())
        }).reset_index()
    else:
        gdp_growth_processed = pd.DataFrame(columns=['year', 'gdp_growth_rate', 'source'])
    
    # 一人当たりGDP
    gdp_per_capita_data = []
    
    if 'oecd_gdp' in data_sources:
        oecd_df = data_sources['oecd_gdp'].copy()
        if 'gdp_per_capita_usd' in oecd_df.columns:
            gdp_pc = oecd_df[['year', 'gdp_per_capita_usd']].copy()
            gdp_pc['source'] = 'OECD'
            gdp_per_capita_data.append(gdp_pc)
    
    if gdp_per_capita_data:
        gdp_pc_combined = pd.concat(gdp_per_capita_data, ignore_index=True)
        gdp_pc_processed = gdp_pc_combined.groupby('year').agg({
            'gdp_per_capita_usd': 'mean',
            'source': lambda x: ', '.join(x.unique())
        }).reset_index()
    else:
        gdp_pc_processed = pd.DataFrame(columns=['year', 'gdp_per_capita_usd', 'source'])
    
    # 実質GDP（内閣府データから）
    real_gdp_processed = None
    if 'cabinet_gdp' in data_sources:
        cabinet_df = data_sources['cabinet_gdp'].copy()
        if 'real_gdp_trillion_yen' in cabinet_df.columns:
            real_gdp_processed = cabinet_df[['year', 'real_gdp_trillion_yen']].copy()
            real_gdp_processed['source'] = 'Cabinet_Office'
    
    # 労働生産性の計算（実質GDP / 労働時間）
    # これは後で労働時間データと結合して計算
    
    return {
        'gdp_growth': gdp_growth_processed,
        'gdp_per_capita': gdp_pc_processed,
        'real_gdp': real_gdp_processed
    }


def calculate_labor_productivity(labor_hours_df, real_gdp_df):
    """労働生産性を計算（実質GDP / 労働時間）"""
    if real_gdp_df is None or labor_hours_df is None:
        return None
    
    # データを結合
    merged = pd.merge(
        real_gdp_df,
        labor_hours_df[['year', 'hours_per_year']],
        on='year',
        how='inner'
    )
    
    # 労働生産性 = 実質GDP（兆円） / 労働時間（時間/年）
    # 単位: 兆円/時間
    merged['labor_productivity'] = merged['real_gdp_trillion_yen'] / merged['hours_per_year']
    
    # 前年比成長率を計算
    merged['labor_productivity_growth'] = merged['labor_productivity'].pct_change() * 100
    
    return merged[['year', 'labor_productivity', 'labor_productivity_growth', 'source']]


def combine_economic_indicators(processed_data, labor_hours_df):
    """全ての経済指標を統合"""
    # 年を基準に全てのデータを結合
    result = pd.DataFrame()
    
    # GDP成長率
    if not processed_data['gdp_growth'].empty:
        result = processed_data['gdp_growth'][['year', 'gdp_growth_rate']].copy()
    
    # 一人当たりGDP
    if not processed_data['gdp_per_capita'].empty:
        if result.empty:
            result = processed_data['gdp_per_capita'][['year', 'gdp_per_capita_usd']].copy()
        else:
            result = pd.merge(
                result,
                processed_data['gdp_per_capita'][['year', 'gdp_per_capita_usd']],
                on='year',
                how='outer'
            )
    
    # 労働生産性
    if processed_data['real_gdp'] is not None and labor_hours_df is not None:
        productivity = calculate_labor_productivity(labor_hours_df, processed_data['real_gdp'])
        if productivity is not None:
            if result.empty:
                result = productivity[['year', 'labor_productivity', 'labor_productivity_growth']].copy()
            else:
                result = pd.merge(
                    result,
                    productivity[['year', 'labor_productivity', 'labor_productivity_growth']],
                    on='year',
                    how='outer'
                )
    
    # 年でソート
    if not result.empty:
        result = result.sort_values('year').reset_index(drop=True)
    
    return result


def save_processed_economic_indicators(df):
    """処理済み経済指標データを保存"""
    output_path = DATA_PROCESSED_DIR / "economic_indicators_processed.csv"
    df.to_csv(output_path, index=False)
    print(f"Saved processed economic indicators to {output_path}")
    
    # メタデータ
    import json
    metadata = {
        'description': 'Processed economic indicators (GDP growth, GDP per capita, labor productivity)',
        'indicators': list(df.columns),
        'year_range': f"{df['year'].min()}-{df['year'].max()}" if not df.empty else "N/A",
        'data_points': len(df)
    }
    
    metadata_path = DATA_PROCESSED_DIR / "economic_indicators_metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    return output_path


def process_economic_indicators(labor_hours_df=None):
    """経済指標データの処理メイン関数"""
    print("Processing economic indicators data...")
    
    # データ読み込み
    data_sources = load_economic_data()
    
    if not data_sources:
        print("No economic data found. Please run data collection first.")
        return None
    
    # データ正規化・統合
    processed = normalize_economic_data(data_sources)
    
    # 経済指標を統合
    combined = combine_economic_indicators(processed, labor_hours_df)
    
    if combined is None or combined.empty:
        print("Failed to process economic indicators data.")
        return None
    
    # 保存
    save_processed_economic_indicators(combined)
    
    print(f"Processed {len(combined)} data points")
    return combined


if __name__ == "__main__":
    # 労働時間データも必要なので、先に読み込む
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent))
    from process_labor_hours import process_labor_hours
    labor_hours = process_labor_hours()
    process_economic_indicators(labor_hours)

