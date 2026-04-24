from fastapi import APIRouter, HTTPException, Header
from app.db.supabase import get_supabase_admin
from typing import List
from app.models.response import AnalysisResponse

router = APIRouter()

@router.get("/{user_id}", response_model=List[AnalysisResponse])
async def get_user_history(user_id: str, x_user_id: str | None = Header(default=None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if x_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        supabase = get_supabase_admin()
        response = supabase.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        # Map Supabase fields to Pydantic model
        records = []
        for row in response.data:
            records.append(AnalysisResponse(
                analysis_id=str(row["id"]),
                match_score=float(row["match_score"]),
                score_label=row["score_label"],
                matched_keywords=row["matched_keywords"],
                missing_keywords=row["missing_keywords"],
                suggestions=row["suggestions"],
                entities=row["entities"],
                word_count=row["resume_word_count"],
                processing_time_ms=row["processing_time_ms"],
            ))
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str, x_user_id: str | None = Header(default=None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    try:
        supabase = get_supabase_admin()
        
        # Check ownership before deleting
        check = supabase.table("analyses").select("user_id").eq("id", analysis_id).single().execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        if check.data.get("user_id") and check.data["user_id"] != x_user_id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this analysis")

        supabase.table("analyses").delete().eq("id", analysis_id).execute()
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
