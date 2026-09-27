import React from 'react';

export const ReportDateRange = ({ dateRange, updateDateRange }) => {
  const ranges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last 1 Year' }
  ];

  return (
    <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {ranges.map(range => (
        <button
          key={range.value}
          onClick={() => updateDateRange(range.value)}
          style={{
            padding: '0.5rem 1rem',
            background: dateRange === range.value ? 'rgba(6, 182, 212, 0.15)' : 'rgba(0,0,0,0.3)',
            border: `1px solid ${dateRange === range.value ? 'var(--color-brand-cyan-light)' : 'var(--glass-border-standard)'}`,
            borderRadius: 'var(--radius-md)',
            color: dateRange === range.value ? 'var(--color-brand-cyan-light)' : 'var(--color-text-secondary)',
            fontSize: '0.85rem',
            fontWeight: dateRange === range.value ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default ReportDateRange;
