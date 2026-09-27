import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { COMPLIANCE_STATUS } from '../../utils/constants';

/**
 * Reusable StatusBadge Component
 * Displays Legal Metrology compliance statuses with appropriate icons and semantic colors.
 * 
 * IMPORTANT: Enforces the wording 'Potential Violation' rather than final legal determination.
 */
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case COMPLIANCE_STATUS.COMPLIANT:
        return {
          label: 'Compliant',
          icon: <CheckCircle2 size={13} />,
          bg: 'var(--color-status-compliant-bg)',
          color: 'var(--color-status-compliant)',
          border: 'var(--color-status-compliant-border)',
        };

      case COMPLIANCE_STATUS.POTENTIAL_VIOLATION:
        return {
          label: 'Potential Violation',
          icon: <AlertTriangle size={13} />,
          bg: 'var(--color-status-violation-bg)',
          color: 'var(--text-danger)',
          border: 'var(--color-status-violation-border)',
        };

      case COMPLIANCE_STATUS.NEEDS_REVIEW:
        return {
          label: 'Needs Review',
          icon: <AlertCircle size={13} />,
          bg: 'var(--color-status-review-bg)',
          color: 'var(--color-status-review)',
          border: 'var(--color-status-review-border)',
        };

      case COMPLIANCE_STATUS.CONFIRMED:
        return {
          label: 'Confirmed Violation',
          icon: <ShieldAlert size={13} />,
          bg: 'var(--color-status-confirmed-bg)',
          color: '#c084fc',
          border: 'var(--color-status-confirmed-border)',
        };

      case COMPLIANCE_STATUS.INVALIDATED:
        return {
          label: 'Invalidated',
          icon: <XCircle size={13} />,
          bg: 'var(--color-status-invalidated-bg)',
          color: 'var(--color-status-invalidated)',
          border: 'var(--color-status-invalidated-border)',
        };

      case COMPLIANCE_STATUS.PENDING:
      default:
        return {
          label: 'Pending Inspection',
          icon: <Clock size={13} />,
          bg: 'var(--color-status-pending-bg)',
          color: 'var(--color-text-secondary)',
          border: 'var(--color-status-pending-border)',
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'sm';

  return (
    <span
      className={`glass-badge ${className}`}
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        fontSize: isSmall ? '0.7rem' : 'var(--font-size-xs)',
        gap: '0.35rem',
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
