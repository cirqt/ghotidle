import React from 'react';

interface MenuBarProps {
  user: { username: string; email: string; is_superuser: boolean } | null;
  onShowInfo: () => void;
  onShowAdmin: () => void;
  onShowAuth: () => void;
  onShowLeaderboard: () => void;
  onLogout: () => void;
}

function MenuBar({ user, onShowInfo, onShowAdmin, onShowAuth, onShowLeaderboard, onLogout }: MenuBarProps) {
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
            <span className="username">{user.username}</span>
            <button className="logout-button" onClick={onLogout}>
              Logout
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
