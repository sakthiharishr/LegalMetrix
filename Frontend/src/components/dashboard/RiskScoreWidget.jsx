import React from 'react';
import { Info } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { RiskBadge } from '../common/RiskBadge';

export const RiskScoreWidget = ({ data }) => {
  if (!data) return null;

  const { score, maxScore, level, breakdown, advisoryNote, inspectedProduct } = data;
  const percentage = Math.min(100, Math.round((score / maxScore) * 100));

  // Score arc fill: determine color
  const getScoreColor = (s) => {
    if (s >= 70) return '#f43f5e';
    if (s >= 40) return 'var(--color-risk-medium)';
    return 'var(--color-status-compliant)';
  };

  const scoreColor = getScoreColor(score);

  // SVG gauge
  const cx = 80, cy = 80, r = 62;
  const circumference = 2 * Math.PI * r;
  // Show 75% of the circle (270°) for gauge style
  const gaugeArc = circumference * 0.75;
  const filledArc = gaugeArc * (percentage / 100);

  return (
    <GlassCard
      variant="elevated"
      header={
        <div>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
            AI Risk Assessment
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
            Automated rule-engine score — not a legal determination
          </p>
        </div>
      }
    >
      {/* Gauge + Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="160" height="100" viewBox="0 0 160 100">
            {/* Background arc */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(var(--tint-rgb), 0.07)"
              strokeWidth="12"
              strokeDasharray={`${gaugeArc} ${circumference - gaugeArc}`}
              strokeDashoffset={circumference * 0.125}
              strokeLinecap="round"
              transform="rotate(-225, 80, 80)"
            />
            {/* Filled arc */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={scoreColor}
              strokeWidth="12"
              strokeDasharray={`${filledArc} ${circumference - filledArc}`}
              strokeDashoffset={circumference * 0.125}
              strokeLinecap="round"
              transform="rotate(-225, 80, 80)"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}88)` }}
            />
            {/* Score text */}
            <text x={cx} y={cy - 4} textAnchor="middle" style={{ fill: 'var(--text-heading)' }} fontSize="28" fontWeight="800" fontFamily="var(--font-family-mono)">
              {score}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(var(--tint-rgb), 0.45)" fontSize="11" fontFamily="var(--font-family-sans)">
              / {maxScore}
            </text>
          </svg>
          <div style={{ textAlign: 'center', marginTop: '-8px' }}>
            <RiskBadge risk={level} size="sm" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Sample Assessment</div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-heading)', lineHeight: 1.3 }}>{inspectedProduct}</div>
        </div>
      </div>

      {/* Breakdown Factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
        {breakdown?.map((factor, i) => {
          const factorPct = Math.round((factor.score / factor.max) * 100);
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{factor.factor}</span>
                <span className="font-mono" style={{ color: 'var(--text-heading)', fontWeight: '600' }}>
                  {factor.score}/{factor.max}
                </span>
              </div>
              <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: 'rgba(var(--tint-rgb), 0.07)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${factorPct}%`,
                    background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`,
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.4rem',
          padding: '0.65rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(6, 182, 212, 0.06)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.4,
        }}
      >
        <Info size={13} color="var(--color-brand-cyan-light)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <span>{advisoryNote}</span>
      </div>
    </GlassCard>
  );
};

export default RiskScoreWidget;
