import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('byh_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Essayer de rafraichir le token
          tryRefresh();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const tryRefresh = async () => {
    const refreshToken = localStorage.getItem('byh_refresh_token');
    if (!refreshToken) {
      clearAuth();
      return;
    }
    try {
      const res = await api.post('/auth/refresh', { refreshToken });
      localStorage.setItem('byh_token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    } catch {
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('byh_token');
    localStorage.removeItem('byh_refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('byh_token', res.data.token);
    if (res.data.refreshToken) {
      localStorage.setItem('byh_refresh_token', res.data.refreshToken);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('byh_token', res.data.token);
    if (res.data.refreshToken) {
      localStorage.setItem('byh_refresh_token', res.data.refreshToken);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('byh_refresh_token');
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {}
    clearAuth();
  };

  // Intercepteur pour rafraichir le token automatiquement
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      res => res,
      async err => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            await tryRefresh();
            const token = localStorage.getItem('byh_token');
            original.headers['Authorization'] = `Bearer ${token}`;
            return api(original);
          } catch {
            clearAuth();
          }
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
