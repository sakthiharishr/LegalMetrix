import os
from typing import Tuple

import cv2
import numpy as np

# Calibrated on real pack photos (test_images): the least sharp real photo scores ~97, while the same
# photos under a heavy (15px) blur score <= 36. Moderately soft photos are allowed but flagged.
UNCLEAR_SHARPNESS = 40.0
REVIEW_SHARPNESS = 90.0
MIN_SIDE_PX = 400


def _sharpness(gray: np.ndarray) -> float:
    """Sharpness of the most detailed parts of the photo (90th percentile of per-tile Laplacian variance).
    A whole-image score is misleading: plain backgrounds make sharp photos look blurry."""
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    h, w = gray.shape
    th, tw = max(1, h // 8), max(1, w // 8)
    tiles = [laplacian[y:y + th, x:x + tw].var() for y in range(0, h - th + 1, th) for x in range(0, w - tw + 1, tw)]
    return float(np.percentile(tiles, 90)) if tiles else 0.0


def assess_image_quality_detail(file_path: str) -> Tuple[str, float, str]:
    """Returns (status, sharpness, reason). status: GOOD | NEEDS_REVIEW | UNCLEAR.
    UNCLEAR photos must be re-taken before analysis."""
    if not os.path.exists(file_path):
        return "UNCLEAR", 0.0, "The image file could not be found."
    image = cv2.imread(file_path)
    if image is None:
        return "UNCLEAR", 0.0, "The image could not be opened."

    height, width = image.shape[:2]
    if min(height, width) < MIN_SIDE_PX:
        return "UNCLEAR", 0.0, f"The photo is too small ({width}x{height}px). Take it closer or at a higher resolution."

    scale = 1000.0 / max(height, width)
    gray = cv2.cvtColor(cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    brightness, contrast = float(gray.mean()), float(gray.std())
    sharpness = round(_sharpness(gray), 1)

    if brightness < 35:
        return "UNCLEAR", sharpness, "The photo is too dark. Retake it in better light."
    if brightness > 235:
        return "UNCLEAR", sharpness, "The photo is overexposed. Avoid direct light or glare."
    if contrast < 15:
        return "UNCLEAR", sharpness, "The photo has almost no contrast; the label text cannot be separated from the background."
    if sharpness < UNCLEAR_SHARPNESS:
        return "UNCLEAR", sharpness, "The photo is blurred. Hold the camera steady and focus on the label."
    if sharpness < REVIEW_SHARPNESS:
        return "NEEDS_REVIEW", sharpness, "The photo is slightly soft; small print may be misread."
    return "GOOD", sharpness, "Image is clear."


def assess_image_quality(file_path: str) -> Tuple[str, float]:
    status, sharpness, _ = assess_image_quality_detail(file_path)
    return status, sharpness
