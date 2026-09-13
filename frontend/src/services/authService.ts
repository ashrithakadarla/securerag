/**
 * Authentication Service
 * 
 * Currently uses mock/local authentication.
 * 
 * TODO: Replace mock implementation with Firebase Authentication
 * - Import and initialize Firebase Auth
 * - Replace login() with signInWithEmailAndPassword()
 * - Replace register() with createUserWithEmailAndPassword()
 * - Replace logout() with signOut()
 * - Replace getCurrentUser() with onAuthStateChanged()
 * - Replace resetPassword() with sendPasswordResetEmail()
 */

import { User, LoginCredentials, RegisterCredentials } from '../types';
import { mockUser } from '../data/mockUsers';

const AUTH_KEY = 'securerag_auth';
const USER_KEY = 'securerag_user';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  /**
   * Login with email and password
   * TODO: Replace with Firebase signInWithEmailAndPassword
   */
  async login(credentials: LoginCredentials): Promise<User> {
    await delay(1200);

    if (credentials.email === 'demo@securerag.io' && credentials.password === 'password123') {
      const user = { ...mockUser, email: credentials.email };
      if (credentials.rememberMe) {
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return user;
    }

    // Accept any email/password for demo (except wrong password patterns)
    if (credentials.password.length < 6) {
      throw new Error('Invalid email or password.');
    }

    const user: User = {
      ...mockUser,
      email: credentials.email,
      fullName: credentials.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    };

    if (credentials.rememberMe) {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return user;
  },

  /**
   * Register a new user
   * TODO: Replace with Firebase createUserWithEmailAndPassword
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    await delay(1500);

    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    if (credentials.password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      fullName: credentials.fullName,
      email: credentials.email,
      role: 'analyst',
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Logout the current user
   * TODO: Replace with Firebase signOut
   */
  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  /**
   * Get the currently authenticated user
   * TODO: Replace with Firebase onAuthStateChanged
   */
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  },

  /**
   * Check if a user is authenticated
   * TODO: Replace with Firebase auth state check
   */
  isAuthenticated(): boolean {
    return !!(localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY));
  },

  /**
   * Send password reset email
   * TODO: Replace with Firebase sendPasswordResetEmail
   */
  async resetPassword(email: string): Promise<void> {
    await delay(1000);
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    // Mock: always succeeds
  },

  /**
   * Sign in with Google
   * TODO: Replace with Firebase GoogleAuthProvider
   */
  async signInWithGoogle(): Promise<User> {
    await delay(1000);
    const user = { ...mockUser, fullName: 'Google User', email: 'google.user@gmail.com' };
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Sign in with GitHub
   * TODO: Replace with Firebase GithubAuthProvider
   */
  async signInWithGithub(): Promise<User> {
    await delay(1000);
    const user = { ...mockUser, fullName: 'GitHub User', email: 'github.user@github.com' };
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },
};
