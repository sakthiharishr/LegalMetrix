import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BookOpen, Info } from 'lucide-react';

export const RuleReferenceCard = ({ ruleReference }) => {
  if (!ruleReference) return null;

  return (
    <GlassCard variant="subtle">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <BookOpen size={18} color="var(--color-brand-cyan-light)" />
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--color-text-primary)' }}>
          Legal Rule Reference
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-brand-cyan-light)', marginBottom: '0.25rem' }}>
            {ruleReference.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            Source: {ruleReference.source}
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          background: 'rgba(var(--tint-rgb), 0.03)', 
          border: '1px solid var(--glass-border-standard)', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--color-text-primary)',
          lineHeight: 1.6
        }}>
          "{ruleReference.referenceText}"
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
          <Info size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            <strong>Disclaimer:</strong> Rule references shown here are provided by the compliance analysis system and are presented for officer review. Final legal determination remains with the authorized enforcement officer.
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default RuleReferenceCard;
