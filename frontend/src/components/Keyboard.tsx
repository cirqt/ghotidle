import React from 'react';
import './Keyboard.css';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses?: Record<string, 'correct' | 'present' | 'absent'>;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, letterStatuses = {} }) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
  ];

  const getKeyClass = (key: string) => {
    const baseClass = `keyboard-key ${key.length > 1 ? 'special' : ''}`;
    const status = letterStatuses[key.toLowerCase()];
    return status ? `${baseClass} ${status}` : baseClass;
  };

  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => onKeyPress(key)}
            >
              {key === 'Backspace' ? '⌫' : key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
