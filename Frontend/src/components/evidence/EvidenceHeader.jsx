import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';

export const EvidenceHeader = ({ scanId, findingId, product, finding }) => {
  return (
    <div style={{
      padding: '1.5rem',
      background: 'rgba(var(--surface-rgb), 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--glass-border-standard)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0' }}>
            Violation Evidence
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span><strong style={{ color: 'var(--color-text-primary)' }}>Scan:</strong> {scanId}</span>
            <span><strong style={{ color: 'var(--color-text-primary)' }}>Finding:</strong> {findingId}</span>
          </div>
          {product?.name && (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Product: {product.name} {product.brand ? `(${product.brand})` : ''}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>AI Status</span>
            <StatusBadge status={finding.status} size="md" />
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--glass-border-standard)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Risk Level</span>
            <RiskBadge risk={finding.riskContribution} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceHeader;
