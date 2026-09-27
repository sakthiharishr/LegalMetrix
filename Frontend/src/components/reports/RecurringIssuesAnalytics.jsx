import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { AlertTriangle, Repeat, Package } from 'lucide-react';

export const RecurringIssuesAnalytics = ({ issues }) => {
  if (!issues || issues.length === 0) return null;

  return (
    <GlassCard variant="danger" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={18} color="var(--text-danger)" />
        <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: 'var(--text-danger)' }}>
          Macro Recurring Intelligence
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {issues.map(issue => (
          <div key={issue.id} style={{ 
            background: 'rgba(239, 68, 68, 0.05)', 
            borderLeft: '3px solid #f87171',
            padding: '1rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: '0.75rem' }}>
              {issue.pattern}
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Repeat size={14} color="var(--text-danger)" />
                <span style={{ color: 'var(--color-text-primary)' }}>{issue.occurrences}</span> occurrences
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Package size={14} color="var(--color-brand-cyan-light)" />
                <span style={{ color: 'var(--color-text-primary)' }}>{issue.affectedProducts}</span> products
              </div>
              <div>
                Last detected: {new Date(issue.lastDetected).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default RecurringIssuesAnalytics;
