import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(USER_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!activeToken) {
      setIsAuthLoading(false);
      return null;
    }

    try {
      const { data } = await api.get('/user/me');
      if (data?.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch {
      clearSession();
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };
    window.addEventListener('codeanova:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('codeanova:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const loginSession = useCallback(({ token: newToken, user: userData }) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthLoading(false);
  }, []);

  const updateUserState = useCallback((updatedUser) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isAuthLoading,
        loginSession,
        updateUserState,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
};

