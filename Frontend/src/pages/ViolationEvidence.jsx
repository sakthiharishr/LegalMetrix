import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useEvidence } from '../hooks/useEvidence';
import evidenceService from '../services/evidenceService';
import { EvidenceHeader } from '../components/evidence/EvidenceHeader';
import { EvidenceImageViewer } from '../components/evidence/EvidenceImageViewer';
import { FindingSummaryCard } from '../components/evidence/FindingSummaryCard';
import { RuleReferenceCard } from '../components/evidence/RuleReferenceCard';
import { EvidenceConfidenceCard } from '../components/evidence/EvidenceConfidenceCard';
import { RiskContextCard } from '../components/evidence/RiskContextCard';
import { EvidenceTraceability } from '../components/evidence/EvidenceTraceability';
import { EvidenceSkeleton } from '../components/evidence/EvidenceSkeleton';
import { GlassButton } from '../components/ui/GlassButton';
import { EmptyState } from '../components/common/EmptyState';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowLeft, ShieldCheck, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RiskBadge } from '../components/common/RiskBadge';

const EvidenceSelector = ({ items, loading, error, retry, onSelect }) => (
  <div>
    <PageHeader title="Violation Evidence" subtitle="Select a product to review all of its violation evidence" />
    {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><LoadingSpinner size="lg" text="Loading violation cases" /></div> : error ? <GlassCard style={{ maxWidth: '650px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}><AlertTriangle size={44} color="var(--text-danger)" style={{ margin: '0 auto 1rem' }} /><div style={{ color: 'var(--text-danger)', marginBottom: '1.2rem' }}>{error}</div><GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton></GlassCard> : items.length === 0 ? <EmptyState title="No Violation Evidence Pending" description="There are currently no products with pending AI findings requiring evidence review." actionLabel="Go to Officer Verification" onAction={() => onSelect(null, true)} /> : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{items.map(item => <GlassCard key={item.scanId} style={{ padding: '1.2rem 1.4rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}><div><div style={{ fontSize: '1rem', fontWeight: 700 }}>{item.productName}</div><div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>Scan: {item.scanId} {item.brand && `| ${item.brand}`}</div><div style={{ display: 'flex', gap: '1rem', marginTop: '0.55rem', flexWrap: 'wrap' }}><span style={{ color: 'var(--text-danger)', fontWeight: 700 }}>{item.findingCount} violation{item.findingCount === 1 ? '' : 's'}</span><RiskBadge risk={item.riskLevel || 'MEDIUM_RISK'} size="sm" /></div></div><GlassButton variant="primary" icon={<Search size={15} />} onClick={() => onSelect(item.scanId)}>View All Evidence</GlassButton></div></GlassCard>)}</div>}
  </div>
);

export const ViolationEvidence = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitScanId = location.state?.scanId || searchParams.get('scanId');
  const explicitFindingId = location.state?.findingId || searchParams.get('findingId') || location.state?.evidenceId;
  const [selectorLoading, setSelectorLoading] = useState(!explicitScanId && !explicitFindingId);
  const [selectorError, setSelectorError] = useState(null);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(explicitScanId ? { scanId: explicitScanId, findingId: explicitFindingId } : null);

  useEffect(() => {
    if (explicitScanId || explicitFindingId) { setSelected({ scanId: explicitScanId, findingId: explicitFindingId }); return; }
    let active = true;
    setSelectorLoading(true); setSelectorError(null);
    evidenceService.getAvailableCases().then(result => { if (active) setItems(result.items || []); }).catch(err => { if (active) setSelectorError(err.message || 'Failed to load violation cases.'); }).finally(() => { if (active) setSelectorLoading(false); });
    return () => { active = false; };
  }, [explicitScanId, explicitFindingId]);

  if (!selected) return <EvidenceSelector items={items} loading={selectorLoading} error={selectorError} retry={() => window.location.reload()} onSelect={(scanId, goVerification) => goVerification ? navigate('/verification') : setSelected({ scanId })} />;
  return <EvidenceDetail scanId={selected.scanId} findingId={selected.findingId} navigate={navigate} />;
};

const EvidenceDetail = ({ scanId, findingId, navigate }) => {
  const { loading, error, data, retry } = useEvidence(scanId, findingId || 'latest');
  if (loading) return <div><PageHeader title="Violation Evidence" subtitle="Retrieving supporting evidence..." /><EvidenceSkeleton /></div>;
  if (error) return <div><PageHeader title="Violation Evidence" subtitle="Failed to retrieve evidence" /><GlassCard style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}><AlertTriangle size={48} color="var(--text-danger)" style={{ margin: '0 auto 1rem' }} /><div style={{ color: 'var(--text-danger)', marginBottom: '1.5rem' }}>{error}</div><div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}><GlassButton variant="secondary" onClick={() => navigate('/evidence')}>All Products</GlassButton><GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton></div></GlassCard></div>;
  if (!data) return null;
  if (data.state === 'NO_FINDINGS') return <div><PageHeader title="Violation Evidence" subtitle="Review AI findings" /><EmptyState title="No Violation Evidence Available" description={data.message || 'No violation evidence is available for this product.'} actionLabel="Back to Products" onAction={() => navigate('/evidence')} /></div>;
  return <div style={{ paddingBottom: '90px', position: 'relative', minHeight: '100%' }}>
    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: 'var(--color-status-review)' }}><strong>Officer Review Required:</strong> Review <strong>all uploaded package images</strong> before making a final determination.</div>
    <EvidenceHeader scanId={data.scanId} findingId={data.findingId} product={data.product} finding={data.finding} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}><div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}><EvidenceImageViewer evidence={data.evidence} /></div><div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}><FindingSummaryCard finding={data.finding} /><RuleReferenceCard ruleReference={data.ruleReference} /><EvidenceConfidenceCard metrics={data.confidenceMetrics} /><RiskContextCard risk={data.risk} /></div></div>
    <EvidenceTraceability traceData={data.traceability} />
    <div style={{ position: 'fixed', bottom: 0, left: 'var(--sidebar-width)', right: 0, padding: '1rem 2rem', background: 'rgba(var(--surface-rgb), 0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--glass-border-standard)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}><GlassButton variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/evidence')}>All Products</GlassButton><GlassButton variant="primary" icon={<ShieldCheck size={16} />} onClick={() => navigate('/verification', { state: { scanId: data.scanId, findingId: data.findingId } })}>Review in Officer Verification</GlassButton></div>
  </div>;
};

export default ViolationEvidence;
