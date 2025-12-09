import React from 'react';
import './Keyboard.css';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: Map<string, 'correct' | 'present' | 'absent'>;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, usedLetters }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  const handleClick = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const status = usedLetters.get(key.toLowerCase());
            return (
              <button
                key={key}
                className={`keyboard-key ${status || ''} ${
                  key.length > 1 ? 'keyboard-key-wide' : ''
                }`}
                onClick={() => handleClick(key)}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
