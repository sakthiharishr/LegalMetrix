import React, { useId } from 'react';

/**
 * Reusable GlassInput Component
 * Accessible input with label, prefix icon, end adornment (e.g. password toggle),
 * helper text, and error validation states.
 */
export const GlassInput = ({
  label,
  error,
  icon = null,
  endAdornment = null,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  helperText,
  autoComplete,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`glass-input-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: error ? 'var(--color-status-violation)' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-status-violation)' }} aria-hidden="true">*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className="glass-input"
          style={{
            width: '100%',
            paddingLeft: icon ? '2.5rem' : '0.875rem',
            paddingRight: endAdornment ? '2.75rem' : '0.875rem',
            paddingTop: '0.65rem',
            paddingBottom: '0.65rem',
            borderColor: error ? 'var(--color-status-violation)' : undefined,
          }}
          {...props}
        />

        {endAdornment && (
          <div
            style={{
              position: 'absolute',
              right: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {endAdornment}
          </div>
        )}
      </div>

      {error ? (
        <span
          id={errorId}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-danger)',
            marginTop: '0.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          id={helperId}
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginTop: '0.125rem',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default GlassInput;
