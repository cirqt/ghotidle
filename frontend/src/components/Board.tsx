import React from 'react';
import './Board.css';

interface BoardProps {
  guesses: string[];
  feedback: ('correct' | 'present' | 'absent')[][];
  currentGuess: string;
  maxGuesses: number;
  wordLength: number;
}

const Board: React.FC<BoardProps> = ({ guesses, feedback, currentGuess, maxGuesses, wordLength }) => {
  const rows = Array.from({ length: maxGuesses }, (_, i) => {
    if (i < guesses.length) {
      // Completed guess
      return {
        letters: guesses[i].padEnd(wordLength, ' ').split(''),
        feedback: feedback[i] || [],
      };
    } else if (i === guesses.length) {
      // Current guess being typed
      return {
        letters: currentGuess.padEnd(wordLength, ' ').split(''),
        feedback: [],
      };
    } else {
      // Empty row
      return {
        letters: Array(wordLength).fill(' '),
        feedback: [],
      };
    }
  });

  return (
    <div className="board">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.letters.map((letter, letterIndex) => (
            <div
              key={letterIndex}
              className={`board-cell ${row.feedback[letterIndex] || ''}`}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
