import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useScanSession } from '../hooks/useScanSession';
import ImageDropZone from '../components/scan/ImageDropZone';
import ImageSlotCard from '../components/scan/ImageSlotCard';
import ProductMetadataForm from '../components/scan/ProductMetadataForm';
import ScanSubmitBar from '../components/scan/ScanSubmitBar';
import ScanProgressTracker from '../components/scan/ScanProgressTracker';
import ImagePreviewModal from '../components/scan/ImagePreviewModal';
import { ANALYSIS_STATUS, SCAN_LIMITS } from '../utils/constants';

export const ScanProduct = () => {
  const navigate = useNavigate();
  const session = useScanSession();
  
  const [previewSlotIndex, setPreviewSlotIndex] = useState(null);

  // Navigate to analysis when complete
  useEffect(() => {
    if (session.analysisStatus === ANALYSIS_STATUS.COMPLETE && session.scanId) {
      const timer = setTimeout(() => {
        navigate('/analysis', { state: { scanId: session.scanId } });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session.analysisStatus, session.scanId, navigate]);

  const handleFilesSelected = (files) => {
    const fileArray = Array.from(files);
    let fileIdx = 0;
    
    // Find empty slots and fill them
    for (let i = 0; i < session.images.length; i++) {
      if (fileIdx >= fileArray.length) break;
      
      const img = session.images[i];
      if (!img.file) {
        session.addImage(i, fileArray[fileIdx]);
        fileIdx++;
      }
    }
  };

  const isTrackerVisible = [
    ANALYSIS_STATUS.UPLOADING,
    ANALYSIS_STATUS.QUALITY_CHECK,
    ANALYSIS_STATUS.LABEL_DETECTION,
    ANALYSIS_STATUS.OCR_EXTRACTION,
    ANALYSIS_STATUS.COMPLIANCE_ANALYSIS,
    ANALYSIS_STATUS.COMPLETE,
    ANALYSIS_STATUS.FAILED
  ].includes(session.analysisStatus);

  const activePreviewSlot = previewSlotIndex !== null ? session.images[previewSlotIndex] : null;

  return (
    <div style={{ paddingBottom: '80px', position: 'relative', minHeight: '100%' }}>
      <PageHeader
        title="Scan Product"
        subtitle="Upload packaged commodity images for compliance analysis."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {isTrackerVisible ? (
          <ScanProgressTracker
            stages={session.processingStages}
            analysisStatus={session.analysisStatus}
          />
        ) : (
          <>
            {session.uploadedCount < SCAN_LIMITS.MAX_IMAGES && (
              <ImageDropZone
                onFilesSelected={handleFilesSelected}
                disabled={session.isAnalyzing}
              />
            )}
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}>
              {session.images.map((slot, idx) => (
                <ImageSlotCard
                  key={idx}
                  slot={slot}
                  slotIndex={idx}
                  onPreview={() => setPreviewSlotIndex(idx)}
                  onReplace={(file) => session.replaceImage(idx, file)}
                  onRemove={() => session.removeImage(idx)}
                  disabled={session.isAnalyzing}
                />
              ))}
            </div>

            <ProductMetadataForm
              metadata={session.metadata}
              onUpdateMetadata={session.updateMetadata}
              disabled={session.isAnalyzing}
            />
          </>
        )}

        {/* Flow step 2: an unclear photo must be retaken before analysis can start */}
        {session.unclearImages.length > 0 && !session.isAnalyzing && (
          <div role="alert" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: 'var(--text-danger-soft)', fontSize: '0.85rem' }}>
            <strong>Image not clear, please upload again.</strong>
            <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.25rem' }}>
              {session.unclearImages.map((img) => <li key={img.viewName}>{img.viewName}: {img.qualityMessage}</li>)}
            </ul>
          </div>
        )}

        {/* Errors display if analysis failed */}
        {session.errors.length > 0 && (
           <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: 'var(--text-danger-soft)', fontSize: '0.85rem' }}>
             <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
               {session.errors.map((err, i) => <li key={i}>{err}</li>)}
             </ul>
           </div>
        )}
      </div>

      <ScanSubmitBar
        uploadedCount={session.uploadedCount}
        maxImages={SCAN_LIMITS.MAX_IMAGES}
        canAnalyze={session.canAnalyze}
        isAnalyzing={session.isAnalyzing}
        analysisStatus={session.analysisStatus}
        onAnalyze={session.startAnalysis}
        onReset={session.resetSession}
      />

      {activePreviewSlot && (
        <ImagePreviewModal
          isOpen={previewSlotIndex !== null}
          onClose={() => setPreviewSlotIndex(null)}
          image={activePreviewSlot}
          onReplace={() => setPreviewSlotIndex(null)}
          onUploadAnother={() => setPreviewSlotIndex(null)}
        />
      )}
    </div>
  );
};

export default ScanProduct;
