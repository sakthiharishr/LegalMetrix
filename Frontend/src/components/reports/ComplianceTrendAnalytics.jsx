import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const ComplianceTrendAnalytics = ({ trend }) => {
  if (!trend || trend.length === 0) return null;

  return (
    <GlassCard variant="default">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.5rem 0', color: 'var(--color-text-primary)' }}>
        Compliance Outcome Trend
      </h3>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', width: '100%', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border-standard)' }}>
        {trend.map((point, index) => {
          const total = point.compliant + point.potentialFindings + point.needsReview;
          const compPct = (point.compliant / total) * 100;
          const fndPct = (point.potentialFindings / total) * 100;
          const revPct = (point.needsReview / total) * 100;

          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'flex-end', gap: '1px' }}>
                <div title={`Needs Review: ${point.needsReview}`} style={{ width: '100%', height: `${revPct}%`, background: 'var(--color-status-warning)' }} />
                <div title={`Potential Findings: ${point.potentialFindings}`} style={{ width: '100%', height: `${fndPct}%`, background: 'var(--color-status-danger)' }} />
                <div title={`Compliant: ${point.compliant}`} style={{ width: '100%', height: `${compPct}%`, background: 'var(--color-status-compliant)' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '-25px', width: '100%', textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center', fontSize: '0.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--color-status-compliant)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Compliant</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--color-status-danger)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Findings</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--color-status-warning)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Review</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ComplianceTrendAnalytics;
