
from io import BytesIO

import fitz 
from PIL import Image
from pypdf import PdfReader
import pytesseract

# Windows Tesseract configuration
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# Pages with fewer than 20 extracted characters are considered
MIN_TEXT_LENGTH = 20

# Rendering resolution for scanned PDF pages.
OCR_DPI = 200

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from a PDF.

    First tries normal PDF text extraction with pypdf.
    If a page has insufficient selectable text, renders that
    page with PyMuPDF and extracts its text using Tesseract OCR.
    """
    try:
        pdf = PdfReader(BytesIO(file_content))
        pages = []

        
        scanned_pdf = fitz.open(stream=file_content, filetype="pdf")

        try:
            for page_number, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""

                if len(text.strip()) < MIN_TEXT_LENGTH:
                    scanned_page = scanned_pdf.load_page(page_number - 1)

                    zoom = OCR_DPI / 72
                    matrix = fitz.Matrix(zoom, zoom)

                    pixmap = scanned_page.get_pixmap(
                        matrix=matrix,
                        alpha=False,
                    )

                    image_bytes = pixmap.tobytes("png")
                    image = Image.open(BytesIO(image_bytes))

                    ocr_text = pytesseract.image_to_string(
                        image,
                        lang="eng",
                    )

                    text = ocr_text.strip()

                if text.strip():
                    pages.append(
                        f"--- Page {page_number} ---\n{text.strip()}"
                    )

        finally:
            scanned_pdf.close()

        return "\n\n".join(pages)

    except Exception as error:
        raise ValueError(
            f"PDF extraction failed: {error}"
        ) from error

def extract_text_from_image(file_content: bytes) -> str:
    """Extract text from a PNG or JPEG image using Tesseract OCR."""
    try:
        image = Image.open(BytesIO(file_content))
        text = pytesseract.image_to_string(image, lang="eng")
        return text.strip()

    except Exception as error:
        raise ValueError(
            f"Image OCR failed: {error}"
        ) from error