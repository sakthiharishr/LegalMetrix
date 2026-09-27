import React from 'react';
import { ReportCard, EmptyPanel } from './ReportCard';
import { BarChart, Legend, formatPointLabel } from './BarChart';

const SERIES = [
  { key: 'compliant', name: 'Compliant', color: 'var(--color-status-compliant)' },
  { key: 'needsReview', name: 'Needs review', color: 'var(--color-status-review)' },
  { key: 'potentialFindings', name: 'Violations', color: 'var(--color-status-violation)' },
];

export const ComplianceTrendAnalytics = ({ trend }) => {
  const points = trend || [];
  const sums = Object.fromEntries(SERIES.map((s) => [s.key, points.reduce((sum, p) => sum + (p[s.key] || 0), 0)]));
  const total = SERIES.reduce((sum, s) => sum + sums[s.key], 0);
  const rate = total ? Math.round((sums.compliant / total) * 100) : 0;

  return (
    <ReportCard
      title="Compliance Outcomes"
      caption="Result of each completed inspection"
      aside={total ? <><div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-status-compliant)', lineHeight: 1 }}>{rate}%</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>compliant</div></> : null}
    >
      {total === 0 ? <EmptyPanel>No completed inspections in this period.</EmptyPanel> : (
        <>
          <BarChart points={points.map((p) => ({
            label: formatPointLabel(p),
            segments: SERIES.map((s) => ({ ...s, value: p[s.key] || 0 })),
          }))} />
          <Legend items={SERIES.map((s) => ({ ...s, name: `${s.name} (${sums[s.key]})` }))} />
        </>
      )}
    </ReportCard>
  );
};

export default ComplianceTrendAnalytics;
