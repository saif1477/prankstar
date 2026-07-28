import { createClient } from '@supabase/supabase-js';
import { DBUser, PublishedPrank } from './db';

// Read Supabase environment variables or use public project placeholder
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttteqwgoancemfwukxov.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dGVxd2dvYW5jZW1md3VreG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTE3MjEsImV4cCI6MjEwMDgyNzcyMX0.ipstGPx0h7D4qxC-AUmy6sf0Ju14CwTWdW4vU5Sz8sc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL Table Schemas for Supabase setup:
 * 
 * CREATE TABLE users (
 *   id TEXT PRIMARY KEY,
 *   email TEXT UNIQUE NOT NULL,
 *   display_name TEXT NOT NULL,
 *   avatar TEXT DEFAULT '😎',
 *   provider TEXT DEFAULT 'email',
 *   is_admin BOOLEAN DEFAULT FALSE,
 *   xp INT DEFAULT 0,
 *   level INT DEFAULT 1,
 *   pranks_launched INT DEFAULT 0,
 *   pranks_published INT DEFAULT 0,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE TABLE published_pranks (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   slug TEXT UNIQUE NOT NULL,
 *   description TEXT,
 *   category TEXT NOT NULL,
 *   os TEXT DEFAULT 'Cross-platform',
 *   difficulty TEXT DEFAULT 'Easy',
 *   duration INT DEFAULT 15,
 *   thumbnail TEXT DEFAULT '🎭',
 *   sound_fx TEXT DEFAULT 'sirenAlarm',
 *   reveal_message TEXT,
 *   author_id TEXT REFERENCES users(id),
 *   author_name TEXT,
 *   author_avatar TEXT,
 *   views INT DEFAULT 0,
 *   likes INT DEFAULT 0,
 *   shares INT DEFAULT 0,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */

export async function syncUserToSupabase(user: DBUser) {
  try {
    const { data, error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      avatar: user.avatar,
      provider: user.provider,
      is_admin: user.isAdmin,
      xp: user.xp,
      level: user.level,
      pranks_launched: user.pranksLaunched,
      pranks_published: user.pranksPublished,
      created_at: user.createdAt,
    });
    if (error) console.warn('Supabase sync notice:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase offline or unconfigured. Operating in persistent local mode.');
    return null;
  }
}

export async function syncPrankToSupabase(prank: PublishedPrank) {
  try {
    const { data, error } = await supabase.from('published_pranks').upsert({
      id: prank.id,
      title: prank.title,
      slug: prank.slug,
      description: prank.description,
      category: prank.category,
      os: prank.os,
      difficulty: prank.difficulty,
      duration: prank.duration,
      thumbnail: prank.thumbnail,
      sound_fx: prank.soundFx,
      reveal_message: prank.revealMessage,
      author_id: prank.authorId,
      author_name: prank.authorName,
      author_avatar: prank.authorAvatar,
      views: prank.views,
      likes: prank.likes,
      shares: prank.shares,
      created_at: prank.createdAt,
    });
    if (error) console.warn('Supabase prank sync notice:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase offline or unconfigured.');
    return null;
  }
}

export async function fetchSupabaseLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('xp', { ascending: false })
      .limit(50);

    if (error || !data) return null;
    return data.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.display_name,
      avatar: u.avatar,
      provider: u.provider,
      isAdmin: u.is_admin,
      xp: u.xp,
      level: u.level,
      pranksLaunched: u.pranks_launched,
      createdAt: u.created_at,
      lastLogin: u.created_at,
    })) as DBUser[];
  } catch {
    return null;
  }
}

export async function deleteUserFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase.from('users').delete().eq('id', userId);
    if (error) console.warn('Supabase user delete notice:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase offline or unconfigured.');
    return null;
  }
}
