"""
Flaskアプリケーション
データ提供用のRESTful API
"""

from flask import Flask
from flask_cors import CORS
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from backend.api.routes import api

app = Flask(__name__)
CORS(app)  # フロントエンドからのアクセスを許可

# API Blueprintを登録
app.register_blueprint(api, url_prefix='/api')


@app.route('/')
def index():
    """ルートエンドポイント"""
    return {
        'message': 'Labor Hours and Economic Growth API',
        'endpoints': {
            '/api/data': 'Get data with optional filters (start_year, end_year, indicators)',
            '/api/indicators': 'Get list of available indicators',
            '/api/year-range': 'Get year range of available data',
            '/api/correlation': 'Get correlation analysis results',
            '/api/timeseries': 'Get time series analysis results',
            '/api/metadata': 'Get data source metadata'
        }
    }


@app.route('/health', methods=['GET'])
def health():
    """ヘルスチェック"""
    return {'status': 'healthy'}


if __name__ == '__main__':
    print("Starting Flask server...")
    print("API available at http://localhost:5001/api")
    app.run(debug=True, port=5001)

