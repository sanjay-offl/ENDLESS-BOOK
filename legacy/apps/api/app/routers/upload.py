from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.models.schemas import SignUploadRequest, SignUploadResponse
from app.services.storage import generate_signed_upload

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "audio/webm", "audio/mp3", "audio/wav"}


@router.post("/sign", response_model=SignUploadResponse)
async def sign_upload(request: SignUploadRequest, user: dict = Depends(get_current_user)):
    if request.contentType not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Content type {request.contentType} not allowed")
    upload_url, public_url = generate_signed_upload(request.fileName, request.contentType)
    return SignUploadResponse(uploadUrl=upload_url, publicUrl=public_url)
