from reportlab.pdfgen import canvas
import os

def create_test_pdf():
    c = canvas.Canvas("test_resume.pdf")
    c.drawString(100, 750, "John Doe Resume")
    c.drawString(100, 730, "Skills: Python, JavaScript, React, FastAPI, SQL")
    c.drawString(100, 710, "Experience: Software Engineer at Tech Corp.")
    c.save()
    print(f"Created {os.path.abspath('test_resume.pdf')}")

if __name__ == "__main__":
    create_test_pdf()
