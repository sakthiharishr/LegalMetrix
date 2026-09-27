import React from 'react';

/**
 * Reusable GlassTable Component
 * Displays tabular intelligence data on translucent glass surfaces
 */
export const GlassTable = ({
  columns = [],
  data = [],
  renderRow,
  emptyMessage = 'No records found.',
  className = '',
}) => {
  return (
    <div className={`glass-table-container ${className}`}>
      <table className="glass-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.label}
                style={{
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : renderRow ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {row[col.key] !== undefined ? String(row[col.key]) : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GlassTable;
