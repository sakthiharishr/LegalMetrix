import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, CheckSquare, History, FileText } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

const ACTIONS = [
  {
    label: 'Scan Product',
    description: 'Initiate a new product label scan',
    icon: <ScanLine size={20} />,
    route: '/scan',
    variant: 'primary',
    accent: 'var(--color-brand-cyan)',
  },
  {
    label: 'Review Findings',
    description: 'Verify pending AI findings',
    icon: <CheckSquare size={20} />,
    route: '/verification',
    variant: 'secondary',
    accent: '#8b5cf6',
  },
  {
    label: 'View History',
    description: 'Browse past inspection records',
    icon: <History size={20} />,
    route: '/history',
    variant: 'secondary',
    accent: 'var(--color-status-review)',
  },
  {
    label: 'Generate Report',
    description: 'Export compliance reports',
    icon: <FileText size={20} />,
    route: '/reports',
    variant: 'secondary',
    accent: 'var(--color-status-compliant)',
  },
];

export const DashboardQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.route)}
          style={{
            background: 'rgba(var(--tint-rgb), 0.04)',
            border: `1px solid rgba(var(--tint-rgb), 0.1)`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all var(--transition-normal)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `rgba(var(--tint-rgb), 0.07)`;
            e.currentTarget.style.borderColor = `${action.accent}55`;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(var(--tint-rgb), 0.04)';
            e.currentTarget.style.borderColor = 'rgba(var(--tint-rgb), 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: `${action.accent}18`,
              border: `1px solid ${action.accent}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: action.accent,
            }}
          >
            {action.icon}
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.1rem' }}>
              {action.label}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
              {action.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default DashboardQuickActions;
