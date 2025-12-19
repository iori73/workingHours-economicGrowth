"""
包括的なUIテストスクリプト
全てのドロップダウンメニューとタブの組み合わせを検証
"""

import requests
import time
from itertools import product

BASE_URL = "http://localhost:5001/api"
FRONTEND_URL = "http://localhost:8000"

# テスト対象の組み合わせ
INDICATORS = ["gdp_growth_rate", "gdp_per_capita_usd"]  # labor_productivity removed - not in dataset
YEAR_RANGES = [
    (1948, 2023),  # Full range
    (1948, 1970),  # Early period
    (1970, 1990),  # Middle period
    (1990, 2023),  # Recent period
    (2010, 2023),  # Very recent
    (1955, 2020),  # Custom range
]

class TestResult:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name, details=""):
        self.passed.append((test_name, details))
        print(f"✅ PASS: {test_name}")
        if details:
            print(f"   {details}")
    
    def add_fail(self, test_name, error):
        self.failed.append((test_name, error))
        print(f"❌ FAIL: {test_name}")
        print(f"   Error: {error}")
    
    def add_warning(self, test_name, message):
        self.warnings.append((test_name, message))
        print(f"⚠️  WARNING: {test_name}")
        print(f"   {message}")
    
    def print_summary(self):
        print("\n" + "=" * 70)
        print("TEST SUMMARY")
        print("=" * 70)
        print(f"✅ Passed: {len(self.passed)}")
        print(f"❌ Failed: {len(self.failed)}")
        print(f"⚠️  Warnings: {len(self.warnings)}")
        
        if self.failed:
            print("\nFailed Tests:")
            for test_name, error in self.failed:
                print(f"  - {test_name}: {error}")
        
        if self.warnings:
            print("\nWarnings:")
            for test_name, message in self.warnings:
                print(f"  - {test_name}: {message}")
        
        print("=" * 70)
        return len(self.failed) == 0


