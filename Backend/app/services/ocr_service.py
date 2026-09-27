from functools import lru_cache
import re
from typing import Any, Dict, List, Tuple

import cv2
import numpy as np


class OCRUnavailableError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def _get_engine():
    try:
        from rapidocr import RapidOCR
        return RapidOCR()
    except Exception as exc:
        raise OCRUnavailableError(
            "RapidOCR is not installed. Install the backend requirements and restart the server."
        ) from exc


def _to_points(box: Any) -> List[List[float]]:
    if box is None:
        return []
    try:
        return [[float(point[0]), float(point[1])] for point in box]
    except Exception:
        return []


def _box_center(box):
    if len(box) < 4:
        return 0.0, 0.0
    xs = [p[0] for p in box]
    ys = [p[1] for p in box]
    return sum(xs) / len(xs), sum(ys) / len(ys)


def _reading_vector(box) -> Tuple[float, float]:
    # A text box is longest along its reading direction; for sideways text that is the p1 -> p2 edge.
    if len(box) < 3:
        return 0.0, 0.0
    ax, ay = box[1][0] - box[0][0], box[1][1] - box[0][1]
    bx, by = box[2][0] - box[1][0], box[2][1] - box[1][1]
    return (ax, ay) if ax * ax + ay * ay >= bx * bx + by * by else (bx, by)


def _text_angle(items) -> float:
    sx = sy = 0.0
    vectors = [_reading_vector(item.get("box") or []) for item in items]
    for dx, dy in vectors:
        length = (dx * dx + dy * dy) ** 0.5
        if length < 1:
            continue
        # Double the angle so opposite directions reinforce instead of cancelling.
        a = np.arctan2(dy, dx)
        sx += length * np.cos(2 * a)
        sy += length * np.sin(2 * a)
    if sx == 0 and sy == 0:
        return 0.0
    angle = float(np.arctan2(sy, sx) / 2)
    votes = sum(1 if dx * np.cos(angle) + dy * np.sin(angle) >= 0 else -1 for dx, dy in vectors)
    return angle if votes >= 0 else angle + np.pi


def _spatial_sort(items):
    """Sort into reading order along the dominant text direction, so rotated photos read correctly."""
    angle = _text_angle(items)
    cos_a, sin_a = np.cos(-angle), np.sin(-angle)

    def key(item):
        x, y = _box_center(item.get("box") or [])
        rx = x * cos_a - y * sin_a
        ry = x * sin_a + y * cos_a
        return (round(ry / 18.0), rx)
    return sorted(items, key=key)


def _box_rect(box: List[List[float]]) -> Tuple[float, float, float, float]:
    if len(box) < 4:
        return 0.0, 0.0, 0.0, 0.0
    xs = [float(p[0]) for p in box]
    ys = [float(p[1]) for p in box]
    return min(xs), min(ys), max(xs), max(ys)


def _resize_for_ocr(image: np.ndarray, max_dimension: int = 1800):
    h, w = image.shape[:2]
    largest = max(h, w)
    if largest <= max_dimension:
        return image, 1.0
    scale = max_dimension / float(largest)
    resized = cv2.resize(
        image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA
    )
    return resized, scale


def _run_single(engine, image):
    try:
        result = engine(image)
    except Exception as exc:
        print(f"[OCR] RapidOCR call failed: {exc}")
        return [], [], []

    texts = getattr(result, "txts", None)
    scores = getattr(result, "scores", None)
    boxes = getattr(result, "boxes", None)

    return (
        list(texts) if texts is not None else [],
        list(scores) if scores is not None else [],
        list(boxes) if boxes is not None else [],
    )


