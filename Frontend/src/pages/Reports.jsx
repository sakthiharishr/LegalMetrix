import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Hooks
import { useReports } from '../hooks/useReports';

// Components
import { ReportDateRange } from '../components/reports/ReportDateRange';
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards';
import { InspectionActivityChart } from '../components/reports/InspectionActivityChart';
import { ComplianceTrendAnalytics } from '../components/reports/ComplianceTrendAnalytics';
import { FindingCategoryAnalytics } from '../components/reports/FindingCategoryAnalytics';
import { RiskDistributionAnalytics } from '../components/reports/RiskDistributionAnalytics';
import { RecurringIssuesAnalytics } from '../components/reports/RecurringIssuesAnalytics';
import { OfficerReviewAnalytics } from '../components/reports/OfficerReviewAnalytics';
import { ReportPreview } from '../components/reports/ReportPreview';
import { ReportExportActions } from '../components/reports/ReportExportActions';
import { ReportsSkeleton } from '../components/reports/ReportsSkeleton';

export const Reports = () => {
  const { 
    dateRange, updateDateRange, 
    loading, error, analytics, retry,
    exportState, exportMessage, handleExportPdf, handleExportCsv 
  } = useReports();

  if (loading) {
    return (
      <div>
        <PageHeader title="Reports & Analytics" subtitle="Loading enforcement intelligence..." />
        <ReportsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Reports & Analytics" subtitle="Error loading analytics" />
        <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={48} color="var(--text-danger)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <div style={{ color: 'var(--text-danger)', marginBottom: '1.5rem' }}>{error}</div>
          <GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton>
        </GlassCard>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="reports-container" style={{ paddingBottom: '40px', minHeight: '100%' }}>
      
      {/* Inline Print Styles */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, .sidebar, .no-print { display: none !important; }
          .reports-container { padding: 0 !important; margin: 0 !important; }
          .glass-card { background: none !important; border: none !important; box-shadow: none !important; color: black !important; padding: 0 !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <PageHeader 
          title="Reports & Analytics" 
          subtitle="Analyze inspection activity, compliance findings, risk patterns and officer review outcomes." 
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ReportDateRange dateRange={dateRange} updateDateRange={updateDateRange} />
            <ReportFilters />
          </div>
          <ReportExportActions 
            exportState={exportState} 
            exportMessage={exportMessage} 
            handleExportPdf={handleExportPdf} 
            handleExportCsv={handleExportCsv} 
          />
        </div>

        <ReportSummaryCards summary={analytics.summary} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <InspectionActivityChart activity={analytics.inspectionActivity} />
          <ComplianceTrendAnalytics trend={analytics.complianceTrend} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <FindingCategoryAnalytics categories={analytics.findingCategories} />
          <RiskDistributionAnalytics distribution={analytics.riskDistribution} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <RecurringIssuesAnalytics issues={analytics.recurringIssues} />
          <OfficerReviewAnalytics outcomes={analytics.officerReviewOutcomes} />
        </div>
      </div>

      {/* Official Report Preview (Visible on Screen at bottom, and ONLY thing visible on Print) */}
      <div className="report-preview-section">
        <h3 className="no-print" style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.5rem' }}>
          Official Report Preview
        </h3>
        <ReportPreview analytics={analytics} />
      </div>

    </div>
  );
};

export default Reports;
