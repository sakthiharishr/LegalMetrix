import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { COMPLIANCE_STATUS } from '../../utils/constants';

export const AnalysisSummaryCard = ({ summary }) => {
  if (!summary) return null;

  const isCompliant = summary.status === COMPLIANCE_STATUS.COMPLIANT;

  return (
    <GlassCard variant="elevated">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Status Area */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0' }}>
              Overall Assessment
            </h3>
            <StatusBadge status={summary.status} size="md" />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.75rem', lineHeight: 1.4, maxWidth: '280px' }}>
              {isCompliant 
                ? 'No significant compliance issues detected by the AI rule engine.'
                : 'AI findings suggest potential non-compliance. Officer verification is required.'}
            </p>
          </div>
          
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: isCompliant ? 'var(--color-status-compliant-bg)' : 'var(--color-status-violation-bg)',
            color: isCompliant ? 'var(--color-status-compliant)' : 'var(--text-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isCompliant ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '0.75rem',
          borderTop: '1px solid var(--glass-border-standard)',
          paddingTop: '1.25rem'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {summary.totalChecks}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Checks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={14} color="var(--color-status-compliant)" />
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {summary.passedChecks}
              </span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Passed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={14} color="var(--text-danger)" />
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {summary.potentialFindings}
              </span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Findings
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={14} color="var(--color-status-review)" />
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {summary.needsReview}
              </span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-status-review)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Review
            </span>
          </div>

        </div>
      </div>
    </GlassCard>
  );
};

export default AnalysisSummaryCard;
