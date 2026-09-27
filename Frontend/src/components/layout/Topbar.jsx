import React from 'react';
import { Menu, LogOut, Shield, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Topbar = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className="glass-topbar"
      style={{
        height: 'var(--topbar-height)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-topbar)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
      }}
    >
      {/* Left side: Hamburger (on mobile) & System Live Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobile}
          aria-label="Toggle navigation menu"
          className="glass-btn-ghost mobile-menu-btn"
          style={{
            display: 'none',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Menu size={22} />
        </button>

        {/* System Enforcement Live Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}
        >
          <span
            className="pulse-indicator"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-cyan)',
              boxShadow: '0 0 8px var(--color-brand-cyan)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: '0.04em',
              color: 'var(--color-brand-cyan-light)',
            }}
          >
            PCR 2011 ENGINE ONLINE
          </span>
        </div>
      </div>

      {/* Right side: Officer Badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Officer Information Card */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(var(--tint-rgb), 0.04)',
              border: '1px solid var(--glass-border-standard)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.8rem',
              }}
            >
              {user.name ? user.name.charAt(0) : 'O'}
            </div>
            <div className="officer-meta" style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {user.name || 'Officer'}
              </div>
              <div
                style={{
                  fontSize: '0.675rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Badge: {user.badgeNumber || 'LM-OFFICER'}
              </div>
            </div>
          </div>
        )}

        <ThemeToggle />

        {/* Logout Action */}
        <button
          onClick={logout}
          title="Sign out of enforcement session"
          aria-label="Logout"
          className="glass-btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border-subtle)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <LogOut size={16} />
          <span className="logout-text">Exit</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .officer-meta {
            display: none;
          }
          .logout-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Topbar;
