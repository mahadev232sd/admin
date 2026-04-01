import axios from 'axios';

/**
 * Dev: Vite proxies /api → backend (see vite.config.js) — avoids CORS / Network Error.
 * Prod: set VITE_API_URL to your API base, e.g. https://api.example.com/api
 */
function resolveBaseURL() {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (env && !(import.meta.env.DEV && env.includes('localhost:5000'))) {
    return env;
  }
  if (import.meta.env.DEV) return '/api';
  if (env) return env;
  return 'https://drserver.vercel.app/api';
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('adminToken');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
