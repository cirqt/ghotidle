import React from 'react';

interface PasswordResetModalProps {
  isOpen: boolean;
  step: 'request' | 'confirm';
  resetEmail: string;
  newPassword: string;
  resetMessage: string;
  resetError: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onRequestSubmit: (event: React.FormEvent) => void;
  onConfirmSubmit: (event: React.FormEvent) => void;
}

function PasswordResetModal({
  isOpen,
  step,
  resetEmail,
  newPassword,
  resetMessage,
  resetError,
  onClose,
  onEmailChange,
  onNewPasswordChange,
  onRequestSubmit,
  onConfirmSubmit,
}: PasswordResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'request' ? 'Reset Password' : 'Set New Password'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {resetMessage && <div className="success-message">{resetMessage}</div>}
          {resetError && <div className="error-message">{resetError}</div>}

          {step === 'request' ? (
            <form onSubmit={onRequestSubmit}>
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="submit-button">
                Send Reset Link
              </button>
              <p style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                We'll send you a link to reset your password.
              </p>
            </form>
          ) : (
            <form onSubmit={onConfirmSubmit}>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <button type="submit" className="submit-button">
                Reset Password
              </button>
              <p style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                Password must be at least 6 characters long.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default PasswordResetModal;