def _target_regions(
    image: np.ndarray, items: List[Dict[str, Any]]
) -> List[Tuple[str, np.ndarray, int, int]]:
    """Build a small number of field-aware crops from detected declaration labels."""
    height, width = image.shape[:2]
    keywords = (
        "MRP", "M.R.P", "NET QUANTITY", "NET WT", "NET WEIGHT",
        "MFG", "MFD", "MANUFACT", "BATCH", "LOT", "USE BY", "EXPIRY",
        "BEST BEFORE", "PACKED", "PKD", "PACKAGING"
    )

    candidates = []
    for item in items:
        text = str(item.get("text", "")).upper()
        if not any(k in text for k in keywords):
            continue
        # MRP recovery is the highest-value targeted pass. Put it first so
        # the single fallback OCR call focuses on the price declaration.
        mrp_priority = 0 if re.search(r"\bMRP\b|M\.?R\.?P|MAXIMUM\s+RETAIL", text) else 1
        x1, y1, x2, y2 = _box_rect(item.get("box") or [])
        if x2 <= x1 or y2 <= y1:
            continue

        # Keep crops reasonably small. Large crops are one of the main causes
        # of unnecessary OCR work.
        pad_x_left = max(60, int(width * 0.10))
        pad_x_right = max(140, int(width * 0.24))
        pad_y_top = max(35, int(height * 0.04))
        pad_y_bottom = max(100, int(height * 0.13))

        left = max(0, int(x1 - pad_x_left))
        top = max(0, int(y1 - pad_y_top))
        right = min(width, int(x2 + pad_x_right))
        bottom = min(height, int(y2 + pad_y_bottom))

        area = max(1, (right - left) * (bottom - top))
        candidates.append((mrp_priority, area, text, left, top, right, bottom))

    # Prefer the first three distinct declaration regions.
    candidates.sort(key=lambda x: (x[0], x[1]))
    regions = []
    seen = []

    for _, _, text, left, top, right, bottom in candidates:
        duplicate = False
        for sl, st, sr, sb in seen:
            overlap_x = max(0, min(right, sr) - max(left, sl))
            overlap_y = max(0, min(bottom, sb) - max(top, st))
            overlap = overlap_x * overlap_y
            current = (right - left) * (bottom - top)
            if current and overlap / current > 0.65:
                duplicate = True
                break
        if duplicate:
            continue

        seen.append((left, top, right, bottom))
        crop = image[top:bottom, left:right]
        if crop.size:
            regions.append((f"target-{len(regions) + 1}", crop, left, top))
        if len(regions) >= 3:
            break

    return regions


def _target_variant(crop: np.ndarray):
    """One controlled fallback for small stamped declarations."""
    scale = 2.5
    up = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(up, cv2.COLOR_BGR2GRAY) if len(up.shape) == 3 else up
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
    return clahe, scale


