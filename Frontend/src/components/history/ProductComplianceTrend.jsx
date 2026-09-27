import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { COMPLIANCE_STATUS } from '../../utils/constants';

export const ProductComplianceTrend = ({ trend }) => {
  if (!trend || trend.length === 0) return null;

  // Ensure it's chronological for left-to-right rendering
  const sortedTrend = [...trend].sort((a, b) => new Date(a.date) - new Date(b.date));

  const getColor = (status) => {
    switch(status) {
      case COMPLIANCE_STATUS.COMPLIANT: return 'var(--color-status-compliant)';
      case COMPLIANCE_STATUS.POTENTIAL_VIOLATION: return 'var(--color-status-danger)';
      case COMPLIANCE_STATUS.NEEDS_REVIEW: return 'var(--color-status-warning)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <GlassCard variant="subtle" style={{ overflow: 'hidden' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.5rem 0', color: 'var(--color-text-primary)' }}>
        Compliance Trend
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', paddingBottom: '1rem' }}>
        {/* Track Line */}
        <div style={{ position: 'absolute', top: '8px', left: '20px', right: '20px', height: '2px', background: 'rgba(var(--tint-rgb), 0.1)', zIndex: 0 }}></div>
        
        {sortedTrend.map((point, i) => (
          <div key={point.inspectionId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div 
              title={point.status}
              style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                background: 'rgba(var(--surface-rgb), 1)', 
                border: `3px solid ${getColor(point.status)}`,
                marginBottom: '0.75rem',
                boxShadow: `0 0 10px ${getColor(point.status)}40`
              }} 
            />
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', textAlign: 'center', textTransform: 'uppercase', marginTop: '0.15rem' }}>
              {point.inspectionId}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ProductComplianceTrend;
