from pydantic import BaseModel
from typing import List, Dict, Optional

class AnalysisResponse(BaseModel):
    analysis_id: str
    match_score: float
    score_label: str
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    entities: Dict[str, List[str]]
    word_count: int
    processing_time_ms: int
    filename: Optional[str] = None
    job_description: Optional[str] = None
