import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * ProtectedRoute Guard
 * Ensures only authorized enforcement officers can access internal modules.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-navy-950)',
        }}
      >
        <LoadingSpinner size="lg" label="Validating officer authorization..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login and preserve destination location in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
