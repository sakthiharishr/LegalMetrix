import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const SEVERITY_CONFIG = {
  HIGH: { bar: 'linear-gradient(90deg, #f43f5e, #ef4444)', labelColor: 'var(--text-danger-soft)' },
  MEDIUM: { bar: 'linear-gradient(90deg, #fb923c, #f59e0b)', labelColor: 'var(--text-warning-soft)' },
  LOW: { bar: 'linear-gradient(90deg, #10b981, #059669)', labelColor: 'var(--text-success-soft)' },
};

export const ViolationCategoriesCard = ({ data = [] }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <GlassCard
      variant="elevated"
      header={
        <div>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
            Potential Violation Categories
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
            AI findings grouped by PCR 2011 rule — pending officer verification
          </p>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {data.map((item, idx) => {
          const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.LOW;
          const barWidth = `${Math.round((item.count / maxCount) * 100)}%`;

          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                    {item.category}
                  </span>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.68rem',
                      color: 'var(--color-text-muted)',
                      background: 'rgba(var(--tint-rgb), 0.06)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    {item.rule}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span className="font-mono" style={{ fontSize: 'var(--font-size-xs)', color: cfg.labelColor, fontWeight: '700' }}>
                    {item.count}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({item.percentage}%)</span>
                </div>
              </div>
              <div
                style={{
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(var(--tint-rgb), 0.07)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: barWidth,
                    background: cfg.bar,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--glass-border-standard)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <AlertTriangle size={12} color="var(--color-status-review)" />
        <span>
          AI findings are presented as <em>Potential Violations</em>. Final legal determination rests with the authorized officer.
        </span>
      </div>
    </GlassCard>
  );
};

export default ViolationCategoriesCard;
