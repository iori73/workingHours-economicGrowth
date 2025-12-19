"""
全データソースからデータを収集するメインスクリプト
"""

import sys
from pathlib import Path

# スクリプトディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from collect_oecd import (
    collect_labor_hours_oecd,
    collect_gdp_oecd
)
from collect_japan_gov import (
    collect_mhlw_labor_hours,
    collect_cabinet_gdp,
    collect_reading_time
)

def main():
    """全データソースからデータを収集"""
    print("=" * 60)
    print("Starting data collection from all sources")
    print("=" * 60)
    
    # OECDデータ
    print("\n[1/5] Collecting OECD data...")
    collect_labor_hours_oecd()
    collect_gdp_oecd()
    
    # 日本の政府統計
    print("\n[2/5] Collecting Japanese government statistics...")
    collect_mhlw_labor_hours()
    collect_cabinet_gdp()
    
    # 読書時間データ
    print("\n[3/5] Collecting reading time data...")
    collect_reading_time()
    
    print("\n" + "=" * 60)
    print("Data collection completed!")
    print("=" * 60)
    print("\nNote: Sample data has been created for development.")
    print("For production use, implement actual data collection")
    print("using e-Stat API, OECD API, or manual downloads.")


if __name__ == "__main__":
    main()

