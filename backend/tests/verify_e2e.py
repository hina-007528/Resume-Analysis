import sys
import os
import pprint

# Add the app directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.nlp.extractor import EntityExtractor
from app.core.nlp.scorer import Scorer, calculate_match_score, get_score_label

RESUME_TEXT = """
Muhammad Awais
Computer Science Student | MAO Graduate College Lahore
Email: awais@email.com | GitHub: github.com/awais

SKILLS:
Python, pandas, NumPy, scikit-learn, TensorFlow, Git, HTML, CSS, Django

EDUCATION:
BSc Computer Science — MAO Graduate College Lahore (2023–2026)

PROJECTS:
1. Resume Analyzer — NLP-based web app using Python, spaCy, Streamlit
2. Image Classifier — CNN model using TensorFlow achieving 94% accuracy

EXPERIENCE:
Internship at TechSoft (3 months) — Developed REST APIs using Django
"""

JD_TEXT = """
Junior Data Analyst — TechCorp Pakistan
Required Skills: Python, SQL, pandas, data visualization, Power BI, 
Tableau, machine learning, communication skills, attention to detail.
Preferred: Experience with APIs, knowledge of Excel or Google Sheets.
"""

def run_e2e_test():
    extractor = EntityExtractor()
    scorer = Scorer()

    print("--- 1. Extraction ---")
    resume_skills = extractor.extract_skills(RESUME_TEXT)
    jd_skills = extractor.extract_skills(JD_TEXT)
    
    print(f"Resume Skills: {sorted(list(resume_skills))}")
    print(f"JD Skills: {sorted(list(jd_skills))}")
    
    matched, missing = scorer.analyze_gaps(resume_skills, jd_skills)
    print(f"Matched: {matched}")
    print(f"Missing: {missing}")

    print("\n--- 2. Scoring ---")
    # Using the top-level function which includes acronym expansion
    score = calculate_match_score(RESUME_TEXT, JD_TEXT)
    label = get_score_label(score)
    
    print(f"Match Score: {score}%")
    print(f"Label: {label}")
    
    # Verification logic
    errors = []
    if not (55 <= score <= 75):
        errors.append(f"Score {score}% is outside expected range 55-75%")
    
    expected_matches = ["python", "pandas", "machine learning"]
    for m in expected_matches:
        if m not in matched:
            errors.append(f"Missing expected match: {m}")
            
    expected_missing = ["sql", "power bi", "tableau", "data visualization", "attention to detail"]
    for m in expected_missing:
        if m not in missing:
            errors.append(f"Missing expected gap: {m}")

    if errors:
        print("\n[FAILED] Verification Errors:")
        for e in errors:
            print(f" - {e}")
    else:
        print("\n[PASSED] All backend outputs match expectations!")

if __name__ == "__main__":
    run_e2e_test()
