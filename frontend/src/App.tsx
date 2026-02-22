import React, { useState, useEffect } from 'react';
import './App.css';
import AdminModal from './components/AdminModal';
import AuthModal from './components/AuthModal';
import GameOverModal from './components/GameOverModal';
import InfoModal from './components/InfoModal';
import LeaderboardModal from './components/LeaderboardModal';
import UserModal from './components/UserModal';
import MenuBar from './components/MenuBar';
import PasswordResetModal from './components/PasswordResetModal';
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [shareMessage, setShareMessage] = useState('');
  const [user, setUser] = useState<{username: string, email: string, is_superuser: boolean} | null>(null);
  const [phoneticWord, setPhoneticWord] = useState(''); // e.g., "GHOTI"
  const [targetWord, setTargetWord] = useState(''); // The actual answer
  const [phoneticPatterns, setPhoneticPatterns] = useState<Array<{letters: string, sound: string, reference: string}>>([]);
  
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

  // Generate share text with emoji grid
  const generateShareText = (): string => {
    const attemptNumber = guesses.length;
    const emojiGrid = guesses
      .map((result) =>
        result.feedback
          .map((fb) => {
            if (fb.status === 'correct') return '🟩';
            if (fb.status === 'present') return '🟨';
            return '⬜';
          })
          .join('')
      )
      .join('\n');

    return `Ghotidle ${attemptNumber}/${MAX_ATTEMPTS}\n\n${emojiGrid}`;
  };

  // Handle share button click
  const handleShare = async () => {
    try {
      const shareText = generateShareText();
      await navigator.clipboard.writeText(shareText);
      setShareMessage('Copied to clipboard!');
    } catch (err) {
      setShareMessage('Failed to copy');
      console.error('Failed to copy:', err);
    }
  };

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
    if (error || shareMessage) {
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
  }, [error, shareMessage]);

  // Clear error/share message after slide-out animation completes
  useEffect(() => {
    if (!showToast && (error || shareMessage)) {
      const timer = setTimeout(() => {
        setError('');
        setShareMessage('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showToast, error, shareMessage]);

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
        setPhoneticPatterns(data.phonetic_patterns || []); // Store patterns for end-game reveal
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
      <MenuBar
        user={user}
        onShowInfo={() => setShowInfo(true)}
        onShowAdmin={() => setShowAdmin(true)}
        onShowAuth={() => setShowAuth(true)}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowUserProfile={() => setShowUserProfile(true)}
        onLogout={handleLogout}
      />

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      <UserModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        user={user}
      />

      <LeaderboardModal 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
        user={user}
      />

      <GameOverModal
        isOpen={gameLost}
        onClose={() => setGameLost(false)}
        title="Better luck next time!"
        breakdownTitle="How it's spelled:"
        resultClass="lost"
        targetWord={targetWord}
        phoneticWord={phoneticWord}
        phoneticPatterns={phoneticPatterns}
        onShare={handleShare}
      />

      <GameOverModal
        isOpen={gameWon}
        onClose={() => setGameWon(false)}
        title="🎉 You won!"
        breakdownTitle="Here's how it's spelled:"
        resultClass="won"
        targetWord={targetWord}
        phoneticWord={phoneticWord}
        phoneticPatterns={phoneticPatterns}
        onShare={handleShare}
      />

      <AuthModal
        isOpen={showAuth}
        mode={authMode}
        onClose={closeAuthModal}
        onModeChange={(mode) => setAuthMode(mode)}
        onLogin={(username, password) => handleLogin(username, password)}
        onRegister={(username, password, email) => handleRegister(username, email || '', password)}
        onForgotPassword={() => {
          setShowAuth(false);
          setShowPasswordReset(true);
          setResetStep('request');
        }}
      />

      <AdminModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        adminMode={adminMode}
        onSelectMode={(mode) => {
          setAdminMode(mode);
          setAdminError('');
          setAdminSuccess('');
        }}
        adminError={adminError}
        adminSuccess={adminSuccess}
        adminSecret={adminSecret}
        adminPhonetic={adminPhonetic}
        adminSounds={adminSounds}
        onAdminSecretChange={(value) => setAdminSecret(value)}
        onAdminPhoneticChange={(value) => setAdminPhonetic(value)}
        onAdminSoundsChange={(value) => handleSoundsChange(value)}
        onAdminSubmit={handleAdminSubmit}
        onRandomWord={handleRandomWord}
        isLoadingPatterns={isLoadingPatterns}
        suggestedPatterns={suggestedPatterns}
        noChangeSoundIndexes={noChangeSoundIndexes}
        selectedPatterns={selectedPatterns}
        onToggleNoChangeForSound={toggleNoChangeForSound}
        setSelectedPatterns={setSelectedPatterns}
        setNoChangeSoundIndexes={setNoChangeSoundIndexes}
        patternLetters={patternLetters}
        patternSound={patternSound}
        patternReference={patternReference}
        onPatternLettersChange={(value) => setPatternLetters(value)}
        onPatternSoundChange={(value) => setPatternSound(value)}
        onPatternReferenceChange={(value) => setPatternReference(value)}
        onPatternSubmit={handlePatternSubmit}
      />

      <PasswordResetModal
        isOpen={showPasswordReset}
        step={resetStep}
        resetEmail={resetEmail}
        newPassword={newPassword}
        resetMessage={resetMessage}
        resetError={resetError}
        onClose={() => {
          setShowPasswordReset(false);
          setResetMessage('');
          setResetError('');
        }}
        onEmailChange={(value) => setResetEmail(value)}
        onNewPasswordChange={(value) => setNewPassword(value)}
        onRequestSubmit={handlePasswordResetRequest}
        onConfirmSubmit={handlePasswordResetConfirm}
      />

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
      {(error || shareMessage) && (
        <div className={`toast ${showToast ? 'show' : ''} ${shareMessage ? 'success' : ''}`}>
          {error || shareMessage}
        </div>
      )}
      </div>
  );
}

export default App;
