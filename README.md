# Drive-to-Text

A small proof of concept that lists supported files in a public Google Drive folder and extracts text from PDFs and images.

## Stack
- FastAPI
- pypdf for native PDF text extraction
- Tesseract OCR via pytesseract for images
- Google Drive API for public-folder discovery

## Local setup

### Requirements
- Python 3.10+
- Tesseract OCR installed and available on PATH
- A Google Drive API key with the Google Drive API enabled

### Run
```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000.

## Project status
Starter scaffold. Drive listing, extraction, batch processing and JSON export are to be implemented.

## Licence
See LICENSE and LICENSES.md.
