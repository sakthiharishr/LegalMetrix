/**
 * LEGAL METRIX - History Service Abstraction
 *
 * Interfaces with the FastAPI backend to retrieve product compliance history
 * Includes mock data fallbacks for frontend development.
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import { 
  mockHistorySummary, 
  mockProductHistoryList, 
  mockProductDetail, 
  mockInspectionTimeline, 
  mockHistoricalFindings, 
  mockRecurringIssues, 
  mockHistoricalEvidence 
} from '../data/mockData';

export const historyService = {
  
  async getHistorySummary() {
    try {
      return await api.get(API_ENDPOINTS.HISTORY_SUMMARY);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockHistorySummary;
    }
  },

  async searchProducts(params) {
    try {
      return await api.get(API_ENDPOINTS.HISTORY_SEARCH, params || {});
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let results = [...mockProductHistoryList];
      
      if (params?.search) {
        const query = params.search.toLowerCase();
        results = results.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.productId.toLowerCase().includes(query));
      }
      if (params?.status && params.status !== 'ALL') {
        results = results.filter(p => p.currentStatus === params.status);
      }
      if (params?.riskLevel && params.riskLevel !== 'ALL') {
        results = results.filter(p => p.riskLevel === params.riskLevel);
      }
      
      return {
        products: results,
        total: results.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      };
    }
  },

  async getProductDetail(productId) {
    try {
      const endpoint = API_ENDPOINTS.HISTORY_DETAIL.replace('{productId}', productId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        ...mockProductDetail,
        productId
      };
    }
  },

  async getInspectionTimeline(productId) {
    try {
      const endpoint = API_ENDPOINTS.HISTORY_INSPECTIONS.replace('{productId}', productId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockInspectionTimeline;
    }
  },

  async getHistoricalFindings(productId) {
    try {
      const endpoint = API_ENDPOINTS.HISTORY_FINDINGS.replace('{productId}', productId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockHistoricalFindings;
    }
  },

  async getRecurringIssues(productId) {
    try {
      const endpoint = API_ENDPOINTS.HISTORY_RECURRING.replace('{productId}', productId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockRecurringIssues;
    }
  },

  async getHistoricalEvidence(productId) {
    try {
      const endpoint = API_ENDPOINTS.HISTORY_EVIDENCE.replace('{productId}', productId);
      return await api.get(endpoint);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockHistoricalEvidence;
    }
  }

};

export default historyService;
