/**
 * LEGAL METRIX - Centralized API Service Abstraction
 * 
 * IMPORTANT: Strictly a frontend service layer.
 * Backend integration target: Python / FastAPI.
 * Base URL is dynamically configured via: VITE_API_BASE_URL.
 * 
 * Security Features:
 * - credentials: 'include' enabled for secure HttpOnly cookie compatibility.
 * - Non-looping HTTP 401 token refresh queue.
 * - In-memory / secured token management.
 * - Credentials and tokens are NEVER printed to logs.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Token storage key
const TOKEN_KEY = 'legal_metrix_access_token';

// Centralized API Endpoints Dictionary for easy backend teammate mapping
export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  // Dashboard Intelligence Endpoints
  DASHBOARD_SUMMARY: '/dashboard/summary',
  DASHBOARD_TRENDS: '/dashboard/compliance-trends',
  DASHBOARD_RISK: '/dashboard/risk-distribution',
  DASHBOARD_VIOLATIONS: '/dashboard/violations',
  DASHBOARD_HIGH_PRIORITY: '/dashboard/high-priority',
  DASHBOARD_RECENT: '/dashboard/recent-inspections',
  DASHBOARD_PATTERNS: '/dashboard/recurring-patterns',
  DASHBOARD_RISK_SCORE: '/dashboard/risk-score-details',
  DASHBOARD_ALERTS: '/dashboard/alerts',
  // Inspection & Scanning Endpoints
  COMMODITY_SCAN: '/commodities/scan',
  COMMODITY_LIST: '/commodities',
  COMPLIANCE_EVALUATE: '/compliance/evaluate',
  OFFICER_VERIFY: '/verification/confirm',
  // Scan & Image Acquisition Endpoints (Phase 3)
  SCAN_CREATE: '/scans',
  SCAN_UPLOAD_IMAGE: '/scans/{scanId}/images',
  SCAN_QUALITY_CHECK: '/scans/quality-check',
  SCAN_FORWARD: '/scans/{scanId}/forward',
  REPORT_CASE_PDF: '/reports/scans/{scanId}/pdf',
  SCAN_ANALYZE: '/scans/{scanId}/analyze',
  SCAN_STATUS: '/scans/{scanId}/status',
  // Compliance Analysis Endpoints (Phase 4)
  ANALYSIS_AVAILABLE: '/analysis/available',
  ANALYSIS_GET: '/analysis/{scanId}',
  ANALYSIS_OCR: '/analysis/{scanId}/ocr',
  ANALYSIS_COMPLIANCE: '/analysis/{scanId}/compliance',
  ANALYSIS_RISK: '/analysis/{scanId}/risk',
  ANALYSIS_HISTORY: '/analysis/{scanId}/history',
  // Violation Evidence Endpoints (Phase 5)
  EVIDENCE_AVAILABLE: '/evidence/available',
  EVIDENCE_GET: '/scans/{scanId}/findings/{findingId}/evidence',
  EVIDENCE_SCAN_GET: '/scans/{scanId}/evidence',
  EVIDENCE_IMAGE: '/evidence/{evidenceId}',
  // Officer Verification Endpoints (Phase 6)
  VERIFICATION_PENDING: '/pending',
  VERIFICATION_GET: '/scans/{scanId}/findings/{findingId}/verification',
  VERIFICATION_SCAN_GET: '/scans/{scanId}/verification',
  VERIFICATION_SUBMIT: '/scans/{scanId}/findings/{findingId}/verification',
  VERIFICATION_TIMELINE: '/scans/{scanId}/findings/{findingId}/timeline',
  // Product History Endpoints (Phase 7)
  HISTORY_SUMMARY: '/products/history/summary',
  HISTORY_SEARCH: '/products/search',
  HISTORY_DETAIL: '/products/{productId}/history',
  HISTORY_INSPECTIONS: '/products/{productId}/inspections',
  HISTORY_FINDINGS: '/products/{productId}/findings',
  HISTORY_RECURRING: '/products/{productId}/recurring-issues',
  HISTORY_EVIDENCE: '/products/{productId}/evidence',
  // Reports & Analytics Endpoints (Phase 8)
  REPORTS_ANALYTICS: '/reports/analytics',
  REPORTS_PREVIEW: '/reports/preview',
  REPORTS_EXPORT_PDF: '/reports/export/pdf',
  REPORTS_EXPORT_CSV: '/reports/export/csv',
};

/**
 * Standard API error structure
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Token helper methods
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

// Refresh token mutex state to prevent concurrent multiple refreshes and infinite loops
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * Core fetch wrapper with authentication interceptor, 401 refresh handling,
 * and error standardization.
 */
async function request(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  
  // Attach JWT Bearer token if present
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default JSON Content-Type if not a FormData upload
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const { responseType, ...fetchOptions } = options;
  const config = {
    ...fetchOptions,
    headers,
    // Enable cookie handling for future FastAPI HttpOnly refresh tokens / session cookies
    credentials: options.credentials || 'include',
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      const isAuthEndpoint =
        endpoint.includes(API_ENDPOINTS.AUTH_LOGIN) ||
        endpoint.includes(API_ENDPOINTS.AUTH_REFRESH);

      // If already a retry or an auth endpoint, do not attempt to refresh
      if (isRetry || isAuthEndpoint) {
        clearAuthToken();
        window.dispatchEvent(
          new CustomEvent('lm-session-expired', {
            detail: { reason: 'session_expired' },
          })
        );
        const errData = await parseResponseData(response);
        throw new ApiError(errData?.detail || errData?.message || 'Authentication session expired', 401, errData);
      }

      // If refresh is already in progress, wait for it to finish and retry once
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(new ApiError('Session refresh failed', 401));
            } else {
              resolve(request(endpoint, options, true));
            }
          });
        });
      }

      // Initiate session refresh
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.accessToken || refreshData.access_token;
          if (newToken) {
            setAuthToken(newToken);
          }
          isRefreshing = false;
          onRefreshed(newToken);
          // Retry the original failed request
          return request(endpoint, options, true);
        } else {
          throw new Error('Refresh endpoint returned error');
        }
      } catch {
        isRefreshing = false;
        clearAuthToken();
        onRefreshed(null);
        window.dispatchEvent(
          new CustomEvent('lm-session-expired', {
            detail: { reason: 'session_expired' },
          })
        );
        throw new ApiError('Session expired. Please sign in again.', 401);
      }
    }

    // File downloads (PDF/CSV) come back as a Blob; errors are still JSON.
    if (responseType === 'blob' && response.ok) {
      return await response.blob();
    }

    const data = await parseResponseData(response);

    if (!response.ok) {
      const errorMessage =
        data?.message || data?.detail || `API request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or client connection error
    throw new ApiError(error.message || 'Unable to connect to enforcement server', 0);
  }
}

async function parseResponseData(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Clean HTTP method abstractions
 */
export const api = {
  get: (endpoint, params = {}, options = {}) => {
    const queryParams = params?.params && typeof params.params === 'object' ? params.params : params;
    const queryString = new URLSearchParams(queryParams || {}).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(fullEndpoint, { ...options, method: 'GET' });
  },

  post: (endpoint, body = {}, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put: (endpoint, body = {}, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'DELETE' });
  },

  uploadFile: (endpoint, formData, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Download a file (PDF/CSV) with the signed-in session and save it.
   * Uses the same token and session refresh as every other request.
   */
  download: async (endpoint, filename, { method = 'GET', body } = {}) => {
    const blob = await request(endpoint, {
      method,
      responseType: 'blob',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export default api;
