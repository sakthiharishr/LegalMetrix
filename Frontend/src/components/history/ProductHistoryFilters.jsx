import React from 'react';
import { COMPLIANCE_STATUS, RISK_LEVEL } from '../../utils/constants';

export const ProductHistoryFilters = ({ statusFilter, setStatusFilter, riskFilter, setRiskFilter }) => {
  const selectStyle = {
    padding: '0.6rem 1rem',
    background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))',
    border: '1px solid var(--glass-border-standard)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontSize: '0.85rem'
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
        <option value="ALL">All Statuses</option>
        <option value={COMPLIANCE_STATUS.COMPLIANT}>Compliant</option>
        <option value={COMPLIANCE_STATUS.POTENTIAL_VIOLATION}>Potential Violation</option>
        <option value={COMPLIANCE_STATUS.NEEDS_REVIEW}>Needs Review</option>
      </select>
      
      <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} style={selectStyle}>
        <option value="ALL">All Risk Levels</option>
        <option value={RISK_LEVEL.LOW_RISK}>Low Risk</option>
        <option value={RISK_LEVEL.MEDIUM_RISK}>Medium Risk</option>
        <option value={RISK_LEVEL.HIGH_RISK}>High Risk</option>
        <option value={RISK_LEVEL.CRITICAL_RISK}>Critical Risk</option>
      </select>
    </div>
  );
};

export default ProductHistoryFilters;
