import React from 'react';

/**
 * Reusable GlassCard Component
 * Implements standard, elevated, and interactive glassmorphic cards
 */
export const GlassCard = ({
  children,
  header,
  footer,
  variant = 'default', // 'default' | 'elevated' | 'interactive' | 'subtle'
  className = '',
  onClick,
  style = {},
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'elevated':
        return 'glass-card glass-elevated';
      case 'interactive':
        return 'glass-card glass-card-interactive';
      case 'subtle':
        return 'glass-panel';
      default:
        return 'glass-card';
    }
  };

  const isClickable = variant === 'interactive' || Boolean(onClick);

  return (
    <div
      className={`${getVariantClass()} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick && onClick(e);
              }
            }
          : undefined
      }
      style={{
        padding: '1.25rem',
        ...style,
      }}
      {...props}
    >
      {header && (
        <div
          style={{
            borderBottom: '1px solid var(--glass-border-standard)',
            paddingBottom: '0.875rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {header}
        </div>
      )}

      <div className="glass-card-content">{children}</div>

      {footer && (
        <div
          style={{
            borderTop: '1px solid var(--glass-border-standard)',
            paddingTop: '0.875rem',
            marginTop: '1rem',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default GlassCard;
