import React, { useRef, useState } from 'react';
import { UPLOAD_STATUS, IMAGE_QUALITY, SCAN_LIMITS } from '../../utils/constants';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassBadge from '../ui/GlassBadge';
import { ImagePlus, Eye, RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock, Loader } from 'lucide-react';

const formatSize = (b) => {
  if (!b) return '';
  return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
};

export const ImageSlotCard = ({ slot, slotIndex, onPreview, onReplace, onRemove, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const canAccept = !disabled && slot.uploadStatus !== UPLOAD_STATUS.UPLOADING && slot.uploadStatus !== UPLOAD_STATUS.VALIDATING;

  const dropHandlers = {
    onDragOver: (e) => {
      e.preventDefault();
      if (canAccept) setIsDragOver(true);
    },
    onDragLeave: () => setIsDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && canAccept) onReplace(file);
    },
  };

  const handleContainerClick = () => {
    if (!disabled && (!slot.uploadStatus || slot.uploadStatus === UPLOAD_STATUS.EMPTY || slot.uploadStatus === UPLOAD_STATUS.FAILED)) {
      fileInputRef.current?.click();
    }
  };

  const handleReplaceClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplace(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const truncate = (str, n) => {
    return (str?.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  const emptyContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '220px',
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 'var(--spacing-md)',
    textAlign: 'center',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    backgroundColor: 'var(--bg-glass)',
  };

  const failedContainerStyle = {
    ...emptyContainerStyle,
    border: '2px dashed var(--color-danger)',
  };

  const thumbnailContainerStyle = {
    width: '100%',
    height: '140px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    marginBottom: 'var(--spacing-sm)',
  };

  const thumbnailStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const renderContent = () => {
    if (!slot.uploadStatus || slot.uploadStatus === UPLOAD_STATUS.EMPTY) {
      return (
        <div style={emptyContainerStyle} onClick={handleContainerClick}>
          <ImagePlus size={32} color="var(--color-text-muted)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>Upload {slot.viewName}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Drag or click to add</div>
        </div>
      );
    }

    if (slot.uploadStatus === UPLOAD_STATUS.FAILED) {
      return (
        <div style={failedContainerStyle} onClick={handleContainerClick}>
          <AlertCircle size={32} color="var(--color-danger)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div style={{ fontWeight: '600', color: 'var(--color-danger)' }}>Upload {slot.viewName}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginTop: 'var(--spacing-xs)' }}>
            {slot.error || 'Upload failed'}
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <GlassButton size="sm" variant="ghost">Try Again</GlassButton>
          </div>
        </div>
      );
    }

    if (slot.uploadStatus === UPLOAD_STATUS.VALIDATING) {
      return (
        <div style={emptyContainerStyle}>
          <Loader size={32} color="var(--color-primary)" className="animate-spin" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Validating...</div>
        </div>
      );
    }

    const isUploading = slot.uploadStatus === UPLOAD_STATUS.UPLOADING;
    const actionsDisabled = disabled || isUploading;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <div style={thumbnailContainerStyle}>
          <img src={slot.preview} alt={slot.viewName} style={thumbnailStyle} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <GlassBadge variant="primary" size="sm">{slot.viewName}</GlassBadge>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatSize(slot.fileSize)}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {truncate(slot.fileName, 25)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
          {slot.uploadStatus === UPLOAD_STATUS.READY && <GlassBadge variant="neutral">Ready</GlassBadge>}
          {slot.uploadStatus === UPLOAD_STATUS.UPLOADING && <GlassBadge variant="primary"><Loader size={12} className="animate-spin" style={{ marginRight: '4px' }} /> Uploading...</GlassBadge>}
          {slot.uploadStatus === UPLOAD_STATUS.UPLOADED && <GlassBadge variant="success"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Uploaded</GlassBadge>}

          {slot.qualityStatus === IMAGE_QUALITY.PENDING && (
            <GlassBadge variant="neutral"><Clock size={12} style={{ marginRight: '4px' }} /> Backend Assessment — Pending</GlassBadge>
          )}
          {slot.qualityStatus === IMAGE_QUALITY.GOOD && (
            <GlassBadge variant="success"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Good Quality</GlassBadge>
          )}
          {slot.qualityStatus === IMAGE_QUALITY.NEEDS_REVIEW && (
            <GlassBadge variant="warning"><AlertCircle size={12} style={{ marginRight: '4px' }} /> Needs Review</GlassBadge>
          )}
          {slot.qualityStatus === IMAGE_QUALITY.UNCLEAR && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <GlassBadge variant="danger"><AlertCircle size={12} style={{ marginRight: '4px' }} /> Unclear</GlassBadge>
              <span style={{ fontSize: '10px', color: 'var(--color-danger)' }}>{slot.qualityMessage || 'Image may not be clear enough for reliable text extraction.'} Use Replace to upload it again.</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
          <GlassButton size="sm" variant="ghost" disabled={actionsDisabled} onClick={() => onPreview(slotIndex)} style={{ flex: 1, padding: '0 4px' }}>
            <Eye size={14} style={{ marginRight: '4px' }} /> Preview
          </GlassButton>
          <GlassButton size="sm" variant="secondary" disabled={actionsDisabled} onClick={handleReplaceClick} style={{ flex: 1, padding: '0 4px' }}>
            <RefreshCw size={14} style={{ marginRight: '4px' }} /> Replace
          </GlassButton>
          <GlassButton size="sm" variant="danger" disabled={actionsDisabled} onClick={() => onRemove(slotIndex)} style={{ flex: 1, padding: '0 4px' }}>
            <Trash2 size={14} style={{ marginRight: '4px' }} /> Remove
          </GlassButton>
        </div>
      </div>
    );
  };

  return (
    <GlassCard
      {...dropHandlers}
      style={{
        padding: 'var(--spacing-md)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        outline: isDragOver ? '2px solid var(--color-brand-cyan)' : 'none',
        outlineOffset: '-2px',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept={SCAN_LIMITS.ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
      />
      {renderContent()}
    </GlassCard>
  );
};

export default ImageSlotCard;
