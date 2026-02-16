import React, { useEffect, useState } from 'react';
import './AuthForm.css';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (username: string, password: string, email?: string) => void;
  onForgotPassword?: () => void;
}

function AuthForm({ mode, onSubmit, onForgotPassword }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password, email);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      {mode === 'register' && (
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="submit-button">
        {mode === 'login' ? 'Login' : 'Register'}
      </button>

      {mode === 'login' && onForgotPassword && (
        <button
          type="button"
          className="forgot-password-link"
          onClick={onForgotPassword}
        >
          Forgot Password?
        </button>
      )}
    </form>
  );
}

export default AuthForm;
