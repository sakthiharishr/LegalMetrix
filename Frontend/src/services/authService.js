/**
 * LEGAL METRIX - Authentication Service Abstraction
 * 
 * STRICT SECURITY CONSTRAINTS:
 * - Does NOT generate JWTs or sign tokens in frontend.
 * - Does NOT store passwords in localStorage, sessionStorage, or logs.
 * - "Remember Me" strictly saves the Officer ID/Badge number for UX convenience, NEVER passwords.
 * - Ready for FastAPI backend integration via API_ENDPOINTS.
 * - In Phase 1 development, falls back smoothly to mock officer authorization if backend is offline.
 */

import { api, API_ENDPOINTS, setAuthToken, clearAuthToken, getAuthToken } from './api';
import { useMockApi } from '../utils/mockConfig';
import { mockCurrentUser } from '../data/mockData';
import { USER_ROLES } from '../utils/constants';

const USER_STORAGE_KEY = 'legal_metrix_officer_profile';
const REMEMBERED_ID_KEY = 'legal_metrix_remembered_officer_id';

export const authService = {
  /**
   * Officer Login
   * Attempts FastAPI authentication; falls back to mock validation if server is offline in Phase 1.
   */
  async login({ username, password, rememberMe = false }) {
    const trimmedId = (username || '').trim();

    if (!trimmedId) {
      throw new Error('Officer ID or official email is required.');
    }
    if (!password || password.trim().length === 0) {
      throw new Error('Password is required.');
    }

    // Handle Remember Me (strictly stores officer ID string only, NEVER credentials)
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_ID_KEY, trimmedId);
    } else {
      localStorage.removeItem(REMEMBERED_ID_KEY);
    }

    try {
      // 1. Attempt connection to FastAPI backend
      const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, {
        username: trimmedId,
        password: password,
      });

      const token = response.accessToken || response.access_token;
      const officer = response.user || response.officer;

      if (token) {
        setAuthToken(token);
      }
      if (officer) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(officer));
      }

      return {
        user: officer,
        accessToken: token,
      };
    } catch (apiError) {
      if (!useMockApi()) throw apiError;
      // If server responded with an explicit 401/403/400 authentication rejection, throw that error
      if (apiError.status === 401 || apiError.status === 403 || apiError.status === 400) {
        throw new Error(apiError.message || 'Invalid officer credentials or unauthorized badge number.');
      }

      // 2. Phase 1 Offline / Mock Mode Fallback (when backend server is not running yet)
      // Small delay to simulate network latency realistically
      await new Promise((res) => setTimeout(res, 550));

      // Rejection check for mock test
      if (trimmedId.toLowerCase() === 'invalid' || password === 'wrong') {
        throw new Error('Invalid Officer ID or password. Please verify your credentials.');
      }

      const mockOfficer = {
        ...mockCurrentUser,
        id: trimmedId.startsWith('LM-') ? trimmedId : `LM-${trimmedId.toUpperCase()}`,
        badgeNumber: trimmedId.toUpperCase(),
        email: trimmedId.includes('@') ? trimmedId : `${trimmedId.toLowerCase()}@delhi.gov.in`,
        department: 'Department of Legal Metrology, Government of India',
      };

      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      setAuthToken(mockToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockOfficer));

      return {
        user: mockOfficer,
        accessToken: mockToken,
        isMock: true,
      };
    }
  },

  /**
   * Officer Logout
   * Notifies backend if reachable, clears local auth state and memory.
   */
  async logout() {
    try {
      // Notify backend to invalidate refresh token/session cookie
      await api.post(API_ENDPOINTS.AUTH_LOGOUT, {}).catch(() => {});
    } finally {
      clearAuthToken();
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  /**
   * Retrieve active stored officer profile
   */
  getCurrentOfficer() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Session refresh abstraction
   */
  async refreshSession() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH_REFRESH, {});
      const token = response.accessToken || response.access_token;
      if (token) {
        setAuthToken(token);
      }
      return response;
    } catch {
      await this.logout();
      throw new Error('Session refresh failed');
    }
  },

  /**
   * Check if officer session is currently active
   */
  isAuthenticated() {
    return Boolean(getAuthToken() && this.getCurrentOfficer());
  },

  /**
   * Remember Me Helpers (Strictly stores non-sensitive username/ID string)
   */
  getRememberedOfficerId() {
    return localStorage.getItem(REMEMBERED_ID_KEY) || '';
  },

  /**
   * Forgot Password / Credential Recovery Request
   */
  async requestPasswordReset({ identifier }) {
    const trimmed = (identifier || '').trim();
    if (!trimmed) {
      throw new Error('Please enter your Officer ID or registered email.');
    }

    try {
      return await api.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { identifier: trimmed });
    } catch (error) {
      if (!useMockApi()) throw error;
      // Mock delay in Phase 1
      await new Promise((res) => setTimeout(res, 600));
      // Neutral security response preventing account enumeration
      return {
        success: true,
        message: 'If an authorized enforcement account is associated with this ID, recovery instructions have been dispatched.',
      };
    }
  },

  /**
   * Role-Based Access Helper
   */
  hasRole(officer, requiredRole) {
    if (!officer || !officer.role) return false;
    if (officer.role === USER_ROLES.ADMIN) return true; // Admin has broad access
    return officer.role === requiredRole;
  },
};

export default authService;
