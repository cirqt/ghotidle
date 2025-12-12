import React, { useState } from 'react';
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
  const [showInfo, setShowInfo] = useState(false);

  const PHONETIC_WORD = 'GHOTI'; // The phonetic spelling shown to user
  const API_URL = 'http://localhost:8000/api/validate/';
  const MAX_WORD_LENGTH = 7;
  const MAX_ATTEMPTS = 5;

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: currentGuess }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate guess');
      }

      const data = await response.json();
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
      setError('Failed to submit guess. Make sure the backend is running.');
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
          <h2>{PHONETIC_WORD}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

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

        <Keyboard onKeyPress={handleKeyPress} />
      </div>
    </div>
  );
}

export default App;
