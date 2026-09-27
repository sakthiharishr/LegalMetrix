import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { OFFICER_DECISION } from '../../utils/constants';
import { Check, X, HelpCircle, UserCheck } from 'lucide-react';

export const OfficerDecisionPanel = ({ 
  decision, 
  setDecision, 
  remarks, 
  setRemarks, 
  isSubmitting, 
  onSubmit, 
  isReadOnly,
  reviewedBy,
  reviewedAt,
  allEvidenceReviewed,
  setAllEvidenceReviewed,
  evidenceImageCount = 0
}) => {
  
  const options = [
    {
      id: OFFICER_DECISION.CONFIRM_FINDING,
      label: 'Confirm Violation',
      description: 'The officer confirms that the product violation(s) are substantiated by the available evidence.',
      icon: <Check size={18} />,
      color: 'var(--color-status-danger)' // Confirming a violation is typically red/danger context
    },
    {
      id: OFFICER_DECISION.INVALIDATE_FINDING,
      label: 'Mark Compliant',
      description: 'The officer determines that the reported product violation(s) are not substantiated by the available evidence.',
      icon: <X size={18} />,
      color: 'var(--color-status-compliant)' // Invalidating a violation means they are compliant
    },
    {
      id: OFFICER_DECISION.NEEDS_FURTHER_REVIEW,
      label: 'Needs Further Review',
      description: 'The officer requires additional information or examination before making a final determination.',
      icon: <HelpCircle size={18} />,
      color: 'var(--color-status-warning)'
    }
  ];

  const maxChars = 1000;
  
  if (isReadOnly) {
    const selectedOption = options.find(o => o.id === decision);
    return (
      <GlassCard variant="elevated" style={{ border: `1px solid ${selectedOption?.color || 'var(--glass-border-standard)'}` }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <UserCheck size={18} color="var(--color-brand-cyan-light)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
            Officer Decision Submitted
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Decision</div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              borderRadius: 'var(--radius-md)',
              background: 'rgba(var(--tint-rgb), 0.05)',
              border: `1px solid ${selectedOption?.color || 'transparent'}`,
              color: selectedOption?.color || 'var(--color-text-primary)',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {selectedOption?.icon}
              {selectedOption?.label || decision}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Officer Remarks</div>
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border-standard)',
              fontSize: '0.85rem',
              color: 'var(--color-text-primary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {remarks}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border-standard)' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Reviewed By</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{reviewedBy || 'Authorized Officer'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date/Time</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {reviewedAt ? new Date(reviewedAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated">
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <UserCheck size={18} color="var(--color-brand-cyan-light)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
          Officer Decision
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {options.map((opt) => {
          const isSelected = decision === opt.id;
          return (
            <div 
              key={opt.id}
              onClick={() => setDecision(opt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDecision(opt.id); } }}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(var(--tint-rgb), 0.08)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${isSelected ? opt.color : 'var(--glass-border-standard)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                border: `2px solid ${isSelected ? opt.color : 'var(--color-text-muted)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: opt.color }} />}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSelected ? opt.color : 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {opt.icon}
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {opt.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
            Officer Remarks <span style={{ color: 'var(--text-danger)' }}>*</span>
          </label>
          <span style={{ fontSize: '0.7rem', color: remarks.length > maxChars ? 'var(--text-danger)' : 'var(--color-text-muted)' }}>
            {remarks.length} / {maxChars}
          </span>
        </div>
        <textarea 
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter observations, justification, or additional review notes..."
          disabled={isSubmitting}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '1rem',
            background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))',
            border: '1px solid var(--glass-border-standard)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: '0.85rem',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem', padding: '0.8rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.22)' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.78rem', lineHeight: 1.45 }}>
          <input
            type="checkbox"
            checked={!!allEvidenceReviewed}
            onChange={(e) => setAllEvidenceReviewed?.(e.target.checked)}
            disabled={isSubmitting}
            style={{ marginTop: '0.2rem' }}
          />
          <span>I have reviewed all {evidenceImageCount || 'uploaded'} package image{evidenceImageCount === 1 ? '' : 's'} and the evidence relevant to this product before making the decision.</span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <GlassButton 
          variant="primary" 
          onClick={onSubmit}
          disabled={isSubmitting || !decision || !remarks.trim() || remarks.length > maxChars || !allEvidenceReviewed}
          icon={isSubmitting ? undefined : <Check size={16} />}
        >
          {isSubmitting ? 'Submitting Review...' : 'Review & Submit'}
        </GlassButton>
      </div>

    </GlassCard>
  );
};

export default OfficerDecisionPanel;
