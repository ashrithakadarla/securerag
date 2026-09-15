import { User, LoginCredentials, RegisterCredentials } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'securerag_access_token';
const USER_KEY = 'securerag_user';

interface BackendUser {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function mapUser(user: BackendUser): User {
  const displayName = user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
  return {
    id: String(user.id),
    fullName: displayName,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) return 'Invalid email or password.';
  if (response.status === 400) return 'This request could not be completed. Check your details and try again.';
  if (response.status === 422) return 'Please check your email and password and try again.';
  if (response.status === 403) return 'This account is not active.';
  return 'Authentication request failed. Please try again.';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function fetchCurrentUser(token: string): Promise<User> {
  const backendUser = await request<BackendUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapUser(backendUser);
}

function storeAuth(token: string, user: User, rememberMe: boolean): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });

    try {
      const user = await fetchCurrentUser(response.access_token);
      storeAuth(response.access_token, user, credentials.rememberMe === true);
      return user;
    } catch (error) {
      clearStoredAuth();
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    await request<BackendUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });

    return this.login({ email: credentials.email, password: credentials.password, rememberMe: false });
  },

  async logout(): Promise<void> {
    clearStoredAuth();
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;

    try {
      const user = await fetchCurrentUser(token);
      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password.') {
        clearStoredAuth();
        return null;
      }
      throw error;
    }
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },

  /**
   * Send password reset email
   * TODO: Replace with Firebase sendPasswordResetEmail
   */
  async resetPassword(email: string): Promise<void> {
    void email;
    throw new Error('Password reset is not available yet.');
  },

  /**
   * Sign in with Google
   * TODO: Replace with Firebase GoogleAuthProvider
   */
  async signInWithGoogle(): Promise<User> {
    throw new Error('Google sign-in is not available yet.');
  },

  /**
   * Sign in with GitHub
   * TODO: Replace with Firebase GithubAuthProvider
   */
  async signInWithGithub(): Promise<User> {
    throw new Error('GitHub sign-in is not available yet.');
  },
};
