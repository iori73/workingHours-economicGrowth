"""
データ統合のテストスクリプト
実データが正しく統合されているか確認
"""

import pandas as pd
import json
from pathlib import Path
import requests
import time

PROJECT_ROOT = Path(__file__).parent
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
API_BASE_URL = "http://localhost:5001/api"


def test_data_files():
    """データファイルの存在と内容を確認"""
    print("=" * 60)
    print("Testing Data Files")
    print("=" * 60)
    
    # 統合データセットの確認
    combined_path = DATA_PROCESSED_DIR / "combined_dataset.csv"
    if not combined_path.exists():
        print("❌ ERROR: combined_dataset.csv not found")
        return False
    
    df = pd.read_csv(combined_path)
    print(f"✅ Combined dataset found: {len(df)} data points")
    print(f"   Year range: {df['year'].min()}-{df['year'].max()}")
    print(f"   Columns: {', '.join(df.columns)}")
    
    # データの完全性チェック
    print("\nData completeness:")
    print(f"   Labor hours: {df['hours_per_year'].notna().sum()}/{len(df)} ({df['hours_per_year'].notna().sum()/len(df)*100:.1f}%)")
    print(f"   GDP growth: {df['gdp_growth_rate'].notna().sum()}/{len(df)} ({df['gdp_growth_rate'].notna().sum()/len(df)*100:.1f}%)")
    print(f"   GDP per capita: {df['gdp_per_capita_usd'].notna().sum()}/{len(df)} ({df['gdp_per_capita_usd'].notna().sum()/len(df)*100:.1f}%)")
    print(f"   Reading time: {df['reading_minutes_per_day'].notna().sum()}/{len(df)} ({df['reading_minutes_per_day'].notna().sum()/len(df)*100:.1f}%)")
    
    # データの妥当性チェック
    print("\nData validity checks:")
    
    # 労働時間の範囲チェック（1000-3000時間の範囲内）
    valid_hours = df['hours_per_year'].between(1000, 3000).sum()
    print(f"   Labor hours in valid range (1000-3000): {valid_hours}/{df['hours_per_year'].notna().sum()}")
    
    # GDP成長率の範囲チェック（-10%から15%の範囲内）
    valid_gdp_growth = df['gdp_growth_rate'].between(-10, 15).sum()
    print(f"   GDP growth in valid range (-10% to 15%): {valid_gdp_growth}/{df['gdp_growth_rate'].notna().sum()}")
    
    # 相関分析結果の確認
    correlation_path = DATA_PROCESSED_DIR / "correlation_analysis.json"
    if correlation_path.exists():
        with open(correlation_path, 'r', encoding='utf-8') as f:
            correlation = json.load(f)
        print(f"\n✅ Correlation analysis found: {len(correlation)} indicators")
        for indicator, result in correlation.items():
            if result:
                print(f"   {indicator}: r={result['pearson_correlation']:.4f}, p={result['pearson_p_value']:.4f}")
    
    return True


def test_api_endpoints():
    """APIエンドポイントのテスト"""
    print("\n" + "=" * 60)
    print("Testing API Endpoints")
    print("=" * 60)
    
    # サーバーが起動しているか確認
    try:
        response = requests.get(f"{API_BASE_URL}/../health", timeout=5)
        if response.status_code != 200:
            print("⚠️  WARNING: Backend server may not be running")
            print("   Please start the server with: python run_server.py")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Please start the server with: python run_server.py")
        return False
    
    # 年範囲の取得
    try:
        response = requests.get(f"{API_BASE_URL}/year-range", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Year range API: {data['min']}-{data['max']}")
        else:
            print(f"❌ ERROR: Year range API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: Year range API test failed: {e}")
        return False
    
    # データ取得のテスト
    try:
        response = requests.get(f"{API_BASE_URL}/data?start_year=2020&end_year=2023", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data API: Retrieved {data['count']} records (2020-2023)")
            
            # データの内容を確認
            if data['count'] > 0:
                sample = data['data'][0]
                print(f"   Sample record: year={sample.get('year')}, hours={sample.get('hours_per_year')}, gdp_growth={sample.get('gdp_growth_rate')}")
        else:
            print(f"❌ ERROR: Data API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: Data API test failed: {e}")
        return False
    
    # 相関分析のテスト
    try:
        response = requests.get(f"{API_BASE_URL}/correlation?indicator=gdp_growth_rate", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Correlation API: r={data['pearson_correlation']:.4f}, p={data['pearson_p_value']:.4f}")
        else:
            print(f"❌ ERROR: Correlation API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: Correlation API test failed: {e}")
        return False
    
    return True


def test_data_consistency():
    """データの一貫性をテスト"""
    print("\n" + "=" * 60)
    print("Testing Data Consistency")
    print("=" * 60)
    
    df = pd.read_csv(DATA_PROCESSED_DIR / "combined_dataset.csv")
    
    # 時系列の一貫性チェック
    years = sorted(df['year'].unique())
    print(f"✅ Year sequence: {years[0]}-{years[-1]} ({len(years)} years)")
    
    # 労働時間の傾向チェック（減少傾向であるべき）
    recent_hours = df[df['year'] >= 2010]['hours_per_year'].mean()
    old_hours = df[df['year'] < 1980]['hours_per_year'].mean()
    if recent_hours < old_hours:
        print(f"✅ Labor hours trend: Decreasing ({old_hours:.0f} → {recent_hours:.0f} hours/year)")
    else:
        print(f"⚠️  WARNING: Unexpected labor hours trend")
    
    # GDP成長率の妥当性チェック
    gdp_data = df[df['gdp_growth_rate'].notna()]
    if len(gdp_data) > 0:
        avg_growth = gdp_data['gdp_growth_rate'].mean()
        print(f"✅ Average GDP growth rate: {avg_growth:.2f}%")
    
    return True


def main():
    """全テストを実行"""
    print("\n" + "=" * 60)
    print("DATA INTEGRATION TEST")
    print("=" * 60)
    
    results = []
    
    results.append(("Data Files", test_data_files()))
    results.append(("API Endpoints", test_api_endpoints()))
    results.append(("Data Consistency", test_data_consistency()))
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! Real data is successfully integrated.")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
    
    return all_passed


if __name__ == "__main__":
    main()

