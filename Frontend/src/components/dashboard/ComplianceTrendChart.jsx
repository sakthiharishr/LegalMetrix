import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

export const ComplianceTrendChart = ({ data = [], activePeriod = '7d', onPeriodChange }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  // SVG dimensions
  const width = 680;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate max scale value
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.compliant || 0, d.potentialViolation || 0, d.needsReview || 0]),
    100
  );
  const yMax = Math.ceil(maxVal * 1.15 / 20) * 20;

  // Coordinate mapper helpers
  const getX = (index) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return padding.top + chartHeight - (val / yMax) * chartHeight;
  };

  // Generate SVG path string for a key
  const generatePath = (key) => {
    if (data.length === 0) return '';
    return data.reduce((path, point, i) => {
      const x = getX(i);
      const y = getY(point[key] || 0);
      if (i === 0) return `M ${x},${y}`;
      // Smooth cubic bezier
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1][key] || 0);
      const cpX1 = prevX + (x - prevX) / 3;
      const cpX2 = x - (x - prevX) / 3;
      return `${path} C ${cpX1},${prevY} ${cpX2},${y} ${x},${y}`;
    }, '');
  };

  // Generate closed area path for subtle gradients
  const generateArea = (key) => {
    if (data.length === 0) return '';
    const linePath = generatePath(key);
    const startX = getX(0);
    const endX = getX(data.length - 1);
    const bottomY = padding.top + chartHeight;
    return `${linePath} L ${endX},${bottomY} L ${startX},${bottomY} Z`;
  };

  const activeDataPoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <GlassCard
      variant="elevated"
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
              Compliance Inspection Trends
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
              Statutory PCR 2011 inspection outcomes over time
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(var(--surface-rgb), 0.6)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border-standard)',
            }}
          >
            {periods.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => onPeriodChange && onPeriodChange(p.key)}
                style={{
                  background: activePeriod === p.key ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: activePeriod === p.key ? 'var(--color-brand-cyan-light)' : 'var(--color-text-muted)',
                  border: activePeriod === p.key ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: activePeriod === p.key ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* Legend & Summary Info */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-status-compliant)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Compliant</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--text-danger)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Potential Violation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-status-review)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Needs Review</span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '480px', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="compliantGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-status-compliant)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-status-compliant)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="violationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-status-review)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-status-review)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + chartHeight * ratio;
            const labelVal = Math.round(yMax * (1 - ratio));
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(var(--tint-rgb), 0.07)"
                  strokeDasharray={i === 4 ? 'none' : '3 3'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--color-text-muted)"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="var(--font-family-mono)"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={height - 12}
                fill="var(--color-text-muted)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="var(--font-family-sans)"
              >
                {d.label}
              </text>
            );
          })}

          {/* Closed Gradients */}
          <path d={generateArea('compliant')} fill="url(#compliantGrad)" />
          <path d={generateArea('potentialViolation')} fill="url(#violationGrad)" />
          <path d={generateArea('needsReview')} fill="url(#reviewGrad)" />

          {/* Lines */}
          <path d={generatePath('compliant')} fill="none" stroke="var(--color-status-compliant)" strokeWidth="2.5" />
          <path d={generatePath('potentialViolation')} fill="none" stroke="#ef4444" strokeWidth="2.5" />
          <path d={generatePath('needsReview')} fill="none" stroke="var(--color-status-review)" strokeWidth="2" strokeDasharray="4 3" />

          {/* Interactive Data Points & Hover Targets */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <g key={i}>
                {/* Invisible wide column for hover target */}
                <rect
                  x={x - (chartWidth / data.length / 2)}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />

                {/* Subtle vertical indicator on hover */}
                {hoverIndex === i && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Circles for values */}
                <circle cx={x} cy={getY(d.compliant)} r={hoverIndex === i ? 5 : 3.5} fill="var(--color-status-compliant)" stroke="rgb(var(--surface-rgb))" strokeWidth="2" />
                <circle cx={x} cy={getY(d.potentialViolation)} r={hoverIndex === i ? 5 : 3.5} fill="#ef4444" stroke="rgb(var(--surface-rgb))" strokeWidth="2" />
                <circle cx={x} cy={getY(d.needsReview)} r={hoverIndex === i ? 4 : 3} fill="var(--color-status-review)" stroke="rgb(var(--surface-rgb))" strokeWidth="2" />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {activeDataPoint && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: `${Math.min(Math.max((getX(hoverIndex) / width) * 100, 15), 80)}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(var(--surface-rgb), 0.94)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.85rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '0.75rem',
              minWidth: '150px',
            }}
          >
            <div style={{ fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.35rem', borderBottom: '1px solid rgba(var(--tint-rgb), 0.08)', paddingBottom: '0.2rem' }}>
              {activeDataPoint.label}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-success-soft)' }}>
              <span>Compliant:</span>
              <strong className="font-mono">{activeDataPoint.compliant}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-danger-soft)' }}>
              <span>Potential Violation:</span>
              <strong className="font-mono">{activeDataPoint.potentialViolation}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-warning-soft)' }}>
              <span>Needs Review:</span>
              <strong className="font-mono">{activeDataPoint.needsReview}</strong>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ComplianceTrendChart;
