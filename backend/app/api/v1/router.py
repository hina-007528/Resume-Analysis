from fastapi import APIRouter
from app.api.v1.endpoints import analyze, history, report

api_router = APIRouter()
# Keep legacy paths:
# - POST /api/v1/analyze
# - GET /api/v1/analysis/{id}
# - GET /api/v1/report/{id}
api_router.include_router(analyze.router, prefix="", tags=["analyze"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(report.router, prefix="/report", tags=["report"])
