import os
import uuid
from datetime import datetime, timezone
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.config import settings
from ...models.scan import ScanSession, ScanImage
from ...models.user import User
from ...schemas.scan import CreateScanResponse, ImageUploadResponse, AnalysisStage, ScanStatusResponse, TriggerAnalysisResponse
from ...services.image_service import assess_image_quality
from ...services.analysis_service import analyze_scan
from ...services.ocr_service import OCRUnavailableError
from ..deps import get_current_user

router = APIRouter(prefix="/scans", tags=["Scanning & Ingestion"])
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def _stage_status(session_status: str, key: str) -> str:
    if session_status == "CREATED":
        return "COMPLETE" if key == "upload" else "IDLE"
    if session_status == "ANALYZING":
        order = {"upload": 0, "quality": 1, "detection": 2, "ocr": 3, "compliance": 4}
        # The current synchronous pipeline completes all stages in one request;
        # status polling therefore reports processing for the analysis stages.
        return "COMPLETE" if key == "upload" else "PROCESSING"
    if session_status == "COMPLETE":
        return "COMPLETE"
    return "FAILED"


@router.post("", response_model=CreateScanResponse)
def create_scan_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan_id = f"SCN-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc)
    session = ScanSession(id=scan_id, status="CREATED", officer_id=current_user.id, created_at=now)
    db.add(session)
    db.commit()
    return CreateScanResponse(scanId=scan_id, createdAt=now.isoformat(), status="CREATED")


@router.post("/{scan_id}/images", response_model=ImageUploadResponse)
async def upload_scan_image(
    scan_id: str,
    request: Request,
    image: UploadFile = File(...),
    viewSlot: str = Form("Front View"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")
    if session.officer_id and session.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    extension = os.path.splitext(image.filename or "")[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPG, JPEG, PNG or WEBP.")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 10 MB upload limit")

    image_id = f"IMG-{uuid.uuid4().hex[:8].upper()}"
    safe_name = os.path.basename(image.filename or f"{image_id}{extension}").replace(" ", "_")
    filename = f"{scan_id}_{image_id}_{safe_name}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, "wb") as buffer:
        await buffer.write(content)

    try:
        quality_status, blur_score = assess_image_quality(file_path)
    except Exception:
        quality_status, blur_score = "NEEDS_REVIEW", 0.0

    image_url = str(request.base_url).rstrip("/") + f"/uploads/{filename}"
    scan_image = ScanImage(
        id=image_id, scan_id=scan_id, view_slot=viewSlot, file_path=file_path,
        file_name=image.filename or safe_name, url=image_url, status="UPLOADED",
        quality_status=quality_status, blur_score=blur_score,
    )
    db.add(scan_image)
    db.commit()

    return ImageUploadResponse(
        imageId=image_id, viewSlot=viewSlot, fileName=image.filename or safe_name,
        url=image_url, status="UPLOADED", qualityStatus=quality_status,
        blurScore=blur_score,
        message="Image received. Quality assessment completed; OCR will run during analysis.",
    )


@router.post("/{scan_id}/analyze", response_model=TriggerAnalysisResponse)
def trigger_analysis(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")
    if session.officer_id and session.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    try:
        analyze_scan(db, session)
    except OCRUnavailableError as exc:
        session.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        session.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        session.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {exc}") from exc

    return TriggerAnalysisResponse(
        scanId=scan_id,
        status="COMPLETE",
        message="Analysis complete. OCR, field extraction and compliance checks are ready.",
    )


@router.get("/{scan_id}/status", response_model=ScanStatusResponse)
def get_scan_status(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")
    if session.officer_id and session.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    stages = [
        AnalysisStage(key="upload", label="Image Upload", status=_stage_status(session.status, "upload")),
        AnalysisStage(key="quality", label="Image Quality Assessment", status=_stage_status(session.status, "quality")),
        AnalysisStage(key="detection", label="Label Detection", status=_stage_status(session.status, "detection")),
        AnalysisStage(key="ocr", label="OCR Extraction", status=_stage_status(session.status, "ocr")),
        AnalysisStage(key="compliance", label="Compliance Analysis", status=_stage_status(session.status, "compliance")),
    ]
    return ScanStatusResponse(scanId=scan_id, status=session.status, stages=stages)