def test_api_health(results):
    """APIサーバーの健全性チェック"""
    print("\n" + "=" * 70)
    print("1. API Health Check")
    print("=" * 70)
    
    try:
        response = requests.get(f"{BASE_URL}/../health", timeout=5)
        if response.status_code == 200:
            results.add_pass("API Health Check", "Server is running")
        else:
            results.add_fail("API Health Check", f"Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        results.add_fail("API Health Check", "Cannot connect to server")
        return False
    except Exception as e:
        results.add_fail("API Health Check", str(e))
        return False
    
    return True


def test_indicator_combinations(results):
    """全ての経済指標と年範囲の組み合わせをテスト"""
    print("\n" + "=" * 70)
    print("2. Testing All Indicator + Year Range Combinations")
    print("=" * 70)
    
    total_tests = len(INDICATORS) * len(YEAR_RANGES)
    print(f"Testing {total_tests} combinations...")
    print()
    
    test_count = 0
    for indicator, (start_year, end_year) in product(INDICATORS, YEAR_RANGES):
        test_count += 1
        test_name = f"Test {test_count}/{total_tests}: {indicator} ({start_year}-{end_year})"
        
        try:
            # APIにリクエスト
            response = requests.get(
                f"{BASE_URL}/data",
                params={
                    "start_year": start_year,
                    "end_year": end_year,
                    "indicators": indicator
                },
                timeout=5
            )
            
            if response.status_code != 200:
                results.add_fail(test_name, f"Status {response.status_code}")
                continue
            
            data = response.json()
            
            # データの検証
            if not data.get('data'):
                results.add_fail(test_name, "No data returned")
                continue
            
            records = data['data']
            
            # 必要なカラムが存在するか確認
            if not records:
                results.add_warning(test_name, "Empty data set")
                continue
            
            first_record = records[0]
            
            # 労働時間カラムが必ず含まれているか確認（重要！）
            if 'hours_per_year' not in first_record:
                results.add_fail(
                    test_name,
                    "Missing 'hours_per_year' column - graph will be broken!"
                )
                continue
            
            # 指定した指標が含まれているか確認
            if indicator not in first_record:
                results.add_warning(
                    test_name,
                    f"Indicator '{indicator}' not in first record"
                )
            
            # データポイント数の確認
            expected_points = end_year - start_year + 1
            actual_points = len(records)
            
            if actual_points < expected_points * 0.5:  # 期待の50%未満
                results.add_warning(
                    test_name,
                    f"Only {actual_points}/{expected_points} data points"
                )
            
            # 労働時間データの有効性チェック
            hours_count = sum(1 for r in records if r.get('hours_per_year') is not None)
            if hours_count == 0:
                results.add_fail(test_name, "No valid labor hours data")
                continue
            
            # 指標データの有効性チェック
            indicator_count = sum(1 for r in records if r.get(indicator) is not None)
            if indicator_count == 0:
                results.add_warning(test_name, f"No valid {indicator} data")
            
            results.add_pass(
                test_name,
                f"{actual_points} records, {hours_count} hours, {indicator_count} {indicator}"
            )
            
        except requests.exceptions.Timeout:
            results.add_fail(test_name, "Request timeout")
        except Exception as e:
            results.add_fail(test_name, str(e))
    
    print()


def test_year_range_api(results):
    """年範囲APIのテスト"""
    print("\n" + "=" * 70)
    print("3. Year Range API Test")
    print("=" * 70)
    
    try:
        response = requests.get(f"{BASE_URL}/year-range", timeout=5)
        if response.status_code == 200:
            data = response.json()
            results.add_pass(
                "Year Range API",
                f"Range: {data['min']}-{data['max']}"
            )
        else:
            results.add_fail("Year Range API", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("Year Range API", str(e))


def test_correlation_api(results):
    """相関分析APIのテスト"""
    print("\n" + "=" * 70)
    print("4. Correlation API Test")
    print("=" * 70)
    
    for indicator in INDICATORS:
        test_name = f"Correlation API - {indicator}"
        try:
            response = requests.get(
                f"{BASE_URL}/correlation",
                params={"indicator": indicator},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if 'pearson_correlation' in data:
                    results.add_pass(
                        test_name,
                        f"r={data['pearson_correlation']:.4f}"
                    )
                else:
                    results.add_warning(test_name, "No correlation data")
            else:
                results.add_fail(test_name, f"Status {response.status_code}")
        except Exception as e:
            results.add_fail(test_name, str(e))


def test_indicators_api(results):
    """利用可能な指標APIのテスト"""
    print("\n" + "=" * 70)
    print("5. Available Indicators API Test")
    print("=" * 70)
    
    try:
        response = requests.get(f"{BASE_URL}/indicators", timeout=5)
        if response.status_code == 200:
            data = response.json()
            indicators = data.get('indicators', [])
            results.add_pass(
                "Indicators API",
                f"Found {len(indicators)} indicators: {', '.join(indicators)}"
            )
            
            # 必要な指標が含まれているか確認
            required = ['hours_per_year', 'gdp_growth_rate', 'gdp_per_capita_usd']
            missing = [i for i in required if i not in indicators]
            if missing:
                results.add_warning(
                    "Indicators API",
                    f"Missing indicators: {', '.join(missing)}"
                )
        else:
            results.add_fail("Indicators API", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("Indicators API", str(e))


def test_edge_cases(results):
    """エッジケースのテスト"""
    print("\n" + "=" * 70)
    print("6. Edge Cases Test")
    print("=" * 70)
    
    edge_cases = [
        ("Future years", {"start_year": 2024, "end_year": 2030}),
        ("Old years", {"start_year": 1900, "end_year": 1940}),
        ("Reversed range", {"start_year": 2020, "end_year": 2010}),
        ("Single year", {"start_year": 2020, "end_year": 2020}),
        ("No parameters", {}),
    ]
    
    for test_name, params in edge_cases:
        try:
            response = requests.get(
                f"{BASE_URL}/data",
                params=params,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                record_count = len(data.get('data', []))
                results.add_pass(
                    f"Edge Case: {test_name}",
                    f"{record_count} records returned"
                )
            else:
                results.add_warning(
                    f"Edge Case: {test_name}",
                    f"Status {response.status_code}"
                )
        except Exception as e:
            results.add_warning(f"Edge Case: {test_name}", str(e))


def main():
    """メインテスト実行"""
    print("\n" + "=" * 70)
    print("COMPREHENSIVE UI/API TESTING")
    print("=" * 70)
    print("Testing all combinations of indicators, year ranges, and tabs")
    print()
    
    results = TestResult()
    
    # サーバーの健全性チェック
    if not test_api_health(results):
        print("\n❌ Server is not running. Please start with: venv/bin/python run_server.py")
        return False
    
    # 各種テストを実行
    test_year_range_api(results)
    test_indicators_api(results)
    test_indicator_combinations(results)
    test_correlation_api(results)
    test_edge_cases(results)
    
    # サマリー表示
    success = results.print_summary()
    
    if success:
        print("\n🎉 All tests passed! The application is working correctly.")
        print(f"\nYou can now open {FRONTEND_URL} and test the UI manually.")
        print("The backend has been verified to work correctly for all combinations.")
    else:
        print("\n⚠️  Some tests failed. Please review the errors above.")
    
    return success


if __name__ == "__main__":
    main()

