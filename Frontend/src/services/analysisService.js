/**
 * LEGAL METRIX - Compliance Analysis Service Abstraction
 *
 * Interfaces with the FastAPI backend to retrieve analysis results.
 * Includes mock data fallbacks for frontend development.
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import {
  mockAnalysisSummary,
  mockExtractedData,
  mockComplianceChecks,
  mockPotentialFindings,
  mockRiskAssessment,
  mockAnalysisImages
} from '../data/mockData';

export const analysisService = {
  async getAvailableScans() {
    return await api.get(API_ENDPOINTS.ANALYSIS_AVAILABLE);
  },

  /**
   * Retrieves the full analysis payload for a given scan session.
   *
   * @param {string} scanId - The unique scan identifier
   * @returns {Promise<Object>} The aggregated analysis data
   */
  async getFullAnalysis(scanId) {
    try {
      // In the future, this could be a single aggregated endpoint 
      // or multiple parallel requests depending on the backend design.
      const endpoint = API_ENDPOINTS.ANALYSIS_GET.replace('{scanId}', scanId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return structured mock data
      return {
        scanId,
        timestamp: new Date().toISOString(),
        productName: 'NutriCrunch Wheat Biscuits', // Extracted dynamically in real scenario
        summary: mockAnalysisSummary,
        images: mockAnalysisImages,
        extractedData: mockExtractedData,
        complianceChecks: mockComplianceChecks,
        findings: mockPotentialFindings,
        risk: mockRiskAssessment
      };
    }
  },

  /** Flow step 10: forward the case to the legal officer. Returns { scanId, caseStatus, message }. */
  async forwardCase(scanId) {
    return api.post(API_ENDPOINTS.SCAN_FORWARD.replace('{scanId}', scanId));
  },

  /** Flow step 9: download the single-case violation report (PDF) and save it. */
  async downloadCaseReport(scanId) {
    return api.download(API_ENDPOINTS.REPORT_CASE_PDF.replace('{scanId}', scanId), `LegalMetrix_${scanId}_report.pdf`);
  },
};

export default analysisService;
