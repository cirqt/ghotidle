import React from 'react';
import './Game.css';

const Game: React.FC = () => {
  return (
    <div className="game">
      <header className="game-header">
        <h1>Ghotidle</h1>
        <p className="game-subtitle">Wordle but for phonetics</p>
      </header>

      <div className="game-message">Start guessing!</div>

      {/* TODO: Implement game logic */}
    </div>
  );
};

export default Game;
