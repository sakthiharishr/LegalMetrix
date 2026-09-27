# Frontend-Backend API Contract

## STATUS: BACKEND CONTRACT REQUIRED

> **IMPORTANT**: The FastAPI backend implementation is currently missing from this repository. All endpoints listed below are the **Frontend Expectations** constructed during Phases 1-8 development. 
> 
> Before finalizing integration, the Backend Developer must confirm or provide the **ACTUAL** route definitions, schemas, and authentication methods. The frontend service layer (`src/services/api.js`) must be updated to map to the real backend reality once established.

---

### Authentication (`authService.js`)

#### Login
- **Frontend Expectation**: `POST /auth/login`
- **Request**: `{ username: "...", password: "..." }`
- **Response**: `{ accessToken: "...", user: { ... } }`
- **Auth**: None
- **Actual**: BACKEND CONTRACT REQUIRED

#### Refresh Session
- **Frontend Expectation**: `POST /auth/refresh`
- **Auth**: HttpOnly Session Cookie or existing Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

#### Logout
- **Frontend Expectation**: `POST /auth/logout`
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

---

### Scanning & Image Acquisition (`scanService.js`)

#### Create Scan
- **Frontend Expectation**: `POST /scans`
- **Request**: `{ metadata: { ... } }`
- **Response**: `{ scanId: "...", status: "CREATED" }`
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

#### Upload Image
- **Frontend Expectation**: `POST /scans/{scanId}/images`
- **Request**: `multipart/form-data` with `file` and `viewName`
- **Response**: `{ imageId: "...", qualityStatus: "GOOD" }`
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

#### Trigger Analysis
- **Frontend Expectation**: `POST /scans/{scanId}/analyze`
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

---

### Analysis & Risk (`analysisService.js`)

#### Get Full Analysis
- **Frontend Expectation**: `GET /analysis/{scanId}`
- **Response**: Aggregated JSON containing OCR data, compliance checks, risk scores, and potential findings.
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

---

### Violation Evidence (`evidenceService.js`)

#### Get Evidence Context
- **Frontend Expectation**: `GET /scans/{scanId}/findings/{findingId}/evidence`
- **Response**: JSON mapping the finding to bounding boxes, OCR text, rule references, and source image URLs.
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

---

### Officer Verification (`verificationService.js`)

#### Submit Decision
- **Frontend Expectation**: `POST /scans/{scanId}/findings/{findingId}/verification`
- **Request**: `{ decision: "CONFIRM_FINDING" | "INVALIDATE_FINDING" | "NEEDS_FURTHER_REVIEW", remarks: "..." }`
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

---

### Product History & Reports (`historyService.js`, `reportService.js`)

#### Get Product Timeline
- **Frontend Expectation**: `GET /products/{productId}/history`
- **Response**: Complete historical track record including past inspections and recurring patterns.
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

#### Get Enforcement Analytics
- **Frontend Expectation**: `GET /reports/analytics?range=30d`
- **Response**: Pre-aggregated metrics for compliance trends, risk distribution, and officer outcomes.
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED

#### Request Export
- **Frontend Expectation**: `POST /reports/export/pdf`
- **Response**: PDF blob or Async Job ID.
- **Auth**: Bearer Token
- **Actual**: BACKEND CONTRACT REQUIRED
