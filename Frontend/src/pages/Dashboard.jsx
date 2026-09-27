import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanLine, FileText, RefreshCw,
  BarChart3, ShieldCheck, AlertTriangle, Clock, ShieldAlert,
} from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';

// Dashboard components
import { StatCard } from '../components/dashboard/StatCard';
import { ComplianceTrendChart } from '../components/dashboard/ComplianceTrendChart';
import { RiskDistributionCard } from '../components/dashboard/RiskDistributionCard';
import { ViolationCategoriesCard } from '../components/dashboard/ViolationCategoriesCard';
import { RecurringPatternsCard } from '../components/dashboard/RecurringPatternsCard';
import { RiskScoreWidget } from '../components/dashboard/RiskScoreWidget';
import { HighPriorityTable } from '../components/dashboard/HighPriorityTable';
import { RecentInspectionsTable } from '../components/dashboard/RecentInspectionsTable';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { IntelligenceAlerts } from '../components/dashboard/IntelligenceAlerts';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';

// Dashboard service (all data flows through here — no raw mock imports)
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Trend period state (managed here so the chart can request new data)
  const [trendPeriod, setTrendPeriod] = useState('7d');

  // Data slices — all null until loaded
  const [summary, setSummary] = useState(null);
  const [allTrends, setAllTrends] = useState({}); // { '7d': [...], '30d': [...], '90d': [...] }
  const [riskDist, setRiskDist] = useState(null);
  const [violationCategories, setViolationCategories] = useState([]);
  const [highPriority, setHighPriority] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [recurringPatterns, setRecurringPatterns] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // ── Data Loading ──────────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data concurrently — each service method has its own mock fallback
      const [
        summaryData,
        trends7d,
        trends30d,
        trends90d,
        riskDistData,
        categoriesData,
        highPriorityData,
        recentData,
        patternsData,
        riskScoreData,
        alertsData,
      ] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getComplianceTrends('7d'),
        dashboardService.getComplianceTrends('30d'),
        dashboardService.getComplianceTrends('90d'),
        dashboardService.getRiskDistribution(),
        dashboardService.getViolationCategories(),
        dashboardService.getHighPriorityInspections(),
        dashboardService.getRecentInspections(),
        dashboardService.getRecurringPatterns(),
        dashboardService.getRiskScoreDetails(),
        dashboardService.getIntelligenceAlerts(),
      ]);

      setSummary(summaryData);
      setAllTrends({ '7d': trends7d, '30d': trends30d, '90d': trends90d });
      setRiskDist(riskDistData);
      setViolationCategories(categoriesData);
      setHighPriority(highPriorityData);
      setRecentInspections(recentData);
      setRecurringPatterns(patternsData);
      setRiskScore(riskScoreData);
      setAlerts(alertsData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[Dashboard] Failed to load data:', err);
      setError(err?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ── Stat cards derived from summary ───────────────────────────────────────
  // Maps mockDashboardSummary field names to StatCard props
  const statCards = summary
    ? [
        {
          title: 'Total Scanned',
          value: summary.totalScanned,
          subtext: summary.totalScannedTrend,
          variant: 'default',
          icon: <BarChart3 size={18} />,
        },
        {
          title: 'Compliant Products',
          value: summary.compliant,
          subtext: summary.compliantTrend,
          variant: 'compliant',
          icon: <ShieldCheck size={18} />,
        },
        {
          title: 'Potential Violations',
          value: summary.potentialViolations,
          subtext: summary.potentialViolationsTrend,
          variant: 'violation',
          icon: <AlertTriangle size={18} />,
        },
        {
          title: 'Needs Officer Review',
          value: summary.needsReview,
          subtext: summary.needsReviewTrend,
          variant: 'review',
          icon: <Clock size={18} />,
        },
        {
          title: 'High-Risk Findings',
          value: summary.highRisk,
          subtext: summary.highRiskTrend,
          variant: 'risk',
          icon: <ShieldAlert size={18} />,
        },
      ]
    : [];

  // ── Render: Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <PageHeader
          title="Enforcement Intelligence"
          subtitle="Loading dashboard data…"
        />
        <DashboardSkeleton />
      </div>
    );
  }

  // ── Render: Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <PageHeader title="Enforcement Intelligence" subtitle="Dashboard could not be loaded" />
        <GlassCard
          variant="elevated"
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.05)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
          <h3 style={{ color: 'var(--text-danger-soft)', marginBottom: '0.5rem', fontSize: 'var(--font-size-lg)' }}>
            Dashboard Unavailable
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <GlassButton variant="secondary" icon={<RefreshCw size={16} />} onClick={loadDashboard}>
            Retry
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  // ── Render: Dashboard ─────────────────────────────────────────────────────
  const activeTrendData = allTrends[trendPeriod] || allTrends['7d'] || [];

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Enforcement Intelligence"
        badge={
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--text-success-soft)',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            LIVE
          </span>
        }
        subtitle={
          lastRefreshed
            ? `PCR 2011 Compliance Overview · Last updated ${lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
            : 'PCR 2011 Compliance Overview'
        }
        actions={
          <>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={15} />}
              onClick={loadDashboard}
              title="Refresh dashboard"
            >
              Refresh
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<FileText size={15} />}
              onClick={() => navigate('/reports')}
            >
              Reports
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<ScanLine size={15} />}
              onClick={() => navigate('/scan')}
            >
              Scan Product
            </GlassButton>
          </>
        }
      />

      {/* Layout wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── 1. Intelligence Alerts ── */}
        {alerts.length > 0 && (
          <IntelligenceAlerts alerts={alerts} />
        )}

        {/* ── 2. Quick Actions ── */}
        <DashboardQuickActions />

        {/* ── 3. Stat Cards ── */}
        {statCards.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1rem',
            }}
          >
            {statCards.map((card, idx) => (
              <StatCard key={idx} {...card} />
            ))}
          </div>
        )}

        {/* ── 4. Compliance Trend + Risk Distribution ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <ComplianceTrendChart
            data={activeTrendData}
            activePeriod={trendPeriod}
            onPeriodChange={setTrendPeriod}
          />
          {riskDist && <RiskDistributionCard data={riskDist} />}
        </div>

        {/* ── 5. Violation Categories + Risk Score Widget ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <ViolationCategoriesCard data={violationCategories} />
          <RiskScoreWidget data={riskScore} />
        </div>

        {/* ── 6. Recurring Patterns (full width) ── */}
        <RecurringPatternsCard data={recurringPatterns} />

        {/* ── 7. High-Priority Inspections Table ── */}
        <HighPriorityTable data={highPriority} />

        {/* ── 8. Recent Inspections Table ── */}
        <RecentInspectionsTable data={recentInspections} />

      </div>
    </div>
  );
};

export { Dashboard };
export default Dashboard;
