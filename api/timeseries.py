"""
Vercelサーバーレス関数: 時系列分析結果取得エンドポイント
"""
import sys
from pathlib import Path
import json

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from backend.models.data_loader import DataLoader

data_loader = DataLoader()


def handler(request):
    """Vercelサーバーレス関数ハンドラー"""
    from vercel import Response
    
    timeseries = data_loader.get_timeseries_analysis()
    
    if timeseries is None:
        return Response(
            json.dumps({'error': 'Time series analysis not available'}),
            status=404,
            headers={'Content-Type': 'application/json'}
        )
    
    return Response(
        json.dumps(timeseries),
        status=200,
        headers={'Content-Type': 'application/json'}
    )

