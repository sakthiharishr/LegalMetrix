from typing import List, Optional, Any
from pydantic import BaseModel

class CreateScanResponse(BaseModel):
    scanId: str
    createdAt: str
    status: str

class ImageUploadResponse(BaseModel):
    imageId: str
    viewSlot: str
    fileName: str
    url: str
    status: str
    qualityStatus: str
    blurScore: float
    message: str

class AnalysisStage(BaseModel):
    key: str
    label: str
    status: str  # IDLE, PROCESSING, COMPLETE, FAILED

class ScanStatusResponse(BaseModel):
    scanId: str
    status: str
    stages: List[AnalysisStage]

class TriggerAnalysisResponse(BaseModel):
    scanId: str
    status: str
    message: str

