"""Human-in-the-loop feedback storage for periodic model improvement.

This intentionally does not fine-tune a model during an officer request. Verified
corrections are stored as training examples so a controlled retraining job can be
run later on an approved dataset.
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict


DATA_DIR = Path(__file__).resolve().parents[2] / "data"
FEEDBACK_FILE = DATA_DIR / "verified_feedback.jsonl"


def record_verified_feedback(
    scan_id: str,
    finding_id: str,
    field_corrections: Dict[str, Any] | None,
    officer: str,
    decision: str,
    remarks: str = "",
) -> int:
    corrections = field_corrections or {}
    if not corrections:
        return 0

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    count = 0
    with FEEDBACK_FILE.open("a", encoding="utf-8") as handle:
        for field, correction in corrections.items():
            if correction is None:
                continue
            record = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "scan_id": scan_id,
                "finding_id": finding_id,
                "field": str(field),
                "corrected_value": str(correction),
                "officer": officer,
                "decision": decision,
                "remarks": remarks or "",
                "source": "OFFICER_VERIFIED",
                "dataset_version": "LM-HITL-1",
            }
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1
    return count
