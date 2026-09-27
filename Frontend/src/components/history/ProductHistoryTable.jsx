import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import historyService from '../../services/historyService';
import { useNavigate } from 'react-router-dom';

export const ProductHistoryTable = ({ products }) => {
  const navigate = useNavigate();

  const reviewProduct = async (productId) => {
    try {
      const findings = await historyService.getHistoricalFindings(productId);
      const pending = findings.find((f) =>
        f.officerDecision === 'PENDING_REVIEW' || f.officerDecision === 'NEEDS_FURTHER_REVIEW'
      );
      if (pending?.scanId && pending?.id) {
        navigate(`/verification?scanId=${pending.scanId}&findingId=${pending.id}`);
        return;
      }
      navigate(`/history?productId=${productId}`);
    } catch (error) {
      navigate(`/history?productId=${productId}`);
    }
  };

  if (!products || products.length === 0) {
    return (
      <GlassCard style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No products matched your search.
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(var(--tint-rgb), 0.05)', borderBottom: '1px solid var(--glass-border-standard)' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Product</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Risk Level</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Last Inspected</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Inspections</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.productId} style={{ borderBottom: '1px solid var(--glass-border-standard)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{product.brand} | {product.productId}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <StatusBadge status={product.currentStatus} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <RiskBadge risk={product.riskLevel} />
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {new Date(product.lastInspection).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {product.inspectionCount}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.openFindings > 0 && (
                      <GlassButton
                        variant="primary"
                        icon={<ShieldCheck size={15} />}
                        onClick={() => reviewProduct(product.productId)}
                      >
                        Review Findings
                      </GlassButton>
                    )}
                    <GlassButton 
                      variant="ghost" 
                      icon={<ChevronRight size={16} />} 
                      onClick={() => navigate(`/history?productId=${product.productId}`)}
                    >
                      View History
                    </GlassButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default ProductHistoryTable;
