import sys
import os

# Add the app directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.nlp.extractor import EntityExtractor
from app.core.nlp.scorer import Scorer

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

def debug_extraction():
    extractor = EntityExtractor()
    
    print("--- JD EXTRACTION ---")
    jd_skills = extractor.extract_skills(JD_TEXT)
    print(f"JD Skills: {sorted(list(jd_skills))}")
    
    print("\n--- RESUME EXTRACTION ---")
    resume_skills = extractor.extract_skills(RESUME_TEXT)
    print(f"Resume Skills: {sorted(list(resume_skills))}")
    
    scorer = Scorer()
    matched, missing = scorer.analyze_gaps(resume_skills, jd_skills)
    print(f"\nMatched: {matched}")
    print(f"Missing: {missing}")
    
    score = scorer.calculate_match_score(RESUME_TEXT, JD_TEXT, resume_skills, jd_skills)
    print(f"\nFinal Score: {score}%")

if __name__ == "__main__":
    debug_extraction()
