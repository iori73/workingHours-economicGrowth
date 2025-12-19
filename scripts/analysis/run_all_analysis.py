"""
全分析を実行するメインスクリプト
"""

import sys
from pathlib import Path

# スクリプトディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from correlation_analysis import main as correlation_main
from time_series_analysis import main as timeseries_main

def main():
    """全分析を実行"""
    print("=" * 60)
    print("Running all analyses")
    print("=" * 60)
    
    print("\n[1/2] Correlation Analysis")
    correlation_main()
    
    print("\n[2/2] Time Series Analysis")
    timeseries_main()
    
    print("\n" + "=" * 60)
    print("All analyses completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()

