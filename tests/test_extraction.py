
from app.services.extraction_service import extract_text_from_pdf

print("Starting PDF extraction test...")

try:
    with open("sample.pdf", "rb") as file:
        content = file.read()

    print(f"PDF loaded: {len(content)} bytes")

    text = extract_text_from_pdf(content)

    print("\n--- Extracted text ---")
    print(text if text.strip() else "No selectable text found.")

    print("\nPDF extraction test completed.")

except Exception as error:
    print(f"\nTEST FAILED: {error}")
