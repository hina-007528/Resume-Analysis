import time
import asyncio
from fastapi import APIRouter, HTTPException, Header, Response, Query
from app.db.supabase import get_supabase_admin
from app.core.report.generator import generate_pdf_report

router = APIRouter()

@router.get("/test/status")
async def test_status():
    return {"status": "ok", "version": "v2-detailed-logging", "timestamp": time.time()}

@router.get("/{analysis_id}")
async def get_report(
    analysis_id: str, 
    x_user_id: str | None = Header(default=None),
    u: str | None = Query(default=None)
):
    # Use either the header or the query parameter for the user ID
    effective_user_id = x_user_id or u
    
    try:
        supabase = get_supabase_admin()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Retry logic for database connection issues
    response = None
    for attempt in range(3):
        try:
            response = supabase.table('analyses').select("*").eq('id', analysis_id).single().execute()
            break
        except Exception as e:
            if attempt == 2:
                raise HTTPException(status_code=500, detail=f"Database error after 3 attempts: {str(e)}")
            await asyncio.sleep(1)

    if not response or not response.data:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    analysis = response.data
    
    # Enforce privacy with detailed logging
    db_user_id = str(analysis.get("user_id")).strip().lower() if analysis.get("user_id") else None
    request_user_id = str(effective_user_id).strip().lower() if effective_user_id else None

    if db_user_id:
        if db_user_id != request_user_id:
            error_msg = (
                f"Access denied: This report belongs to user {db_user_id[:8]}..., "
                f"but you are identified as {request_user_id[:8] if request_user_id else 'Guest'}. "
                f"Full IDs: DB={db_user_id}, REQ={request_user_id}"
            )
            print(f"PRIVACY CHECK: {error_msg}")
            raise HTTPException(status_code=403, detail=error_msg)
        else:
            print(f"PRIVACY CHECK: Access granted for {analysis_id} to user {request_user_id}")
    else:
        print(f"PRIVACY CHECK: Access granted for public/unowned report {analysis_id}")

    try:
        pdf_buffer = generate_pdf_report(analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    filename = f"Neural_Report_{analysis_id[:8]}.pdf"
    content = pdf_buffer.getvalue()
    
    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "Content-Length": str(len(content)),
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        }
    )
