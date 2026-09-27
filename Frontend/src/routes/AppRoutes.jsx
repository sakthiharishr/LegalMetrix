import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { ScanProduct } from '../pages/ScanProduct';
import { ComplianceAnalysis } from '../pages/ComplianceAnalysis';
import { ViolationEvidence } from '../pages/ViolationEvidence';
import { OfficerVerification } from '../pages/OfficerVerification';
import { ProductHistory } from '../pages/ProductHistory';
import { Reports } from '../pages/Reports';

/**
 * AppRoutes Component
 * Centralizes the application route definitions for all 8 core modules
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route: Officer Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default route redirects to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="scan" element={<ScanProduct />} />
        <Route path="analysis" element={<ComplianceAnalysis />} />
        <Route path="evidence" element={<ViolationEvidence />} />
        <Route path="verification" element={<OfficerVerification />} />
        <Route path="history" element={<ProductHistory />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
