
from fastapi import FastAPI
from fastapi.responses import FileResponse

from app.api.drive import router as drive_router

app = FastAPI(
    title="Drive-to-Text",
    description="Extract text from PDF and image files stored in Google Drive.",
    version="1.0.0",
)

app.include_router(drive_router)



@app.get("/api/health")
def health_check():
    return {"status": "ok"}


