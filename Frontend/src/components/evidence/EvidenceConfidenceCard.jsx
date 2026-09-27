import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Activity, Info } from 'lucide-react';

export const EvidenceConfidenceCard = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <GlassCard variant="default">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Activity size={18} color="var(--color-brand-cyan-light)" />
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--color-text-primary)' }}>
          AI Confidence Metrics
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            OCR Read
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            {metrics.ocr}%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            NLP Extraction
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            {metrics.extraction}%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Finding Score
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-brand-cyan-light)' }}>
            {metrics.finding}%
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', paddingTop: '1rem', borderTop: '1px solid var(--glass-border-standard)' }}>
        <Info size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Confidence reflects system output and does not constitute a legal determination.
        </div>
      </div>
    </GlassCard>
  );
};

export default EvidenceConfidenceCard;
