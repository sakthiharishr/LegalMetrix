import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassModal } from '../ui/GlassModal';
import { ZoomIn, Image as ImageIcon, MapPin, CheckCircle2 } from 'lucide-react';

export const EvidenceImageViewer = ({ evidence }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(null);
  const images = evidence?.images?.length
    ? evidence.images
    : (evidence?.primaryImage ? [{ id: 'primary', url: evidence.primaryImage, viewSlot: 'Evidence Image', fileName: '', isPrimary: true }] : []);

  if (!evidence || images.length === 0) {
    return (
      <GlassCard variant="default">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <div>No package images are available for this finding.</div>
        </div>
      </GlassCard>
    );
  }

  const renderBoundingBoxes = (image) => {
    if (!image.isPrimary || !evidence.boundingBoxes?.length) return null;
    return evidence.boundingBoxes.map(box => (
      <div key={box.id} style={{ position: 'absolute', left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%`, border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', pointerEvents: 'none', boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset' }}>
        <div style={{ position: 'absolute', bottom: '100%', left: '-2px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '0.15rem 0.4rem', borderRadius: '4px 4px 4px 0', whiteSpace: 'nowrap' }}>
          {box.label}
        </div>
      </div>
    ));
  };

  return (
    <>
      <GlassCard variant="default" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--color-brand-cyan-light)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>All Package Evidence</h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{images.length} image{images.length === 1 ? '' : 's'} required</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', padding: '0.7rem 0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
          Review <strong>all uploaded package images</strong> before confirming or dismissing this product-level violation.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {images.map((image, index) => (
            <div key={image.id || index} style={{ border: image.isPrimary ? '2px solid var(--color-brand-cyan-light)' : '1px solid var(--glass-border-standard)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.7rem', background: 'rgba(10,15,29,0.8)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{image.viewSlot || `Image ${index + 1}`}</div>
                {image.isPrimary && <span style={{ fontSize: '0.65rem', color: 'var(--color-brand-cyan-light)' }}>Evidence source</span>}
              </div>
              <div style={{ position: 'relative', aspectRatio: '4 / 3', background: 'rgba(0,0,0,0.35)' }}>
                <img src={image.url} alt={`${image.viewSlot || 'Package'} evidence`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {renderBoundingBoxes(image)}
                <button onClick={() => setIsPreviewOpen(index)} style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(10, 15, 29, 0.78)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.45rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} aria-label={`Preview ${image.viewSlot || 'image'}`}>
                  <ZoomIn size={15} />
                </button>
              </div>
              <div style={{ padding: '0.5rem 0.7rem', fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} color="var(--color-status-compliant)" /> Uploaded package view {index + 1} of {images.length}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {isPreviewOpen !== null && (
        <GlassModal isOpen={true} onClose={() => setIsPreviewOpen(false)} title={images[isPreviewOpen]?.viewSlot || 'Package Evidence'}>
          {images[isPreviewOpen] && <img src={images[isPreviewOpen].url} alt={images[isPreviewOpen].viewSlot || 'Package evidence'} style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />}
        </GlassModal>
      )}
    </>
  );
};

export default EvidenceImageViewer;
