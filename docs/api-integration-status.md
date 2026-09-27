# API Integration Status

**Current Project Phase**: Phase 9 (Frontend Finalization)
**Backend Reality**: Not Present in Repository

> *This document tracks the alignment between frontend UI expectations and the actual FastAPI backend implementation. It serves as the primary handoff document for the backend team.*

| Feature | Frontend Expectation | Actual Backend | Status | Notes |
|---------|----------------------|----------------|--------|-------|
| Login Auth | `POST /auth/login` | *Unknown* | **MISSING** | Needs backend contract confirmation. |
| Session Refresh | `POST /auth/refresh` | *Unknown* | **MISSING** | Does the backend use HttpOnly cookies or manual refresh tokens? |
| Create Scan | `POST /scans` | *Unknown* | **MISSING** | - |
| Image Upload | `POST /scans/{id}/images` (multipart) | *Unknown* | **MISSING** | Check allowed field names and image size limits. |
| Trigger Analysis | `POST /scans/{id}/analyze` | *Unknown* | **MISSING** | Is this synchronous or an async job? |
| Fetch Analysis | `GET /analysis/{id}` | *Unknown* | **MISSING** | Frontend expects OCR, Risk, and Findings clustered together. |
| Evidence Context | `GET /scans/{sid}/findings/{fid}/evidence` | *Unknown* | **MISSING** | Frontend expects coordinate bounding boxes for OCR overlay. |
| Submit Verification | `POST /scans/{sid}/findings/{fid}/verification` | *Unknown* | **MISSING** | Needs enum mapping for Officer Decisions. |
| Product History | `GET /products/{id}/history` | *Unknown* | **MISSING** | - |
| Reports Analytics | `GET /reports/analytics` | *Unknown* | **MISSING** | Ensure backend pre-aggregates stats; frontend won't calculate them. |
| Export PDF | `POST /reports/export/pdf` | *Unknown* | **MISSING** | Does this return a direct Blob or a polling Job ID? |

### Next Steps for Backend Team:
1. Review the endpoints inside `src/services/api.js`.
2. Update the API paths inside the `API_ENDPOINTS` dictionary to match actual FastAPI route decorators.
3. Validate request payload formats.
4. Ensure CORS is configured properly in `main.py` allowing the local frontend (`localhost:5173`) to communicate smoothly.
