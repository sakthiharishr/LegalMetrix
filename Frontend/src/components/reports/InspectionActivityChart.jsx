import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const InspectionActivityChart = ({ activity }) => {
  if (!activity || activity.length === 0) return null;

  const maxCount = Math.max(...activity.map(a => a.count), 1);

  return (
    <GlassCard variant="default">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.5rem 0', color: 'var(--color-text-primary)' }}>
        Inspection Activity Volume
      </h3>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', width: '100%', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border-standard)' }}>
        {activity.map((point, index) => {
          const heightPercent = (point.count / maxCount) * 100;
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
              <div 
                title={`${point.count} inspections on ${point.date}`}
                style={{ 
                  width: '100%', 
                  maxWidth: '40px',
                  height: `${heightPercent}%`, 
                  background: 'var(--color-brand-cyan-light)', 
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8,
                  transition: 'height 0.5s ease-out'
                }} 
              />
              <div style={{ position: 'absolute', bottom: '-25px', fontSize: '0.65rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default InspectionActivityChart;
