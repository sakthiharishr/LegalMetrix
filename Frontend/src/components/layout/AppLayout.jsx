import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Main Application Shell Layout
 * Integrates Glassmorphic Sidebar, Topbar, and dynamic view routing
 */
export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      className="app-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-navy-950)',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={closeMobileMenu} />

      {/* Main Content Area */}
      <div
        className="main-layout-container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'var(--sidebar-width)',
          minWidth: 0,
          transition: 'margin-left var(--transition-normal)',
        }}
      >
        {/* Top Header */}
        <Topbar onToggleMobile={toggleMobileMenu} />

        {/* Dynamic Route Content */}
        <main
          className="app-main-content animate-fade-in"
          style={{
            flex: 1,
            padding: '2rem 1.75rem',
            maxWidth: 'var(--container-max-width)',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .main-layout-container {
            margin-left: 0 !important;
          }
          .app-main-content {
            padding: 1.25rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
