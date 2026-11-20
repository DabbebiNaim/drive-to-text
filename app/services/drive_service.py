
import os
import re

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

SUPPORTED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
}


class DriveServiceError(Exception):
    pass


def extract_folder_id(folder_url: str) -> str:
    pattern = (
        r"^https?://"
        r"(?:drive\.google\.com|docs\.google\.com)"
        r"/(?:drive/(?:u/\d+/)?folders|folders)/"
        r"([a-zA-Z0-9_-]+)"
    )

    match = re.match(pattern, folder_url)

    if not match:
        raise DriveServiceError("Invalid Google Drive folder URL.")

    return match.group(1)


def list_folder_files(folder_url: str) -> list:
    if not API_KEY:
        raise DriveServiceError(
            "Google Drive API key is missing. Check your .env file."
        )

    folder_id = extract_folder_id(folder_url)

    try:
        service = build(
            "drive",
            "v3",
            developerKey=API_KEY,
            cache_discovery=False,
        )

        files = []
        page_token = None

        while True:
            response = service.files().list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields=(
                    "nextPageToken,"
                    "files(id,name,mimeType,size,webViewLink)"
                ),
                pageSize=100,
                pageToken=page_token,
            ).execute()

            for item in response.get("files", []):
                if item.get("mimeType") in SUPPORTED_TYPES:
                    files.append({
                        "id": item["id"],
                        "name": item["name"],
                        "mime_type": item["mimeType"],
                        "size": item.get("size", 0),
                        "web_view_link": item.get("webViewLink"),
                    })

            page_token = response.get("nextPageToken")

            if not page_token:
                break

        return files

    except HttpError as error:
        raise DriveServiceError(
            f"Google Drive API error: {error}"
        ) from error
    except DriveServiceError:
        raise
    except Exception as error:
        raise DriveServiceError(
            f"Could not retrieve files: {error}"
        ) from error

def download_file(file_id: str) -> bytes:
    """Download a file's content from Google Drive."""
    if not API_KEY:
        raise DriveServiceError("Google Drive API key is missing.")

    try:
        service = build(
            "drive",
            "v3",
            developerKey=API_KEY,
            cache_discovery=False,
        )

        response = service.files().get_media(
            fileId=file_id
        ).execute()

        return response

    except HttpError as error:
        raise DriveServiceError(
            f"Could not download file {file_id}: {error}"
        ) from error

def get_file_metadata(file_id: str) -> dict:
    """Retrieve metadata for a Google Drive file."""
    if not API_KEY:
        raise DriveServiceError("Google Drive API key is missing.")

    try:
        service = build(
            "drive",
            "v3",
            developerKey=API_KEY,
            cache_discovery=False,
        )

        return service.files().get(
            fileId=file_id,
            fields="id,name,mimeType,size,webViewLink",
        ).execute()

    except HttpError as error:
        raise DriveServiceError(
            f"Could not retrieve file metadata: {error}"
        ) from error
