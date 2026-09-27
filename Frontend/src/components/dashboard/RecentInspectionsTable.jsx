import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassTable } from '../ui/GlassTable';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import { ClipboardList } from 'lucide-react';

/**
 * Parses an ISO timestamp string into separate date and time display strings.
 */
const formatTimestamp = (isoStr) => {
  try {
    const d = new Date(isoStr);
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  } catch {
    return { date: '—', time: '' };
  }
};

export const RecentInspectionsTable = ({ data = [] }) => {
  const columns = [
    { key: 'product', label: 'Commodity', width: '24%' },
    { key: 'scanId', label: 'Scan ID', width: '12%' },
    { key: 'dateTime', label: 'Date / Time', width: '14%' },
    { key: 'result', label: 'AI Result', width: '17%' },
    { key: 'risk', label: 'Risk', width: '10%' },
    { key: 'officer', label: 'Officer ID', width: '11%' },
    { key: 'status', label: 'Status', width: '12%' },
  ];

  return (
    <GlassCard
      variant="elevated"
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ClipboardList size={16} color="var(--color-brand-cyan-light)" />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
              Recent Inspections
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.1rem 0 0 0' }}>
              Chronological log of product scans and AI findings
            </p>
          </div>
        </div>
      }
    >
      {data.length === 0 ? (
        <EmptyState title="No Inspections Yet" description="Completed product scans will appear here." />
      ) : (
        <GlassTable
          columns={columns}
          data={data}
          renderRow={(item) => {
            const { date, time } = formatTimestamp(item.timestamp);

            return (
              <tr key={item.id}>
                <td>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                      {item.productName}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-brand-cyan-light)' }}>
                    {item.id}
                  </span>
                </td>
                <td>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{date}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{time}</div>
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.result}
                  </span>
                </td>
                <td>
                  <RiskBadge risk={item.risk} size="sm" />
                </td>
                <td>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text-secondary)',
                      background: 'rgba(var(--tint-rgb), 0.05)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {item.officer}
                  </span>
                </td>
                <td>
                  <StatusBadge status={item.status} size="sm" />
                </td>
              </tr>
            );
          }}
        />
      )}
    </GlassCard>
  );
};

export default RecentInspectionsTable;
