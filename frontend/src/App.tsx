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

function App() {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [phoneticWord, setPhoneticWord] = useState(''); // e.g., "GHOTI"
  const [targetLength, setTargetLength] = useState(0);

  const API_BASE_URL = 'http://localhost:8000/api';
  const MAX_WORD_LENGTH = 7;
  const MAX_ATTEMPTS = 5;

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
        setTargetLength(data.length);
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
          <button className="user-icon-button" aria-label="Sign in / Sign up">
            <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
          </button>
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
              
              <p>You have unlimited guesses. Good luck!</p>
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
