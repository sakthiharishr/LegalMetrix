import React from 'react';
import { REVIEW_STATUS } from '../../utils/constants';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const ReviewStatusBanner = ({ status }) => {
  const isCompleted = status === REVIEW_STATUS.COMPLETED;

  if (isCompleted) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'var(--color-status-compliant)'
      }}>
        <CheckCircle size={18} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          <strong>Review Completed:</strong> This finding has already been reviewed by an authorized enforcement officer. The decision is final and cannot be modified.
        </span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '0.75rem 1rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'var(--color-status-review)'
    }}>
      <AlertTriangle size={18} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
        <strong>Pending Officer Review:</strong> This finding was identified by the compliance analysis system and requires review by an authorized enforcement officer. AI output is advisory and does not constitute a final legal violation.
      </span>
    </div>
  );
};

export default ReviewStatusBanner;
