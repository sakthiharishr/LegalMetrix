import os
import cv2
import numpy as np
from typing import Tuple

def assess_image_quality(file_path: str) -> Tuple[str, float]:
    """
    Assess image quality using OpenCV:
    - Calculates variance of the Laplacian to measure blur / sharpness.
    - Checks resolution.
    Returns: (qualityStatus, blurScore)
    qualityStatus: 'GOOD' | 'NEEDS_REVIEW' | 'UNCLEAR'
    """
    if not os.path.exists(file_path):
        return "UNCLEAR", 0.0

    image = cv2.imread(file_path)
    if image is None:
        return "UNCLEAR", 0.0

    height, width = image.shape[:2]
    if width < 150 or height < 150:
        return "NEEDS_REVIEW", 20.0

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Variance of the Laplacian method
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = float(laplacian.var())

    if variance < 45.0:
        return "NEEDS_REVIEW", round(variance, 1)
    elif variance < 80.0:
        return "GOOD", round(variance, 1)
    else:
        return "GOOD", round(variance, 1)

