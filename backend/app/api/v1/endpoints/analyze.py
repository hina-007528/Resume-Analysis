from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header
from app.core.pdf.parser import PDFParser
from app.core.nlp.preprocessor import TextPreprocessor
from app.core.nlp.extractor import EntityExtractor
from app.core.nlp.scorer import Scorer
from app.models.response import AnalysisResponse
from app.db.supabase import supabase
from app.config import settings
from typing import List
import time
import uuid

router = APIRouter()

# Initialize NLP components
preprocessor = TextPreprocessor()
extractor = EntityExtractor()
scorer = Scorer()


def ensure_profile_exists(user_id: str):
    """
    Ensure a profile row exists for an authenticated user.
    Uses an upsert-style approach to handle races.
    """
    if not user_id or user_id == "guest":
        return

    # Try to fetch user info from auth (optional but helpful for email)
    email = None
    full_name = None
    try:
        # Check if user exists in auth first to avoid FK violations on profiles
        auth_response = supabase.auth.admin.get_user_by_id(user_id)
        if auth_response and hasattr(auth_response, "user") and auth_response.user:
            email = auth_response.user.email
            user_metadata = getattr(auth_response.user, "user_metadata", {})
            full_name = user_metadata.get("full_name") or user_metadata.get("name")
    except Exception as e:
        print(f"Auth lookup failed for {user_id}: {e}")

    try:
        # Perform an upsert into profiles
        profile_data = {
            "id": user_id,
            "email": email or f"{user_id[:8]}@placeholder.local",
            "updated_at": "now()"
        }
        if full_name:
            profile_data["full_name"] = full_name
            
        supabase.table("profiles").upsert(profile_data, on_conflict="id").execute()
        print(f"Profile ensured for user {user_id}")
    except Exception as e:
        print(f"Critical error: Could not ensure profile for {user_id}: {e}")
        raise

def save_to_supabase(analysis_id: str, user_id: str, result: dict):
    """
    Save analysis results to Supabase.
    """
    # Validate user_id as a UUID if it's not "guest"
    valid_user_id = None
    if user_id and user_id != "guest":
        try:
            uuid.UUID(user_id)
            valid_user_id = user_id
        except ValueError:
            print(f"Invalid user_id provided: {user_id}. Saving as guest.")
            valid_user_id = None

    data = {
        "id": analysis_id,
        "user_id": valid_user_id,
        "match_score": result["match_score"],
        "score_label": result["score_label"],
        "matched_keywords": list(result["matched_keywords"]),
        "missing_keywords": list(result["missing_keywords"]),
        "suggestions": result["suggestions"],
        "job_description_snippet": result["job_description"][:200],
        "resume_filename": result["filename"],
        "resume_word_count": result["word_count"],
        "processing_time_ms": result["processing_time_ms"],
        "entities": result["entities"]
    }

    if not supabase:
        raise RuntimeError("Supabase client not initialized")

    try:
        if valid_user_id:
            ensure_profile_exists(valid_user_id)

        response = supabase.table("analyses").insert(data).execute()
        print(f"Saved analysis {analysis_id} to Supabase for user {valid_user_id}")
        return
    except Exception as e:
        print(f"Failed to save analysis {analysis_id}: {e}")
        # Final fallback to guest if it was an ownership issue
        if valid_user_id:
            print("Retrying save as guest...")
            data["user_id"] = None
            supabase.table("analyses").insert(data).execute()
        else:
            raise


