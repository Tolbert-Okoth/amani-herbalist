// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change to 5001 if your backend uses that port
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;