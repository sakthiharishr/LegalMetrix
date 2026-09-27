import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  BadgeCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ScanLine,
  Scale,
  ShieldCheck,
  Sparkles,
  WifiOff,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const Login = () => {
  const { login, isAuthenticated, sessionExpired, clearSessionExpiredNotice, getRememberedOfficerId } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  // Form input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // UI status states
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthenticating, navigate, from]);

  // Load remembered Officer ID if previously saved
  useEffect(() => {
    const remembered = getRememberedOfficerId();
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, [getRememberedOfficerId]);

  // Client-side validation
  const validateForm = () => {
    const errors = { username: '', password: '' };
    let isValid = true;

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      errors.username = 'Officer ID or official email is required.';
      isValid = false;
    } else if (trimmedUsername.length < 3) {
      errors.username = 'Officer ID must be at least 3 characters.';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required to authenticate.';
      isValid = false;
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);

    // Clear field-specific and general errors on typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (authError) {
      setAuthError('');
    }
    if (sessionExpired) {
      clearSessionExpiredNotice();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    setIsAuthenticating(true);

    try {
      // Authenticate via AuthContext / authService (zero credentials logged)
      await login({
        username: username.trim(),
        password: password,
        rememberMe,
      });

      setIsSuccess(true);
      // Brief delay to display authorized state before navigation
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 400);
    } catch (err) {
      setIsAuthenticating(false);
      const message = err.message || 'Authentication failed. Please verify your officer credentials.';
      setAuthError(message);
    }
  };

  return (
    <div className="login-viewport">
      {/* Background Ambient Layers */}
      <div className="login-ambient-grid" />
      <ThemeToggle style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 2 }} />

      <div className="login-container">
        {/* ====================================================================
            LEFT PANEL: BRANDING, TAGLINE, FEATURE HIGHLIGHTS & SIH BADGE
            ==================================================================== */}
        <div className="login-left-panel">
          {/* Header Branding */}
          <div className="brand-header-area">
            <div className="brand-shield-wrapper">
              <img src="/logo.svg" alt="Legal Metrix Emblem" className="brand-shield-img" />
            </div>

            <div className="sih-badge-pill">
              <Shield size={13} color="var(--color-brand-cyan-light)" />
              <span>SIH 2026 • Problem Statement 26034</span>
            </div>

            <h1 className="brand-title">LEGAL METRIX</h1>
            <p className="brand-subtitle">
              AI-Powered Legal Metrology Compliance &amp; Enforcement Intelligence System
            </p>

            <div className="tagline-badge">
              <span className="tagline-dot" />
              <span className="tagline-text">"Scan. Detect. Verify. Enforce."</span>
            </div>
          </div>

          {/* 3 Core Feature Highlights */}
          <div className="features-container">
            {/* Feature 1 */}
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper cyan">
                <ScanLine size={20} />
              </div>
              <div>
                <h3 className="feature-title">1. AI-Powered Inspection</h3>
                <p className="feature-description">
                  Automated product label and mandatory declaration analysis under PCR 2011.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper blue">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="feature-title">2. Risk-Based Intelligence</h3>
                <p className="feature-description">
                  Prioritize packaged commodities requiring physical inspection and verification.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper green">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="feature-title">3. Evidence-Based Compliance</h3>
                <p className="feature-description">
                  Provide verified evidentiary logs and OCR proof for authorized officer determination.
                </p>
              </div>
            </div>
          </div>

          {/* Department Footer Note */}
          <div className="left-panel-footer">
            <span>Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
            <span className="footer-bullet">•</span>
            <span>Govt. of India</span>
          </div>
        </div>

        {/* ====================================================================
            RIGHT PANEL: GLASSMORPHISM LOGIN CARD
            ==================================================================== */}
        <div className="login-right-panel">
          <GlassCard variant="elevated" className="login-glass-card">
            {/* Session Expired Alert Banner */}
            {sessionExpired && (
              <div className="session-expired-banner animate-fade-in" role="alert">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} />
                  <span>Session expired. Please sign in to resume enforcement access.</span>
                </div>
                <button
                  type="button"
                  onClick={clearSessionExpiredNotice}
                  aria-label="Dismiss message"
                  className="banner-close-btn"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Card Header */}
            <div className="card-header-area">
              <div className="mobile-brand-row">
                <img src="/logo.svg" alt="Legal Metrix" style={{ width: '28px', height: '28px' }} />
                <span style={{ fontWeight: '800', letterSpacing: '0.04em', color: 'var(--text-heading)' }}>
                  LEGAL METRIX
                </span>
              </div>

              <h2 className="card-title">Welcome Back</h2>
              <p className="card-subtitle">
                Authorized Legal Metrology Officer &amp; Enforcement Access Portal
              </p>
            </div>

            {/* Authentication Error Feedback */}
            {authError && (
              <div className="auth-error-banner animate-fade-in" role="alert">
                {authError.toLowerCase().includes('connect') ? (
                  <WifiOff size={18} className="error-icon" />
                ) : (
                  <AlertCircle size={18} className="error-icon" />
                )}
                <div>
                  <div className="error-title">Authentication Failed</div>
                  <div className="error-body">{authError}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="login-form">
              {/* Officer ID / Email Input */}
              <GlassInput
                label="Officer ID / Official Email"
                required
                icon={<BadgeCheck size={16} />}
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={fieldErrors.username}
                disabled={isAuthenticating || isSuccess}
                autoComplete="username"
              />

              {/* Password Input with Visibility Toggle */}
              <GlassInput
                label="Enforcement Password"
                type={showPassword ? 'text' : 'password'}
                required
                icon={<Lock size={16} />}
                placeholder="Enter your enforcement credentials"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={fieldErrors.password}
                disabled={isAuthenticating || isSuccess}
                autoComplete="current-password"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="password-toggle-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                    disabled={isAuthenticating || isSuccess}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Remember Me & Forgot Password Row */}
              <div className="remember-forgot-row">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isAuthenticating || isSuccess}
                    className="remember-checkbox"
                  />
                  <span>Remember Officer ID</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="forgot-password-link"
                  disabled={isAuthenticating || isSuccess}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isAuthenticating}
                disabled={isAuthenticating || isSuccess}
                className="submit-btn"
              >
                {isSuccess ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} /> Officer Authorized
                  </span>
                ) : (
                  'Sign In to Enforcement Portal'
                )}
              </GlassButton>
            </form>

            {/* Security Indicator Footnote */}
            <div className="security-indicator-footer">
              <div className="security-pill">
                <Shield size={12} color="var(--color-brand-cyan)" />
                <span>Secure Government Access</span>
              </div>
              <span className="footer-divider">•</span>
              <div className="security-pill">
                <Lock size={11} color="var(--color-status-compliant)" />
                <span>Session Protected</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* Scoped Styling for Split-Screen Glassmorphic Layout */}
      <style>{`
        .login-viewport {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-navy-950);
          position: relative;
          overflow-x: hidden;
          padding: 2rem 1.5rem;
        }

        .login-ambient-grid {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(at 15% 20%, rgba(6, 182, 212, 0.13) 0px, transparent 45%),
            radial-gradient(at 85% 25%, rgba(37, 99, 235, 0.15) 0px, transparent 45%),
            radial-gradient(at 50% 80%, rgba(var(--surface-rgb), 0.95) 0px, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .login-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 3.5rem;
          max-width: 1200px;
          width: 100%;
          align-items: center;
        }

        /* Left Panel */
        .login-left-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .brand-header-area {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .brand-shield-wrapper {
          width: 62px;
          height: 62px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2));
          border: 1px solid rgba(6, 182, 212, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.25);
        }

        .brand-shield-img {
          width: 36px;
          height: 36px;
        }

        .sih-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.25);
          font-size: 0.72rem;
          color: var(--color-brand-cyan-light);
          font-weight: var(--font-weight-medium);
        }

        .brand-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.05;
          color: var(--text-heading);
          margin: 0;
        }

        .brand-subtitle {
          font-size: 1.05rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
          margin: 0;
          max-width: 520px;
        }

        .tagline-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          background: rgba(var(--tint-rgb), 0.05);
          border: 1px solid var(--glass-border-standard);
          margin-top: 0.25rem;
        }

        .tagline-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-brand-cyan);
          box-shadow: 0 0 6px var(--color-brand-cyan);
        }

        .tagline-text {
          font-size: 0.8rem;
          color: var(--text-heading);
          font-weight: var(--font-weight-semibold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .features-container {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg);
          transition: transform var(--transition-fast), border-color var(--transition-fast);
        }

        .feature-card:hover {
          transform: translateX(4px);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .feature-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-icon-wrapper.cyan {
          background: rgba(6, 182, 212, 0.12);
          color: var(--color-brand-cyan-light);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .feature-icon-wrapper.blue {
          background: rgba(37, 99, 235, 0.14);
          color: var(--color-brand-blue-light);
          border: 1px solid rgba(37, 99, 235, 0.3);
        }

        .feature-icon-wrapper.green {
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-status-compliant);
          border: 1px solid var(--color-status-compliant-border);
        }

        .feature-title {
          font-size: 0.95rem;
          font-weight: var(--font-weight-semibold);
          color: var(--text-heading);
          margin: 0 0 0.2rem 0;
        }

        .feature-description {
          font-size: 0.825rem;
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .left-panel-footer {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          padding-top: 0.5rem;
        }

        .footer-bullet {
          color: rgba(var(--tint-rgb), 0.25);
        }

        /* Right Panel */
        .login-right-panel {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .login-glass-card {
          padding: 2.25rem 2rem !important;
          border-radius: var(--radius-xl) !important;
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(var(--tint-rgb), 0.08) !important;
        }

        .card-header-area {
          margin-bottom: 1.75rem;
        }

        .mobile-brand-row {
          display: none;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.75rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-heading);
          margin: 0;
        }

        .card-subtitle {
          font-size: 0.825rem;
          color: var(--color-text-secondary);
          margin-top: 0.3rem;
          margin-bottom: 0;
          line-height: 1.4;
        }

        .session-expired-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.75rem 0.875rem;
          border-radius: var(--radius-md);
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: var(--text-warning-soft);
          font-size: 0.775rem;
          margin-bottom: 1.25rem;
        }

        .banner-close-btn {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
        }

        .auth-error-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.75rem 0.875rem;
          border-radius: var(--radius-md);
          background: var(--color-status-violation-bg);
          border: 1px solid var(--color-status-violation-border);
          color: var(--text-danger-soft);
          margin-bottom: 1.25rem;
        }

        .error-icon {
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .error-title {
          font-size: 0.8rem;
          font-weight: var(--font-weight-semibold);
          color: var(--text-heading);
        }

        .error-body {
          font-size: 0.75rem;
          margin-top: 0.1rem;
          line-height: 1.35;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .password-toggle-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-xs);
          transition: color var(--transition-fast);
        }

        .password-toggle-btn:hover {
          color: var(--color-text-primary);
        }

        .remember-forgot-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          padding: 0.1rem 0;
        }

        .remember-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          user-select: none;
        }

        .remember-checkbox {
          cursor: pointer;
          accent-color: var(--color-brand-cyan);
          width: 14px;
          height: 14px;
        }

        .forgot-password-link {
          background: transparent;
          border: none;
          color: var(--color-brand-cyan-light);
          font-size: inherit;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color var(--transition-fast);
        }

        .forgot-password-link:hover {
          color: var(--text-heading);
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          margin-top: 0.5rem;
          height: 44px;
        }

        .security-indicator-footer {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--glass-border-standard);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-size: 0.725rem;
          color: var(--color-text-muted);
        }

        .security-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .footer-divider {
          color: rgba(var(--tint-rgb), 0.2);
        }

        /* Responsive Breakpoints */
        @media (max-width: 980px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            max-width: 520px;
          }

          .login-left-panel {
            text-align: center;
            align-items: center;
          }

          .brand-header-area {
            align-items: center;
          }

          .brand-subtitle {
            text-align: center;
          }

          .features-container {
            display: none; /* Collapses feature cards on tablet/mobile to avoid clutter */
          }

          .left-panel-footer {
            display: none;
          }

          .mobile-brand-row {
            display: flex;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .login-viewport {
            padding: 1rem 0.75rem;
          }

          .login-glass-card {
            padding: 1.75rem 1.25rem !important;
          }

          .brand-title {
            font-size: 2.25rem;
          }

          .remember-forgot-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
