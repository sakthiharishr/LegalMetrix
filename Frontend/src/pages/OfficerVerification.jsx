import { RiskBadge } from '../components/common/RiskBadge';
import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useVerification } from '../hooks/useVerification';
import { ReviewStatusBanner } from '../components/verification/ReviewStatusBanner';
import { AiAssessmentCard } from '../components/verification/AiAssessmentCard';
import { VerificationTimeline } from '../components/verification/VerificationTimeline';
import { OfficerDecisionPanel } from '../components/verification/OfficerDecisionPanel';
import { FindingSummaryCard } from '../components/evidence/FindingSummaryCard';
import { RuleReferenceCard } from '../components/evidence/RuleReferenceCard';
import { GlassModal } from '../components/ui/GlassModal';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { EmptyState } from '../components/common/EmptyState';
import { ArrowLeft, Image as ImageIcon, ShieldAlert, RefreshCw, CheckCircle2, Clock3, FileDown } from 'lucide-react';
import { REVIEW_STATUS, OFFICER_DECISION } from '../utils/constants';
import { EvidenceSkeleton } from '../components/evidence/EvidenceSkeleton'; // Reuse skeleton
import verificationService from '../services/verificationService';
import analysisService from '../services/analysisService';

// Flow step 9 -> 11: the officer reviews the case with its violation report.
const ReportButton = ({ scanId }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const download = async () => {
    setBusy(true); setError('');
    try { await analysisService.downloadCaseReport(scanId); }
    catch (err) { setError(err.message || 'Report download failed.'); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {error && <span role="alert" style={{ color: 'var(--text-danger)', fontSize: '0.8rem' }}>{error}</span>}
      <GlassButton variant="secondary" icon={<FileDown size={16} />} onClick={download} disabled={busy}>
        {busy ? 'Preparing report...' : 'Violation Report (PDF)'}
      </GlassButton>
    </div>
  );
};

export const OfficerVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const passedScanId = location.state?.scanId || searchParams.get('scanId') || '';
  const passedFindingId = location.state?.findingId || searchParams.get('findingId') || '';

  const [pendingItems, setPendingItems] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);
  const [selectedScanId, setSelectedScanId] = useState(passedScanId);
  const [selectedFindingId, setSelectedFindingId] = useState(passedFindingId);

  const loadPending = async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const result = await verificationService.getPendingVerifications();
      setPendingItems(result.items || []);
    } catch (err) {
      setPendingError(err.message || 'Failed to load pending verifications.');
    } finally {
      setPendingLoading(false);
    }
  };

  React.useEffect(() => {
    loadPending();
  }, []);

  // A forwarded case arrives with only its scan ID: open it at its first pending finding.
  React.useEffect(() => {
    if (!selectedScanId || selectedFindingId) return;
    const item = pendingItems.find((p) => p.scanId === selectedScanId);
    const findingId = item?.findingId || item?.violations?.[0]?.findingId;
    if (findingId) setSelectedFindingId(findingId);
  }, [pendingItems, selectedScanId, selectedFindingId]);

  const activeScanId = selectedScanId || '';
  const activeFindingId = selectedFindingId || '';

  const { 
    loading, error, data, retry,
    decision, setDecision, remarks, setRemarks,
    isSubmitting, submitSuccess, submitError, submitReview
  } = useVerification(activeScanId, activeFindingId);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [allEvidenceReviewed, setAllEvidenceReviewed] = useState(false);

  const selectPending = (item) => {
    setAllEvidenceReviewed(false);
    setSelectedScanId(item.scanId);
    setSelectedFindingId(item.findingId);
    const params = new URLSearchParams({ scanId: item.scanId, findingId: item.findingId });
    navigate(`/verification?${params.toString()}`, { replace: true });
  };

  if (!activeScanId || !activeFindingId) {
    return (
      <div style={{ paddingBottom: '60px' }}>
        <PageHeader title="Officer Verification" subtitle="Review pending findings from current and previously scanned products." />

        <GlassCard style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Pending Verifications</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>One case per product. Each case contains all AI-detected violations that require an officer decision.</div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pendingItems.length ? 'var(--color-status-review)' : 'var(--color-status-compliant)' }}>{pendingItems.length}</div>
          </div>
        </GlassCard>

        {pendingLoading ? (
          <EvidenceSkeleton />
        ) : pendingError ? (
          <GlassCard style={{ textAlign: 'center', padding: '2.5rem' }}>
            <ShieldAlert size={42} color="var(--text-danger)" style={{ margin: '0 auto 1rem' }} />
            <div style={{ color: 'var(--text-danger)', marginBottom: '1rem' }}>{pendingError}</div>
            <GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={loadPending}>Retry</GlassButton>
          </GlassCard>
        ) : pendingItems.length === 0 ? (
          <EmptyState
            title="No Pending Verifications"
            description="All current and previously scanned findings have been reviewed."
            actionLabel="Go to Dashboard"
            onAction={() => navigate('/dashboard')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {pendingItems.map((item) => (
              <GlassCard key={item.scanId} style={{ padding: '1.15rem 1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(300px, 2fr) 120px 150px auto', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{item.brand} · {item.scanId}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-danger)', fontWeight: 700 }}>
                      {item.violations?.length || 0} violation{item.violations?.length === 1 ? '' : 's'} detected
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Violations to review</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {(item.violations || []).map((violation, index) => (
                        <div key={violation.findingId || index} style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)' }}>
                          <span style={{ color: 'var(--text-danger)', marginRight: '0.4rem' }}>•</span>
                          {violation.description}
                          {violation.affectedField ? <span style={{ color: 'var(--color-text-muted)' }}> ({violation.affectedField})</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div><RiskBadge risk={item.riskLevel || 'MEDIUM_RISK'} size="sm" /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}><Clock3 size={14} /> {new Date(item.createdAt).toLocaleDateString()}</div>
                  <GlassButton variant="primary" size="sm" onClick={() => selectPending({ ...item, findingId: item.violations?.[0]?.findingId })}>Review</GlassButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!data && !loading && !error) {
    return (
      <div>
        <PageHeader title="Officer Verification" subtitle="Human-in-the-loop validation" />
        <EmptyState 
          title="Verification Record Not Found"
          description="Missing Scan ID or Finding ID. Please return to the analysis overview and select a specific finding."
          actionLabel="Back to Analysis"
          onAction={() => navigate('/analysis', { state: { scanId: passedScanId } })}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Officer Verification" subtitle="Loading verification workspace..." />
        <EvidenceSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Officer Verification" subtitle="Failed to retrieve record" />
        <GlassCard style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <ShieldAlert size={48} color="var(--text-danger)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <div style={{ color: 'var(--text-danger)', marginBottom: '1.5rem', fontWeight: '500' }}>{error}</div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <GlassButton variant="secondary" onClick={() => navigate(-1)}>Go Back</GlassButton>
            <GlassButton variant="primary" icon={<RefreshCw size={14} />} onClick={retry}>Retry</GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!data) return null;

  if (data.state === 'NO_FINDINGS') {
    return (
      <div>
        <PageHeader title="Officer Verification" subtitle="Human-in-the-loop validation" />
        <EmptyState
          title="No Officer Verification Required"
          description={data.message || 'No findings require officer verification for this scan.'}
          actionLabel="Back to Analysis"
          onAction={() => navigate('/analysis', { state: { scanId: data.scanId } })}
        />
      </div>
    );
  }

  const isCompleted = data.status === REVIEW_STATUS.COMPLETED;

  const handleOpenConfirmModal = () => {
    if (!decision || !remarks.trim() || remarks.length > 1000 || !allEvidenceReviewed) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    await submitReview();
    await loadPending();
  };

  const getDecisionLabel = (d) => {
    if (d === OFFICER_DECISION.CONFIRM_FINDING) return 'Confirm Violation';
    if (d === OFFICER_DECISION.INVALIDATE_FINDING) return 'Mark Compliant';
    return 'Needs Further Review';
  };

  return (
    <div style={{ paddingBottom: '90px', position: 'relative', minHeight: '100%' }}>
      
      <PageHeader 
        title="Officer Verification" 
        subtitle={`Scan: ${data.scanId} | Product: ${data.product?.name || 'Unknown'}`} 
        actions={<ReportButton scanId={data.scanId} />}
      />

      <ReviewStatusBanner status={data.status} />

      {submitSuccess && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', 
          padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-status-compliant)' 
        }}>
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>Officer review submitted successfully.</span>
        </div>
      )}

      {submitError && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', 
          padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-danger)' 
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: AI Findings & Evidence Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          
          {data.findings?.length > 0 && (
            <GlassCard variant="danger">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-danger)' }}>Product Violations</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{data.findings.length} detected</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {data.findings.map((finding, index) => (
                  <div key={index} style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{index + 1}. {finding.description}</div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      <span>Field: {finding.affectedField || 'N/A'}</span>
                      <span>Detected: {finding.extractedValue || 'Not detected'}</span>
                      <span>Expected: {finding.expectedValue || 'Not specified'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <FindingSummaryCard finding={data.finding} />
          <AiAssessmentCard finding={data.finding} />
          <RuleReferenceCard ruleReference={data.ruleReference} />

          {/* Evidence Link Card */}
          <GlassCard variant="subtle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ImageIcon size={20} color="var(--color-brand-cyan-light)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Visual Evidence Available</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Review bounded regions and OCR overlays.</div>
              </div>
            </div>
            <GlassButton 
              variant="secondary" 
              onClick={() => navigate('/evidence', { state: { scanId: data.scanId, findingId: data.findingId } })}
            >
              View Full Evidence
            </GlassButton>
          </GlassCard>

          <VerificationTimeline timeline={data.timeline} />
        </div>

        {/* Right Column: Officer Decision Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <OfficerDecisionPanel 
            decision={decision}
            setDecision={setDecision}
            remarks={remarks}
            setRemarks={setRemarks}
            isSubmitting={isSubmitting}
            onSubmit={handleOpenConfirmModal}
            isReadOnly={isCompleted}
            reviewedBy={data.reviewedBy}
            reviewedAt={data.reviewedAt}
            allEvidenceReviewed={allEvidenceReviewed}
            setAllEvidenceReviewed={setAllEvidenceReviewed}
            evidenceImageCount={data.evidence?.images?.length || 0}
          />
        </div>

      </div>

      {/* Confirmation Modal */}
      <GlassModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Officer Decision"
      >
        <div style={{ color: 'var(--color-text-primary)' }}>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Please confirm that you have reviewed the available evidence and want to submit this authoritative decision. This action will be logged in the permanent audit trail.
          </p>
          
          <div style={{ background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))', border: '1px solid var(--glass-border-standard)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Decision</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-brand-cyan-light)', marginBottom: '1rem' }}>
              {getDecisionLabel(decision)}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Remarks</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
              {remarks}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <GlassButton variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleConfirmSubmit}>
              Submit Decision
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Bottom Sticky Action Bar */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--sidebar-width)',
          right: 0,
          padding: '1rem 2rem',
          background: 'rgba(var(--surface-rgb), 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--glass-border-standard)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100
        }}
      >
        <GlassButton 
          variant="secondary" 
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/analysis', { state: { scanId: data.scanId } })}
        >
          Back to Analysis
        </GlassButton>
      </div>

    </div>
  );
};

export default OfficerVerification;
