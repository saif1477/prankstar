import { getCurrentUser } from './auth';
import { updateUserXPInDB } from './db';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Explorer' | 'Creator' | 'Social' | 'Mastery' | 'Secret';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  pranksLaunched: number;
  customPranksCreated: number;
  pranksShared: number;
  favorites: string[];
  history: { prankId: string; timestamp: string }[];
  badges: Badge[];
  recentlyViewed: { slug: string; timestamp: string }[];
  dailyRewardLastClaimed: string | null;
  dailyStreak: number;
  commentsCount: number;
}

export const INITIAL_BADGES: Badge[] = [
  { id: 'badge-first-prank', name: 'First Prank', description: 'Launched your very first prank simulation', icon: '🚀', category: 'Explorer', unlocked: false },
  { id: 'badge-hacker-pro', name: 'Master Hacker', description: 'Ran the Matrix Cyber Terminal prank', icon: '🟢', category: 'Mastery', unlocked: false },
  { id: 'badge-sound-maestro', name: 'Audio Wizard', description: 'Tested 5+ sounds in the Web Audio Sound Studio', icon: '🎵', category: 'Mastery', unlocked: false },
  { id: 'badge-builder-rookie', name: 'Canva Creator', description: 'Built a custom prank using the No-Code Builder', icon: '🎨', category: 'Creator', unlocked: false },
  { id: 'badge-share-10', name: 'Viral Prankster', description: 'Shared custom prank links with 10 friends', icon: '🔥', category: 'Social', unlocked: false },
  { id: 'badge-konami-secret', name: 'Retro Matrix Lord', description: 'Entered the secret Konami Code sequence (↑↑↓↓←→←→ba)', icon: '🕹️', category: 'Secret', unlocked: false },
  { id: 'badge-night-owl', name: 'Night Owl', description: 'Launched a prank past midnight', icon: '🦉', category: 'Secret', unlocked: false },
  { id: 'badge-april-fool-king', name: 'April Fool King', description: 'Unlocked 10+ badges and reached Level 5', icon: '👑', category: 'Mastery', unlocked: false },
  { id: 'badge-ai-overlord', name: 'AI Whisperer', description: 'Used the AI Prank Generator Assistant', icon: '🤖', category: 'Creator', unlocked: false },
  { id: 'badge-food-troll', name: 'Pizza Bandit', description: 'Sent a fake Uber Eats 100 Pizza tracker', icon: '🍕', category: 'Explorer', unlocked: false },
  { id: 'badge-10-shares', name: '10 Shares', description: 'Shared 10 prank links with friends', icon: '🔗', category: 'Social', unlocked: false },
  { id: 'badge-100-shares', name: '100 Shares', description: 'Shared 100 prank links worldwide', icon: '🌐', category: 'Social', unlocked: false },
  { id: 'badge-1000-views', name: '1000 Views', description: 'Your pranks reached 1000 total views', icon: '👁️', category: 'Mastery', unlocked: false },
  { id: 'badge-explorer', name: 'Explorer', description: 'Visited 10 different prank pages', icon: '🧭', category: 'Explorer', unlocked: false },
  { id: 'badge-funny-master', name: 'Funny Master', description: 'Launched 5 pranks from Funny category', icon: '😂', category: 'Mastery', unlocked: false },
  { id: 'badge-prank-king', name: 'Prank King', description: 'Reached Level 10 and launched 50 pranks', icon: '🤴', category: 'Mastery', unlocked: false },
  { id: 'badge-daily-streak', name: 'Daily Streak', description: 'Claimed daily rewards 7 days in a row', icon: '📅', category: 'Explorer', unlocked: false },
  { id: 'badge-commenter', name: 'Voice of the People', description: 'Left 10 comments on pranks', icon: '💬', category: 'Social', unlocked: false },
  { id: 'badge-reporter', name: 'Safety Guardian', description: 'Reported a prank for review', icon: '🛡️', category: 'Secret', unlocked: false },
  { id: 'badge-leaderboard', name: 'Top Prankster', description: 'Reached top 10 on the leaderboard', icon: '🏆', category: 'Mastery', unlocked: false },
];

