import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { Clock } from 'lucide-react';

export const InspectionTimeline = ({ inspections }) => {
  if (!inspections || inspections.length === 0) {
    return (
      <GlassCard variant="default" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No inspection history is available.
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Clock size={16} color="var(--color-text-secondary)" />
        <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--color-text-primary)' }}>
          Inspection Timeline
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          background: 'var(--glass-border-standard)',
          zIndex: 0
        }} />

        {inspections.map((insp, index) => (
          <div key={insp.id} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
            
            <div style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: 'var(--color-brand-cyan-light)',
              marginTop: '4px',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, paddingBottom: index === inspections.length - 1 ? 0 : '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{insp.id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(insp.date).toLocaleDateString()} at {new Date(insp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <StatusBadge status={insp.status} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Findings: <span style={{ color: 'var(--color-text-primary)' }}>{insp.findingCount}</span>
                </div>
                {insp.findingCount > 0 && (
                  <RiskBadge risk={insp.riskLevel} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default InspectionTimeline;
