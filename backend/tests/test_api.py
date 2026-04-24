from pathlib import Path

from app.api.v1.endpoints import analyze as analyze_endpoint
from app.api.v1.endpoints import history as history_endpoint

from conftest import FakeSupabase


def test_analyze_endpoint_valid_pdf(client, sample_pdf_path: Path, monkeypatch):
    monkeypatch.setattr(analyze_endpoint, "save_to_supabase", lambda *_args, **_kwargs: None)
    with open(sample_pdf_path, "rb") as f:
        response = client.post(
            "/api/v1/analyze",
            files={"resume_file": ("test_resume.pdf", f, "application/pdf")},
            data={"job_description": "Need python react fastapi engineer", "user_id": "guest"},
        )
    assert response.status_code == 200
    payload = response.json()
    assert "analysis_id" in payload
    assert 0 <= payload["match_score"] <= 100


def test_analyze_endpoint_invalid_file(client, monkeypatch):
    monkeypatch.setattr(analyze_endpoint, "save_to_supabase", lambda *_args, **_kwargs: None)
    response = client.post(
        "/api/v1/analyze",
        files={"resume_file": ("resume.txt", b"not a pdf", "text/plain")},
        data={"job_description": "Need python react fastapi engineer", "user_id": "guest"},
    )
    assert response.status_code == 422


def test_analyze_endpoint_empty_jd(client, sample_pdf_path: Path, monkeypatch):
    monkeypatch.setattr(analyze_endpoint, "save_to_supabase", lambda *_args, **_kwargs: None)
    with open(sample_pdf_path, "rb") as f:
        response = client.post(
            "/api/v1/analyze",
            files={"resume_file": ("test_resume.pdf", f, "application/pdf")},
            data={"job_description": "   ", "user_id": "guest"},
        )
    assert response.status_code == 422


def test_analyze_endpoint_oversized_pdf(client, monkeypatch):
    monkeypatch.setattr(analyze_endpoint, "save_to_supabase", lambda *_args, **_kwargs: None)
    huge_pdf = b"%PDF-1.4\n" + (b"0" * (6 * 1024 * 1024))
    response = client.post(
        "/api/v1/analyze",
        files={"resume_file": ("huge.pdf", huge_pdf, "application/pdf")},
        data={"job_description": "Need python react fastapi engineer", "user_id": "guest"},
    )
    assert response.status_code == 413


def test_history_endpoint_authenticated(client, monkeypatch):
    fake = FakeSupabase(
        {
            "analyses": [
                {
                    "id": "abc-123",
                    "user_id": "user-1",
                    "match_score": 91.2,
                    "score_label": "Excellent Match",
                    "matched_keywords": ["python"],
                    "missing_keywords": ["aws"],
                    "suggestions": ["Add AWS"],
                    "entities": {"ORG": []},
                    "resume_word_count": 350,
                    "processing_time_ms": 250,
                    "created_at": "2026-01-01T00:00:00Z",
                }
            ]
        }
    )
    monkeypatch.setattr(history_endpoint, "get_supabase_admin", lambda: fake)
    response = client.get("/api/v1/history/user-1", headers={"X-User-Id": "user-1"})
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_history_endpoint_unauthenticated(client):
    response = client.get("/api/v1/history/user-1")
    assert response.status_code == 401
