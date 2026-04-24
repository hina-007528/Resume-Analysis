from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_test_pdf():
    path = "d:/resume-analyzer/backend/tests/test_resume.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter
    
    content = [
        "Muhammad Awais",
        "Computer Science Student | MAO Graduate College Lahore",
        "Email: awais@email.com | GitHub: github.com/awais",
        "",
        "SKILLS:",
        "Python, pandas, NumPy, scikit-learn, TensorFlow, Git, HTML, CSS, Django",
        "",
        "EDUCATION:",
        "BSc Computer Science — MAO Graduate College Lahore (2023–2026)",
        "",
        "PROJECTS:",
        "1. Resume Analyzer — NLP-based web app using Python, spaCy, Streamlit",
        "2. Image Classifier — CNN model using TensorFlow achieving 94% accuracy",
        "",
        "EXPERIENCE:",
        "Internship at TechSoft (3 months) — Developed REST APIs using Django"
    ]
    
    y = height - 50
    for line in content:
        c.drawString(50, y, line)
        y -= 20
        
    c.save()
    print(f"PDF created at {path}")

if __name__ == "__main__":
    create_test_pdf()
