import React from 'react';
import { GlassCard } from '../ui/GlassCard';

/** Card shell shared by every analytics panel: title, optional caption, optional right-side figure. */
export const ReportCard = ({ title, caption, aside, children, style }) => (
  <GlassCard style={{ padding: '1.25rem 1.5rem', minWidth: 0, ...style }}>
    {/* GlassCard wraps children in its own container, so the layout lives on this inner element. */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{title}</h3>
        {caption && <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{caption}</div>}
      </div>
      {aside && <div style={{ flexShrink: 0, textAlign: 'right' }}>{aside}</div>}
    </div>
    {children}
    </div>
  </GlassCard>
);

/** Centered note for panels with nothing to show in the selected period. */
export const EmptyPanel = ({ children }) => (
  <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', border: '1px dashed var(--glass-border-standard)', borderRadius: 'var(--radius-md)' }}>
    {children}
  </div>
);

export default ReportCard;
