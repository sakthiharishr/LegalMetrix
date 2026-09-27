import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GitBranch } from 'lucide-react';

export const EvidenceTraceability = ({ traceData }) => {
  if (!traceData) return null;

  return (
    <GlassCard variant="subtle" style={{ marginTop: '1.5rem', opacity: 0.9 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <GitBranch size={16} color="var(--color-text-secondary)" />
        <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--color-text-primary)' }}>
          Evidence Traceability
        </h3>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '1rem',
        fontSize: '0.75rem' 
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Scan Session</span>
          <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{traceData.scanId || 'Not available'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Finding Reference</span>
          <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{traceData.findingId || 'Not available'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Evidence Package</span>
          <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{traceData.evidenceId || 'Not available'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Source Image</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{traceData.sourceImage || 'Not available'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Analysis Engine</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{traceData.analysisVersion || 'Not available'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Rule Engine</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{traceData.ruleEngineVersion || 'Not available'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Timestamp</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {traceData.analysisTimestamp ? new Date(traceData.analysisTimestamp).toLocaleString() : 'Not available'}
          </span>
        </div>

      </div>
    </GlassCard>
  );
};

export default EvidenceTraceability;
