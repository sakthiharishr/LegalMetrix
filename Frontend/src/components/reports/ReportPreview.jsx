import React from 'react';
import { GlassCard } from '../ui/GlassCard';

const OUTCOME_LABELS = {
  CONFIRM_FINDING: 'Violation confirmed',
  INVALIDATE_FINDING: 'Finding invalidated',
  NEEDS_FURTHER_REVIEW: 'Further review requested',
  PENDING_REVIEW: 'Pending review',
};

export const ReportPreview = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <GlassCard variant="default" style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>
      {/* Report Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--color-text-secondary)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
          LEGAL METRIX
        </h1>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Enforcement Intelligence Report</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Reporting Period: {new Date(analytics.reportingPeriod.start).toLocaleDateString()} to {new Date(analytics.reportingPeriod.end).toLocaleDateString()}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Generated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* 1. Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          1. Inspection Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
          <div><strong>Total Inspections:</strong> {analytics.summary.totalInspections}</div>
          <div><strong>Products Inspected:</strong> {analytics.summary.productsInspected}</div>
          <div><strong>Potential Findings:</strong> {analytics.summary.potentialFindings}</div>
          <div><strong>Officer Reviews Completed:</strong> {analytics.summary.officerReviews}</div>
        </div>
      </div>

      {/* 2. Finding Categories */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          2. Finding Categories Distribution
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-standard)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Category</th>
              <th style={{ padding: '0.5rem' }}>Count</th>
              <th style={{ padding: '0.5rem' }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {analytics.findingCategories.map(cat => (
              <tr key={cat.category} style={{ borderBottom: '1px dashed rgba(var(--tint-rgb), 0.1)' }}>
                <td style={{ padding: '0.5rem' }}>{cat.category}</td>
                <td style={{ padding: '0.5rem' }}>{cat.count}</td>
                <td style={{ padding: '0.5rem' }}>{cat.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Officer Review Outcomes */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          3. Officer Review Outcomes
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-standard)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Outcome</th>
              <th style={{ padding: '0.5rem' }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {analytics.officerReviewOutcomes.map(outcome => (
              <tr key={outcome.outcome} style={{ borderBottom: '1px dashed rgba(var(--tint-rgb), 0.1)' }}>
                <td style={{ padding: '0.5rem' }}>{OUTCOME_LABELS[outcome.outcome] || outcome.outcome.replace(/_/g, ' ').toLowerCase()}</td>
                <td style={{ padding: '0.5rem' }}>{outcome.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Recurring Issues */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          4. Top Recurring Issues
        </h3>
        {analytics.recurringIssues.map(issue => (
          <div key={issue.id} style={{ marginBottom: '1rem', padding: '0.5rem', borderLeft: '3px solid var(--color-text-muted)', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold' }}>{issue.pattern}</div>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              {issue.occurrences} occurrences across {issue.affectedProducts} product{issue.affectedProducts === 1 ? '' : 's'}.
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        *** End of Report ***
      </div>
    </GlassCard>
  );
};

export default ReportPreview;
