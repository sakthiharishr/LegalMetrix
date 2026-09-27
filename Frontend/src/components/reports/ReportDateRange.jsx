import React from 'react';

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
];

/** Segmented control for the reporting period. */
export const ReportDateRange = ({ dateRange, updateDateRange }) => (
  <div role="radiogroup" aria-label="Reporting period" className="no-print"
    style={{ display: 'inline-flex', padding: 3, gap: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-standard)', background: 'rgba(var(--tint-rgb), 0.04)' }}>
    {RANGES.map((range) => {
      const active = dateRange === range.value;
      return (
        <button
          key={range.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => updateDateRange(range.value)}
          style={{
            padding: '0.45rem 0.95rem', border: 'none', borderRadius: 'calc(var(--radius-md) - 3px)', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: active ? 600 : 500, transition: 'background 0.15s, color 0.15s',
            background: active ? 'var(--color-brand-cyan)' : 'transparent',
            color: active ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          {range.label}
        </button>
      );
    })}
  </div>
);

export default ReportDateRange;
