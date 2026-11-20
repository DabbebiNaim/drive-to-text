
from app.services.extraction_service import extract_text_from_image

print("Starting OCR test...")

try:
    with open("sample.png", "rb") as file:
        content = file.read()

    text = extract_text_from_image(content)

    print("\n--- OCR RESULT ---")
    print(text if text else "No text detected.")

    print("\nOCR test completed.")

except Exception as error:
    print(f"OCR TEST FAILED: {error}")
