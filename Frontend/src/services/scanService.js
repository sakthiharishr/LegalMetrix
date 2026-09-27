/**
 * LEGAL METRIX - Scan & Image Acquisition Service Abstraction
 *
 * Intermediary between scan UI components and the FastAPI backend.
 * Provides fallback to structured mock data for standalone frontend development.
 *
 * IMPORTANT: Does NOT perform OCR or image recognition.
 * Image processing is exclusively handled by the backend (OpenCV + OCR).
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import {
  mockScanSession,
  mockImageUploadResponse,
  mockAnalysisStages,
  mockAnalysisResult,
} from '../data/mockData';

/**
 * Generate a mock scan ID (for frontend demo only)
 */
const generateMockScanId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  return `SCN-${ts}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

export const scanService = {
  /**
   * Create a new scan session.
   * Backend returns: { scanId, createdAt, status }
   */
  async createScanSession() {
    try {
      return await api.post(API_ENDPOINTS.SCAN_CREATE);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((r) => setTimeout(r, 300));
      return {
        ...mockScanSession,
        scanId: generateMockScanId(),
        createdAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Check one photo's quality as soon as it is added (blur, light, size).
   * Backend returns: { qualityStatus: GOOD | NEEDS_REVIEW | UNCLEAR, blurScore, message }
   */
  async checkImageQuality(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      return await api.uploadFile(API_ENDPOINTS.SCAN_QUALITY_CHECK, formData);
    } catch (error) {
      if (!useMockApi()) throw error;
      return { qualityStatus: 'GOOD', blurScore: 100, message: 'Image is clear.' };
    }
  },

  /**
   * Upload a single image to an existing scan session.
   * @param {string} scanId - The scan session identifier
   * @param {File} file - The image file to upload
   * @param {string} viewSlot - The view label (e.g. "Front View")
   */
  async uploadImage(scanId, file, viewSlot) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('viewSlot', viewSlot);
      const endpoint = API_ENDPOINTS.SCAN_UPLOAD_IMAGE.replace('{scanId}', scanId);
      return await api.uploadFile(endpoint, formData);
    } catch (error) {
      if (!useMockApi()) throw error;
      // Simulate upload delay proportional to file size (capped at 1.5s)
      const delay = Math.min(1500, Math.max(300, file.size / 5000));
      await new Promise((r) => setTimeout(r, delay));
      return {
        ...mockImageUploadResponse,
        imageId: `IMG-${Date.now().toString(36).toUpperCase()}`,
        viewSlot,
        fileName: file.name,
      };
    }
  },

  /**
   * Trigger backend analysis for a scan session.
   * The backend will run: OpenCV → OCR → NLP → Compliance rules.
   * @param {string} scanId
   * @param {function} onStageUpdate - Optional callback for stage progress updates
   */
  async analyzeProduct(scanId, onStageUpdate) {
    try {
      const endpoint = API_ENDPOINTS.SCAN_ANALYZE.replace('{scanId}', scanId);
      return await api.post(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      // Simulate multi-stage processing for frontend demo
      const stages = [
        { key: 'upload', label: 'Image Upload', delay: 400 },
        { key: 'quality', label: 'Image Quality Assessment', delay: 600 },
        { key: 'detection', label: 'Label Detection', delay: 800 },
        { key: 'ocr', label: 'OCR Extraction', delay: 700 },
        { key: 'compliance', label: 'Compliance Analysis', delay: 500 },
      ];

      for (let i = 0; i < stages.length; i++) {
        if (onStageUpdate) {
          onStageUpdate(stages[i].key, 'PROCESSING');
        }
        await new Promise((r) => setTimeout(r, stages[i].delay));
        if (onStageUpdate) {
          onStageUpdate(stages[i].key, 'COMPLETE');
        }
      }

      return {
        ...mockAnalysisResult,
        scanId,
      };
    }
  },

  /**
   * Poll current analysis status for a scan session.
   * @param {string} scanId
   */
  async getScanStatus(scanId) {
    try {
      const endpoint = API_ENDPOINTS.SCAN_STATUS.replace('{scanId}', scanId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((r) => setTimeout(r, 200));
      return {
        scanId,
        status: 'COMPLETE',
        stages: mockAnalysisStages,
      };
    }
  },
};

export default scanService;
