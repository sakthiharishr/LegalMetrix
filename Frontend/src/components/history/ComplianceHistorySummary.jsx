import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, Target, AlertTriangle } from 'lucide-react';

export const ComplianceHistorySummary = ({ detail }) => {
  if (!detail) return null;

  return (
    <GlassCard variant="default">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.25rem 0', color: 'var(--color-text-primary)' }}>
        Current Compliance Status
      </h3>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Overall Status</div>
          <StatusBadge status={detail.currentStatus} size="lg" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', flex: 1 }}>
          <div style={{ padding: '0.75rem', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-standard)' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Inspections</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{detail.summary?.totalInspections || 0}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-standard)' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Open Findings</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-status-review)' }}>{detail.summary?.potentialFindings || 0}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-standard)' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Confirmed Violations</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-danger)' }}>{detail.summary?.officerConfirmations || 0}</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <AlertTriangle size={14} />
        Current status reflects the latest available backend assessment and officer review.
      </div>
    </GlassCard>
  );
};

export default ComplianceHistorySummary;
