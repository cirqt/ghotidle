import { Word, GuessResponse } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  async getRandomWord(): Promise<Word> {
    const response = await fetch(`${API_BASE_URL}/word/random/`);
    if (!response.ok) {
      throw new Error('Failed to fetch word');
    }
    return response.json();
  },

  async validateGuess(guess: string, wordId: number): Promise<GuessResponse> {
    const response = await fetch(`${API_BASE_URL}/validate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guess,
        word_id: wordId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate guess');
    }
    return response.json();
  },
};