def run_ocr(image_path: str) -> Dict[str, Any]:
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Unable to read the uploaded image for OCR.")

    engine = _get_engine()
    collected_by_text: Dict[str, Dict[str, Any]] = {}

    def collect(texts, scores, boxes, variant_name, to_original, min_confidence=0.0, only_new=False):
        """to_original maps an (x, y) point of the OCR'd image back to original-image pixels."""
        existing = {re.sub(r"[^A-Z0-9]", "", key) for key in collected_by_text}
        existing_blob = "|".join(existing)
        for index, text in enumerate(texts):
            value = str(text).strip()
            if not value:
                continue

            normalized = " ".join(value.upper().split())
            score = float(scores[index]) if index < len(scores) else 0.0
            confidence = score * 100 if score <= 1 else score
            if confidence < min_confidence:
                continue
            if only_new:
                # Keep only genuinely new words, not fragments of text the upright pass already read.
                compact = re.sub(r"[^A-Z0-9]", "", normalized)
                if len(re.sub(r"[^A-Z]", "", compact)) < 4 or compact in existing_blob:
                    continue
            box = _to_points(boxes[index]) if index < len(boxes) else []
            box = [[round(v, 2) for v in to_original(p[0], p[1])] for p in box]

            item = {
                "id": f"OCR-{len(collected_by_text) + 1:03d}",
                "text": value,
                "confidence": round(confidence, 2),
                "box": box,
                "variant": variant_name,
            }

            old = collected_by_text.get(normalized)
            targeted = variant_name.startswith("target-")
            old_targeted = bool(old and str(old.get("variant", "")).startswith("target-"))

            if (
                old is None
                or confidence > old["confidence"] + 1.0
                or (targeted and not old_targeted and confidence >= old["confidence"] - 2.0)
            ):
                collected_by_text[normalized] = item

    # ---------------------------------------------------------------
    # PASS 1: ONE normal OCR call on a bounded image.
    # ---------------------------------------------------------------
    ocr_image, image_scale = _resize_for_ocr(image, max_dimension=1800)

    def from_ocr_image(x, y):
        return x / image_scale, y / image_scale

    texts, scores, boxes = _run_single(engine, ocr_image)
    collect(texts, scores, boxes, "original", from_ocr_image)

    first_items = _spatial_sort(list(collected_by_text.values()))

    # ---------------------------------------------------------------
    # PASS 2: ONLY if the primary pass produced very little text, use
    # one enhanced whole-image fallback.
    # ---------------------------------------------------------------
    if len(first_items) < 3:
        gray = cv2.cvtColor(ocr_image, cv2.COLOR_BGR2GRAY)
        enhanced = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
        texts, scores, boxes = _run_single(engine, enhanced)
        collect(texts, scores, boxes, "enhanced", from_ocr_image)

    # ---------------------------------------------------------------
    # PASS 2b: sideways passes on a small copy. Large stylised brand
    # logos printed along the pack (e.g. FROOTI) are missed by the text
    # detector unless the image is upright; small copies keep this cheap.
    # ---------------------------------------------------------------
    small, small_scale = _resize_for_ocr(image, max_dimension=640)
    sh, sw = small.shape[:2]
    for rotation, name, to_small in (
        (cv2.ROTATE_90_CLOCKWISE, "rot-cw", lambda x, y: (y, sh - 1 - x)),
        (cv2.ROTATE_90_COUNTERCLOCKWISE, "rot-ccw", lambda x, y: (sw - 1 - y, x)),
    ):
        texts, scores, boxes = _run_single(engine, cv2.rotate(small, rotation))

        def from_rotated(x, y, to_small=to_small):
            px, py = to_small(x, y)
            return px / small_scale, py / small_scale

        collect(texts, scores, boxes, name, from_rotated, min_confidence=85.0, only_new=True)

    first_items = _spatial_sort(list(collected_by_text.values()))

    # ---------------------------------------------------------------
    # PASS 3: At most three declaration-specific crops. Each crop gets
    # ONE OCR call only. This recovers tiny MRP/date/lot text without the
    # previous 9-10 OCR calls per region.
    # ---------------------------------------------------------------
    # Items are in original-image pixels; crops are taken from the resized OCR image.
    scaled_items = [
        {**item, "box": [[p[0] * image_scale, p[1] * image_scale] for p in item.get("box") or []]}
        for item in first_items
    ]
    for region_name, crop, ox, oy in _target_regions(ocr_image, scaled_items):
        target, target_scale = _target_variant(crop)
        texts, scores, boxes = _run_single(engine, target)

        def from_crop(x, y, ox=ox, oy=oy, target_scale=target_scale):
            return (x / target_scale + ox) / image_scale, (y / target_scale + oy) / image_scale

        collect(texts, scores, boxes, region_name, from_crop)

    collected = _spatial_sort(list(collected_by_text.values()))
    for index, item in enumerate(collected, 1):
        item["id"] = f"OCR-{index:03d}"

    average = (
        sum(item["confidence"] for item in collected) / len(collected)
        if collected
        else 0.0
    )
    raw_text = "\n".join(item["text"] for item in collected)

    return {
        "text": raw_text,
        "items": collected,
        "confidence": round(average, 2),
        "engine": "RapidOCR-PP-OCRv6-Controlled",
    }
