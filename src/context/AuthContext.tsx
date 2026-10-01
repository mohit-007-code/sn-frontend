import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { TOKEN_STORAGE_KEY } from '../api/client';
import { parseApiError } from '../utils/error';
import { useToast } from '../hooks/useToast';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updated: Partial<User>) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await usersApi.getMe();
      setUser(currentUser);
    } catch {
      logout();
    }
  }, [logout]);

  const updateUserLocally = useCallback((updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  }, []);

  // Listen for 401 unauthorized events from API client
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('sn:auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('sn:auth:unauthorized', handleUnauthorized);
    };
  }, [logout, toast]);

  // Initial authentication check on load
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await usersApi.getMe();
        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
          // Pre-cache following & followers
          usersApi.getFollowers(currentUser.id, 1, 50).catch(() => null);
          usersApi.getFollowing(currentUser.id, 1, 50).catch(() => null);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const data = await authApi.login(credentials);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        setToken(data.access_token);

        // Fetch user profile immediately after login
        const currentUser = await usersApi.getMe();
        setUser(currentUser);
        usersApi.getFollowers(currentUser.id, 1, 50).catch(() => null);
        usersApi.getFollowing(currentUser.id, 1, 50).catch(() => null);
        toast.success('Logged in successfully');
      } catch (err) {
        const errorMessage = parseApiError(err);
        toast.error(errorMessage);
        throw err;
      }
    },
    [toast]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        await authApi.register(credentials);
        toast.success('Account created successfully. Please log in.');
      } catch (err) {
        const errorMessage = parseApiError(err);
        toast.error(errorMessage);
        throw err;
      }
    },
    [toast]
  );

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      updateUserLocally,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, updateUserLocally]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
