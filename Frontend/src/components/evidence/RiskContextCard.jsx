import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Shield, AlertCircle } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const RiskContextCard = ({ risk }) => {
  if (!risk) return null;

  const getScoreColor = () => {
    if (risk.score >= 70) return 'var(--text-danger)'; // High
    if (risk.score >= 40) return 'var(--color-status-review)'; // Medium
    return 'var(--color-status-compliant)'; // Low
  };

  const scoreColor = getScoreColor();

  return (
    <GlassCard variant="default">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Shield size={18} color="var(--color-brand-cyan-light)" />
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
            Risk Context
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            border: `3px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 10px ${scoreColor}40`
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {risk.score}
            </span>
            <span style={{ fontSize: '0.5rem', color: 'var(--color-text-muted)' }}>/ 100</span>
          </div>

          <div style={{ flex: 1 }}>
            <RiskBadge risk={risk.level} />
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', color: 'var(--color-text-primary)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {risk.factors?.map((factor, i) => (
                <li key={i} style={{ color: 'var(--color-text-secondary)' }}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default RiskContextCard;
