import React, { useEffect, useState } from 'react';

interface UserStats {
  correct: number;
  wrong: number;
  streak: number;
  win_rate: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { username: string; email: string } | null;
}

function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email change state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Password change state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchUserStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:8000/api/leaderboard/', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.current_user) {
            const totalGames = data.current_user.correct + data.current_user.wrong;
            const winRate = totalGames > 0 ? Math.round((data.current_user.correct / totalGames) * 100) : 0;
            setStats({
              correct: data.current_user.correct,
              wrong: data.current_user.wrong,
              streak: data.current_user.streak,
              win_rate: winRate,
            });
          }
        } else {
          setError('Failed to load stats');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [isOpen, user]);

  // Handle email change
  const handleEmailChange = async () => {
    if (newEmail !== confirmEmail) {
      setEmailError('Emails do not match');
      return;
    }
    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailLoading(true);
    setEmailError('');
    setEmailMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/change-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ new_email: newEmail }),
      });

      if (response.ok) {
        setEmailMessage('Email updated successfully!');
        setIsEditingEmail(false);
        setNewEmail('');
        setConfirmEmail('');
        // Refresh page after 2 seconds to update user data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const data = await response.json();
        setEmailError(data.error || 'Failed to update email');
      }
    } catch (err) {
      setEmailError('Network error');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          current_password: currentPassword,
          new_password: newPassword 
        }),
      });

      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setIsEditingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError('Network error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {loading && <p>Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          
          {user && !loading && (
            <>
              {/* Account Info Section */}
              <div className="account-section">
                <h3>Account Information</h3>
                <div className="account-info-row">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="account-info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>

              {/* Email Change Section */}
              <div className="account-section">
                <div className="section-header">
                  <h3>Change Email</h3>
                  {!isEditingEmail && (
                    <button className="edit-button" onClick={() => setIsEditingEmail(true)}>
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingEmail && (
                  <div className="edit-form">
                    <input
                      type="email"
                      placeholder="New email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="settings-input"
                    />
                    <input
                      type="email"
                      placeholder="Confirm new email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="settings-input"
                    />
                    {emailError && <p className="error-text">{emailError}</p>}
                    {emailMessage && <p className="success-text">{emailMessage}</p>}
                    <div className="button-group">
                      <button 
                        className="save-button" 
                        onClick={handleEmailChange}
                        disabled={emailLoading}
                      >
                        {emailLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        className="cancel-button" 
                        onClick={() => {
                          setIsEditingEmail(false);
                          setNewEmail('');
                          setConfirmEmail('');
                          setEmailError('');
                          setEmailMessage('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              <div className="account-section">
                <div className="section-header">
                  <h3>Change Password</h3>
                  {!isEditingPassword && (
                    <button className="edit-button" onClick={() => setIsEditingPassword(true)}>
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingPassword && (
                  <div className="edit-form">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="settings-input"
                    />
                    <input
                      type="password"
                      placeholder="New password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="settings-input"
                      minLength={6}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="settings-input"
                      minLength={6}
                    />
                    {passwordError && <p className="error-text">{passwordError}</p>}
                    {passwordMessage && <p className="success-text">{passwordMessage}</p>}
                    <div className="button-group">
                      <button 
                        className="save-button" 
                        onClick={handlePasswordChange}
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        className="cancel-button" 
                        onClick={() => {
                          setIsEditingPassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          setPasswordMessage('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics Section */}
              {stats && (
                <div className="account-section">
                  <h3>Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">{stats.correct + stats.wrong}</div>
                      <div className="stat-label">Games</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.correct}</div>
                      <div className="stat-label">Wins</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.wrong}</div>
                      <div className="stat-label">Losses</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.streak}</div>
                      <div className="stat-label">Streak</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.win_rate}%</div>
                      <div className="stat-label">Win Rate</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserModal;
