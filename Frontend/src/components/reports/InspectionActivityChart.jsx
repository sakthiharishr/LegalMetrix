import React from 'react';
import { ReportCard, EmptyPanel } from './ReportCard';
import { BarChart, formatPointLabel } from './BarChart';

const PER = { day: 'per day', week: 'per week', month: 'per month' };

export const InspectionActivityChart = ({ activity, granularity = 'day' }) => {
  const points = activity || [];
  const total = points.reduce((sum, p) => sum + p.count, 0);

  return (
    <ReportCard
      title="Inspection Activity"
      caption={`Scans ${PER[granularity] || 'per day'}`}
      aside={<><div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>inspections</div></>}
    >
      {total === 0 ? <EmptyPanel>No inspections in this period.</EmptyPanel> : (
        <BarChart points={points.map((p) => ({
          label: formatPointLabel(p),
          segments: [{ key: 'count', name: 'Inspections', value: p.count, color: 'var(--color-brand-cyan)' }],
        }))} />
      )}
    </ReportCard>
  );
};

export default InspectionActivityChart;
