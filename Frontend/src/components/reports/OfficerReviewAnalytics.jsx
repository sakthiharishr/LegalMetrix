import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { OFFICER_DECISION } from '../../utils/constants';

export const OfficerReviewAnalytics = ({ outcomes }) => {
  if (!outcomes || outcomes.length === 0) return null;

  const total = outcomes.reduce((sum, item) => sum + item.count, 0) || 1;

  const getStyle = (outcome) => {
    switch(outcome) {
      case OFFICER_DECISION.CONFIRM_FINDING: return { label: 'Confirmed Findings', color: 'var(--text-danger)' };
      case OFFICER_DECISION.INVALIDATE_FINDING: return { label: 'Invalidated Findings', color: 'var(--color-status-compliant)' };
      case OFFICER_DECISION.NEEDS_FURTHER_REVIEW: return { label: 'Needs Further Review', color: 'var(--color-status-warning)' };
      default: return { label: 'Pending Review', color: 'var(--color-text-muted)' };
    }
  };

  return (
    <GlassCard variant="default">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.5rem 0', color: 'var(--color-text-primary)' }}>
        Officer Review Outcomes
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {outcomes.map(item => {
          const style = getStyle(item.outcome);
          const pct = ((item.count / total) * 100).toFixed(1);
          
          return (
            <div key={item.outcome} style={{ padding: '1rem', background: 'rgba(var(--shade-rgb), calc(0.2 * var(--shade-k)))', border: '1px solid var(--glass-border-standard)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem', height: '24px' }}>
                {style.label}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: style.color }}>
                {item.count}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {pct}% of reviews
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default OfficerReviewAnalytics;
