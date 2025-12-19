"""
労働時間と経済指標の相関分析
"""

import pandas as pd
import numpy as np
from scipy import stats
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def load_combined_data():
    """統合データセットを読み込み"""
    data_path = DATA_PROCESSED_DIR / "combined_dataset.csv"
    
    if not data_path.exists():
        print("Combined dataset not found. Please run data processing first.")
        return None
    
    return pd.read_csv(data_path)


def calculate_correlation(labor_hours, economic_indicator):
    """
    労働時間と経済指標の相関係数を計算
    
    Returns:
        dict: 相関係数、p値、統計情報
    """
    # 欠損値を除外
    valid_data = pd.DataFrame({
        'labor_hours': labor_hours,
        'economic': economic_indicator
    }).dropna()
    
    if len(valid_data) < 3:
        return None
    
    # ピアソンの相関係数
    corr, p_value = stats.pearsonr(
        valid_data['labor_hours'],
        valid_data['economic']
    )
    
    # スピアマンの順位相関係数（ノンパラメトリック）
    spearman_corr, spearman_p = stats.spearmanr(
        valid_data['labor_hours'],
        valid_data['economic']
    )
    
    return {
        'pearson_correlation': float(corr),
        'pearson_p_value': float(p_value),
        'spearman_correlation': float(spearman_corr),
        'spearman_p_value': float(spearman_p),
        'n_samples': len(valid_data),
        'interpretation': interpret_correlation(corr)
    }


def interpret_correlation(corr):
    """相関係数の解釈"""
    abs_corr = abs(corr)
    if abs_corr < 0.1:
        return "negligible"
    elif abs_corr < 0.3:
        return "weak"
    elif abs_corr < 0.5:
        return "moderate"
    elif abs_corr < 0.7:
        return "strong"
    else:
        return "very_strong"


def analyze_all_correlations(df):
    """全ての経済指標と労働時間の相関を分析"""
    if df is None or 'hours_per_year' not in df.columns:
        return None
    
    labor_hours = df['hours_per_year']
    results = {}
    
    # GDP成長率
    if 'gdp_growth_rate' in df.columns:
        results['gdp_growth_rate'] = calculate_correlation(
            labor_hours,
            df['gdp_growth_rate']
        )
    
    # 一人当たりGDP
    if 'gdp_per_capita_usd' in df.columns:
        results['gdp_per_capita_usd'] = calculate_correlation(
            labor_hours,
            df['gdp_per_capita_usd']
        )
    
    # 労働生産性
    if 'labor_productivity' in df.columns:
        results['labor_productivity'] = calculate_correlation(
            labor_hours,
            df['labor_productivity']
        )
    
    # 労働生産性成長率
    if 'labor_productivity_growth' in df.columns:
        results['labor_productivity_growth'] = calculate_correlation(
            labor_hours,
            df['labor_productivity_growth']
        )
    
    # 読書時間（サブ要素）
    if 'reading_minutes_per_day' in df.columns:
        results['reading_minutes_per_day'] = calculate_correlation(
            labor_hours,
            df['reading_minutes_per_day']
        )
    
    return results


def save_correlation_results(results):
    """相関分析結果を保存"""
    output_path = DATA_PROCESSED_DIR / "correlation_analysis.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Saved correlation analysis results to {output_path}")
    return output_path


def main():
    """相関分析のメイン関数"""
    print("Performing correlation analysis...")
    
    # データ読み込み
    df = load_combined_data()
    
    if df is None:
        return
    
    # 相関分析
    results = analyze_all_correlations(df)
    
    if results:
        # 結果を表示
        print("\nCorrelation Analysis Results:")
        print("=" * 60)
        for indicator, result in results.items():
            if result:
                print(f"\n{indicator}:")
                print(f"  Pearson correlation: {result['pearson_correlation']:.4f}")
                print(f"  P-value: {result['pearson_p_value']:.4f}")
                print(f"  Interpretation: {result['interpretation']}")
                print(f"  Sample size: {result['n_samples']}")
        
        # 保存
        save_correlation_results(results)
    else:
        print("No correlation analysis could be performed.")


if __name__ == "__main__":
    main()

