"""
時系列分析
トレンド、構造変化点の検出
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"


def load_combined_data():
    """統合データセットを読み込み"""
    data_path = DATA_PROCESSED_DIR / "combined_dataset.csv"
    
    if not data_path.exists():
        return None
    
    df = pd.read_csv(data_path)
    df['year'] = pd.to_datetime(df['year'], format='%Y')
    return df


def detect_trend_changes(series, window=5):
    """
    時系列データのトレンド変化点を検出
    
    Args:
        series: 時系列データ（pandas Series）
        window: 移動平均のウィンドウサイズ
    
    Returns:
        list: 変化点の年
    """
    # 移動平均を計算
    ma = series.rolling(window=window, center=True).mean()
    
    # 一次差分を計算
    diff = ma.diff()
    
    # 変化点の検出（差分の符号が変わる点）
    change_points = []
    for i in range(1, len(diff)):
        if not pd.isna(diff.iloc[i]) and not pd.isna(diff.iloc[i-1]):
            if (diff.iloc[i] > 0 and diff.iloc[i-1] < 0) or \
               (diff.iloc[i] < 0 and diff.iloc[i-1] > 0):
                change_points.append(series.index[i])
    
    return change_points


def calculate_trend(df, column, period_start=None, period_end=None):
    """
    特定期間のトレンドを計算（線形回帰）
    
    Returns:
        dict: 傾き、切片、R²値
    """
    if period_start:
        df = df[df['year'] >= pd.to_datetime(str(period_start))]
    if period_end:
        df = df[df['year'] <= pd.to_datetime(str(period_end))]
    
    if column not in df.columns:
        return None
    
    data = df[['year', column]].dropna()
    
    if len(data) < 2:
        return None
    
    # 年を数値に変換（回帰用）
    years_numeric = (data['year'] - data['year'].min()).dt.days / 365.25
    
    # 線形回帰
    slope, intercept = np.polyfit(years_numeric, data[column], 1)
    
    # R²値
    y_pred = slope * years_numeric + intercept
    ss_res = np.sum((data[column] - y_pred) ** 2)
    ss_tot = np.sum((data[column] - np.mean(data[column])) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    return {
        'slope': float(slope),
        'intercept': float(intercept),
        'r_squared': float(r_squared),
        'period_start': str(data['year'].min().year),
        'period_end': str(data['year'].max().year)
    }


def analyze_time_series(df):
    """時系列分析を実行"""
    if df is None:
        return None
    
    results = {}
    
    # 労働時間の分析
    if 'hours_per_year' in df.columns:
        labor_hours = df.set_index('year')['hours_per_year'].dropna()
        if len(labor_hours) > 0:
            results['labor_hours'] = {
                'change_points': [str(y.year) for y in detect_trend_changes(labor_hours)],
                'overall_trend': calculate_trend(df, 'hours_per_year'),
                'periods': {
                    '1950s_1970s': calculate_trend(df, 'hours_per_year', 1950, 1979),
                    '1980s_1990s': calculate_trend(df, 'hours_per_year', 1980, 1999),
                    '2000s_present': calculate_trend(df, 'hours_per_year', 2000, None)
                }
            }
    
    # GDP成長率の分析
    if 'gdp_growth_rate' in df.columns:
        results['gdp_growth_rate'] = {
            'overall_trend': calculate_trend(df, 'gdp_growth_rate'),
            'periods': {
                '1950s_1970s': calculate_trend(df, 'gdp_growth_rate', 1950, 1979),
                '1980s_1990s': calculate_trend(df, 'gdp_growth_rate', 1980, 1999),
                '2000s_present': calculate_trend(df, 'gdp_growth_rate', 2000, None)
            }
        }
    
    return results


def save_time_series_results(results):
    """時系列分析結果を保存"""
    output_path = DATA_PROCESSED_DIR / "time_series_analysis.json"
    
    # JSONシリアライズ可能な形式に変換
    def convert_to_serializable(obj):
        if isinstance(obj, dict):
            return {k: convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_serializable(item) for item in obj]
        elif isinstance(obj, (np.integer, np.floating)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj
    
    serializable_results = convert_to_serializable(results)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(serializable_results, f, ensure_ascii=False, indent=2)
    
    print(f"Saved time series analysis results to {output_path}")
    return output_path


def main():
    """時系列分析のメイン関数"""
    print("Performing time series analysis...")
    
    df = load_combined_data()
    
    if df is None:
        print("Data not found. Please run data processing first.")
        return
    
    results = analyze_time_series(df)
    
    if results:
        save_time_series_results(results)
        print("\nTime series analysis completed.")
    else:
        print("No time series analysis could be performed.")


if __name__ == "__main__":
    main()

