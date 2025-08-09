const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

const TOKEN_KEY = 'token';

export const getToken = (): string | null => {
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string | null) => {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || res.statusText);
  }
  return res.json();
};

// Auth API
export const auth = {
  login: async (data: { email: string; password: string }) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },
  register: async (data: { email: string; password: string }) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },
  logout: () => setToken(null),
};

// Stories API
export const stories = {
  list: () => request('/stories'),
};

// Hooks
import { useEffect, useState } from 'react';

export const useStories = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    stories
      .list()
      .then(setData)
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export const useAuth = () => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handle = async (
    fn: (data: { email: string; password: string }) => Promise<any>,
    data: { email: string; password: string },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(data);
      setTokenState(getToken());
      return res;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    loading,
    error,
    login: (data: { email: string; password: string }) => handle(auth.login, data),
    register: (data: { email: string; password: string }) => handle(auth.register, data),
    logout: () => {
      auth.logout();
      setTokenState(null);
    },
  };
};

export type ApiError = Error;
