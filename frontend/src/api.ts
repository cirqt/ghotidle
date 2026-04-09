declare global {
  interface Window {
    __API_URL__?: string;
  }
}

const API_BASE_URL = window.__API_URL__ || process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default API_BASE_URL;
