import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { RiskBadge } from '../common/RiskBadge';
import { ShieldAlert, FileSearch, ArrowRight } from 'lucide-react';

export const PotentialFindings = ({ findings, onNavigateToEvidence }) => {
  if (!findings || findings.length === 0) return null;

  return (
    <GlassCard 
      variant="danger"
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--text-danger)" />
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--text-danger)' }}>
            Potential Findings ({findings.length})
          </h3>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {findings.map(finding => (
          <div 
            key={finding.id}
            style={{
              padding: '1.25rem',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    {finding.category}
                  </span>
                  <RiskBadge risk={finding.risk} size="sm" />
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {finding.description}
                </p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Affected Field</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>{finding.field}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                <span>AI Confidence: </span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>{finding.confidence}%</span>
              </div>
              
              {onNavigateToEvidence && (
                <GlassButton 
                  variant="primary" 
                  size="sm" 
                  icon={<FileSearch size={14} />} 
                  onClick={() => onNavigateToEvidence(finding.evidenceId)}
                >
                  View Evidence
                </GlassButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default PotentialFindings;
