from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional
from datetime import datetime


class Place(BaseModel):
    label: str
    lat: float
    lng: float


class ChapterCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=80)
    pages: list[str] = Field(..., min_length=3, max_length=3)
    language: str = "en"
    place: Optional[Place] = None
    icon: str = "bangles"
    heroImagePath: Optional[str] = None
    audioPath: Optional[str] = None

    @field_validator("pages")
    @classmethod
    def validate_pages(cls, v):
        for i, page in enumerate(v):
            if len(page) > 1500:
                raise ValueError(f"Page {i+1} exceeds 1500 characters")
        return v


class ChapterUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=80)
    pages: Optional[list[str]] = None
    place: Optional[Place] = None
    icon: Optional[str] = None

    @field_validator("pages")
    @classmethod
    def validate_pages(cls, v):
        if v is None:
            return v
        for i, page in enumerate(v):
            if len(page) > 1500:
                raise ValueError(f"Page {i+1} exceeds 1500 characters")
        return v


class ChapterResponse(BaseModel):
    id: str
    title: str
    pages: list[str]
    authorUid: str
    authorName: str
    authorPhoto: Optional[str] = None
    language: str
    place: Optional[Place] = None
    icon: str
    heroImagePath: Optional[str] = None
    audioPath: Optional[str] = None
    status: str
    featured: bool = False
    createdAt: str
    updatedAt: str
    chapterNumber: int


class TranslationResponse(BaseModel):
    title: str
    pages: list[str]
    createdAt: str


class WeaveRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=10000)


class WeaveResponse(BaseModel):
    title: str
    pages: list[str]


class TranscribeResponse(BaseModel):
    transcript: str
    language: str


class SignUploadRequest(BaseModel):
    fileName: str
    contentType: str


class SignUploadResponse(BaseModel):
    uploadUrl: str
    publicUrl: str


class EventRequest(BaseModel):
    event: str
    chapter_id: Optional[str] = None
    language: Optional[str] = None


class ModerateRequest(BaseModel):
    action: Literal["publish", "reject"]


class FeatureRequest(BaseModel):
    featured: bool
