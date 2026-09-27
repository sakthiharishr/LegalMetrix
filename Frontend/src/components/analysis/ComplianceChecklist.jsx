import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { GlassButton } from '../ui/GlassButton';
import { ChevronDown, ChevronUp, Scale, Info, FileSearch } from 'lucide-react';

export const ComplianceChecklist = ({ checks, onNavigateToEvidence }) => {
  const [expandedRows, setExpandedRows] = useState({});

  if (!checks || checks.length === 0) return null;

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <GlassCard 
      variant="elevated"
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={18} color="var(--color-brand-cyan-light)" />
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
            Compliance Checks
          </h3>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {checks.map(check => {
          const isExpanded = !!expandedRows[check.id];
          
          return (
            <div 
              key={check.id}
              style={{
                background: 'rgba(var(--tint-rgb), 0.02)',
                border: '1px solid var(--glass-border-standard)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}
            >
              {/* Header Row (Always visible) */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid var(--glass-border-standard)' : 'none'
                }}
                onClick={() => toggleRow(check.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '130px', flexShrink: 0 }}>
                    <StatusBadge status={check.status} size="sm" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                      {check.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Extracted:</span> {check.extracted}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  {check.confidence > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {check.confidence}% Conf.
                    </div>
                  )}
                  <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ padding: '1.25rem', background: 'rgba(var(--shade-rgb), calc(0.2 * var(--shade-k)))', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expected Requirement</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{check.expected}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>AI Explanation</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
                        <Info size={14} style={{ marginTop: '0.1rem', flexShrink: 0, color: 'var(--color-brand-cyan-light)' }} />
                        <span>{check.explanation}</span>
                      </div>
                    </div>
                  </div>

                  {check.ruleReference && (
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(6, 182, 212, 0.05)', 
                      border: '1px solid rgba(6, 182, 212, 0.2)', 
                      borderRadius: 'var(--radius-sm)' 
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-brand-cyan-light)', marginBottom: '0.25rem' }}>
                        Legal Reference: {check.ruleReference.ruleName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {check.ruleReference.description}
                      </div>
                    </div>
                  )}

                  {check.evidenceAvailable && onNavigateToEvidence && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <GlassButton variant="secondary" size="sm" icon={<FileSearch size={14} />} onClick={onNavigateToEvidence}>
                        View Evidence
                      </GlassButton>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default ComplianceChecklist;
