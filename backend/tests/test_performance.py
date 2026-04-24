import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from app.api.v1.endpoints import analyze as analyze_endpoint


def _send_request(client, sample_pdf_path: Path):
    with open(sample_pdf_path, "rb") as f:
        return client.post(
            "/api/v1/analyze",
            files={"resume_file": ("test_resume.pdf", f, "application/pdf")},
            data={"job_description": "Need python react fastapi engineer", "user_id": "guest"},
        )


def test_processing_time(client, sample_pdf_path: Path, monkeypatch):
    monkeypatch.setattr(analyze_endpoint, "save_to_supabase", lambda *_args, **_kwargs: None)
    start = time.perf_counter()
    response = _send_request(client, sample_pdf_path)
    elapsed = time.perf_counter() - start
    assert response.status_code == 200
    assert elapsed < 3.0


def test_concurrent_requests(client, sample_pdf_path: Path, monkeypatch):
    monkeypatch.setattr(analyze_endpoint, "save_to_supabase", lambda *_args, **_kwargs: None)
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(_send_request, client, sample_pdf_path) for _ in range(10)]
        responses = [f.result() for f in futures]
    assert all(r.status_code == 200 for r in responses)
