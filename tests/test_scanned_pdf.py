
from app.services.extraction_service import extract_text_from_pdf

print("Starting scanned PDF OCR test...")

try:
    with open("scanned-sample.pdf", "rb") as file:
        content = file.read()

    text = extract_text_from_pdf(content)

    print("\n--- SCANNED PDF OCR RESULT ---")
    print(text if text else "No text detected.")

    if text.strip():
        print("\nSUCCESS: Text extracted from scanned PDF.")
    else:
        print("\nWARNING: No text was detected.")

except Exception as error:
    print(f"\nTEST FAILED: {error}")