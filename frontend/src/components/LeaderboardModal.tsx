import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  correct: number;
  wrong: number;
  streak: number;
}

interface LeaderboardData {
  top_5: LeaderboardEntry[];
  current_user: LeaderboardEntry | null;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { username: string } | null;
}

function LeaderboardModal({ isOpen, onClose, user }: LeaderboardModalProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:8000/api/leaderboard/', {
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Failed to load leaderboard');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 Leaderboard</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {loading && <p>Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          
          {data && !loading && (
            <>
              {/* Current user stats */}
              {user && data.current_user && (
                <div className="user-stats-section">
                  <h3>Your Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">{data.current_user.correct + data.current_user.wrong}</div>
                      <div className="stat-label">Games</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{data.current_user.correct}</div>
                      <div className="stat-label">Wins</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{data.current_user.streak}</div>
                      <div className="stat-label">Streak</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top 5 */}
              <div className="top-players-section">
                <h3>Top Players</h3>
                {data.top_5.length === 0 ? (
                  <p className="empty-message">No players yet. Be the first!</p>
                ) : (
                  <>
                    <div className="leaderboard-header">
                      <div className="rank-header">#</div>
                      <div className="username-header">Player</div>
                      <div className="stats-header">
                        <span className="wins-header" title="Correct guesses">W</span>
                        <span className="losses-header" title="Wrong guesses">L</span>
                        <span className="streak-header" title="Daily streak">🔥</span>
                      </div>
                    </div>
                    <div className="leaderboard-list">
                      {data.top_5.map((entry) => (
                        <div 
                          key={entry.rank} 
                          className={`leaderboard-entry ${entry.username === user?.username ? 'current-user' : ''}`}
                        >
                          <div className="rank">#{entry.rank}</div>
                          <div className="username">{entry.username}</div>
                          <div className="stats">
                            <span className="wins">{entry.correct}</span>
                            <span className="losses">{entry.wrong}</span>
                            <span className="streak">{entry.streak}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Current user position if outside top 5 */}
              {user && data.current_user && data.current_user.rank > 5 && (
                <div className="user-position-section">
                  <div className="divider">...</div>
                  <div className="leaderboard-entry current-user">
                    <div className="rank">#{data.current_user.rank}</div>
                    <div className="username">{data.current_user.username}</div>
                    <div className="stats">
                      <span className="wins">{data.current_user.correct}</span>
                      <span className="losses">{data.current_user.wrong}</span>
                      <span className="streak">{data.current_user.streak}</span>
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

export default LeaderboardModal;
