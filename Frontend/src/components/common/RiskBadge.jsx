import React from 'react';
import { ShieldAlert, ShieldAlert as ShieldWarning, ShieldCheck } from 'lucide-react';
import { RISK_LEVEL } from '../../utils/constants';

/**
 * Reusable RiskBadge Component
 * Indicates inspection severity and enforcement urgency
 */
export const RiskBadge = ({ risk, size = 'md', className = '' }) => {
  const getRiskConfig = () => {
    switch (risk) {
      case RISK_LEVEL.HIGH_RISK:
        return {
          label: 'High Risk',
          icon: <ShieldAlert size={13} />,
          bg: 'var(--color-risk-high-bg)',
          color: 'var(--text-rose)',
          border: 'var(--color-risk-high-border)',
        };
      case RISK_LEVEL.MEDIUM_RISK:
        return {
          label: 'Medium Risk',
          icon: <ShieldWarning size={13} />,
          bg: 'var(--color-risk-medium-bg)',
          color: 'var(--color-risk-medium)',
          border: 'var(--color-risk-medium-border)',
        };
      case RISK_LEVEL.LOW_RISK:
      default:
        return {
          label: 'Low Risk',
          icon: <ShieldCheck size={13} />,
          bg: 'var(--color-risk-low-bg)',
          color: '#34d399',
          border: 'var(--color-risk-low-border)',
        };
    }
  };

  const config = getRiskConfig();
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

export default RiskBadge;
