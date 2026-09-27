import React from 'react';
import { ClipboardCheck, Package, AlertTriangle, Gavel } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const Kpi = ({ icon: Icon, label, value, note, color }) => (
  <GlassCard style={{ padding: '1.1rem 1.25rem', minWidth: 0 }}>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center', flexShrink: 0,
      background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
      <Icon size={20} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.15, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>{note}</div>
    </div>
    </div>
  </GlassCard>
);

export const ReportSummaryCards = ({ summary }) => {
  if (!summary) return null;
  const perInspection = summary.totalInspections ? (summary.potentialFindings / summary.totalInspections).toFixed(1) : '0';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      <Kpi icon={ClipboardCheck} label="Inspections" value={summary.totalInspections} color="var(--color-brand-cyan)"
        note="Scans completed in this period" />
      <Kpi icon={Package} label="Products Inspected" value={summary.productsInspected} color="var(--color-brand-blue)"
        note="Distinct products scanned" />
      <Kpi icon={AlertTriangle} label="Open Findings" value={summary.potentialFindings} color="var(--color-status-review)"
        note={`${perInspection} per inspection · awaiting review`} />
      <Kpi icon={Gavel} label="Confirmed Violations" value={summary.confirmedFindings} color="var(--color-status-violation)"
        note={`${summary.officerReviews} officer decision${summary.officerReviews === 1 ? '' : 's'} recorded`} />
    </div>
  );
};

export default ReportSummaryCards;
