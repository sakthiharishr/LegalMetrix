import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Reusable GlassButton Component
 * Supports primary, secondary, danger, and ghost glass styles
 */
export const GlassButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  onClick,
  style = {},
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'glass-btn-secondary';
      case 'danger':
        return 'glass-btn-danger';
      case 'ghost':
        return 'glass-btn-ghost';
      case 'primary':
      default:
        return 'glass-btn-primary';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.375rem 0.75rem', fontSize: 'var(--font-size-xs)' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-base)' };
      case 'md':
      default:
        return { padding: '0.55rem 1.125rem', fontSize: 'var(--font-size-sm)' };
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`glass-btn ${getVariantClass()} ${className}`}
      style={{
        ...getSizeStyle(),
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default GlassButton;
