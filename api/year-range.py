"""
Vercelサーバーレス関数: 年範囲取得エンドポイント
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
    
    year_range = data_loader.get_year_range()
    
    if year_range is None:
        return Response(
            json.dumps({'error': 'Data not available'}),
            status=404,
            headers={'Content-Type': 'application/json'}
        )
    
    return Response(
        json.dumps(year_range),
        status=200,
        headers={'Content-Type': 'application/json'}
    )