const LOCAL_STORAGE_KEY = 'prankstar_user_stats';

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return {
      xp: 0,
      level: 1,
      pranksLaunched: 0,
      customPranksCreated: 0,
      pranksShared: 0,
      favorites: [],
      history: [],
      badges: INITIAL_BADGES,
      recentlyViewed: [],
      dailyRewardLastClaimed: null,
      dailyStreak: 0,
      commentsCount: 0,
    };
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    const initial: UserStats = {
      xp: 0,
      level: 1,
      pranksLaunched: 0,
      customPranksCreated: 0,
      pranksShared: 0,
      favorites: [],
      history: [],
      badges: INITIAL_BADGES,
      recentlyViewed: [],
      dailyRewardLastClaimed: null,
      dailyStreak: 0,
      commentsCount: 0,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as UserStats;
  } catch {
    return {
      xp: 0,
      level: 1,
      pranksLaunched: 0,
      customPranksCreated: 0,
      pranksShared: 0,
      favorites: [],
      history: [],
      badges: INITIAL_BADGES,
      recentlyViewed: [],
      dailyRewardLastClaimed: null,
      dailyStreak: 0,
      commentsCount: 0,
    };
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
}

export function addXP(amount: number, reason?: string): UserStats {
  const stats = getUserStats();
  stats.xp += amount;
  
  // Calculate level: Level = Math.floor(XP / 100) + 1
  const newLevel = Math.floor(stats.xp / 100) + 1;
  if (newLevel > stats.level) {
    stats.level = newLevel;
  }
  
  saveUserStats(stats);

  // Sync to database if user is logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateUserXPInDB(currentUser.id, amount);
  }

  return stats;
}

export function unlockBadge(badgeId: string): UserStats {
  const stats = getUserStats();
  const badgeIndex = stats.badges.findIndex((b) => b.id === badgeId);
  if (badgeIndex !== -1 && !stats.badges[badgeIndex].unlocked) {
    stats.badges[badgeIndex].unlocked = true;
    stats.badges[badgeIndex].unlockedAt = new Date().toLocaleDateString();
    stats.xp += 100;
    saveUserStats(stats);
  }
  return stats;
}

export function toggleFavoritePrank(slug: string): boolean {
  const stats = getUserStats();
  const index = stats.favorites.indexOf(slug);
  let isFav = false;
  if (index >= 0) {
    stats.favorites.splice(index, 1);
  } else {
    stats.favorites.push(slug);
    isFav = true;
  }
  saveUserStats(stats);
  return isFav;
}

export function incrementPranksLaunched(): UserStats {
  const stats = getUserStats();
  stats.pranksLaunched += 1;
  saveUserStats(stats);
  return stats;
}

export function incrementShares(): UserStats {
  const stats = getUserStats();
  stats.pranksShared += 1;
  saveUserStats(stats);
  return stats;
}

export function incrementCustomCreated(): UserStats {
  const stats = getUserStats();
  stats.customPranksCreated += 1;
  saveUserStats(stats);
  return stats;
}

export function addToHistory(slug: string): void {
  const stats = getUserStats();
  // Remove if already exists to avoid duplicates
  stats.recentlyViewed = stats.recentlyViewed.filter(h => h.slug !== slug);
  // Add to front
  stats.recentlyViewed.unshift({ slug, timestamp: new Date().toISOString() });
  // Keep only last 20
  stats.recentlyViewed = stats.recentlyViewed.slice(0, 20);
  saveUserStats(stats);
}

export function claimDailyReward(): { claimed: boolean; xpGained: number; streak: number } {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];
  
  if (stats.dailyRewardLastClaimed === today) {
    return { claimed: false, xpGained: 0, streak: stats.dailyStreak };
  }
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (stats.dailyRewardLastClaimed === yesterday) {
    stats.dailyStreak += 1;
  } else {
    stats.dailyStreak = 1;
  }
  
  const xpGained = 25 * stats.dailyStreak; // Streak multiplier!
  stats.dailyRewardLastClaimed = today;
  stats.xp += xpGained;
  stats.level = Math.floor(stats.xp / 100) + 1;
  
  if (stats.dailyStreak >= 7) {
    const badgeIdx = stats.badges.findIndex(b => b.id === 'badge-daily-streak');
    if (badgeIdx >= 0 && !stats.badges[badgeIdx].unlocked) {
      stats.badges[badgeIdx].unlocked = true;
      stats.badges[badgeIdx].unlockedAt = today;
      stats.xp += 100;
    }
  }
  
  saveUserStats(stats);
  return { claimed: true, xpGained, streak: stats.dailyStreak };
}

export function incrementComments(): UserStats {
  const stats = getUserStats();
  stats.commentsCount += 1;
  if (stats.commentsCount >= 10) {
    const badgeIdx = stats.badges.findIndex(b => b.id === 'badge-commenter');
    if (badgeIdx >= 0 && !stats.badges[badgeIdx].unlocked) {
      stats.badges[badgeIdx].unlocked = true;
      stats.badges[badgeIdx].unlockedAt = new Date().toLocaleDateString();
      stats.xp += 100;
    }
  }
  saveUserStats(stats);
  return stats;
}
