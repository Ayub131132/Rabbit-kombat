const BASE_URL = 'http://localhost:5000';

export const api = {
  async post(endpoint, body) {
    const token = localStorage.getItem('jwt_token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return response.json();
  },

  async get(endpoint) {
    const token = localStorage.getItem('jwt_token');
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
    });

    return response.json();
  }
};