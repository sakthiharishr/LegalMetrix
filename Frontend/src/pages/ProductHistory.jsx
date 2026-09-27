import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

// Hooks
import { useProductHistory } from '../hooks/useProductHistory';
import { useProductHistoryDetail } from '../hooks/useProductHistoryDetail';

// List Components
import { ProductHistorySearch } from '../components/history/ProductHistorySearch';
import { ProductHistoryFilters } from '../components/history/ProductHistoryFilters';
import { ProductHistoryTable } from '../components/history/ProductHistoryTable';
import { ProductHistorySkeleton } from '../components/history/ProductHistorySkeleton';

// Detail Components
import { ProductHistoryDetailSkeleton } from '../components/history/ProductHistoryDetailSkeleton';
import { ComplianceHistorySummary } from '../components/history/ComplianceHistorySummary';
import { ProductComplianceTrend } from '../components/history/ProductComplianceTrend';
import { InspectionTimeline } from '../components/history/InspectionTimeline';
import { HistoricalFindingsTable } from '../components/history/HistoricalFindingsTable';
import { RecurringIssuesCard } from '../components/history/RecurringIssuesCard';
import { HistoricalEvidenceGallery } from '../components/history/HistoricalEvidenceGallery';

// ============================================================================
// LIST VIEW (Overall History)
// ============================================================================
const HistoryListView = () => {
  const {
    loading, error, summary, products, total, page, setPage,
    search, setSearch, statusFilter, setStatusFilter, riskFilter, setRiskFilter, retry
  } = useProductHistory();

  if (loading) {
    return (
      <div>
        <PageHeader title="Product Compliance History" subtitle="Track product inspections and compliance findings over time." />
        <ProductHistorySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Product Compliance History" subtitle="Error loading history" />
        <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={48} color="var(--text-danger)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <div style={{ color: 'var(--text-danger)', marginBottom: '1.5rem' }}>{error}</div>
          <GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px', minHeight: '100%' }}>
      <PageHeader 
        title="Product Compliance History" 
        subtitle="Search and track historical compliance assessments, evidence, and officer decisions." 
      />

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Total Products</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{summary?.totalProducts || 0}</div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Total Inspections</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{summary?.totalInspections || 0}</div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Potential Findings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-status-review)' }}>{summary?.potentialFindings || 0}</div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Reviewed Findings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-status-compliant)' }}>{summary?.reviewedFindings || 0}</div>
        </GlassCard>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <ProductHistorySearch search={search} setSearch={setSearch} />
        <ProductHistoryFilters 
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          riskFilter={riskFilter} setRiskFilter={setRiskFilter}
        />
      </div>

      <ProductHistoryTable products={products} />

      {/* Basic Pagination */}
      {total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <GlassButton variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</GlassButton>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Page {page}</span>
          <GlassButton variant="secondary" onClick={() => setPage(p => p + 1)} disabled={products.length < 10}>Next</GlassButton>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DETAIL VIEW (Specific Product)
// ============================================================================
const HistoryDetailView = ({ productId }) => {
  const navigate = useNavigate();
  const { loading, error, detail, inspections, findings, recurringIssues, evidence, retry } = useProductHistoryDetail(productId);

  if (loading) {
    return (
      <div>
        <PageHeader title="Product Detail" subtitle="Loading compliance history..." />
        <ProductHistoryDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Product Detail" subtitle="Error loading history" />
        <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={48} color="var(--text-danger)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <div style={{ color: 'var(--text-danger)', marginBottom: '1.5rem' }}>{error}</div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <GlassButton variant="secondary" onClick={() => navigate('/history')}>Back to List</GlassButton>
            <GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div style={{ paddingBottom: '90px', position: 'relative', minHeight: '100%' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <GlassButton variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate('/history')}>
          Back to History
        </GlassButton>
      </div>

      <PageHeader 
        title={detail.identity?.name || 'Unknown Product'}
        subtitle={`ID: ${detail.productId} | Brand: ${detail.identity?.brand || 'N/A'}`} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <ComplianceHistorySummary detail={detail} />
          
          <GlassCard variant="subtle">
             <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 1rem 0', color: 'var(--color-text-primary)' }}>
              Product Identity
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Manufacturer:</span><br/><span style={{ color: 'var(--color-text-primary)' }}>{detail.identity?.manufacturer || 'N/A'}</span></div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Packer:</span><br/><span style={{ color: 'var(--color-text-primary)' }}>{detail.identity?.packer || 'N/A'}</span></div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Importer:</span><br/><span style={{ color: 'var(--color-text-primary)' }}>{detail.identity?.importer || 'N/A'}</span></div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Batch/Lot:</span><br/><span style={{ color: 'var(--color-text-primary)' }}>{detail.identity?.batchLot || 'N/A'}</span></div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Origin:</span><br/><span style={{ color: 'var(--color-text-primary)' }}>{detail.identity?.countryOfOrigin || 'N/A'}</span></div>
            </div>
          </GlassCard>

          <ProductComplianceTrend trend={detail.trend} />
          
          {recurringIssues && recurringIssues.length > 0 && (
            <RecurringIssuesCard issues={recurringIssues} />
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <InspectionTimeline inspections={inspections} />
        </div>

      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <HistoricalFindingsTable findings={findings} />
        <HistoricalEvidenceGallery evidence={evidence} />
      </div>

    </div>
  );
};

// ============================================================================
// PAGE ORCHESTRATOR
// ============================================================================
export const ProductHistory = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');

  // Conditionally render the correct view
  if (productId) {
    return <HistoryDetailView productId={productId} />;
  }

  return <HistoryListView />;
};

export default ProductHistory;
