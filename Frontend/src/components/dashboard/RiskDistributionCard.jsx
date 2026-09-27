import React from 'react';
import { ShieldAlert, Shield, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { RiskBadge } from '../common/RiskBadge';
import { RISK_LEVEL } from '../../utils/constants';

export const RiskDistributionCard = ({ data }) => {
  const high = data?.highRisk || { count: 0, percentage: 0 };
  const medium = data?.mediumRisk || { count: 0, percentage: 0 };
  const low = data?.lowRisk || { count: 0, percentage: 0 };
  const total = data?.total || high.count + medium.count + low.count || 1;

  return (
    <GlassCard
      variant="elevated"
      header={
        <div>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-heading)', margin: 0 }}>
            Risk Distribution
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
            Current inspection priority breakdown
          </p>
        </div>
      }
    >
      {/* Multi-Segmented Progress Bar */}
      <div
        style={{
          height: '12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(var(--tint-rgb), 0.06)',
          display: 'flex',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          padding: '2px',
        }}
      >
        <div
          title={`High Risk: ${high.count} (${high.percentage}%)`}
          style={{
            width: `${high.percentage}%`,
            background: 'linear-gradient(90deg, #f43f5e, #ef4444)',
            borderRadius: 'var(--radius-full) 0 0 var(--radius-full)',
            transition: 'width 0.5s ease',
          }}
        />
        <div
          title={`Medium Risk: ${medium.count} (${medium.percentage}%)`}
          style={{
            width: `${medium.percentage}%`,
            background: 'linear-gradient(90deg, #fb923c, #f59e0b)',
            transition: 'width 0.5s ease',
          }}
        />
        <div
          title={`Low Risk: ${low.count} (${low.percentage}%)`}
          style={{
            width: `${low.percentage}%`,
            background: 'linear-gradient(90deg, #10b981, #059669)',
            borderRadius: '0 var(--radius-full) var(--radius-full) 0',
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Tier Details List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* High Risk */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RiskBadge risk={RISK_LEVEL.HIGH_RISK} size="sm" />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Urgent Verification Required
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontWeight: '700', color: 'var(--text-rose-soft)', fontSize: 'var(--font-size-sm)' }}>
              {high.count}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.35rem' }}>
              ({high.percentage}%)
            </span>
          </div>
        </div>

        {/* Medium Risk */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(251, 146, 60, 0.08)',
            border: '1px solid rgba(251, 146, 60, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RiskBadge risk={RISK_LEVEL.MEDIUM_RISK} size="sm" />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Secondary Check Warranted
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontWeight: '700', color: 'var(--text-warning-soft)', fontSize: 'var(--font-size-sm)' }}>
              {medium.count}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.35rem' }}>
              ({medium.percentage}%)
            </span>
          </div>
        </div>

        {/* Low Risk */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RiskBadge risk={RISK_LEVEL.LOW_RISK} size="sm" />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Compliant / Standard Baseline
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontWeight: '700', color: 'var(--text-success-soft)', fontSize: 'var(--font-size-sm)' }}>
              {low.count}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.35rem' }}>
              ({low.percentage}%)
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default RiskDistributionCard;
