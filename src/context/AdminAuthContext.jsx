import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(!!localStorage.getItem('adminToken'));

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const t = localStorage.getItem('adminToken');
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      if (data.user?.role !== 'admin') {
        logout();
        return;
      }
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refresh();
  }, [token, refresh]);

  const login = useCallback(async ({ email, password }) => {
    const identifier = String(email ?? '').trim().toLowerCase();
    const { data } = await api.post('/auth/login', {
      identifier,
      password,
    });
    if (data.user?.role !== 'admin') {
      throw new Error('Not an admin account');
    }
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: !!user && user.role === 'admin',
      login,
      logout,
      refresh,
    }),
    [user, token, loading, login, logout, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdminAuth requires provider');
  return v;
}



