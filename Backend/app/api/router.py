from fastapi import APIRouter
from .v1.auth import router as auth_router
from .v1.dashboard import router as dashboard_router
from .v1.scans import router as scans_router
from .v1.analysis import router as analysis_router
from .v1.evidence import router as evidence_router
from .v1.verification import router as verification_router
from .v1.products import router as products_router
from .v1.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(scans_router)
api_router.include_router(analysis_router)
api_router.include_router(evidence_router)
api_router.include_router(verification_router)
api_router.include_router(products_router)
api_router.include_router(reports_router)

