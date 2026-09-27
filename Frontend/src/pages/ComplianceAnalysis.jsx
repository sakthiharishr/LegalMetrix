import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useComplianceAnalysis } from '../hooks/useComplianceAnalysis';
import analysisService from '../services/analysisService';
import { AnalysisSummaryCard } from '../components/analysis/AnalysisSummaryCard';
import { ProductImageViewer } from '../components/analysis/ProductImageViewer';
import { OcrExtractionPanel } from '../components/analysis/OcrExtractionPanel';
import { ComplianceChecklist } from '../components/analysis/ComplianceChecklist';
import { PotentialFindings } from '../components/analysis/PotentialFindings';
import { RiskAssessmentCard } from '../components/analysis/RiskAssessmentCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { EmptyState } from '../components/common/EmptyState';
import { ArrowLeft, History, ShieldCheck, RefreshCw, Search, AlertTriangle, FileDown } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RiskBadge } from '../components/common/RiskBadge';

const AnalysisSelector = ({ items, onSelect, loading, error, retry }) => (
  <div>
    <PageHeader title="Compliance Analysis" subtitle="Select a scanned product to view its compliance analysis" />
    {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><LoadingSpinner size="lg" text="Loading analyzed products" /></div> : error ? (
      <GlassCard style={{ maxWidth: '650px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
        <AlertTriangle size={44} color="var(--text-danger)" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--text-danger)', marginBottom: '1.2rem' }}>{error}</div>
        <GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton>
      </GlassCard>
    ) : items.length === 0 ? (
      <EmptyState title="No Analyzed Products" description="Complete a product scan first. Completed analyses will appear here." actionLabel="Go to Scan Product" onAction={() => onSelect(null, true)} />
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map(item => (
          <GlassCard key={item.scanId} style={{ padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{item.productName}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>Scan: {item.scanId}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.55rem', flexWrap: 'wrap' }}><span>Status: {item.status}</span><RiskBadge risk={item.riskLevel} size="sm" /><span>{item.findingCount || 0} finding{item.findingCount === 1 ? '' : 's'}</span></div>
              </div>
              <GlassButton variant="primary" icon={<Search size={15} />} onClick={() => onSelect(item.scanId)}>View Analysis</GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>
    )}
  </div>
);

export const ComplianceAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitScanId = location.state?.scanId || searchParams.get('scanId');
  const [selectorLoading, setSelectorLoading] = useState(!explicitScanId);
  const [selectorError, setSelectorError] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(explicitScanId || null);

  useEffect(() => {
    if (explicitScanId) { setSelectedScanId(explicitScanId); return; }
    // "All Products" navigates here without a scan: show the list instead of the last opened scan.
    setSelectedScanId(null);
    let active = true;
    setSelectorLoading(true); setSelectorError(null);
    analysisService.getAvailableScans().then(result => { if (active) setItems(result.items || []); }).catch(err => { if (active) setSelectorError(err.message || 'Failed to load analyzed products.'); }).finally(() => { if (active) setSelectorLoading(false); });
    return () => { active = false; };
    // location.key changes on every navigation, so "All Products" works even when no scan was passed either time.
  }, [explicitScanId, location.key]);

  if (!selectedScanId) return <AnalysisSelector items={items} loading={selectorLoading} error={selectorError} retry={() => window.location.reload()} onSelect={(id, goScan) => goScan ? navigate('/scan') : setSelectedScanId(id)} />;

  return <AnalysisDetail scanId={selectedScanId} navigate={navigate} />;
};

const CASE_LABELS = {
  NO_CASE: 'Compliant - no case',
  READY_TO_FORWARD: 'Ready to forward',
  FORWARDED: 'Forwarded to legal officer',
  UNDER_REVIEW: 'Further review requested',
  CONFIRMED: 'Violation confirmed',
  INVALIDATED: 'Finding invalidated',
};

const CaseActions = ({ data, navigate }) => {
  const [caseStatus, setCaseStatus] = useState(data.caseStatus);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { setCaseStatus(data.caseStatus); setMessage(''); }, [data.scanId, data.caseStatus]);

  const hasCase = (data.findings?.length || 0) > 0 && caseStatus !== 'NO_CASE';
  const decided = caseStatus === 'CONFIRMED' || caseStatus === 'INVALIDATED';

  const downloadReport = async () => {
    setBusy('report'); setMessage('');
    try { await analysisService.downloadCaseReport(data.scanId); }
    catch (err) { setMessage(err.message || 'Report download failed.'); }
    finally { setBusy(''); }
  };

  const forward = async () => {
    setBusy('forward'); setMessage('');
    try {
      const result = await analysisService.forwardCase(data.scanId);
      setCaseStatus(result.caseStatus);
      navigate('/verification', { state: { scanId: data.scanId } });
    } catch (err) {
      setMessage(err.message || 'Could not forward the case.');
    } finally { setBusy(''); }
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {message && <span role="alert" style={{ color: 'var(--text-danger)', fontSize: '0.8rem' }}>{message}</span>}
      {caseStatus && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Case: <strong>{CASE_LABELS[caseStatus] || caseStatus}</strong></span>}
      <GlassButton variant="ghost" icon={<FileDown size={16} />} onClick={downloadReport} disabled={busy === 'report'}>
        {busy === 'report' ? 'Preparing report...' : hasCase ? 'Download Violation Report' : 'Download Inspection Report'}
      </GlassButton>
      <GlassButton variant="ghost" icon={<History size={16} />} onClick={() => navigate('/history')}>Product History</GlassButton>
      {hasCase && !decided && (
        <GlassButton variant="primary" icon={<ShieldCheck size={16} />} onClick={forward} disabled={busy === 'forward'}>
          {busy === 'forward' ? 'Forwarding...' : caseStatus === 'FORWARDED' || caseStatus === 'UNDER_REVIEW' ? 'Open Officer Verification' : 'Forward Case to Legal Officer'}
        </GlassButton>
      )}
    </div>
  );
};

const AnalysisDetail = ({ scanId, navigate }) => {
  const { loading, error, data, retry } = useComplianceAnalysis(scanId);
  if (loading) return <div><PageHeader title="Compliance Analysis" subtitle="Retrieving backend analysis..." /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><LoadingSpinner size="lg" text="Loading Compliance Results" /></div></div>;
  if (error) return <div><PageHeader title="Compliance Analysis" subtitle="Analysis retrieval failed" /><GlassCard style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}><AlertTriangle size={48} color="var(--text-danger)" style={{ margin: '0 auto 1rem' }} /><div style={{ color: 'var(--text-danger)', marginBottom: '1rem' }}>{error}</div><div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}><GlassButton variant="secondary" onClick={() => navigate('/analysis')}>Back to Products</GlassButton><GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton></div></GlassCard></div>;
  if (!data) return null;
  return <div style={{ paddingBottom: '80px', position: 'relative', minHeight: '100%' }}>
    <PageHeader title="Compliance Analysis" subtitle={`Review extracted declarations and automated findings. | Scan ID: ${data.scanId}`} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}><div style={{ minWidth: 0 }}><ProductImageViewer images={data.images} scanId={data.scanId} /></div><div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}><AnalysisSummaryCard summary={data.summary} /><RiskAssessmentCard risk={data.risk} /></div></div>
      <OcrExtractionPanel extractedData={data.extractedData} />
      {data.findings?.length > 0 && <PotentialFindings findings={data.findings} onNavigateToEvidence={(evidenceId) => navigate('/evidence', { state: { evidenceId, scanId: data.scanId } })} />}
      <ComplianceChecklist checks={data.complianceChecks} onNavigateToEvidence={() => navigate('/evidence', { state: { scanId: data.scanId } })} />
    </div>
    <div style={{ position: 'fixed', bottom: 0, left: 'var(--sidebar-width)', right: 0, padding: '1rem 2rem', background: 'rgba(var(--surface-rgb), 0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--glass-border-standard)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
      <GlassButton variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/analysis')}>All Products</GlassButton>
      <CaseActions data={data} navigate={navigate} />
    </div>
  </div>;
};

export default ComplianceAnalysis;
