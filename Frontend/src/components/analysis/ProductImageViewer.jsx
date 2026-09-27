import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassModal } from '../ui/GlassModal';
import { ZoomIn, Image as ImageIcon } from 'lucide-react';

export const ProductImageViewer = ({ images, scanId }) => {
  const [activeImage, setActiveImage] = useState(images?.find(img => img.isPrimary) || images?.[0]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <GlassCard>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <div>No images available for this scan session.</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Primary Image Display */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '280px', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--glass-border-standard)'
        }}
      >
        <img 
          src={activeImage?.url} 
          alt={activeImage?.viewName || 'Product Scan'} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
        
        {/* Overlay actions */}
        <button
          onClick={() => setIsPreviewOpen(true)}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(10, 15, 29, 0.7)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Full Screen Preview"
        >
          <ZoomIn size={16} />
        </button>

        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(10, 15, 29, 0.7)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.7rem',
          fontWeight: '500'
        }}>
          {activeImage?.viewName}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {images.map(img => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img)}
              style={{
                width: '60px',
                height: '60px',
                flexShrink: 0,
                padding: 0,
                border: activeImage?.id === img.id ? '2px solid var(--color-brand-cyan-light)' : '2px solid transparent',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
            >
              <img src={img.url} alt={img.viewName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Metadata footer */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
        <span>Scan ID: <span className="font-mono">{scanId}</span></span>
        {/* Placeholder for future bounding box toggle */}
        <span style={{ fontStyle: 'italic' }}>OCR Overlay Ready</span>
      </div>

      {/* Fullscreen Preview Modal */}
      <GlassModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`${activeImage?.viewName} — Preview`}
        maxWidth="900px"
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)' }}>
          <img 
            src={activeImage?.url} 
            alt={activeImage?.viewName} 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
          />
        </div>
      </GlassModal>

    </GlassCard>
  );
};

export default ProductImageViewer;
