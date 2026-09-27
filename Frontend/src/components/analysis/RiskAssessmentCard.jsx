import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { RiskBadge } from '../common/RiskBadge';
import { Shield, AlertCircle } from 'lucide-react';
import { RISK_LEVEL } from '../../utils/constants';

export const RiskAssessmentCard = ({ risk }) => {
  if (!risk) return null;

  // Determine color based on risk score (0-100)
  const getScoreColor = () => {
    if (risk.score >= 70) return 'var(--text-danger)'; // High
    if (risk.score >= 40) return 'var(--color-status-review)'; // Medium
    return 'var(--color-status-compliant)'; // Low
  };

  const scoreColor = getScoreColor();

  return (
    <GlassCard variant="default">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--color-brand-cyan-light)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
              Risk Assessment
            </h3>
          </div>
          <RiskBadge risk={risk.level} />
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          {/* Score display */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            border: `4px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 15px ${scoreColor}40`
          }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {risk.score}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>/ 100</span>
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
              Contributing Factors
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-primary)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {risk.factors.map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div style={{ 
          marginTop: 'auto',
          padding: '0.75rem',
          background: 'rgba(var(--tint-rgb), 0.02)',
          borderTop: '1px solid var(--glass-border-standard)',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '0.1rem' }} />
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            <strong>Disclaimer:</strong> Risk assessment is an analytical aid for inspection prioritization and does not constitute a final legal determination.
          </p>
        </div>

      </div>
    </GlassCard>
  );
};

export default RiskAssessmentCard;
