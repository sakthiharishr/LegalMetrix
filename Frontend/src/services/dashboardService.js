/**
 * LEGAL METRIX - Dashboard Data Service Abstraction
 * 
 * Intermediary between UI components and the FastAPI backend.
 * Provides fallback to structured mock data for standalone frontend development.
 */

import { api, API_ENDPOINTS } from './api';
import { useMockApi } from '../utils/mockConfig';
import {
  mockDashboardSummary,
  mockComplianceTrends,
  mockRiskDistribution,
  mockViolationCategories,
  mockHighPriorityInspections,
  mockRecentInspections,
  mockRecurringPatterns,
  mockSampleRiskScore,
  mockIntelligenceAlerts,
} from '../data/mockData';

export const dashboardService = {
  /**
   * Fetch top-level statistic counters
   */
  async getDashboardSummary() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_SUMMARY);
    } catch (error) {
      if (!useMockApi()) throw error;
      // Simulate minor network delay for realistic loading skeleton demo
      await new Promise((res) => setTimeout(res, 250));
      return mockDashboardSummary;
    }
  },

  /**
   * Fetch compliance trend points for 7d, 30d, or 90d
   */
  async getComplianceTrends(period = '7d') {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_TRENDS, { period });
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 200));
      return mockComplianceTrends[period] || mockComplianceTrends['7d'];
    }
  },

  /**
   * Fetch risk tier distribution
   */
  async getRiskDistribution() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_RISK);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 200));
      return mockRiskDistribution;
    }
  },

  /**
   * Fetch breakdown of potential violations by PCR 2011 rule
   */
  async getViolationCategories() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_VIOLATIONS);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 200));
      return mockViolationCategories;
    }
  },

  /**
   * Fetch high-priority commodities flagged for urgent review
   */
  async getHighPriorityInspections() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_HIGH_PRIORITY);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 250));
      return mockHighPriorityInspections;
    }
  },

  /**
   * Fetch recent scan events log
   */
  async getRecentInspections() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_RECENT);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 250));
      return mockRecentInspections;
    }
  },

  /**
   * Fetch recurring repeat violation patterns
   */
  async getRecurringPatterns() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_PATTERNS);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 200));
      return mockRecurringPatterns;
    }
  },

  /**
   * Fetch composite risk score breakdown details
   */
  async getRiskScoreDetails() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_RISK_SCORE);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 200));
      return mockSampleRiskScore;
    }
  },

  /**
   * Fetch intelligence notification alerts
   */
  async getIntelligenceAlerts() {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD_ALERTS);
    } catch (error) {
      if (!useMockApi()) throw error;
      await new Promise((res) => setTimeout(res, 150));
      return mockIntelligenceAlerts;
    }
  },
};

export default dashboardService;
