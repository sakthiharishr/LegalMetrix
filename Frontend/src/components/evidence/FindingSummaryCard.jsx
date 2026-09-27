import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { AlertCircle, Target } from 'lucide-react';

export const FindingSummaryCard = ({ finding }) => {
  if (!finding) return null;

  return (
    <GlassCard variant="danger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <AlertCircle size={18} color="var(--text-danger)" />
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--text-danger)' }}>
          Why was this flagged?
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Category
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
            {finding.category}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Affected Field
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              {finding.affectedField || 'Not specified'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Extracted Value
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              {finding.extractedValue || 'Not detected'}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Expected / Reference Value
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-brand-cyan-light)' }}>
            {finding.expectedValue || 'Not available'}
          </div>
        </div>

        <div style={{ 
          marginTop: '0.5rem', 
          padding: '1rem', 
          background: 'rgba(239, 68, 68, 0.05)', 
          borderLeft: '3px solid #ef4444', 
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Target size={12} color="#ef4444" />
            Detection Reason
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {finding.description}
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default FindingSummaryCard;
