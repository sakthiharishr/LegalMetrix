import React from 'react';

/**
 * Standard PageHeader Component
 * Provides uniform enterprise page titling, context, and action slots across all views
 */
export const PageHeader = ({
  title,
  subtitle,
  badge = null,
  actions = null,
  className = '',
}) => {
  return (
    <div
      className={`page-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {badge}
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: '0.35rem',
              marginBottom: 0,
              maxWidth: '650px',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
