/**
 * PrankStar Auth System
 * Integrates with unified DB layer (`lib/db.ts`).
 * Everyone starts from 0 XP upon registration.
 */

import { registerUserInDB, findUserByEmail, getAllUsers, DBUser } from './db';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  provider: 'email' | 'google' | 'github';
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

const AUTH_KEY = 'prankstar_auth_v2';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function getAuthState(): AuthState {
  const user = getCurrentUser();
  return { user, isLoggedIn: !!user };
}

export function loginWithEmail(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const dbUser = findUserByEmail(email);

  if (!dbUser) {
    return { success: false, error: 'No account found with this email. Please create an account first.' };
  }

  if (dbUser.password && dbUser.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const sessionUser: User = {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.displayName,
    avatar: dbUser.avatar,
    provider: dbUser.provider,
    isAdmin: dbUser.isAdmin,
    createdAt: dbUser.createdAt,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

export function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): { success: boolean; error?: string; user?: User } {
  if (!email || !password || !displayName) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  // Check if this user is designated as admin via admin role in email or custom check
  const isAdminUser = email.toLowerCase().startsWith('admin') || email.toLowerCase().includes('admin');

  const dbUser = registerUserInDB({
    email,
    password,
    displayName,
    provider: 'email',
    isAdmin: isAdminUser,
  });

  const sessionUser: User = {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.displayName,
    avatar: dbUser.avatar,
    provider: dbUser.provider,
    isAdmin: dbUser.isAdmin,
    createdAt: dbUser.createdAt,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

export function loginWithGoogle(googleProfile?: { email: string; name: string; picture?: string }): { success: boolean; user: User } {
  const email = googleProfile?.email || `user_${Math.floor(Math.random() * 8999 + 1000)}@gmail.com`;
  const displayName = googleProfile?.name || 'Google User';

  const dbUser = registerUserInDB({
    email,
    displayName,
    avatar: '🌐',
    provider: 'google',
    isAdmin: email.toLowerCase().includes('admin'),
  });

  const sessionUser: User = {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.displayName,
    avatar: dbUser.avatar,
    provider: dbUser.provider,
    isAdmin: dbUser.isAdmin,
    createdAt: dbUser.createdAt,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

export function loginWithGithub(githubProfile?: { email: string; name: string }): { success: boolean; user: User } {
  const email = githubProfile?.email || `dev_${Math.floor(Math.random() * 8999 + 1000)}@github.com`;
  const displayName = githubProfile?.name || 'GitHub Developer';

  const dbUser = registerUserInDB({
    email,
    displayName,
    avatar: '🐙',
    provider: 'github',
    isAdmin: email.toLowerCase().includes('admin'),
  });

  const sessionUser: User = {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.displayName,
    avatar: dbUser.avatar,
    provider: dbUser.provider,
    isAdmin: dbUser.isAdmin,
    createdAt: dbUser.createdAt,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

export function promoteCurrentSessionToAdmin(): User | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  currentUser.isAdmin = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
  }
  return currentUser;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user?.isAdmin;
}
