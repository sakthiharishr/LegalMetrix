import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Clock, Cpu, User, CheckCircle2 } from 'lucide-react';

export const VerificationTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  const getIcon = (actor) => {
    switch(actor) {
      case 'SYSTEM': return <Clock size={14} />;
      case 'AI_ANALYSIS': return <Cpu size={14} />;
      case 'OFFICER': return <User size={14} />;
      default: return <CheckCircle2 size={14} />;
    }
  };

  const getColor = (actor) => {
    switch(actor) {
      case 'SYSTEM': return 'var(--color-text-muted)';
      case 'AI_ANALYSIS': return 'var(--text-danger)'; // danger/alert color
      case 'OFFICER': return 'var(--color-brand-cyan-light)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <GlassCard variant="subtle">
      <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1.25rem 0', color: 'var(--color-text-primary)' }}>
        Audit Timeline
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        {/* Vertical connecting line */}
        <div style={{
          position: 'absolute',
          left: '11px',
          top: '20px',
          bottom: '10px',
          width: '2px',
          background: 'var(--glass-border-standard)',
          zIndex: 0
        }} />

        {timeline.map((event, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
            
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'rgba(var(--surface-rgb), 1)',
              border: `1px solid ${getColor(event.actor)}`,
              color: getColor(event.actor),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {getIcon(event.actor)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '0.2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                {event.action}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span style={{ fontSize: '0.65rem', color: getColor(event.actor), textTransform: 'uppercase' }}>
                  {event.actor}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default VerificationTimeline;
