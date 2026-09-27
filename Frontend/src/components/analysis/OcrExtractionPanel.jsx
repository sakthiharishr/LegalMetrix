import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { FileText, Cpu } from 'lucide-react';

export const OcrExtractionPanel = ({ extractedData }) => {
  if (!extractedData || extractedData.length === 0) return null;

  return (
    <GlassCard 
      variant="default"
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} color="var(--color-brand-cyan-light)" />
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
            Extracted Product Information
          </h3>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {extractedData.map((item, idx) => (
          <div key={idx} style={{ 
            background: 'rgba(var(--tint-rgb), 0.03)', 
            border: '1px solid var(--glass-border-standard)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
              {item.field}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
              {item.value}
            </div>
            
            {item.confidence > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                <Cpu size={12} />
                <span>OCR Confidence: </span>
                <span style={{ 
                  color: item.confidence > 90 ? 'var(--color-status-compliant)' : item.confidence > 75 ? 'var(--color-status-review)' : 'var(--text-danger)',
                  fontWeight: '600'
                }}>
                  {item.confidence}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default OcrExtractionPanel;
