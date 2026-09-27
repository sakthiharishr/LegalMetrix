import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassTable } from '../ui/GlassTable';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import { ShieldAlert } from 'lucide-react';

export const HighPriorityTable = ({ data = [] }) => {
  const navigate = useNavigate();

  const columns = [
    { key: 'product', label: 'Commodity', width: '28%' },
    { key: 'id', label: 'Product ID', width: '12%' },
    { key: 'category', label: 'Category', width: '13%' },
    { key: 'risk', label: 'Risk', width: '11%' },
    { key: 'finding', label: 'AI Finding', width: '22%' },
    { key: 'lastScan', label: 'Last Scan', width: '9%' },
    { key: 'status', label: 'Status', width: '8%' },
    { key: 'action', label: '', width: '7%', align: 'right' },
  ];

  return (
    <GlassCard
      variant="elevated"
      style={{ padding: '0' }}
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(244, 63, 94, 0.14)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={16} color="var(--text-rose)" />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
                High-Priority Inspections
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.1rem 0 0 0' }}>
                Flagged commodities requiring urgent officer verification
              </p>
            </div>
          </div>
          <GlassButton variant="ghost" size="sm" onClick={() => navigate('/verification')}>
            View All Pending
          </GlassButton>
        </div>
      }
    >
      {data.length === 0 ? (
        <EmptyState
          title="No High-Priority Inspections"
          description="No inspections are currently flagged as high-priority. Compliant products will not appear here."
        />
      ) : (
        <GlassTable
          columns={columns}
          data={data}
          renderRow={(item) => (
            <tr key={item.id} style={{ borderLeft: item.risk === 'HIGH_RISK' ? '3px solid rgba(244, 63, 94, 0.6)' : 'none' }}>
              <td>
                <div style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-xs)' }}>
                  {item.productName}
                </div>
              </td>
              <td>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-brand-cyan-light)' }}>
                  {item.id}
                </span>
              </td>
              <td>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{item.category}</span>
              </td>
              <td>
                <RiskBadge risk={item.risk} size="sm" />
              </td>
              <td>
                <span
                  style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.35, display: 'block' }}
                  title={item.finding}
                >
                  {item.finding.length > 55 ? `${item.finding.slice(0, 55)}…` : item.finding}
                </span>
              </td>
              <td>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {item.lastScan}
                </span>
              </td>
              <td>
                <StatusBadge status={item.status} size="sm" />
              </td>
              <td style={{ textAlign: 'right' }}>
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => navigate('/verification', { state: { scanId: item.id, findingId: item.findingId || undefined } })}
                >
                  Review
                </GlassButton>
              </td>
            </tr>
          )}
        />
      )}
    </GlassCard>
  );
};

export default HighPriorityTable;
