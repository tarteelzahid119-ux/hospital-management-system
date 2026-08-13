import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('hms_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (payload) => {
    const res = await authApi.signup(payload);
    const { user: u, token } = res.data.data;
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
