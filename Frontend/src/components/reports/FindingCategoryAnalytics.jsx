import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const FindingCategoryAnalytics = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <GlassCard variant="default">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.5rem 0', color: 'var(--color-text-primary)' }}>
        Finding Categories
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {categories.map(cat => (
          <div key={cat.category}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              <span>{cat.category}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{cat.count} ({cat.percentage}%)</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${cat.percentage}%`, 
                background: 'var(--color-brand-cyan-light)',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default FindingCategoryAnalytics;
