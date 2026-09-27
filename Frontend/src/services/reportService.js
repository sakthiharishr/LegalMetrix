/**
 * LEGAL METRIX - Report Service Abstraction
 *
 * Interfaces with the FastAPI backend to retrieve reports and enforcement analytics.
 * Includes mock data fallbacks for frontend development.
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import { mockReportAnalytics } from '../data/mockData';

export const reportService = {
  async getReportAnalytics(params) {
    try {
      return await api.get(API_ENDPOINTS.REPORTS_ANALYTICS, params || {});
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockReportAnalytics;
    }
  },

  // Exports go through the shared client so they carry the signed-in session (and refresh it).
  async requestPdfExport(params) {
    return api.post(API_ENDPOINTS.REPORTS_EXPORT_PDF, params || {}, { responseType: 'blob' });
  },

  async requestCsvExport(params) {
    return api.post(API_ENDPOINTS.REPORTS_EXPORT_CSV, params || {}, { responseType: 'blob' });
  }
};

export default reportService;
