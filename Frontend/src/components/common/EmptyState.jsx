import React from 'react';
import { FileQuestion } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

/**
 * Reusable EmptyState Component
 * Displays empty or zero-result states in an enterprise glass container
 */
export const EmptyState = ({
  icon = <FileQuestion size={42} />,
  title = 'No Records Found',
  description = 'There are currently no items matching your criteria in the system.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '560px',
        margin: '1.5rem auto',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          color: 'var(--color-brand-cyan-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '0.5rem',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '400px',
          lineHeight: 'var(--line-height-relaxed)',
          marginBottom: actionLabel ? '1.5rem' : 0,
        }}
      >
        {description}
      </p>

      {actionLabel && (
        <GlassButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};

export default EmptyState;
