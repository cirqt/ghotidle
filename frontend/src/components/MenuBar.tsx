import React from 'react';

interface MenuBarProps {
  user: { username: string; email: string; is_superuser: boolean } | null;
  onShowInfo: () => void;
  onShowAdmin: () => void;
  onShowAuth: () => void;
  onShowLeaderboard: () => void;
  onShowUserProfile: () => void;
  onLogout: () => void;
}

function MenuBar({ user, onShowInfo, onShowAdmin, onShowAuth, onShowLeaderboard, onShowUserProfile, onLogout }: MenuBarProps) {
  return (
    <header className="menu-bar">
      <div className="menu-left">
        <h1 className="menu-title">Ghotidle</h1>
        <button className="info-icon-button" onClick={onShowInfo} aria-label="How to play">
          ⓘ
        </button>
      </div>
      <div className="menu-right">
        {user?.is_superuser && (
          <button className="admin-button" onClick={onShowAdmin} aria-label="Admin Panel">
            ⚙️ Admin
          </button>
        )}
        <button className="leaderboard-icon-button" onClick={onShowLeaderboard} aria-label="Leaderboard">
          <svg className="leaderboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="14" width="5" height="7" />
            <rect x="9.5" y="8" width="5" height="13" />
            <rect x="16" y="11" width="5" height="10" />
          </svg>
        </button>
        {user ? (
          <div className="user-menu">
            <button className="user-profile-button" onClick={onShowUserProfile} aria-label="View profile">
              <svg className="user-profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </button>
            <button className="logout-button" onClick={onLogout} aria-label="Logout">
              <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <button className="user-icon-button" onClick={onShowAuth} aria-label="Sign in / Sign up">
            <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

export default MenuBar;
