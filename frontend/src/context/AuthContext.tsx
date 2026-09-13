/**
 * Authentication Context
 * 
 * Provides authentication state and methods to the entire app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthState } from '../types';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then(user => {
      if (isMounted) {
        setState({ user, isAuthenticated: !!user, isLoading: false, error: null });
      }
    }).catch(() => {
      if (isMounted) {
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    });

    return () => { isMounted = false; };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.login(credentials);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.register(credentials);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.signInWithGoogle();
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.signInWithGithub();
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'GitHub sign-in failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, resetPassword, signInWithGoogle, signInWithGithub, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
