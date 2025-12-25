"""
Vercelサーバーレス関数: メタデータ取得エンドポイント
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
    
    metadata = data_loader.get_metadata()
    
    return Response(
        json.dumps(metadata),
        status=200,
        headers={'Content-Type': 'application/json'}
    )

