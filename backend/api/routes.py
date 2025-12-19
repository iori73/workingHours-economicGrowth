"""
APIルート定義
"""

from flask import Blueprint, jsonify, request
from backend.models.data_loader import DataLoader

api = Blueprint('api', __name__)
data_loader = DataLoader()


@api.route('/data', methods=['GET'])
def get_data():
    """
    データを取得
    
    Query parameters:
        start_year: 開始年（オプション）
        end_year: 終了年（オプション）
        indicators: カンマ区切りの指標リスト（オプション）
    """
    start_year = request.args.get('start_year', type=int)
    end_year = request.args.get('end_year', type=int)
    indicators_str = request.args.get('indicators', '')
    
    indicators = [ind.strip() for ind in indicators_str.split(',')] if indicators_str else None
    
    data = data_loader.get_data(
        start_year=start_year,
        end_year=end_year,
        indicators=indicators
    )
    
    if data is None:
        return jsonify({'error': 'Data not available'}), 404
    
    return jsonify({
        'data': data,
        'count': len(data)
    })


@api.route('/indicators', methods=['GET'])
def get_indicators():
    """利用可能な指標のリストを取得"""
    indicators = data_loader.get_available_indicators()
    
    return jsonify({
        'indicators': indicators
    })


@api.route('/year-range', methods=['GET'])
def get_year_range():
    """データの年範囲を取得"""
    year_range = data_loader.get_year_range()
    
    if year_range is None:
        return jsonify({'error': 'Data not available'}), 404
    
    return jsonify(year_range)


@api.route('/correlation', methods=['GET'])
def get_correlation():
    """
    相関分析結果を取得
    
    Query parameters:
        indicator: 特定の指標（オプション）
    """
    indicator = request.args.get('indicator')
    
    correlation = data_loader.get_correlation(indicator=indicator)
    
    if correlation is None:
        return jsonify({'error': 'Correlation analysis not available'}), 404
    
    return jsonify(correlation)


@api.route('/timeseries', methods=['GET'])
def get_timeseries_analysis():
    """時系列分析結果を取得"""
    timeseries = data_loader.get_timeseries_analysis()
    
    if timeseries is None:
        return jsonify({'error': 'Time series analysis not available'}), 404
    
    return jsonify(timeseries)


@api.route('/metadata', methods=['GET'])
def get_metadata():
    """メタデータを取得"""
    metadata = data_loader.get_metadata()
    
    return jsonify(metadata)

