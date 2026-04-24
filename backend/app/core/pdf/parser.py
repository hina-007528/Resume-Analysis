try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

import io
import re
from typing import Optional

class PDFParser:
    @staticmethod
    def extract_text(file_bytes: bytes) -> str:
        """
        Extract text from PDF using pdfplumber as primary and pypdf as fallback.
        Applies post-processing and sanity checks.
        """
        text = ""
        
        # Try pdfplumber first
        if pdfplumber:
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text(x_tolerance=3, y_tolerance=3)
                        if page_text:
                            text += page_text + "\n"
                        else:
                            page_text = page.extract_text_simple()
                            if page_text:
                                text += page_text + "\n"
                
                if text.strip():
                    return PDFParser.verify_extraction(PDFParser._clean_text(text))
            except Exception as e:
                if "password" in str(e).lower():
                    raise ValueError("This PDF is password protected. Please upload an unlocked version.")
                print(f"pdfplumber failed: {e}")
            
        # Fallback to pypdf
        if PdfReader:
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                if reader.is_encrypted:
                    raise ValueError("This PDF is password protected. Please upload an unlocked version.")
                
                text = ""
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                if text.strip():
                    return PDFParser.verify_extraction(PDFParser._clean_text(text))
            except ValueError:
                raise
            except Exception as e:
                print(f"pypdf failed: {e}")

        # If we get here, extraction yielded nothing
        raise ValueError(
            "PDF_EMPTY: No text could be extracted. "
            "This PDF appears to be scanned or image-based."
        )

    @staticmethod
    def verify_extraction(raw_text: str) -> str:
        """
        Post-extraction sanity checks.
        Raises ValueError with specific message if extraction looks wrong.
        """
        if not raw_text or len(raw_text.strip()) == 0:
            raise ValueError(
                "PDF_EMPTY: No text could be extracted. "
                "File may be scanned or image-based."
            )
        
        if len(raw_text.strip()) < 100:
            raise ValueError(
                f"PDF_TOO_SHORT: Extracted text is too short ({len(raw_text.strip())} chars). "
                "Resume may be incomplete."
            )
        
        # Check for garbled text (too many non-ASCII/non-Latin chars = encoding issue)
        # We allow latin-1 range (0-255) to support accents, but check for high non-readable counts
        non_readable = sum(1 for c in raw_text if ord(c) > 255)
        if len(raw_text) > 0 and non_readable / len(raw_text) > 0.3:
            raise ValueError(
                "PDF_ENCODING: High proportion of unreadable characters. "
                "Try re-saving the PDF from your word processor."
            )
        
        # Check minimum word count for a real resume
        word_count = len(raw_text.split())
        if word_count < 50:
            raise ValueError(
                f"PDF_SPARSE: Only {word_count} words extracted. "
                "Resume appears too sparse for analysis."
            )
        
        return raw_text.strip()

    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Clean up extracted PDF text for NLP processing.
        """
        # Remove common bullet points symbols and replace with space
        bullets = ["•", "▪", "●", "○", "♦", "◦", "■", "–", "—"]
        for b in bullets:
            text = text.replace(b, " ")

        # Normalize whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]{2,}', ' ', text)
        
        # Remove empty lines
        lines = [line.strip() for line in text.split('\n')]
        lines = [line for line in lines if line]
        return '\n'.join(lines).strip()
