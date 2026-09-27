/**
 * LEGAL METRIX - useScanSession Hook
 *
 * Central state management for the product scan workflow.
 * Manages image slots, metadata, validation, upload, and analysis lifecycle.
 *
 * IMPORTANT: Frontend validation only. OCR and image quality assessment
 * are performed by the backend (OpenCV/FastAPI).
 */

import { useState, useCallback, useRef } from 'react';
import {
  IMAGE_VIEWS,
  SCAN_LIMITS,
  UPLOAD_STATUS,
  IMAGE_QUALITY,
  ANALYSIS_STATUS,
} from '../utils/constants';
import scanService from '../services/scanService';

// Initial empty slot
const createEmptySlot = (viewName) => ({
  file: null,
  preview: null,
  viewName,
  fileName: '',
  fileSize: 0,
  uploadStatus: UPLOAD_STATUS.EMPTY,
  qualityStatus: IMAGE_QUALITY.PENDING,
  qualityMessage: '',
  error: null,
  dimensions: null,
});

// Initial processing stages
const createInitialStages = () => [
  { key: 'upload', label: 'Image Upload', status: 'PENDING' },
  { key: 'quality', label: 'Image Quality Assessment', status: 'PENDING' },
  { key: 'detection', label: 'Label Detection', status: 'PENDING' },
  { key: 'ocr', label: 'OCR Extraction', status: 'PENDING' },
  { key: 'compliance', label: 'Compliance Analysis', status: 'PENDING' },
];

// Format bytes for display
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Validate a single image file (frontend checks only).
 * Returns { valid, error, dimensions }
 */
const validateImageFile = (file, existingSlots) => {
  return new Promise((resolve) => {
    if (!(file instanceof Blob)) {
      return resolve({ valid: false, error: 'No image file was received. Please choose the file again.' });
    }

    // Type check: some phones/browsers report an empty or non-standard MIME type, so fall back to the extension.
    const extension = (file.name || '').toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || '';
    const typeOk = SCAN_LIMITS.ACCEPTED_TYPES.includes(file.type);
    const extensionOk = SCAN_LIMITS.ACCEPTED_EXTENSIONS.split(',').includes(extension);
    if (!typeOk && !extensionOk) {
      return resolve({
        valid: false,
        error: `Unsupported file "${file.name || 'image'}". Accepted: JPG, JPEG, PNG, WEBP.`,
      });
    }

    // Size check
    const maxBytes = SCAN_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return resolve({
        valid: false,
        error: `File exceeds ${SCAN_LIMITS.MAX_FILE_SIZE_MB} MB limit (${formatFileSize(file.size)}).`,
      });
    }

    if (file.size === 0) {
      return resolve({ valid: false, error: 'File appears to be empty (0 bytes).' });
    }

    // Duplicate check (by name + size)
    const isDuplicate = existingSlots.some(
      (s) => s.file && s.fileName === file.name && s.fileSize === file.size
    );
    if (isDuplicate) {
      return resolve({
        valid: false,
        error: `Duplicate image "${file.name}" is already uploaded.`,
      });
    }

    // Dimension + corruption check via Image load
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight };

      if (dimensions.width < SCAN_LIMITS.MIN_IMAGE_WIDTH || dimensions.height < SCAN_LIMITS.MIN_IMAGE_HEIGHT) {
        return resolve({
          valid: false,
          error: `Image too small (${dimensions.width}×${dimensions.height}px). Minimum: ${SCAN_LIMITS.MIN_IMAGE_WIDTH}×${SCAN_LIMITS.MIN_IMAGE_HEIGHT}px.`,
          dimensions,
        });
      }

      resolve({ valid: true, error: null, dimensions });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: 'Image appears to be corrupted or unreadable.',
      });
    };

    img.src = objectUrl;
  });
};

