import PyPDF2
from io import BytesIO
from typing import Optional


def extract_text_from_pdf(pdf_bytes: bytes) -> Optional[str]:
    """Extract text from PDF file bytes."""
    try:
        pdf_file = BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None

