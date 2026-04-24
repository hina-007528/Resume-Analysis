from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from io import BytesIO
import datetime


def _hex_to_color(hex_value: str):
    """Compatibility helper for ReportLab versions lacking HexColor aliases."""
    value = hex_value.lstrip("#")
    if len(value) != 6:
        return colors.black
    r = int(value[0:2], 16) / 255.0
    g = int(value[2:4], 16) / 255.0
    b = int(value[4:6], 16) / 255.0
    return colors.Color(r, g, b)


def _safe_list(value):
    if isinstance(value, list):
        return [str(v) for v in value if v is not None]
    if value is None:
        return []
    return [str(value)]


def _safe_text(value, fallback="N/A"):
    if value is None:
        return fallback
    text = str(value).strip()
    return text if text else fallback


def generate_pdf_report(data: dict) -> BytesIO:
    """
    Generates a professional PDF report from analysis data.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=LETTER)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=_hex_to_color("#00F5FF"),
        alignment=1, # Center
        spaceAfter=20
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=_hex_to_color("#7B2FFF"),
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = styles['BodyText']
    
    elements = []
    
    # Header
    elements.append(Paragraph("NEURAL_ANALYSIS_REPORT", title_style))
    elements.append(Paragraph(f"Timestamp: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    elements.append(Spacer(1, 20))
    
    # Summary Table
    score = data.get("match_score", 0)
    summary_data = [
        ["METRIC", "VALUE"],
        ["MATCH_COEFFICIENT", f"{_safe_text(score, '0')}%"],
        ["ATS_RATING", _safe_text(data.get("score_label"), "N/A")],
        ["WORD_COUNT", _safe_text(data.get("resume_word_count"), "0")],
    ]
    
    table = Table(summary_data, colWidths=[150, 250])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), _hex_to_color("#0A0A0F")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(table)
    elements.append(Spacer(1, 25))
    
    # Key Skills Identified
    elements.append(Paragraph("IDENTIFIED_NEURAL_NODES (SKILLS)", header_style))
    skills = ", ".join(_safe_list(data.get("matched_keywords")))
    elements.append(Paragraph(skills if skills else "No major skills identified.", body_style))
    elements.append(Spacer(1, 15))
    
    # Critical Gaps
    elements.append(Paragraph("CRITICAL_MATRIX_GAPS", header_style))
    gaps = ", ".join(_safe_list(data.get("missing_keywords")))
    elements.append(Paragraph(gaps if gaps else "No significant gaps detected.", body_style))
    elements.append(Spacer(1, 15))
    
    # System Suggestions
    elements.append(Paragraph("SYSTEM_OPTIMIZATIONS", header_style))
    for suggestion in _safe_list(data.get("suggestions")):
        elements.append(Paragraph(f"• {suggestion}", body_style))
    
    # Footer
    elements.append(Spacer(1, 50))
    elements.append(Paragraph("--- END OF TRANSMISSION ---", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
