
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl

from app.services.drive_service import (
    DriveServiceError,
    list_folder_files,
    download_file,
)

from app.services.extraction_service import (
    extract_text_from_pdf,
    extract_text_from_image,
)

router = APIRouter(prefix="/api/drive", tags=["Google Drive"])


class DriveRequest(BaseModel):
    folder_url: HttpUrl


class BatchRequest(BaseModel):
    file_ids: list[str]


@router.post("/list")
def list_drive_files(request: DriveRequest):
    try:
        files = list_folder_files(str(request.folder_url))

        return {
            "success": True,
            "total": len(files),
            "files": files,
        }

    except DriveServiceError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/extract")
def extract_drive_files(request: BatchRequest):
    results = []

    for file_id in request.file_ids:
        result = {
            "file_id": file_id,
            "status": "failed",
            "text": "",
            "error": None,
        }

        try:
            file_content = download_file(file_id)

            # Retrieve file metadata to identify its type
            from app.services.drive_service import get_file_metadata

            metadata = get_file_metadata(file_id)
            mime_type = metadata["mimeType"]

            if mime_type == "application/pdf":
                extracted_text = extract_text_from_pdf(file_content)

            elif mime_type in ("image/png", "image/jpeg"):
                extracted_text = extract_text_from_image(file_content)

            else:
                raise ValueError("Unsupported file type.")

            result["status"] = "success"
            result["text"] = extracted_text

        except Exception as error:
            result["error"] = str(error)

        results.append(result)

    return {
        "success": True,
        "total": len(results),
        "successful": sum(
            1 for item in results if item["status"] == "success"
        ),
        "failed": sum(
            1 for item in results if item["status"] == "failed"
        ),
        "results": results,
    }
