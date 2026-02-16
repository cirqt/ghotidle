import React from 'react';

interface PhoneticPattern {
  letters: string;
  sound: string;
  reference: string;
}

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  breakdownTitle: string;
  resultClass: 'won' | 'lost';
  targetWord: string;
  phoneticWord: string;
  phoneticPatterns: PhoneticPattern[];
}

function GameOverModal({
  isOpen,
  onClose,
  title,
  breakdownTitle,
  resultClass,
  targetWord,
  phoneticWord,
  phoneticPatterns,
}: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-over-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="game-over-label">The word was:</p>
          <div className={`revealed-word ${resultClass}`}>{targetWord.toUpperCase()}</div>
          <p className="phonetic-explanation">
            Phonetically: <strong>{phoneticWord}</strong>
          </p>

          {phoneticPatterns.length > 0 && (
            <div className="phonetic-breakdown">
              <h3>{breakdownTitle}</h3>
              {phoneticPatterns.map((pattern, idx) => (
                <div key={idx} className="phonetic-pattern-row">
                  <span className="pattern-letters">{pattern.letters.toUpperCase()}</span>
                  <span className="pattern-arrow">→</span>
                  <span className="pattern-sound">"{pattern.sound}"</span>
                  <span className="pattern-reference">
                    (from <em>{pattern.reference}</em>)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
