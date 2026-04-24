import sys
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Add the app directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.nlp.preprocessor import preprocess_text

def debug_score(resume_raw: str, jd_raw: str):
    resume = preprocess_text(resume_raw)
    jd = preprocess_text(jd_raw)
    
    print("--- PREPROCESSED RESUME ---")
    print(resume)
    print("\n--- PREPROCESSED JD ---")
    print(jd)
    
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform([resume, jd])
    
    feature_names = vectorizer.get_feature_names_out()
    resume_vec = tfidf_matrix[0].toarray()[0]
    jd_vec = tfidf_matrix[1].toarray()[0]
    
    # Show top weighted terms in each document
    resume_top = sorted(zip(feature_names, resume_vec), 
                       key=lambda x: x[1], reverse=True)[:15]
    jd_top = sorted(zip(feature_names, jd_vec), 
                   key=lambda x: x[1], reverse=True)[:15]
    
    score = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0] * 100
    
    print(f"\nSemantic Match Score (TF-IDF): {score:.2f}%")
    print(f"\nTop Resume Terms: {resume_top}")
    print(f"\nTop JD Terms: {jd_top}")
    
    # Show which JD terms are matching/missing
    shared = set(feature_names[resume_vec > 0]) & set(feature_names[jd_vec > 0])
    missing = set(feature_names[jd_vec > 0]) - set(feature_names[resume_vec > 0])
    print(f"\nMatched Terms ({len(shared)}): {sorted(shared)}")
    print(f"\nMissing Terms ({len(missing)}): {sorted(missing)}")

if __name__ == "__main__":
    RESUME_TEXT = """
    Muhammad Awais
    Computer Science Student | MAO Graduate College Lahore
    SKILLS: Python, pandas, NumPy, scikit-learn, TensorFlow, Git, HTML, CSS, Django
    EDUCATION: BSc Computer Science — MAO Graduate College Lahore (2023–2026)
    PROJECTS: 1. Resume Analyzer — NLP-based web app using Python, spaCy, Streamlit
    2. Image Classifier — CNN model using TensorFlow achieving 94% accuracy
    EXPERIENCE: Internship at TechSoft (3 months) — Developed REST APIs using Django
    """

    JD_TEXT = """
    Junior Data Analyst — TechCorp Pakistan
    Required Skills: Python, SQL, pandas, data visualization, Power BI, 
    Tableau, machine learning, communication skills, attention to detail.
    Preferred: Experience with APIs, knowledge of Excel or Google Sheets.
    """
    
    debug_score(RESUME_TEXT, JD_TEXT)
