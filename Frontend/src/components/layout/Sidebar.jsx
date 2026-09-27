import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  Scale,
  FileSearch,
  ShieldCheck,
  History,
  BarChart3,
  X,
  Shield,
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../utils/constants';

// Icon mapping helper
const iconMap = {
  LayoutDashboard,
  ScanLine,
  Scale,
  FileSearch,
  ShieldCheck,
  History,
  BarChart3,
};

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(var(--surface-rgb), 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 'var(--z-sidebar)',
          }}
        />
      )}

      <aside
        className={`glass-sidebar ${isMobileOpen ? 'sidebar-open-mobile' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 'calc(var(--z-sidebar) + 1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform var(--transition-normal)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border-standard)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
              }}
            >
              <img src="/logo.svg" alt="Legal Metrix Logo" style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  letterSpacing: '0.04em',
                  color: 'var(--text-heading)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                LEGAL METRIX
              </h1>
              <p
                style={{
                  fontSize: '0.675rem',
                  color: 'var(--color-brand-cyan-light)',
                  margin: 0,
                  fontWeight: 'var(--font-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                PCR 2011 Intelligence
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="mobile-close-btn"
            aria-label="Close navigation"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SIH Banner Pill */}
        <div
          style={{
            margin: '0.875rem 1rem 0.25rem 1rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Shield size={14} color="var(--color-brand-cyan-light)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)' }}>SIH 2026</span> • PS 26034
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '0.875rem 0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.5rem 0.75rem 0.25rem',
            }}
          >
            Enforcement Modules
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = iconMap[item.iconName] || LayoutDashboard;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `nav-link-item ${isActive ? 'nav-link-active' : ''}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <IconComponent size={18} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--glass-border-standard)',
            background: 'rgba(var(--surface-rgb), 0.4)',
          }}
        >
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
              Legal Metrology Dept.
            </div>
            Govt. of India Compliance Engine
          </div>
        </div>
      </aside>

      <style>{`
        .nav-link-item:hover {
          background: rgba(var(--tint-rgb), 0.05);
          color: var(--color-text-primary) !important;
          transform: translateX(2px);
        }

        .nav-link-active {
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.16) 0%, rgba(37, 99, 235, 0.12) 100%) !important;
          color: var(--color-brand-cyan-light) !important;
          border: 1px solid rgba(6, 182, 212, 0.3);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
        }

        .nav-link-active .nav-icon {
          color: var(--color-brand-cyan);
        }

        @media (max-width: 900px) {
          .glass-sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open-mobile {
            transform: translateX(0) !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
