import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const ReportSummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Total Inspections</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{summary.totalInspections}</div>
      </GlassCard>
      
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Products Inspected</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{summary.productsInspected}</div>
      </GlassCard>

      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Potential Findings</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-status-review)' }}>{summary.potentialFindings}</div>
      </GlassCard>

      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Confirmed Violations</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-danger)' }}>{summary.confirmedFindings}</div>
      </GlassCard>
    </div>
  );
};

export default ReportSummaryCards;
