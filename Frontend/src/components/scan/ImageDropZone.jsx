import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Camera } from 'lucide-react';
import { SCAN_LIMITS } from '../../utils/constants';
import GlassButton from '../ui/GlassButton';

export const ImageDropZone = ({
  onFilesSelected,
  disabled = false,
  acceptedTypes = SCAN_LIMITS.ACCEPTED_EXTENSIONS
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input so the same files can be selected again if needed
      e.target.value = null;
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      style={{
        border: `2px dashed ${isDragOver ? 'var(--color-brand-cyan-light)' : 'var(--glass-border-highlight)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-2xl) var(--spacing-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'var(--glass-bg-subtle)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: isDragOver ? '0 0 15px var(--color-brand-cyan-light)' : 'none',
        transition: 'all var(--transition-normal)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        position: 'relative'
      }}
      onClick={() => {
        if (!disabled) fileInputRef.current?.click();
      }}
    >
      <input
        type="file"
        multiple
        accept={acceptedTypes}
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <UploadCloud
        size={48}
        color={isDragOver ? 'var(--color-brand-cyan)' : 'var(--color-text-muted)'}
        style={{ marginBottom: 'var(--spacing-md)', transition: 'color var(--transition-normal)' }}
      />
      
      {isDragOver ? (
        <h3 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--color-brand-cyan-light)' }}>
          Drop images here
        </h3>
      ) : (
        <>
          <h3 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--color-text-primary)' }}>
            Upload Product Images
          </h3>
          <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Upload clear images of the package label from multiple views.
          </p>
          <p style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
            Accepted: JPG, JPEG, PNG, WEBP &middot; Max {SCAN_LIMITS.MAX_FILE_SIZE_MB} MB per image
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <GlassButton
              variant="primary"
              icon={<ImageIcon size={18} />}
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={disabled}
            >
              Browse Files
            </GlassButton>
            <GlassButton
              variant="secondary"
              icon={<Camera size={18} />}
              onClick={(e) => {
                e.preventDefault();
                cameraInputRef.current?.click();
              }}
              disabled={disabled}
            >
              Take Photo
            </GlassButton>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDropZone;
