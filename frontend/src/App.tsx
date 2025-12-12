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
  const [error, setError] = useState('');

  const PHONETIC_WORD = 'GHOTI'; // The phonetic spelling shown to user
  const API_URL = 'http://localhost:8000/api/validate/';
  const MAX_WORD_LENGTH = 7;

  const handleKeyPress = async (key: string) => {
    if (key === 'Enter') {
      if (currentGuess.length > 0 && !isLoading && !gameWon) {
        await submitGuess();
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (key.length === 1 && !gameWon && currentGuess.length < MAX_WORD_LENGTH) {
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
      <h1>Ghotidle</h1>
      
      <div className="phonetic-word">
        <p>Decode this phonetic spelling:</p>
        <h2>{PHONETIC_WORD}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="guesses-container">
        {guesses.map((result, index) => (
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
        ))}
      </div>

      {gameWon && (
        <div className="win-message">
          🎉 You won! The answer was "{guesses[guesses.length - 1].guess}"
        </div>
      )}
      
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          value={currentGuess}
          onChange={handleInputChange}
          placeholder={gameWon ? "You won!" : "enter your guess"}
          autoFocus
          disabled={isLoading || gameWon}
        />
      </div>

      <Keyboard onKeyPress={handleKeyPress} />
    </div>
  );
}

export default App;
