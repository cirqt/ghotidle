import React, { useState, useEffect } from 'react';
import './App.css';
import Keyboard from './components/Keyboard';

interface LetterFeedback {
  letter: string;
  status: 'correct' | 'present' | 'absent';
  position: number;
}

interface GuessResult {
  guess: string;
  feedback: LetterFeedback[];
  is_correct: boolean;
  length_match: boolean;
}

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (username: string, password: string, email?: string) => void;
  onForgotPassword?: () => void;
}

// AuthForm component for login/register
function AuthForm({ mode, onSubmit, onForgotPassword }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reset form when mode changes
  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password, email);
    // Clear form after submission
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

function App() {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<{username: string, email: string, is_superuser: boolean} | null>(null);
  const [phoneticWord, setPhoneticWord] = useState(''); // e.g., "GHOTI"
  const [targetWord, setTargetWord] = useState(''); // The actual answer
  
  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetUid, setResetUid] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  
  // Admin form state
  const [adminMode, setAdminMode] = useState<'word' | 'pattern'>('word');
  const [adminSecret, setAdminSecret] = useState('');
  const [adminPhonetic, setAdminPhonetic] = useState('');
  const [adminSounds, setAdminSounds] = useState(''); // e.g., "f-i-sh"
  const [suggestedPatterns, setSuggestedPatterns] = useState<any[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([]);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);
  const [noChangeSoundIndexes, setNoChangeSoundIndexes] = useState<number[]>([]);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  
  // Pattern form state
  const [patternLetters, setPatternLetters] = useState('');
  const [patternSound, setPatternSound] = useState('');
  const [patternReference, setPatternReference] = useState('');

  const API_BASE_URL = 'http://localhost:8000/api';
  const MAX_WORD_LENGTH = 7;
  const MAX_ATTEMPTS = 5;

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me/`, {
          credentials: 'include', // Important: include session cookie
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        // User not logged in, that's ok
      }
    };
    checkAuth();
  }, []);

  // Check for password reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const uid = urlParams.get('uid');
    
    if (token && uid) {
      setResetToken(token);
      setResetUid(uid);
      setResetStep('confirm');
      setShowPasswordReset(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (error) {
      // Small delay to ensure initial render happens before animation starts
      const showTimer = setTimeout(() => {
        setShowToast(true);
      }, 10); // 10ms delay allows CSS transition to work
      
      const hideTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowToast(false);
    }
  }, [error]);

  // Clear error message after slide-out animation completes
  useEffect(() => {
    if (!showToast && error) {
      const timer = setTimeout(() => {
        setError('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showToast, error]);

  // Fetch the daily word on component mount
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/word/`);
        if (!response.ok) {
          throw new Error('Failed to fetch word');
        }
        const data = await response.json();
        // data.phonetic_spelling is "gh,o,ti" - join to create "GHOTI"
        const phonetic = data.phonetic_spelling.split(',').join('').toUpperCase();
        setPhoneticWord(phonetic);
        setTargetWord(data.word); // Store the answer for reveal
      } catch (err) {
        setError('Failed to load word. Make sure the backend is running.');
        console.error('Error fetching word:', err);
      }
    };

    fetchWord();
  }, []);

  // Calculate keyboard letter statuses based on all guesses
  const getKeyboardLetterStatus = (): Record<string, 'correct' | 'present' | 'absent'> => {
    const letterStatus: Record<string, 'correct' | 'present' | 'absent'> = {};
    
    // Priority: correct > present > absent
    guesses.forEach((result) => {
      result.feedback.forEach((feedback) => {
        const letter = feedback.letter.toLowerCase();
        const currentStatus = letterStatus[letter];
        
        // Only update if new status has higher priority
        if (feedback.status === 'correct') {
          letterStatus[letter] = 'correct';
        } else if (feedback.status === 'present' && currentStatus !== 'correct') {
          letterStatus[letter] = 'present';
        } else if (feedback.status === 'absent' && !currentStatus) {
          letterStatus[letter] = 'absent';
        }
      });
    });
    
    return letterStatus;
  };

  const handleKeyPress = async (key: string) => {
    if (key === 'Enter') {
      if (currentGuess.length > 0 && !isLoading && !gameWon && !gameLost) {
        await submitGuess();
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (key.length === 1 && !gameWon && !gameLost && currentGuess.length < MAX_WORD_LENGTH) {
      setCurrentGuess(currentGuess + key);
    }
  };

  const submitGuess = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/validate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: currentGuess }),
      });

      const data = await response.json();

      // Check if backend sent an error message (e.g., invalid word)
      if (!response.ok) {
        setError(data.error || 'Invalid guess');
        setIsLoading(false);
        return;
      }
      const result: GuessResult = {
        guess: currentGuess,
        feedback: data.feedback,
        is_correct: data.is_correct,
        length_match: data.length_match,
      };

      setGuesses([...guesses, result]);
      
      if (data.is_correct) {
        setGameWon(true);
      } else if (guesses.length + 1 >= MAX_ATTEMPTS) {
        setGameLost(true);
      }
      
      setCurrentGuess('');
    } catch (err) {
      // This only happens if backend is actually down or network failure
      setError('Cannot connect to server. Make sure the backend is running.');
      console.error('Error submitting guess:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (value.length <= MAX_WORD_LENGTH) {
      setCurrentGuess(value);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include session cookie
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        closeAuthModal();
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include session cookie
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        closeAuthModal();
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
      console.error('Registration error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include', // Important: include session cookie
      });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const closeAuthModal = () => {
    setShowAuth(false);
    setAuthMode('login');
    setError(''); // Clear any error messages
  };

  const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    
    const length = localPart.length;
    
    // Calculate visible chars (30% of total, minimum 3)
    const visibleCount = Math.max(3, Math.ceil(length * 0.3));
    
    // For short emails, show 1 at start and rest at end
    // For longer emails, distribute more evenly
    const startChars = length <= 6 ? 1 : Math.floor(visibleCount / 2);
    const endChars = visibleCount - startChars;
    
    const start = localPart.slice(0, startChars);
    const end = localPart.slice(-endChars);
    
    return `${start}***${end}@${domain}`;
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetEmail.trim()) {
      setResetError('Email is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.found) {
          const maskedEmail = maskEmail(resetEmail);
          setResetMessage(`Password reset email sent to: ${maskedEmail}`);
        } else {
          setResetError('No account found with that email address.');
        }
        setResetEmail('');
      } else {
        setResetError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setResetError('Network error. Please try again.');
      console.error('Password reset request error:', err);
    }
  };

  const handlePasswordResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!newPassword.trim()) {
      setResetError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          uid: resetUid,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResetMessage(data.message);
        setNewPassword('');
        // Close modal and redirect to login after 2 seconds
        setTimeout(() => {
          setShowPasswordReset(false);
          setResetStep('request');
          setShowAuth(true);
          setAuthMode('login');
        }, 2000);
      } else {
        setResetError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setResetError('Network error. Please try again.');
      console.error('Password reset confirm error:', err);
    }
  };

  const handleSoundsChange = async (sounds: string) => {
    setAdminSounds(sounds);
    
    // Clear suggestions if input is empty
    if (!sounds.trim()) {
      setSuggestedPatterns([]);
      setSelectedPatterns([]);
      setNoChangeSoundIndexes([]);
      return;
    }

    // Fetch pattern suggestions when user types sounds
    setIsLoadingPatterns(true);
    try {
      const response = await fetch(`${API_BASE_URL}/phonetic-patterns/suggest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sounds: sounds.toLowerCase().trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedPatterns(data.suggestions || []);
      }
    } catch (err) {
      console.error('Error fetching pattern suggestions:', err);
    } finally {
      setIsLoadingPatterns(false);
    }
  };

  const handleRandomWord = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/words/random/`);
      if (response.ok) {
        const data = await response.json();
        setAdminSecret(data.word);
        setAdminError('');
      } else {
        setAdminError('Failed to get random word');
      }
    } catch (err) {
      setAdminError('Error fetching random word');
      console.error('Error:', err);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    // Basic validation
    if (!adminSecret.trim() || !adminPhonetic.trim()) {
      setAdminError('Both fields are required');
      return;
    }

    if (adminSecret.length > 50 || adminPhonetic.length > 50) {
      setAdminError('Words must be 50 characters or less');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/words/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          secret: adminSecret.toLowerCase().trim(),
          phonetic: adminPhonetic.toLowerCase().trim(),
          sounds: adminSounds.toLowerCase().trim(),
          pattern_ids: selectedPatterns,
          no_change_indexes: noChangeSoundIndexes,
        }),
      });

      if (response.ok) {
        setAdminSuccess('Word added successfully!');
        setAdminSecret('');
        setAdminPhonetic('');
        setAdminSounds('');
        setSuggestedPatterns([]);
        setSelectedPatterns([]);
        setNoChangeSoundIndexes([]);
        // Close modal after 1.5 seconds
        setTimeout(() => {
          setShowAdmin(false);
          setAdminSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setAdminError(data.error || 'Failed to add word');
      }
    } catch (err) {
      setAdminError('Network error. Please try again.');
      console.error('Admin submit error:', err);
    }
  };

  const toggleNoChangeForSound = (soundIndex: number, patternIds: number[]) => {
    if (noChangeSoundIndexes.includes(soundIndex)) {
      setNoChangeSoundIndexes(noChangeSoundIndexes.filter(index => index !== soundIndex));
      return;
    }

    setNoChangeSoundIndexes([...noChangeSoundIndexes, soundIndex]);

    if (patternIds.length > 0) {
      setSelectedPatterns(selectedPatterns.filter(id => !patternIds.includes(id)));
    }
  };

  const handlePatternSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    // Basic validation
    if (!patternLetters.trim() || !patternSound.trim() || !patternReference.trim()) {
      setAdminError('All fields are required');
      return;
    }

    if (patternLetters.length > 10 || patternSound.length > 10 || patternReference.length > 50) {
      setAdminError('Input too long. Check field limits.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/phonetic-patterns/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          letters: patternLetters.toLowerCase().trim(),
          sound: patternSound.toLowerCase().trim(),
          reference: patternReference.toLowerCase().trim(),
        }),
      });

      if (response.ok) {
        setAdminSuccess('Pattern added successfully!');
        setPatternLetters('');
        setPatternSound('');
        setPatternReference('');
        // Close modal after 1.5 seconds
        setTimeout(() => {
          setShowAdmin(false);
          setAdminSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setAdminError(data.error || 'Failed to add pattern');
      }
    } catch (err) {
      setAdminError('Network error. Please try again.');
      console.error('Pattern submit error:', err);
    }
  };

  return (
    <div className="App">
      <header className="menu-bar">
        <div className="menu-left">
          <h1 className="menu-title">Ghotidle</h1>
          <button className="info-icon-button" onClick={() => setShowInfo(true)} aria-label="How to play">
            ⓘ
          </button>
        </div>
        <div className="menu-right">
          {user?.is_superuser && (
            <button className="admin-button" onClick={() => setShowAdmin(true)} aria-label="Admin Panel">
              ⚙️ Admin
            </button>
          )}
          {user ? (
            <div className="user-menu">
              <span className="username">{user.username}</span>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="user-icon-button" onClick={() => setShowAuth(true)} aria-label="Sign in / Sign up">
              <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>How to Play</h2>
              <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Ghotidle</strong> is a reverse phonetic puzzle game!</p>
              
              <p>You'll see an unconventionally spelled word using English phonetic patterns. Your goal is to guess the standard spelling.</p>
              
              <div className="example-box">
                <p className="example-title">Example:</p>
                <p>Displayed word: <strong>GHOTI</strong></p>
                <p>Standard spelling: <strong>FISH</strong></p>
                <ul>
                  <li><strong>GH</strong> = "f" (as in "enou<strong>gh</strong>")</li>
                  <li><strong>O</strong> = "i" (as in "w<strong>o</strong>men")</li>
                  <li><strong>TI</strong> = "sh" (as in "na<strong>ti</strong>on")</li>
                </ul>
              </div>
              
              <p><strong>Color coding:</strong></p>
              <ul>
                <li><span className="color-demo correct">Green</span> = Correct letter in correct position</li>
                <li><span className="color-demo present">Yellow</span> = Letter exists but wrong position</li>
                <li><span className="color-demo absent">Gray</span> = Letter not in word</li>
              </ul>
              
              <p>You have <strong>5 attempts</strong> to guess the word. Good luck!</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Lost Modal */}
      {gameLost && (
        <div className="modal-overlay" onClick={() => setGameLost(false)}>
          <div className="modal-content game-over-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Better luck next time!</h2>
              <button className="modal-close" onClick={() => setGameLost(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="game-over-label">The word was:</p>
              <div className="revealed-word">{targetWord.toUpperCase()}</div>
              <p className="phonetic-explanation">
                Phonetically: <strong>{phoneticWord}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={closeAuthModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
              <button className="modal-close" onClick={closeAuthModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button 
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              {authMode === 'login' ? (
                <AuthForm 
                  mode="login" 
                  onSubmit={(username, password) => handleLogin(username, password)}
                  onForgotPassword={() => {
                    setShowAuth(false);
                    setShowPasswordReset(true);
                    setResetStep('request');
                  }}
                />
              ) : (
                <AuthForm 
                  mode="register" 
                  onSubmit={(username, password, email) => handleRegister(username, email || '', password)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdmin && (
        <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Panel</h2>
              <button className="modal-close" onClick={() => setShowAdmin(false)}>×</button>
            </div>
            
            {/* Admin Tabs */}
            <div className="admin-tabs">
              <button 
                className={`admin-tab ${adminMode === 'word' ? 'active' : ''}`}
                onClick={() => {
                  setAdminMode('word');
                  setAdminError('');
                  setAdminSuccess('');
                }}
              >
                Add Word
              </button>
              <button 
                className={`admin-tab ${adminMode === 'pattern' ? 'active' : ''}`}
                onClick={() => {
                  setAdminMode('pattern');
                  setAdminError('');
                  setAdminSuccess('');
                }}
              >
                Add Pattern
              </button>
            </div>

            <div className="modal-body">
              {adminError && <div className="error-message">{adminError}</div>}
              {adminSuccess && <div className="success-message">{adminSuccess}</div>}

              {/* Word Form */}
              {adminMode === 'word' && (
                <form className="admin-form" onSubmit={handleAdminSubmit}>
                
                <div className="form-group">
                  <label htmlFor="secret">Standard Spelling</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      id="secret"
                      placeholder="e.g., fish"
                      maxLength={50}
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleRandomWord}
                      className="random-word-button"
                      title="Get random word"
                    >
                      🎲
                    </button>
                  </div>
                  <span className="form-hint">The correct spelling players need to guess</span>
                </div>

                <div className="form-group">
                  <label htmlFor="phonetic">Phonetic Spelling</label>
                  <input
                    type="text"
                    id="phonetic"
                    placeholder="e.g., ghoti"
                    maxLength={50}
                    value={adminPhonetic}
                    onChange={(e) => setAdminPhonetic(e.target.value)}
                  />
                  <span className="form-hint">The unconventional phonetic spelling to display</span>
                </div>

                <div className="form-group">
                  <label htmlFor="sounds">How It Sounds (with hyphens)</label>
                  <input
                    type="text"
                    id="sounds"
                    placeholder="e.g., f-i-sh"
                    maxLength={100}
                    value={adminSounds}
                    onChange={(e) => handleSoundsChange(e.target.value)}
                  />
                  <span className="form-hint">Separate each sound with a hyphen (e.g., "f-i-sh", "n-ay-sh-un")</span>
                </div>

                {/* Pattern Suggestions */}
                {isLoadingPatterns && (
                  <div className="pattern-loading">Finding matching patterns...</div>
                )}
                
                {suggestedPatterns.length > 0 && (
                  <div className="pattern-suggestions">
                    <h3>Suggested Phonetic Patterns:</h3>
                    {suggestedPatterns.map((sound, soundIndex) => (
                      <div key={soundIndex} className="sound-group">
                        <h4>Sound: "{sound.sound}"</h4>
                        <div className="pattern-options">
                          <label className="pattern-option no-change-option">
                            <input
                              type="checkbox"
                              checked={noChangeSoundIndexes.includes(soundIndex)}
                              onChange={() => toggleNoChangeForSound(
                                soundIndex,
                                sound.patterns.map((pattern: any) => pattern.id)
                              )}
                            />
                            <span className="pattern-letters">✓</span>
                            <span className="pattern-sound">Keep as-is</span>
                            <span className="pattern-reference">(no replacement for this sound)</span>
                          </label>

                          {sound.patterns.length > 0 ? (
                            sound.patterns.map((pattern: any) => (
                              <label key={pattern.id} className="pattern-option">
                                <input
                                  type="checkbox"
                                  checked={selectedPatterns.includes(pattern.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPatterns([...selectedPatterns, pattern.id]);
                                      setNoChangeSoundIndexes(
                                        noChangeSoundIndexes.filter(index => index !== soundIndex)
                                      );
                                    } else {
                                      setSelectedPatterns(selectedPatterns.filter(id => id !== pattern.id));
                                    }
                                  }}
                                />
                                <span className="pattern-letters">{pattern.letters}</span>
                                <span className="pattern-arrow">→</span>
                                <span className="pattern-sound">{pattern.sound}</span>
                                <span className="pattern-reference">(from "{pattern.reference}")</span>
                              </label>
                            ))
                          ) : (
                            <p className="no-patterns">No patterns found for "{sound.sound}". You may need to add this pattern first.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="submit-button">
                  Add Word
                </button>
              </form>
              )}

              {/* Pattern Form */}
              {adminMode === 'pattern' && (
                <form className="admin-form" onSubmit={handlePatternSubmit}>
                  <div className="form-group">
                    <label htmlFor="pattern-letters">Letter Combination</label>
                    <input
                      type="text"
                      id="pattern-letters"
                      placeholder="e.g., ti, gh, ph"
                      maxLength={10}
                      value={patternLetters}
                      onChange={(e) => setPatternLetters(e.target.value)}
                    />
                    <span className="form-hint">The letters that make the sound (max 10 chars)</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="pattern-sound">Sound It Makes</label>
                    <input
                      type="text"
                      id="pattern-sound"
                      placeholder="e.g., sh, f, i"
                      maxLength={10}
                      value={patternSound}
                      onChange={(e) => setPatternSound(e.target.value)}
                    />
                    <span className="form-hint">The phonetic sound produced (max 10 chars)</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="pattern-reference">Reference Word</label>
                    <input
                      type="text"
                      id="pattern-reference"
                      placeholder="e.g., nation, enough, women"
                      maxLength={50}
                      value={patternReference}
                      onChange={(e) => setPatternReference(e.target.value)}
                    />
                    <span className="form-hint">An example word where this pattern appears</span>
                  </div>

                  <div className="pattern-example">
                    <strong>Example:</strong> In "nation", the letters "ti" make the sound "sh"
                  </div>

                  <button type="submit" className="submit-button">
                    Add Pattern
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="modal-overlay" onClick={() => setShowPasswordReset(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{resetStep === 'request' ? 'Reset Password' : 'Set New Password'}</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowPasswordReset(false);
                  setResetMessage('');
                  setResetError('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {resetMessage && <div className="success-message">{resetMessage}</div>}
              {resetError && <div className="error-message">{resetError}</div>}
              
              {resetStep === 'request' ? (
                <form onSubmit={handlePasswordResetRequest}>
                  <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
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
                <form onSubmit={handlePasswordResetConfirm}>
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
      )}

      <div className="game-content">
        <div className="phonetic-word">
          <p>todays phonetic speeling:</p>
          <h2>{phoneticWord || 'Loading...'}</h2>
        </div>

        <div className="guesses-container">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => {
            const result = guesses[index];
            if (result) {
              // Show actual guess
              return (
                <div key={index} className="guess-row">
                  <div className="guess-letters">
                    {result.guess.split('').map((letter, letterIndex) => {
                      const feedback = result.feedback[letterIndex];
                      return (
                        <div
                          key={letterIndex}
                          className={`guess-letter ${feedback.status}`}
                        >
                          {letter.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                  <div className="guess-info">
                    {result.length_match ? (
                      <span className="length-match">✓ Correct length</span>
                    ) : (
                      <span className="length-mismatch">✗ Wrong length</span>
                    )}
                  </div>
                </div>
              );
            } else {
              // Show empty slot
              return (
                <div key={index} className="guess-row empty">
                  <div className="guess-letters">
                    <div className="guess-letter empty"></div>
                  </div>
                  <div className="guess-info"></div>
                </div>
              );
            }
          })}
        </div>
      
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            value={currentGuess}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleKeyPress('Enter');
              }
            }}
            placeholder={gameWon ? "You won!" : gameLost ? "Game over!" : "enter your guess"}
            autoFocus
            disabled={isLoading || gameWon || gameLost}
          />
        </div>

        <Keyboard 
          onKeyPress={handleKeyPress} 
          letterStatuses={getKeyboardLetterStatus()} 
        />
      </div>

      {/* Toast notification */}
      {error && (
        <div className={`toast ${showToast ? 'show' : ''}`}>
          {error}
        </div>
      )}
      </div>
  );
}

export default App;
