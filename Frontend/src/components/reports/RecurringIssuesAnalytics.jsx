import React from 'react';
import { Repeat, Package } from 'lucide-react';
import { ReportCard, EmptyPanel } from './ReportCard';

export const RecurringIssuesAnalytics = ({ issues }) => {
  const items = [...(issues || [])].sort((a, b) => b.occurrences - a.occurrences).slice(0, 6);

  return (
    <ReportCard title="Recurring Issues" caption="Findings seen two or more times in this period">
      {items.length === 0 ? <EmptyPanel>No recurring issues in this period.</EmptyPanel> : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((issue, index) => (
            <div key={issue.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderTop: index ? '1px solid var(--glass-border-standard)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{issue.pattern}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  Last seen {new Date(issue.lastDetected).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                <span title="Occurrences" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Repeat size={13} /> <strong style={{ color: 'var(--color-text-primary)' }}>{issue.occurrences}</strong>
                </span>
                <span title="Products affected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Package size={13} /> <strong style={{ color: 'var(--color-text-primary)' }}>{issue.affectedProducts}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ReportCard>
  );
};

export default RecurringIssuesAnalytics;
