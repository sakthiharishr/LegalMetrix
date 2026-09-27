import React from 'react';

const niceMax = (value) => {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s * 4 >= value);
  return step * 4;
};

/**
 * Bar chart with a value axis, gridlines and readable date labels.
 * points: [{ label, segments: [{ key, value, color, name }] }] - several segments stack.
 */
export const BarChart = ({ points, height = 180 }) => {
  const totals = points.map((p) => p.segments.reduce((sum, s) => sum + s.value, 0));
  const max = niceMax(Math.max(...totals, 1));
  const ticks = [max, (max * 3) / 4, max / 2, max / 4, 0];
  // Show at most ~8 labels so they never overlap; always label the last bar.
  const every = Math.max(1, Math.ceil(points.length / 8));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '0.6rem', paddingTop: '0.5rem' }}>
      <div style={{ position: 'relative', height, fontSize: '0.68rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
        {ticks.map((t) => (
          <div key={t} style={{ position: 'absolute', right: 0, top: `${(1 - t / max) * 100}%`, transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', height }}>
        {ticks.map((t) => (
          <div key={t} style={{ position: 'absolute', left: 0, right: 0, top: `${(1 - t / max) * 100}%`, borderTop: `1px ${t === 0 ? 'solid' : 'dashed'} var(--glass-border-standard)` }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: points.length > 20 ? '3px' : '8px' }}>
          {points.map((point, i) => (
            <div
              key={`${point.label}-${i}`}
              title={`${point.label}: ${point.segments.map((s) => `${s.name} ${s.value}`).join(', ')}`}
              style={{ flex: 1, height: `${(totals[i] / max) * 100}%`, display: 'flex', flexDirection: 'column-reverse', borderRadius: '3px 3px 0 0', overflow: 'hidden', minWidth: 0 }}
            >
              {point.segments.filter((s) => s.value > 0).map((s) => (
                <div key={s.key} style={{ height: `${(s.value / (totals[i] || 1)) * 100}%`, background: s.color }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div />
      <div style={{ display: 'flex', gap: points.length > 20 ? '3px' : '8px', marginTop: '0.45rem' }}>
        {points.map((point, i) => (
          <div key={`${point.label}-x-${i}`} style={{ flex: 1, minWidth: 0, position: 'relative', height: '1rem' }}>
            {(i % every === 0 || i === points.length - 1) && (i === points.length - 1 || points.length - 1 - i >= every / 2) && (
              <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: '0.68rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {point.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Legend = ({ items }) => (
  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
    {items.map((item) => (
      <span key={item.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
        {item.name}
      </span>
    ))}
  </div>
);

export const formatPointLabel = (point) =>
  point.label || new Date(point.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default BarChart;
