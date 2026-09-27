import React from 'react';
import GlassModal from '../ui/GlassModal';
import GlassBadge from '../ui/GlassBadge';
import GlassButton from '../ui/GlassButton';
import { IMAGE_QUALITY } from '../../utils/constants';

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  image,
  onReplace,
  onUploadAnother
}) => {
  if (!image) return null;

  const { preview, viewName, fileName, fileSize, qualityStatus, dimensions } = image;

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formattedSize = typeof fileSize === 'number' ? formatSize(fileSize) : fileSize;
  const dimsText = dimensions ? `${dimensions.width}x${dimensions.height}` : '';

  const renderQualityBadge = () => {
    switch (qualityStatus) {
      case IMAGE_QUALITY.PENDING:
        return <GlassBadge variant="neutral">Backend Quality Assessment — Pending</GlassBadge>;
      case IMAGE_QUALITY.GOOD:
        return <GlassBadge variant="success">Good Quality</GlassBadge>;
      case IMAGE_QUALITY.NEEDS_REVIEW:
        return <GlassBadge variant="warning">Needs Review</GlassBadge>;
      case IMAGE_QUALITY.UNCLEAR:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <GlassBadge variant="danger">Image may not be clear enough for reliable text extraction.</GlassBadge>
          </div>
        );
      default:
        return null;
    }
  };

  const footerContent = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', width: '100%' }}>
      {qualityStatus === IMAGE_QUALITY.UNCLEAR && (
        <>
          <GlassButton variant="secondary" onClick={onReplace}>
            Replace Image
          </GlassButton>
          <GlassButton variant="primary" onClick={onUploadAnother}>
            Upload Another View
          </GlassButton>
        </>
      )}
      <GlassButton variant="ghost" onClick={onClose}>
        Close
      </GlassButton>
    </div>
  );

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${viewName} — Preview`}
      maxWidth="800px"
      footer={footerContent}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', alignItems: 'center' }}>
        <div style={{
          width: '100%',
          background: 'var(--glass-bg-dark)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-sm)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img
            src={preview}
            alt={viewName}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)'
            }}
          />
        </div>
        
        <div style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          textAlign: 'center'
        }}>
          {fileName} {formattedSize ? `· ${formattedSize}` : ''} {dimsText ? `· ${dimsText}` : ''}
        </div>

        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          {renderQualityBadge()}
        </div>
      </div>
    </GlassModal>
  );
};

export default ImagePreviewModal;
