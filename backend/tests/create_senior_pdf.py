from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

def create_senior_pdf(output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 50, "Jane Doe")
    
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 70, "Senior Data Analyst | 5+ Years Experience")
    c.drawCentredString(width/2, height - 85, "Email: jane@email.com | LinkedIn: linkedin.com/in/janedoe")
    
    # Summary
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 120, "PROFESSIONAL SUMMARY")
    c.setFont("Helvetica", 11)
    summary = [
        "Experienced Data Analyst with a track record of building complex machine learning",
        "models and high-impact data visualization dashboards using Power BI and Tableau.",
        "Expert in SQL optimization and Python-based data engineering pipelines."
    ]
    y = height - 140
    for line in summary:
        c.drawString(50, y, line)
        y -= 15
    
    # Skills
    y -= 10
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "TECHNICAL SKILLS")
    c.setFont("Helvetica", 11)
    y -= 20
    skills = [
        "Programming: Python (Pandas, NumPy, Scikit-learn, TensorFlow)",
        "Database: SQL (PostgreSQL, MySQL), NoSQL",
        "Visualization: Tableau, Power BI, Matplotlib, Seaborn, Data Visualization",
        "Tools: Excel, Google Sheets, Git, GitHub, REST APIs",
        "Soft Skills: Communication skills, attention to detail, project management."
    ]
    for skill in skills:
        c.drawString(50, y, skill)
        y -= 15

    # Experience
    y -= 10
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "PROFESSIONAL EXPERIENCE")
    y -= 20
    
    exp1 = [
        "Senior Data Analyst — DataDynamics (2020–Present)",
        "- Led a team of analysts to deliver a cross-platform data visualization suite using Tableau and Power BI.",
        "- Optimized SQL queries reducing processing time by 40%.",
        "- Implemented machine learning models for customer churn prediction using Python and scikit-learn.",
        "- Managed end-to-end data pipelines and API integrations."
    ]
    for line in exp1:
        if "Senior Data" in line:
            c.setFont("Helvetica-Bold", 11)
        else:
            c.setFont("Helvetica", 11)
        c.drawString(50, y, line)
        y -= 15

    y -= 10
    exp2 = [
        "Data Analyst — InsightsCorp (2018–2020)",
        "- Developed automated reports in Excel and Google Sheets.",
        "- Maintained strong attention to detail in data cleaning and ETL processes.",
        "- Collaborated with stakeholders using excellent communication skills."
    ]
    for line in exp2:
        if "Data Analyst" in line:
            c.setFont("Helvetica-Bold", 11)
        else:
            c.setFont("Helvetica", 11)
        c.drawString(50, y, line)
        y -= 15

    c.save()
    print(f"Created Senior PDF at: {output_path}")

if __name__ == "__main__":
    path = os.path.join("d:\\resume-analyzer", "senior_resume.pdf")
    create_senior_pdf(path)
