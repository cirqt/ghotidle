import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to Play</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            <strong>Ghotidle</strong> is a reverse phonetic puzzle game!
          </p>

          <p>
            You'll see an unconventionally spelled word using English phonetic patterns. Your
            goal is to guess the standard spelling.
          </p>

          <div className="example-box">
            <p className="example-title">Example:</p>
            <p>
              Displayed word: <strong>GHOTI</strong>
            </p>
            <p>
              Standard spelling: <strong>FISH</strong>
            </p>
            <ul>
              <li>
                <strong>GH</strong> = "f" (as in "enou<strong>gh</strong>")
              </li>
              <li>
                <strong>O</strong> = "i" (as in "w<strong>o</strong>men")
              </li>
              <li>
                <strong>TI</strong> = "sh" (as in "na<strong>ti</strong>on")
              </li>
            </ul>
          </div>

          <p>
            <strong>Color coding:</strong>
          </p>
          <ul>
            <li>
              <span className="color-demo correct">Green</span> = Correct letter in correct
              position
            </li>
            <li>
              <span className="color-demo present">Yellow</span> = Letter exists but wrong
              position
            </li>
            <li>
              <span className="color-demo absent">Gray</span> = Letter not in word
            </li>
          </ul>

          <p>
            You have <strong>5 attempts</strong> to guess the word. Good luck!
          </p>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
