import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { GlassButton } from '../ui/GlassButton';
import { ChevronRight, ShieldCheck, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoricalFindingsTable = ({ findings }) => {
  const navigate = useNavigate();

  if (!findings || findings.length === 0) {
    return (
      <GlassCard variant="default" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No historical findings are recorded.
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border-standard)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--color-text-primary)' }}>
          Historical Findings
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(var(--tint-rgb), 0.02)', borderBottom: '1px solid var(--glass-border-standard)' }}>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Date</th>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Category / Field</th>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Risk Level</th>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Officer Decision</th>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {findings.map(finding => (
              <tr key={finding.id} style={{ borderBottom: '1px solid var(--glass-border-standard)' }}>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {new Date(finding.date).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>{finding.category}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{finding.affectedField}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <RiskBadge risk={finding.riskLevel} />
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {finding.officerDecision ? finding.officerDecision.replace(/_/g, ' ') : 'PENDING'}
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <GlassButton 
                      variant="ghost" 
                      icon={<FileSearch size={14} />} 
                      onClick={() => navigate(`/evidence?scanId=${finding.scanId}&findingId=${finding.id}`)}
                    >
                      Evidence
                    </GlassButton>
                    <GlassButton 
                      variant={finding.officerDecision === 'PENDING_REVIEW' || finding.officerDecision === 'NEEDS_FURTHER_REVIEW' ? 'primary' : 'ghost'}
                      icon={<ShieldCheck size={14} />} 
                      onClick={() => navigate('/verification')}
                    >
                      {finding.officerDecision === 'PENDING_REVIEW' || finding.officerDecision === 'NEEDS_FURTHER_REVIEW' ? 'Verify' : 'View Verification'}
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

export default HistoricalFindingsTable;
