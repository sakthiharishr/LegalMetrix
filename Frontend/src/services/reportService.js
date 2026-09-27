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

  async requestPdfExport(params) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('legalmetrix_access_token');
    const res = await fetch(`${baseUrl}${API_ENDPOINTS.REPORTS_EXPORT_PDF}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(params || {})
    });
    if (!res.ok) throw new Error(`PDF export failed (${res.status})`);
    return await res.blob();
  },

  async requestCsvExport(params) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('legalmetrix_access_token');
    const res = await fetch(`${baseUrl}${API_ENDPOINTS.REPORTS_EXPORT_CSV}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(params || {})
    });
    if (!res.ok) throw new Error(`CSV export failed (${res.status})`);
    return await res.blob();
  }
};

export default reportService;
