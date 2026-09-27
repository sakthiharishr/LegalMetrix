import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

const SEVERITY_STYLES = {
  urgent: {
    bg: 'rgba(244, 63, 94, 0.08)',
    border: 'rgba(244, 63, 94, 0.35)',
    iconColor: 'var(--text-rose)',
    textColor: 'var(--text-rose-softer)',
    icon: AlertCircle,
    actionVariant: 'danger',
  },
  warning: {
    bg: 'rgba(251, 146, 60, 0.08)',
    border: 'rgba(251, 146, 60, 0.35)',
    iconColor: 'var(--color-risk-medium)',
    textColor: 'var(--text-warning-soft)',
    icon: AlertTriangle,
    actionVariant: 'secondary',
  },
  info: {
    bg: 'rgba(6, 182, 212, 0.07)',
    border: 'rgba(6, 182, 212, 0.3)',
    iconColor: 'var(--color-brand-cyan-light)',
    textColor: 'var(--text-info-soft)',
    icon: Info,
    actionVariant: 'ghost',
  },
};

const AlertItem = ({ alert, onDismiss }) => {
  const navigate = useNavigate();
  const cfg = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
  const Icon = cfg.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.8rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <Icon size={16} color={cfg.iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {alert.title && (
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: cfg.textColor, marginBottom: '0.15rem' }}>
            {alert.title}
          </div>
        )}
        <div style={{ fontSize: alert.title ? '0.72rem' : 'var(--font-size-xs)', fontWeight: alert.title ? '400' : '600', color: alert.title ? 'var(--color-text-muted)' : cfg.textColor, lineHeight: 1.4 }}>
          {alert.message}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {alert.actionLabel && (
          <GlassButton
            variant={cfg.actionVariant}
            size="sm"
            onClick={() => navigate(alert.route)}
          >
            {alert.actionLabel}
          </GlassButton>
        )}
        <button
          onClick={() => onDismiss(alert.id)}
          title="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            color: 'var(--color-text-muted)',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export const IntelligenceAlerts = ({ alerts = [] }) => {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  const handleDismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  if (visible.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {visible.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default IntelligenceAlerts;
