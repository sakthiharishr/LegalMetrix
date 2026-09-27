# Legal Metrix

AI-Powered Legal Metrology Compliance & Enforcement Intelligence System.

## Development

From the project root:

```powershell
npm install
npm run dev
```

This starts both:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/api/v1/docs

Python: 3.12+

## Development Login

For testing, use:

- Username: `admin`
- Password: `password`


## Evidence Storage (Officer Verification)

The evidence layer preserves the original uploaded package image and creates a persistent finding-to-image link.

- Original images remain in `Backend/uploads/` and are served by FastAPI at `/uploads/...`.
- Each compliance finding now gets an `EvidenceRecord` in the `evidence_records` table.
- The record stores `finding_id`, `scan_id`, `image_id`, original `image_path`, public `image_url`, and the OCR bounding boxes used to highlight the supporting region.
- No original evidence image is overwritten or modified.
- Older findings are automatically backfilled when their evidence is opened.
- Re-analysis removes stale evidence records for that scan before creating the new finding/evidence set.
- Officer Verification uses the persisted evidence image and bounding boxes rather than simply selecting the first uploaded image.
- Evidence can also be resolved directly with `/api/v1/evidence/{evidenceId}`.

The existing frontend structure and OCR/extraction pipeline are unchanged by this evidence-layer update.
