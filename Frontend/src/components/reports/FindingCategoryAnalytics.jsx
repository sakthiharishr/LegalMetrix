import React from 'react';
import { ReportCard, EmptyPanel } from './ReportCard';

export const ProgressRow = ({ label, value, percent, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
      <span style={{ color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>{value}</strong> · {percent}%
      </span>
    </div>
    <div style={{ height: 8, background: 'rgba(var(--tint-rgb), 0.08)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(percent, value ? 2 : 0)}%`, background: color, borderRadius: 4 }} />
    </div>
  </div>
);

export const FindingCategoryAnalytics = ({ categories }) => {
  const items = categories || [];
  const total = items.reduce((sum, c) => sum + c.count, 0);

  return (
    <ReportCard title="Finding Categories" caption={`${total} finding${total === 1 ? '' : 's'} by declaration area`}>
      {items.length === 0 ? <EmptyPanel>No findings in this period.</EmptyPanel> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {items.map((cat) => (
            <ProgressRow key={cat.category} label={cat.category} value={cat.count} percent={cat.percentage} color="var(--color-brand-cyan)" />
          ))}
        </div>
      )}
    </ReportCard>
  );
};

export default FindingCategoryAnalytics;
