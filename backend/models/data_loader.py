"""
データローダー
処理済みデータを読み込む
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"


class DataLoader:
    """データを読み込むクラス"""
    
    def __init__(self):
        self.combined_data = None
        self.correlation_results = None
        self.timeseries_results = None
        self.metadata = {}
        self._load_all_data()
    
    def _load_all_data(self):
        """全てのデータを読み込み"""
        # 統合データセット
        combined_path = DATA_PROCESSED_DIR / "combined_dataset.csv"
        if combined_path.exists():
            self.combined_data = pd.read_csv(combined_path)
            # 年を数値に変換（JSONシリアライズ用）
            self.combined_data['year'] = self.combined_data['year'].astype(int)
        
        # 相関分析結果
        correlation_path = DATA_PROCESSED_DIR / "correlation_analysis.json"
        if correlation_path.exists():
            with open(correlation_path, 'r', encoding='utf-8') as f:
                self.correlation_results = json.load(f)
        
        # 時系列分析結果
        timeseries_path = DATA_PROCESSED_DIR / "time_series_analysis.json"
        if timeseries_path.exists():
            with open(timeseries_path, 'r', encoding='utf-8') as f:
                self.timeseries_results = json.load(f)
        
        # メタデータ
        metadata_files = [
            'labor_hours_metadata.json',
            'economic_indicators_metadata.json',
            'reading_time_metadata.json'
        ]
        
        for meta_file in metadata_files:
            meta_path = DATA_PROCESSED_DIR / meta_file
            if meta_path.exists():
                with open(meta_path, 'r', encoding='utf-8') as f:
                    key = meta_file.replace('_metadata.json', '')
                    self.metadata[key] = json.load(f)
    
    def _sanitize_data(self, data):
        """
        データからNaNとInfinityを再帰的に削除
        """
        if isinstance(data, dict):
            return {k: self._sanitize_data(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_data(v) for v in data]
        elif isinstance(data, float):
            if np.isnan(data) or np.isinf(data):
                return None
            return data
        return data

    def get_data(self, start_year=None, end_year=None, indicators=None):
        """
        データを取得（フィルタリング可能）
        
        Args:
            start_year: 開始年
            end_year: 終了年
            indicators: 取得する指標のリスト
        
        Returns:
            dict: フィルタリングされたデータ
        """
        if self.combined_data is None:
            return None
        
        df = self.combined_data.copy()
        
        # 年でフィルタリング
        if start_year:
            df = df[df['year'] >= start_year]
        if end_year:
            df = df[df['year'] <= end_year]
        
        # 指標でフィルタリング
        if indicators:
            # hours_per_yearは常に必要なので、必ず含める
            required_columns = ['year', 'hours_per_year']
            columns = required_columns + [ind for ind in indicators if ind in df.columns and ind not in required_columns]
            df = df[columns]
        
        # NaN値をnullに変換（JSONシリアライズ用）
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.where(pd.notnull(df), None)
        # さらに明示的に置換（pd.notnullで漏れる場合のため）
        df = df.replace({np.nan: None})
        
        return df.to_dict('records')
    
    def get_correlation(self, indicator=None):
        """相関分析結果を取得"""
        if self.correlation_results is None:
            return None
        
        if indicator:
            return self._sanitize_data(self.correlation_results.get(indicator))
        
        return self._sanitize_data(self.correlation_results)
    
    def get_timeseries_analysis(self):
        """時系列分析結果を取得"""
        return self._sanitize_data(self.timeseries_results)
    
    def get_metadata(self):
        """メタデータを取得"""
        return self._sanitize_data(self.metadata)
    
    def get_available_indicators(self):
        """利用可能な指標のリストを取得"""
        if self.combined_data is None:
            return []
        
        # 'year'以外の列を指標として返す
        indicators = [col for col in self.combined_data.columns if col != 'year']
        return indicators
    
    def get_year_range(self):
        """データの年範囲を取得"""
        if self.combined_data is None or len(self.combined_data) == 0:
            return None
        
        return {
            'min': int(self.combined_data['year'].min()),
            'max': int(self.combined_data['year'].max())
        }

