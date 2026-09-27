import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { GlassButton } from './GlassButton';

/**
 * Reusable GlassModal Component
 * Implements accessible native <dialog> with light-dismiss and keyboard Escape support
 */
export const GlassModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '540px',
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle native cancel (Escape key)
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  // Handle light-dismiss: click outside dialog content
  const handleClickOutside = (e) => {
    const dialog = dialogRef.current;
    if (e.target === dialog) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClickOutside}
      aria-labelledby="glass-modal-title"
      className="glass-modal"
      style={{
        margin: 'auto',
        maxWidth,
        width: '90%',
        padding: 0,
        backgroundColor: 'rgba(var(--surface-rgb), 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(var(--tint-rgb), 0.12)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--glass-shadow-lg), 0 0 40px rgba(0, 0, 0, 0.7)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border-standard)',
          }}
        >
          <h3
            id="glass-modal-title"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="glass-btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.375rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid var(--glass-border-standard)',
              background: 'rgba(var(--shade-rgb), calc(0.2 * var(--shade-k)))',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        dialog::backdrop {
          background: rgba(var(--surface-rgb), 0.78);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
    </dialog>
  );
};

export default GlassModal;
