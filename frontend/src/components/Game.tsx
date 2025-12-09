import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { GameState } from '../types';
import Board from './Board';
import Keyboard from './Keyboard';
import './Game.css';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    guesses: [],
    feedback: [],
    isGameOver: false,
    isWon: false,
    maxGuesses: 6,
  });
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedLetters, setUsedLetters] = useState<Map<string, 'correct' | 'present' | 'absent'>>(
    new Map()
  );

  const loadNewWord = useCallback(async () => {
    try {
      setLoading(true);
      const word = await api.getRandomWord();
      setGameState({
        currentWord: word,
        guesses: [],
        feedback: [],
        isGameOver: false,
        isWon: false,
        maxGuesses: 6,
      });
      setCurrentGuess('');
      setMessage('Guess the word! (Hint: It might be spelled unusually)');
      setUsedLetters(new Map());
    } catch (error) {
      setMessage('Error loading word. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewWord();
  }, [loadNewWord]);

  const handleGuess = useCallback(async () => {
    if (!gameState.currentWord || gameState.isGameOver) return;
    
    const guess = currentGuess.toLowerCase().trim();
    if (guess.length !== gameState.currentWord.word.length) {
      setMessage(`Word must be ${gameState.currentWord.word.length} letters long`);
      return;
    }

    try {
      setLoading(true);
      const response = await api.validateGuess(guess, gameState.currentWord.id);
      
      const newGuesses = [...gameState.guesses, guess];
      const newFeedback = [...gameState.feedback, response.feedback];
      
      // Update used letters
      const newUsedLetters = new Map(usedLetters);
      guess.split('').forEach((letter, index) => {
        const status = response.feedback[index];
        const currentStatus = newUsedLetters.get(letter);
        
        // Only update if the new status is "better" than the current one
        if (
          !currentStatus ||
          (status === 'correct') ||
          (status === 'present' && currentStatus === 'absent')
        ) {
          newUsedLetters.set(letter, status);
        }
      });
      setUsedLetters(newUsedLetters);

      const isWon = response.is_correct;
      const isGameOver = isWon || newGuesses.length >= gameState.maxGuesses;

      setGameState({
        ...gameState,
        guesses: newGuesses,
        feedback: newFeedback,
        isGameOver,
        isWon,
      });

      if (isWon) {
        setMessage(`Congratulations! The word was "${gameState.currentWord.word}"`);
      } else if (isGameOver) {
        setMessage(`Game Over! The word was "${gameState.currentWord.word}"`);
      } else {
        setMessage(response.message);
      }

      setCurrentGuess('');
    } catch (error) {
      setMessage('Error validating guess. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [gameState, currentGuess, usedLetters]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.isGameOver || loading) return;

    if (key === 'ENTER') {
      handleGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      if (gameState.currentWord && currentGuess.length < gameState.currentWord.word.length) {
        setCurrentGuess((prev) => prev + key.toLowerCase());
      }
    }
  }, [gameState.isGameOver, gameState.currentWord, loading, currentGuess.length, handleGuess]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (event.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  if (!gameState.currentWord && !message.includes('Error')) {
    return <div className="game loading">Loading...</div>;
  }

  return (
    <div className="game">
      <header className="game-header">
        <h1>Ghotidle</h1>
        <p className="game-subtitle">Wordle but for phonetics</p>
      </header>

      {message && <div className="game-message">{message}</div>}

      {gameState.currentWord && (
        <>
          <Board
            guesses={gameState.guesses}
            feedback={gameState.feedback}
            currentGuess={currentGuess}
            maxGuesses={gameState.maxGuesses}
            wordLength={gameState.currentWord.word.length}
          />

          <Keyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />

          {gameState.isGameOver && (
            <div className="game-controls">
              <button className="new-game-button" onClick={loadNewWord}>
                New Game
              </button>
              {gameState.currentWord.patterns.length > 0 && (
                <div className="patterns-info">
                  <h3>Alternative spellings:</h3>
                  {gameState.currentWord.patterns.map((pattern) => (
                    <div key={pattern.id} className="pattern-item">
                      <strong>{pattern.pattern}</strong> - {pattern.explanation}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Game;
