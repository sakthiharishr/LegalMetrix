/**
 * LEGAL METRIX - Evidence Service Abstraction
 *
 * Interfaces with the FastAPI backend to retrieve violation evidence payloads.
 * Includes mock data fallbacks for frontend development.
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import { mockEvidenceData } from '../data/mockData';

export const evidenceService = {
  async getAvailableCases() {
    return await api.get(API_ENDPOINTS.EVIDENCE_AVAILABLE);
  },

  /**
   * Retrieves the full evidence payload for a given finding within a scan.
   *
   * @param {string} scanId - The unique scan identifier
   * @param {string} findingId - The unique finding identifier
   * @returns {Promise<Object>} The aggregated evidence data
   */
  async getEvidence(scanId, findingId) {
    try {
      const endpoint = (findingId && String(findingId).startsWith('EVD-'))
        ? API_ENDPOINTS.EVIDENCE_IMAGE.replace('{evidenceId}', findingId)
        : (!findingId || findingId === 'latest')
          ? API_ENDPOINTS.EVIDENCE_SCAN_GET.replace('{scanId}', scanId)
          : API_ENDPOINTS.EVIDENCE_GET
              .replace('{scanId}', scanId)
              .replace('{findingId}', findingId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Return mock data, overriding IDs to match request
      return {
        ...mockEvidenceData,
        scanId,
        findingId,
        traceability: {
          ...mockEvidenceData.traceability,
          scanId,
          findingId,
        }
      };
    }
  }
};

export default evidenceService;
