import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { RISK_LEVEL } from '../../utils/constants';

export const RiskDistributionAnalytics = ({ distribution }) => {
  if (!distribution || distribution.length === 0) return null;

  const total = distribution.reduce((sum, item) => sum + item.count, 0) || 1;

  const getColor = (level) => {
    switch(level) {
      case RISK_LEVEL.LOW_RISK: return 'var(--color-status-compliant)';
      case RISK_LEVEL.MEDIUM_RISK: return 'var(--color-status-warning)';
      case RISK_LEVEL.HIGH_RISK: return 'var(--color-status-danger)';
      case RISK_LEVEL.CRITICAL_RISK: return '#991b1b'; // darker red
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <GlassCard variant="default">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.5rem 0', color: 'var(--color-text-primary)' }}>
        Risk Distribution
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {distribution.map(item => {
          const percentage = ((item.count / total) * 100).toFixed(1);
          return (
            <div key={item.level}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                <span>{item.level.replace(/_/g, ' ')}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{item.count} ({percentage}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${percentage}%`, 
                  background: getColor(item.level),
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default RiskDistributionAnalytics;
