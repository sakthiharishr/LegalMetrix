import React from 'react';

/**
 * Reusable GlassBadge Component
 * Displays translucent pills for counts, statuses, and tags
 */
export const GlassBadge = ({
  children,
  variant = 'default', // 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  size = 'md',         // 'sm' | 'md'
  icon = null,
  className = '',
  style = {},
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'rgba(6, 182, 212, 0.14)',
          color: 'var(--color-brand-cyan-light)',
          borderColor: 'rgba(6, 182, 212, 0.35)',
        };
      case 'success':
        return {
          background: 'var(--color-status-compliant-bg)',
          color: 'var(--color-status-compliant)',
          borderColor: 'var(--color-status-compliant-border)',
        };
      case 'danger':
        return {
          background: 'var(--color-status-violation-bg)',
          color: 'var(--text-danger)',
          borderColor: 'var(--color-status-violation-border)',
        };
      case 'warning':
        return {
          background: 'var(--color-status-review-bg)',
          color: 'var(--color-status-review)',
          borderColor: 'var(--color-status-review-border)',
        };
      case 'neutral':
        return {
          background: 'var(--color-status-pending-bg)',
          color: 'var(--color-text-secondary)',
          borderColor: 'var(--color-status-pending-border)',
        };
      case 'default':
      default:
        return {
          background: 'rgba(var(--tint-rgb), 0.08)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--glass-border-standard)',
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`glass-badge ${className}`}
      style={{
        ...getBadgeStyle(),
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        fontSize: isSmall ? '0.7rem' : 'var(--font-size-xs)',
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};

export default GlassBadge;
