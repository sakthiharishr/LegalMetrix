import React from 'react';
import { ReportCard, EmptyPanel } from './ReportCard';
import { ProgressRow } from './FindingCategoryAnalytics';

const LEVELS = [
  { level: 'HIGH_RISK', label: 'High risk', color: 'var(--color-risk-high)' },
  { level: 'MEDIUM_RISK', label: 'Medium risk', color: 'var(--color-risk-medium)' },
  { level: 'LOW_RISK', label: 'Low risk', color: 'var(--color-risk-low)' },
];

export const RiskDistributionAnalytics = ({ distribution }) => {
  const counts = Object.fromEntries((distribution || []).map((d) => [d.level, d.count]));
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <ReportCard title="Risk Distribution" caption={`${total} inspection${total === 1 ? '' : 's'} by assessed risk`}>
      {total === 0 ? <EmptyPanel>No inspections in this period.</EmptyPanel> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {LEVELS.map(({ level, label, color }) => {
            const value = counts[level] || 0;
            return <ProgressRow key={level} label={label} value={value} percent={Math.round((value / total) * 100)} color={color} />;
          })}
        </div>
      )}
    </ReportCard>
  );
};

export default RiskDistributionAnalytics;
