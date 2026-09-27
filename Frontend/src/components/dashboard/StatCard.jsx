import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const StatCard = ({
  title,
  value,
  icon,
  subtext,
  variant = 'default', // 'default' | 'compliant' | 'violation' | 'review' | 'risk'
}) => {
  const getSemanticColors = () => {
    switch (variant) {
      case 'compliant':
        return {
          border: 'rgba(16, 185, 129, 0.35)',
          glow: 'rgba(16, 185, 129, 0.15)',
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: 'var(--color-status-compliant)',
          valueColor: 'var(--text-success-soft)',
        };
      case 'violation':
        return {
          border: 'rgba(239, 68, 68, 0.35)',
          glow: 'rgba(239, 68, 68, 0.15)',
          iconBg: 'rgba(239, 68, 68, 0.12)',
          iconColor: 'var(--text-danger)',
          valueColor: 'var(--text-danger-soft)',
        };
      case 'review':
        return {
          border: 'rgba(245, 158, 11, 0.35)',
          glow: 'rgba(245, 158, 11, 0.15)',
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: 'var(--color-status-review)',
          valueColor: 'var(--text-warning-soft)',
        };
      case 'risk':
        return {
          border: 'rgba(244, 63, 94, 0.4)',
          glow: 'rgba(244, 63, 94, 0.18)',
          iconBg: 'rgba(244, 63, 94, 0.14)',
          iconColor: 'var(--text-rose)',
          valueColor: 'var(--text-rose-soft)',
        };
      case 'default':
      default:
        return {
          border: 'rgba(6, 182, 212, 0.3)',
          glow: 'rgba(6, 182, 212, 0.12)',
          iconBg: 'rgba(6, 182, 212, 0.1)',
          iconColor: 'var(--color-brand-cyan-light)',
          valueColor: 'var(--text-heading)',
        };
    }
  };

  const colors = getSemanticColors();

  return (
    <GlassCard
      variant="elevated"
      style={{
        borderColor: colors.border,
        boxShadow: `0 8px 32px -4px rgba(0, 0, 0, 0.55), 0 0 20px ${colors.glow}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </span>
        <div
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            background: colors.iconBg,
            color: colors.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'var(--font-weight-extrabold)',
          color: colors.valueColor,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '0.4rem',
        }}
      >
        {value !== undefined && value !== null ? value.toLocaleString() : '—'}
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <span>{subtext}</span>
      </div>
    </GlassCard>
  );
};

export default StatCard;