@router.get("/analysis/{analysis_id}")
async def get_analysis_by_id(analysis_id: str, x_user_id: str | None = Header(default=None)):
    """
    Fetch a saved analysis by ID using backend credentials.
    Enforces ownership check if analysis has a user_id.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        response = supabase.table("analyses").select("*").eq("id", analysis_id).limit(1).execute()
        rows = response.data or []
        if not rows:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis = rows[0]
        
        # Enforce privacy with detailed logging
        db_user_id = str(analysis.get("user_id")).strip().lower() if analysis.get("user_id") else None
        request_user_id = str(x_user_id).strip().lower() if x_user_id else None

        if db_user_id:
            if db_user_id != request_user_id:
                error_msg = (
                    f"Access denied: This analysis belongs to user {db_user_id[:8]}..., "
                    f"but you are identified as {request_user_id[:8] if request_user_id else 'Guest'}. "
                    f"Full IDs: DB={db_user_id}, REQ={request_user_id}"
                )
                print(f"PRIVACY CHECK: {error_msg}")
                raise HTTPException(status_code=403, detail=error_msg)
            else:
                print(f"PRIVACY CHECK: Access granted for {analysis_id} to user {request_user_id}")
        else:
            print(f"PRIVACY CHECK: Access granted for public/unowned analysis {analysis_id}")
            
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis: {str(e)}")


@router.post("/analyze", response_model=AnalysisResponse)

async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...),
    user_id: str = Form("guest")
):
    print(f"Received analysis request for {resume_file.filename} | user: {user_id}")
    start_time = time.time()

    try:
        if not job_description or len(job_description.strip()) == 0:
            raise HTTPException(status_code=422, detail="Job description cannot be empty")

        # 1. Validate file
        if not resume_file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=422, detail="Only PDF files are allowed")
        
        file_bytes = await resume_file.read()
        print(f"File size: {len(file_bytes)} bytes")
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        if len(file_bytes) > settings.max_upload_size_mb * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"File size exceeds {settings.max_upload_size_mb}MB limit")
            
        # 2. Parse PDF
        print("Parsing PDF...")
        resume_text = PDFParser.extract_text(file_bytes)
        if not resume_text or len(resume_text.strip()) < 50:
            print(f"PDF extraction result: '{resume_text[:100] if resume_text else None}'")
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract text from PDF. "
                    "Please ensure it is a text-based PDF (not scanned/image-only). "
                    "Try re-saving as PDF from Word or Google Docs."
                ),
            )

        print(f"Extracted {len(resume_text)} characters from PDF")

        # 3. NLP Pipeline
        print("Running NLP pipeline...")
        clean_resume = preprocessor.get_clean_string(resume_text)
        clean_jd     = preprocessor.get_clean_string(job_description)

        resume_skills = extractor.extract_skills(resume_text)
        jd_skills     = extractor.extract_skills(job_description)

        print(f"Resume skills detected ({len(resume_skills)}): {sorted(resume_skills)}")
        print(f"JD skills detected     ({len(jd_skills)}): {sorted(jd_skills)}")

        entities = extractor.extract_entities(resume_text)

        # 4. Scoring (hybrid: TF-IDF + skill-overlap)
        print("Calculating match score...")
        match_score = scorer.calculate_match_score(
            clean_resume, clean_jd,
            resume_skills=resume_skills,
            jd_skills=jd_skills,
        )
        score_label = scorer.get_score_label(match_score)
        matched_skills, missing_skills = scorer.analyze_gaps(resume_skills, jd_skills)

        print(f"Match score: {match_score:.1f}% ({score_label})")
        print(f"Matched skills ({len(matched_skills)}): {matched_skills}")
        print(f"Missing skills ({len(missing_skills)}): {missing_skills}")

        # 5. Generate suggestions
        suggestions: List[str] = []

        # Specific skill gap tips
        if "sql" in missing_skills:
            suggestions.append("Consider adding SQL to your resume as it is a core requirement for this role.")
        
        viz_skills = {"data visualization", "power bi", "tableau"}
        missing_viz = viz_skills & set(missing_skills)
        if missing_viz:
            suggestions.append(f"The JD emphasizes visualization. Mention experience with {', '.join(missing_viz)}.")

        # General skill gap tip
        if missing_skills:
            top_missing = ", ".join(missing_skills[:5])
            suggestions.append(f"Add these keywords to improve ATS matching: {top_missing}.")

        # Score tier tip
        if match_score < 40:
            suggestions.append("Weak Match. Your resume needs significant tailoring to align with this JD.")
        elif match_score < 60:
            suggestions.append("Average Match. Good foundation, but missing key technical requirements.")
        elif match_score < 80:
            suggestions.append("Good Match! You have most of the required skills. Focus on quantifying impact.")
        else:
            suggestions.append("Excellent Match! Your profile is highly aligned with this position.")

        # No-skill-detection warning
        if not matched_skills and not jd_skills:
            suggestions.append(
                "No technical skills were detected in the job description. "
                "Make sure the JD text is pasted in full rather than just a title."
            )
        elif not matched_skills and jd_skills:
            suggestions.append(
                "No skill keywords from your resume matched the JD. "
                "Ensure your PDF is text-based and uses standard technology names."
            )

        processing_time_ms = int((time.time() - start_time) * 1000)
        analysis_id = str(uuid.uuid4())

        result = {
            "analysis_id": analysis_id,
            "match_score": round(match_score, 2),
            "score_label": score_label,
            "matched_keywords": matched_skills,
            "missing_keywords": missing_skills,
            "suggestions": suggestions,
            "entities": entities,
            "word_count": len(resume_text.split()),
            "processing_time_ms": processing_time_ms,
            "filename": resume_file.filename,
            "job_description": job_description,
        }

        print(f"Analysis completed in {processing_time_ms}ms | score: {match_score:.1f}%")

        # 6. Save to DB synchronously (fixes race condition with results page)
        save_to_supabase(analysis_id, user_id, result)

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected analysis error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Neural Engine error: {str(e)}")

