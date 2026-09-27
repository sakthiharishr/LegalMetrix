import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCcw, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { RiskBadge } from '../common/RiskBadge';

export const RecurringPatternsCard = ({ data = [] }) => {
  const navigate = useNavigate();

  return (
    <GlassCard
      variant="elevated"
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCcw size={16} color="var(--color-brand-cyan-light)" />
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
                Recurring Compliance Patterns
              </h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
              Repeated non-compliance patterns detected across product scans
            </p>
          </div>
          <span
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--text-danger-soft)',
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Intelligence Alert
          </span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.map((pattern) => (
          <div
            key={pattern.id}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(var(--tint-rgb), 0.03)',
              border: '1px solid var(--glass-border-standard)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <RiskBadge risk={pattern.risk} size="sm" />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: 'rgba(var(--tint-rgb), 0.06)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    {pattern.ruleViolated}
                  </span>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-heading)', fontWeight: '500', margin: '0 0 0.3rem 0', lineHeight: 1.35 }}>
                  {pattern.pattern}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Manufacturer: </span>
                  {pattern.manufacturer}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                  Affected: {pattern.affectedProducts}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  <AlertTriangle size={11} color="var(--text-danger)" />
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-danger-soft)', fontWeight: '700' }}>
                    {pattern.occurrences}×
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>occurrences</span>
                </div>

                <GlassButton
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight size={13} />}
                  iconPosition="right"
                  onClick={() => navigate(pattern.actionRoute)}
                >
                  Inspect
                </GlassButton>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.7rem',
                color: 'var(--color-status-review)',
              }}
            >
              <RefreshCcw size={11} />
              <span>Pattern detected — Requires inspection review by authorized officer</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default RecurringPatternsCard;
