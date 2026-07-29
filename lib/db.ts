/**
 * PrankStar Unified Central Database
 * Persistent database for real users, published pranks, real-time leaderboard, XP, and badges.
 * Everyone starts from 0 XP upon registration and syncs directly to Supabase!
 */

import { syncUserToSupabase, syncPrankToSupabase, deleteUserFromSupabase } from './supabase';

export interface DBUser {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  provider: 'email' | 'google' | 'github';
  password?: string;
  isAdmin: boolean;
  xp: number;
  level: number;
  pranksLaunched: number;
  pranksPublished: number;
  badges: string[]; // Badge IDs
  createdAt: string;
  lastLogin: string;
}

export interface PublishedPrank {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  os: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  duration: number;
  thumbnail: string;
  soundFx: string;
  customImageUrl?: string;
  customAudioUrl?: string;
  revealMessage: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  views: number;
  likes: number;
  shares: number;
  createdAt: string;
  status: 'published' | 'pending';
}

const DB_USERS_KEY = 'prankstar_users_db_v2';
const DB_PRANKS_KEY = 'prankstar_custom_pranks_v2';

function getRawUsers(): DBUser[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DB_USERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as DBUser[];
  } catch {
    return [];
  }
}

export function saveUsersDB(users: DBUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
}

export function getAllUsers(): DBUser[] {
  return getRawUsers();
}

export function findUserByEmail(email: string): DBUser | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Register User & Immediately Push to Supabase Table `users`
 */
export function registerUserInDB(data: {
  id?: string;
  email: string;
  displayName: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  password?: string;
  isAdmin?: boolean;
}): DBUser {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  
  if (existing) {
    // Push update to Supabase
    syncUserToSupabase(existing);
    return existing;
  }

  const avatars = ['😎', '🎭', '🤡', '👻', '🦊', '🐱', '🚀', '⚡', '🔥', '💜'];
  const newUser: DBUser = {
    id: data.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: data.email,
    displayName: data.displayName,
    avatar: data.avatar || avatars[Math.floor(Math.random() * avatars.length)],
    provider: data.provider,
    password: data.password,
    // Privileges must be assigned by a trusted server/admin workflow, never by an email string.
    isAdmin: data.isAdmin === true,
    xp: 0, // Everyone starts from 0 XP!
    level: 1,
    pranksLaunched: 0,
    pranksPublished: 0,
    badges: [],
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsersDB(users);

  // Sync directly to Supabase `users` table
  syncUserToSupabase(newUser);

  return newUser;
}

export function updateUserXPInDB(userId: string, xpDelta: number): DBUser | null {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].xp = Math.max(0, users[idx].xp + xpDelta);
  users[idx].level = Math.floor(users[idx].xp / 100) + 1;
  saveUsersDB(users);

  // Sync update to Supabase
  syncUserToSupabase(users[idx]);

  return users[idx];
}

export function updateUserStatsInDB(userId: string, updates: Partial<DBUser>): DBUser | null {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveUsersDB(users);

  // Sync update to Supabase
  syncUserToSupabase(users[idx]);

  return users[idx];
}

/**
 * Real-time Leaderboard sorted by actual user XP (starts at 0)
 */
export function getRealLeaderboard(): DBUser[] {
  const users = getAllUsers();
  return users.filter((u) => !u.isAdmin).sort((a, b) => b.xp - a.xp);
}

/**
 * Global Published Pranks Management & Sync to Supabase Table `published_pranks`
 */
export function getPublishedPranks(): PublishedPrank[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DB_PRANKS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as PublishedPrank[];
  } catch {
    return [];
  }
}

export function savePublishedPranks(pranks: PublishedPrank[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_PRANKS_KEY, JSON.stringify(pranks));
}

export function publishPrankToDB(prankData: Omit<PublishedPrank, 'id' | 'createdAt' | 'views' | 'likes' | 'shares' | 'status'>): PublishedPrank {
  const pranks = getPublishedPranks();
  const newPrank: PublishedPrank = {
    ...prankData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prk_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    views: 0,
    likes: 0,
    shares: 0,
    status: 'published',
    createdAt: new Date().toISOString(),
  };

  pranks.unshift(newPrank);
  savePublishedPranks(pranks);

  // Reward user with +50 XP for publishing a prank
  updateUserXPInDB(prankData.authorId, 50);

  // Sync prank to Supabase `published_pranks` table
  syncPrankToSupabase(newPrank);

  return newPrank;
}

export function makeUserAdmin(userId: string): DBUser | null {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].isAdmin = true;
  saveUsersDB(users);

  // Sync with Supabase
  syncUserToSupabase(users[idx]);
  return users[idx];
}

export function deleteUserAccountInDB(userId: string): void {
  const users = getAllUsers();
  const filtered = users.filter((u) => u.id !== userId);
  saveUsersDB(filtered);

  // Sync deletion with Supabase table `users`
  deleteUserFromSupabase(userId);
}

/**
 * Reset / Clear all stored user accounts to start completely fresh
 */
export function clearAllAccounts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DB_USERS_KEY);
  localStorage.removeItem('prankstar_auth_v2');
  localStorage.removeItem('prankstar_user_stats');
}
