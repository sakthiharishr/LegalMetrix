import React from 'react';

/**
 * Reusable LoadingSpinner Component
 * Accessible, lightweight dual-ring loader with cyan/blue accents
 */
export const LoadingSpinner = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  label = 'Loading...',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 36;
      case 'md':
      default:
        return 24;
    }
  };

  const dim = getDimensions();

  return (
    <div
      role="status"
      aria-label={label}
      className={`loading-spinner-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'spin 0.8s linear infinite',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="rgba(var(--tint-rgb), 0.15)"
          strokeWidth="2.5"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="var(--color-brand-cyan)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {label}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
