import React from 'react';

export const ReportFilters = () => {
  // Mock filters for Phase 8. In the future, these will connect to useReports.
  const selectStyle = {
    padding: '0.6rem 1rem',
    background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))',
    border: '1px solid var(--glass-border-standard)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontSize: '0.85rem',
    minWidth: '150px'
  };

  return (
    <div className="no-print" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <select style={selectStyle} disabled>
        <option>All Risk Levels</option>
      </select>
      <select style={selectStyle} disabled>
        <option>All Categories</option>
      </select>
      <select style={selectStyle} disabled>
        <option>All Officer Outcomes</option>
      </select>
    </div>
  );
};

export default ReportFilters;
