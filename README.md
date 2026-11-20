# Drive-to-Text

**A document extraction tool for publicly accessible Google Drive folders.**

Drive-to-Text is a Python-based proof of concept designed to discover supported files in public Google Drive folders and extract readable text from PDFs and images.

The project combines the Google Drive API, native PDF text extraction and Optical Character Recognition (OCR) to simplify document discovery and text extraction.

## Features

- **Google Drive integration** – Discover supported files in publicly accessible Google Drive folders.
- **PDF text extraction** – Extract embedded text from PDF documents using `pypdf`.
- **Image text recognition** – Extract text from images using Tesseract OCR.
- **REST API** – Backend API built with FastAPI.
- **Automated testing** – Test coverage for health checks, PDF extraction and OCR functionality.

## Tech Stack

| Technology | Purpose |
|---|---|
| Python 3.10+ | Application development |
| FastAPI | REST API framework |
| Google Drive API | File discovery |
| pypdf | PDF text extraction |
| Tesseract OCR | Image text recognition |
| pytesseract | Python integration for Tesseract |
| pytest | Automated testing |

## Project Structure

```text
drive-to-text/
├── app/
│   ├── api/
│   │   └── drive.py
│   ├── services/
│   │   ├── drive_service.py
│   │   └── extraction_service.py
│   └── main.py
├── frontend/
│   ├── public/
│   └── src/
├── tests/
│   ├── test_extraction.py
│   ├── test_health.py
│   ├── test_ocr.py
│   └── test_scanned_pdf.py
├── .env.example
├── .gitignore
├── requirements.txt
├── LICENSE
├── LICENSES.md
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Python 3.10 or later
- Tesseract OCR
- Google Drive API key with the Google Drive API enabled

Tesseract must be installed separately and accessible through your system PATH.

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/drive-to-text.git
cd drive-to-text
```

**2. Create a virtual environment**

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**3. Install Python dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure environment variables**

Create a local environment file:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

Add your Google Drive API key using the environment variable specified in `.env.example`.

**5. Start the application**

```bash
uvicorn app.main:app --reload
```

The application will be available at:

- **API:** http://127.0.0.1:8000
- **Interactive API documentation:** http://127.0.0.1:8000/docs

## Running Tests

Run the test suite from the project root:

```bash
pytest
```

## Development Roadmap

Planned improvements:

- [ ] Complete Google Drive folder discovery.
- [ ] Implement end-to-end document extraction.
- [ ] Improve scanned PDF processing.
- [ ] Add batch processing for multiple files.
- [ ] Implement JSON export.
- [ ] Improve error handling and input validation.
- [ ] Expand automated test coverage.
- [ ] Enhance frontend functionality.

## Current Status

Drive-to-Text is an actively developed proof of concept. The repository provides the initial application structure and document-processing components, with further integration and functionality planned.

## Security

- Keep API keys and credentials in your local `.env` file.
- Never commit secrets or credentials to version control.
- Only access files you are authorised to process.

## Licence

See [LICENSE](LICENSE) and [LICENSES.md](LICENSES.md) for licensing information.
