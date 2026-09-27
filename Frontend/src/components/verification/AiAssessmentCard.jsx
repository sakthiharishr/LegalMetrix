import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Bot, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';

export const AiAssessmentCard = ({ finding }) => {
  if (!finding) return null;

  return (
    <GlassCard variant="danger" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={18} color="var(--text-danger)" />
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--text-danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI-Assisted Analysis
          </h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>AI Finding Status</span>
          <div><StatusBadge status={finding.status} /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>AI Confidence</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{finding.confidence}%</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Risk Level</span>
          <div><RiskBadge risk={finding.riskLevel} /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Risk Score</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{finding.riskScore} / 100</div>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Detection Reason
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.5, background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #ef4444' }}>
          {finding.description}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border-standard)' }}>
        <ShieldAlert size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          AI output is advisory and requires authorized officer verification. Do not base final enforcement action solely on this assessment without reviewing evidence.
        </div>
      </div>

    </GlassCard>
  );
};

export default AiAssessmentCard;
