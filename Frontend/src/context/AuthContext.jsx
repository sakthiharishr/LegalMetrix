/**
 * LEGAL METRIX - AuthContext
 * Centralized authentication state management & session lifecycle
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Initialize authentication state on application load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedOfficer = authService.getCurrentOfficer();
        const isAuth = authService.isAuthenticated();

        if (storedOfficer && isAuth) {
          setUser(storedOfficer);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session initialization error', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to session-expired events from api.js
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(true);
    };

    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('lm-session-expired', handleSessionExpired);
    window.addEventListener('lm-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('lm-session-expired', handleSessionExpired);
      window.removeEventListener('lm-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setSessionExpired(false);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const res = await authService.refreshSession();
      const updatedOfficer = authService.getCurrentOfficer();
      if (updatedOfficer) {
        setUser(updatedOfficer);
        setIsAuthenticated(true);
      }
      return res;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(true);
      throw err;
    }
  };

  const hasRole = useCallback(
    (requiredRole) => {
      return authService.hasRole(user, requiredRole);
    },
    [user]
  );

  const clearSessionExpiredNotice = () => {
    setSessionExpired(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    sessionExpired,
    login,
    logout,
    refreshSession,
    hasRole,
    clearSessionExpiredNotice,
    getRememberedOfficerId: authService.getRememberedOfficerId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
