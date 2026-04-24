import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.core.report.generator import generate_pdf_report
import time

mock_data = {
    "id": "9ce317e9-b622-4516-9ab0-6e6e3b0e7d02",
    "match_score": 45,
    "score_label": "INTERMEDIATE_MATCH",
    "resume_word_count": 1200,
    "matched_keywords": ["python", "django", "git", "github", "html", "machine learning", "numpy", "pandas", "python", "scikit-learn"],
    "missing_keywords": ["react", "typescript", "aws", "docker"],
    "suggestions": ["Add more experience with cloud platforms.", "Highlight TypeScript projects."],
    "resume_filename": "senior_resume.pdf",
    "processing_time_ms": 368
}

print("Starting PDF generation...")
start_time = time.time()
try:
    buffer = generate_pdf_report(mock_data)
    end_time = time.time()
    print(f"PDF generation took {end_time - start_time:.4f} seconds")
    print(f"Buffer size: {len(buffer.getvalue())} bytes")
except Exception as e:
    print(f"Error: {e}")
