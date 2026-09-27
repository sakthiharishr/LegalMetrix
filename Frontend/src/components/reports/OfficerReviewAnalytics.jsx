import React from 'react';
import { ReportCard, EmptyPanel } from './ReportCard';
import { OFFICER_DECISION } from '../../utils/constants';

const OUTCOMES = [
  { key: OFFICER_DECISION.CONFIRM_FINDING, label: 'Confirmed', color: 'var(--color-status-violation)' },
  { key: OFFICER_DECISION.INVALIDATE_FINDING, label: 'Invalidated', color: 'var(--color-status-compliant)' },
  { key: OFFICER_DECISION.NEEDS_FURTHER_REVIEW, label: 'Further review', color: 'var(--color-status-review)' },
];

export const OfficerReviewAnalytics = ({ outcomes }) => {
  const counts = Object.fromEntries((outcomes || []).map((o) => [o.outcome, o.count]));
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <ReportCard title="Officer Review Outcomes" caption={`${total} decision${total === 1 ? '' : 's'} recorded`}>
      {total === 0 ? <EmptyPanel>No officer decisions in this period.</EmptyPanel> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          {OUTCOMES.map(({ key, label, color }) => {
            const value = counts[key] || 0;
            return (
              <div key={key} style={{ padding: '0.9rem 1rem', border: '1px solid var(--glass-border-standard)', borderTop: `3px solid ${color}`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0.3rem 0 0.1rem', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{Math.round((value / total) * 100)}% of decisions</div>
              </div>
            );
          })}
        </div>
      )}
    </ReportCard>
  );
};

export default OfficerReviewAnalytics;
