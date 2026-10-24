import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('classsathi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('classsathi_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token on initial load
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('classsathi_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('classsathi_user', JSON.stringify(res.data));
          }
        } catch (err) {
          // If offline / server unreachable, keep existing user session active!
          const saved = localStorage.getItem('classsathi_user');
          if (saved) {
            try {
              setUser(JSON.parse(saved));
            } catch {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('classsathi_token', res.data.token);
      localStorage.setItem('classsathi_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('classsathi_token');
    localStorage.removeItem('classsathi_user');
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('classsathi_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
