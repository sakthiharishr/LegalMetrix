/**
 * LEGAL METRIX - Verification Service Abstraction
 *
 * Interfaces with the FastAPI backend for the human-in-the-loop verification process.
 * Includes mock data fallbacks for frontend development.
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import { mockVerificationData, mockAlreadyReviewedData } from '../data/mockData';
import { REVIEW_STATUS, OFFICER_DECISION } from '../utils/constants';

// In-memory store to simulate submission state across navigation in dev mode
const mockStore = new Map();

export const verificationService = {
  async getPendingVerifications() {
    try {
      return await api.get(API_ENDPOINTS.VERIFICATION_PENDING);
    } catch (error) {
      if (!useMockApi()) throw error;
      return { total: 0, items: [] };
    }
  },

  /**
   * Retrieves the verification workspace data for a given finding.
   */
  async getVerification(scanId, findingId) {
    try {
      const endpoint = (!findingId || findingId === 'latest')
        ? API_ENDPOINTS.VERIFICATION_SCAN_GET.replace('{scanId}', scanId)
        : API_ENDPOINTS.VERIFICATION_GET
            .replace('{scanId}', scanId)
            .replace('{findingId}', findingId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const key = `${scanId}-${findingId}`;
      if (mockStore.has(key)) {
        return mockStore.get(key);
      }

      // Default to returning pending review, unless findingId has a special suffix (for testing)
      if (findingId.includes('REVIEWED')) {
        return {
          ...mockAlreadyReviewedData,
          scanId,
          findingId
        };
      }

      return {
        ...mockVerificationData,
        scanId,
        findingId
      };
    }
  },

  /**
   * Submits the officer's authoritative decision.
   */
  async submitVerification(scanId, findingId, payload) {
    try {
      const endpoint = API_ENDPOINTS.VERIFICATION_SUBMIT
        .replace('{scanId}', scanId)
        .replace('{findingId}', findingId);
      return await api.post(endpoint, payload);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedRecord = {
        ...mockVerificationData,
        scanId,
        findingId,
        status: REVIEW_STATUS.COMPLETED,
        decision: payload.decision,
        remarks: payload.remarks,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Current Officer (Mock)',
        timeline: [
          ...mockVerificationData.timeline,
          { 
            timestamp: new Date().toISOString(), 
            actor: 'OFFICER', 
            action: `Review Submitted: ${
              payload.decision === OFFICER_DECISION.CONFIRM_FINDING ? 'Confirm Finding' :
              payload.decision === OFFICER_DECISION.INVALIDATE_FINDING ? 'Invalidate Finding' : 'Needs Further Review'
            }`, 
            status: 'COMPLETED' 
          }
        ]
      };

      const key = `${scanId}-${findingId}`;
      mockStore.set(key, updatedRecord);

      return updatedRecord;
    }
  }
};

export default verificationService;
