export interface Word {
  id: number;
  word: string;
  difficulty: number;
  patterns: PhoneticPattern[];
}

export interface PhoneticPattern {
  id: number;
  pattern: string;
  explanation: string;
}

export interface GuessResponse {
  is_correct: boolean;
  is_valid_pattern: boolean;
  feedback: ('correct' | 'present' | 'absent')[];
  message: string;
}

export interface GameState {
  currentWord: Word | null;
  guesses: string[];
  feedback: ('correct' | 'present' | 'absent')[][];
  isGameOver: boolean;
  isWon: boolean;
  maxGuesses: number;
}