export const useScanSession = () => {
  const [scanId, setScanId] = useState(null);
  const [images, setImages] = useState(IMAGE_VIEWS.map(createEmptySlot));
  const [metadata, setMetadata] = useState({
    productName: '',
    brand: '',
    category: '',
    skuId: '',
    manufacturer: '',
    batchNumber: '',
  });
  const [analysisStatus, setAnalysisStatus] = useState(ANALYSIS_STATUS.IDLE);
  const [processingStages, setProcessingStages] = useState(createInitialStages());
  const [errors, setErrors] = useState([]);

  // Prevent concurrent submissions
  const isSubmitting = useRef(false);
  // Latest slots, so several files validated at once all see each other for the duplicate check.
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const pendingFiles = useRef([]);

  // ── Image Actions ──────────────────────────────────────────────────────

  const addImage = useCallback(async (slotIndex, file) => {
    // Mark as validating
    setImages((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        ...next[slotIndex],
        uploadStatus: UPLOAD_STATUS.VALIDATING,
        error: null,
      };
      return next;
    });

    // Validate against the other slots plus files still being validated in the same batch.
    const others = imagesRef.current.filter((_, i) => i !== slotIndex);
    const pending = pendingFiles.current.map((f) => ({ file: f, fileName: f.name, fileSize: f.size }));
    pendingFiles.current.push(file);
    const result = await validateImageFile(file, [...others, ...pending]);
    pendingFiles.current = pendingFiles.current.filter((f) => f !== file);

    if (!result.valid) {
      setImages((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          ...createEmptySlot(IMAGE_VIEWS[slotIndex]),
          error: result.error,
          uploadStatus: UPLOAD_STATUS.FAILED,
        };
        return next;
      });
      return false;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);

    setImages((prev) => {
      const next = [...prev];
      // Revoke old preview if replacing
      if (next[slotIndex].preview) {
        URL.revokeObjectURL(next[slotIndex].preview);
      }
      next[slotIndex] = {
        file,
        preview,
        viewName: IMAGE_VIEWS[slotIndex],
        fileName: file.name,
        fileSize: file.size,
        uploadStatus: UPLOAD_STATUS.READY,
        qualityStatus: IMAGE_QUALITY.PENDING,
        qualityMessage: 'Checking image quality...',
        error: null,
        dimensions: result.dimensions,
      };
      return next;
    });

    // Flow step 2: check the photo straight away so an unclear one can be retaken before analysis.
    let quality;
    try {
      quality = await scanService.checkImageQuality(file);
    } catch (err) {
      quality = { qualityStatus: IMAGE_QUALITY.NEEDS_REVIEW, message: 'Image quality could not be checked; it will be checked again during analysis.' };
    }
    setImages((prev) => {
      const next = [...prev];
      // The slot may have been replaced or cleared while the check was running.
      if (next[slotIndex].file !== file) return prev;
      next[slotIndex] = { ...next[slotIndex], qualityStatus: quality.qualityStatus, qualityMessage: quality.message || '' };
      return next;
    });

    return true;
  }, []);

  const removeImage = useCallback((slotIndex) => {
    setImages((prev) => {
      const next = [...prev];
      if (next[slotIndex].preview) {
        URL.revokeObjectURL(next[slotIndex].preview);
      }
      next[slotIndex] = createEmptySlot(IMAGE_VIEWS[slotIndex]);
      return next;
    });
  }, []);

  // addImage already revokes and overwrites the slot, so replacing is the same operation.
  const replaceImage = addImage;

  // ── Metadata Actions ───────────────────────────────────────────────────

  const updateMetadata = useCallback((field, value) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Analysis Actions ───────────────────────────────────────────────────

  const startAnalysis = useCallback(async () => {
    if (isSubmitting.current) return;

    const uploadableImages = images.filter(
      (img) => img.file && img.uploadStatus !== UPLOAD_STATUS.FAILED
    );
    if (uploadableImages.length === 0) return;

    isSubmitting.current = true;
    setErrors([]);
    setAnalysisStatus(ANALYSIS_STATUS.UPLOADING);
    setProcessingStages(createInitialStages());

    try {
      // 1. Create scan session
      const session = await scanService.createScanSession();
      setScanId(session.scanId);
      localStorage.setItem('legalmetrix_active_scan_id', session.scanId);

      // 2. Upload images
      setProcessingStages((prev) =>
        prev.map((s) => (s.key === 'upload' ? { ...s, status: 'PROCESSING' } : s))
      );

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.file) continue;

        setImages((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], uploadStatus: UPLOAD_STATUS.UPLOADING };
          return next;
        });

        try {
          const uploaded = await scanService.uploadImage(session.scanId, img.file, img.viewName);
          setImages((prev) => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              uploadStatus: UPLOAD_STATUS.UPLOADED,
              qualityStatus: uploaded?.qualityStatus || next[i].qualityStatus,
              qualityMessage: uploaded?.message || next[i].qualityMessage,
            };
            return next;
          });
        } catch (err) {
          setImages((prev) => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              uploadStatus: UPLOAD_STATUS.FAILED,
              error: err?.message || 'Upload failed',
            };
            return next;
          });
          setErrors((prev) => [...prev, `Failed to upload ${img.viewName}: ${err?.message || 'Unknown error'}`]);
        }
      }

      setProcessingStages((prev) =>
        prev.map((s) => (s.key === 'upload' ? { ...s, status: 'COMPLETE' } : s))
      );

      // 3. Trigger analysis
      setAnalysisStatus(ANALYSIS_STATUS.QUALITY_CHECK);

      const onStageUpdate = (stageKey, status) => {
        setProcessingStages((prev) =>
          prev.map((s) => (s.key === stageKey ? { ...s, status } : s))
        );

        // Map stage to analysis status
        const statusMap = {
          quality: ANALYSIS_STATUS.QUALITY_CHECK,
          detection: ANALYSIS_STATUS.LABEL_DETECTION,
          ocr: ANALYSIS_STATUS.OCR_EXTRACTION,
          compliance: ANALYSIS_STATUS.COMPLIANCE_ANALYSIS,
        };
        if (statusMap[stageKey] && status === 'PROCESSING') {
          setAnalysisStatus(statusMap[stageKey]);
        }
      };

      const result = await scanService.analyzeProduct(session.scanId, onStageUpdate);

      setAnalysisStatus(ANALYSIS_STATUS.COMPLETE);
      return { scanId: session.scanId, result };
    } catch (err) {
      setAnalysisStatus(ANALYSIS_STATUS.FAILED);
      setErrors((prev) => [...prev, err?.message || 'Analysis failed. Please try again.']);
      return null;
    } finally {
      isSubmitting.current = false;
    }
  }, [images]);

  // ── Reset ──────────────────────────────────────────────────────────────

  const resetSession = useCallback(() => {
    // Revoke all object URLs
    images.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });

    setScanId(null);
    setImages(IMAGE_VIEWS.map(createEmptySlot));
    setMetadata({
      productName: '',
      brand: '',
      category: '',
      skuId: '',
      manufacturer: '',
      batchNumber: '',
    });
    setAnalysisStatus(ANALYSIS_STATUS.IDLE);
    setProcessingStages(createInitialStages());
    setErrors([]);
    isSubmitting.current = false;
  }, [images]);

  // ── Computed ────────────────────────────────────────────────────────────

  const uploadedCount = images.filter(
    (img) => img.file && img.uploadStatus !== UPLOAD_STATUS.FAILED
  ).length;

  const hasMinimumImages = uploadedCount >= 1;

  const isAnalyzing = [
    ANALYSIS_STATUS.UPLOADING,
    ANALYSIS_STATUS.QUALITY_CHECK,
    ANALYSIS_STATUS.LABEL_DETECTION,
    ANALYSIS_STATUS.OCR_EXTRACTION,
    ANALYSIS_STATUS.COMPLIANCE_ANALYSIS,
  ].includes(analysisStatus);

  const withFiles = images.filter((img) => img.file && img.uploadStatus !== UPLOAD_STATUS.FAILED);
  const unclearImages = withFiles.filter((img) => img.qualityStatus === IMAGE_QUALITY.UNCLEAR);
  const qualityChecking = withFiles.some((img) => img.qualityStatus === IMAGE_QUALITY.PENDING);
  const canAnalyze = hasMinimumImages && !isAnalyzing && !qualityChecking && unclearImages.length === 0
    && analysisStatus !== ANALYSIS_STATUS.COMPLETE;

  return {
    // State
    scanId,
    images,
    metadata,
    analysisStatus,
    processingStages,
    errors,

    // Computed
    uploadedCount,
    hasMinimumImages,
    isAnalyzing,
    canAnalyze,
    unclearImages,
    qualityChecking,

    // Actions
    addImage,
    removeImage,
    replaceImage,
    updateMetadata,
    startAnalysis,
    resetSession,

    // Utilities
    formatFileSize,
  };
};

export default useScanSession;
