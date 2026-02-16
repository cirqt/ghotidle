import React from 'react';
import AuthForm from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, email?: string) => void;
  onForgotPassword: () => void;
}

function AuthModal({
  isOpen,
  mode,
  onClose,
  onModeChange,
  onLogin,
  onRegister,
  onForgotPassword,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => onModeChange('login')}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => onModeChange('register')}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <AuthForm mode="login" onSubmit={(username, password) => onLogin(username, password)} onForgotPassword={onForgotPassword} />
          ) : (
            <AuthForm
              mode="register"
              onSubmit={(username, password, email) => onRegister(username, password, email)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
