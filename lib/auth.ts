/**
 * PrankStar Auth System
 * Integrates with unified DB layer (`lib/db.ts`).
 * Everyone starts from 0 XP upon registration.
 */

import { registerUserInDB, findUserByEmail, DBUser } from './db';
import { supabase, syncUserToSupabase } from './supabase';

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

function sessionUserFromDB(dbUser: DBUser): User {
  return { id: dbUser.id, email: dbUser.email, displayName: dbUser.displayName, avatar: dbUser.avatar, provider: dbUser.provider, isAdmin: dbUser.isAdmin, createdAt: dbUser.createdAt };
}

function persistSession(user: User): User {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

/** Uses Supabase Auth so the same account works on every device. Legacy
 * browser-only accounts remain available on their original browser. */
export async function loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return { success: false, error: 'Enter your email and password.' };
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (data.user) {
    const metadata = data.user.user_metadata || {};
    const user: User = {
      id: data.user.id, email: data.user.email || normalizedEmail,
      displayName: metadata.display_name || normalizedEmail.split('@')[0], avatar: metadata.avatar || '🎭',
      provider: 'email', isAdmin: false, createdAt: data.user.created_at,
    };
    return { success: true, user: persistSession(user) };
  }

  // One-device migration path for accounts created before real authentication.
  const dbUser = findUserByEmail(normalizedEmail);
  if (dbUser?.password === password) return { success: true, user: persistSession(sessionUserFromDB(dbUser)) };
  return { success: false, error: error?.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : (error?.message || 'Unable to sign in. Please try again.') };
}

/** @deprecated Kept only for callers from older builds. Never creates accounts on login. */
export function loginWithEmailLegacy(email: string, password: string): { success: boolean; error?: string; user?: User } {
  let dbUser = findUserByEmail(email);

  // Legacy local account fallback only; unknown accounts must not be created by login.
  if (!dbUser) {
    return { success: false, error: 'Account not found. Create an account first.' };
  } else if (dbUser.password && dbUser.password !== password) {
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

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  if (!email || !password || !displayName) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail, password,
    options: { data: { display_name: displayName.trim(), avatar: '🎭' } },
  });
  if (error) return { success: false, error: error.message };
  if (!data.user) return { success: false, error: 'Account could not be created. Please try again.' };
  if (!data.session) return { success: false, error: 'Check your email to confirm your account, then sign in.' };
  const dbUser = registerUserInDB({ id: data.user.id, email: normalizedEmail, displayName: displayName.trim(), provider: 'email', isAdmin: false });
  // Keep the public profile synchronized without persisting a password locally.
  void syncUserToSupabase({ ...dbUser, password: undefined });
  return { success: true, user: persistSession(sessionUserFromDB(dbUser)) };
}

export function loginWithGoogle(googleProfile?: { email: string; name: string; picture?: string }): { success: boolean; user: User } {
  const email = googleProfile?.email || `user_${Math.floor(Math.random() * 8999 + 1000)}@gmail.com`;
  const displayName = googleProfile?.name || 'Google User';

  const dbUser = registerUserInDB({
    email,
    displayName,
    avatar: '🌐',
    provider: 'google',
    isAdmin: false,
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
    isAdmin: false,
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
  // Client-side elevation was a privilege-escalation vulnerability. Admin roles
  // must be assigned through the backend and never from a browser session.
  return null;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user?.isAdmin;
}
