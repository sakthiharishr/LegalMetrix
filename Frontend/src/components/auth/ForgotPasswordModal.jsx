import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { authService } from '../../services/authService';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleClose = () => {
    setIdentifier('');
    setError('');
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = identifier.trim();

    if (!trimmed) {
      setError('Please enter your Officer ID or registered email.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await authService.requestPasswordReset({ identifier: trimmed });
      setIsSuccess(true);
      setSuccessMessage(
        res?.message ||
          'If an authorized enforcement account matches these credentials, verification instructions have been dispatched to your official email.'
      );
    } catch (err) {
      setError(err.message || 'Unable to process credential recovery request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Officer Credential Recovery"
      maxWidth="500px"
      footer={
        isSuccess ? (
          <GlassButton variant="primary" onClick={handleClose}>
            Return to Sign In
          </GlassButton>
        ) : (
          <>
            <GlassButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              Dispatch Instructions
            </GlassButton>
          </>
        )
      }
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-status-compliant-bg)',
              border: '1px solid var(--color-status-compliant-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-status-compliant)',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h4
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-heading)',
              marginBottom: '0.5rem',
            }}
          >
            Recovery Request Received
          </h4>

          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '380px',
              margin: '0 auto',
            }}
          >
            {successMessage}
          </p>

          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(var(--tint-rgb), 0.04)',
              border: '1px solid var(--glass-border-standard)',
              fontSize: '0.7rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
            }}
          >
            Note: For urgent enforcement access, contact the Legal Metrology Zonal IT Desk or your Regional Enforcement Directorate.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Enter your official Officer Badge Number or registered departmental email. A secure verification link will be routed to your registered contact channel.
          </p>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-status-violation-bg)',
                border: '1px solid var(--color-status-violation-border)',
                color: 'var(--text-danger-soft)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <GlassInput
            label="Officer ID or Official Email"
            required
            icon={<Mail size={16} />}
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. LM-DEL-2024-049 or officer@delhi.gov.in"
            disabled={isSubmitting}
            autoComplete="username"
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.7rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <ShieldAlert size={15} color="var(--color-brand-cyan-light)" />
            <span>Government portal security protocols protect accounts against unauthorized enumeration.</span>
          </div>
        </form>
      )}
    </GlassModal>
  );
};

export default ForgotPasswordModal;
