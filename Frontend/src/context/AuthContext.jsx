import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../api/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response && response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response && response.success && response.data) {
      const { user: userData, token: userToken } = response.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return response;
    }
    throw new Error(response.message || 'Giris yapilamadi.');
  };

  const register = async (userDataInput) => {
    const response = await authService.register(userDataInput);
    if (response && response.success && response.data) {
      const { user: userData, token: userToken } = response.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return response;
    }
    throw new Error(response.message || 'Kayit basarisiz oldu.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth bir AuthProvider icinde kullanilmalidir.');
  }
  return context;
};

export default AuthContext;

