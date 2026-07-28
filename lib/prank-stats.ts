/**
 * Real-time persistent prank interaction data (views, likes, shares).
 * All counts persist in LocalStorage and update live.
 */

const PRANK_STATS_KEY = 'prankstar_prank_stats';

export interface PrankStats {
  views: number;
  likes: number;
  shares: number;
  likedBy: string[]; // user IDs who liked
}

type PrankStatsMap = Record<string, PrankStats>;

function getStatsMap(): PrankStatsMap {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PRANK_STATS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as PrankStatsMap;
  } catch {
    return {};
  }
}

function saveStatsMap(map: PrankStatsMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRANK_STATS_KEY, JSON.stringify(map));
}

export function getPrankStats(slug: string): PrankStats {
  const map = getStatsMap();
  return map[slug] || { views: 0, likes: 0, shares: 0, likedBy: [] };
}

export function recordView(slug: string): PrankStats {
  const map = getStatsMap();
  if (!map[slug]) {
    map[slug] = { views: 0, likes: 0, shares: 0, likedBy: [] };
  }
  map[slug].views += 1;
  saveStatsMap(map);
  return map[slug];
}

export function toggleLike(slug: string, userId: string): { stats: PrankStats; liked: boolean } {
  const map = getStatsMap();
  if (!map[slug]) {
    map[slug] = { views: 0, likes: 0, shares: 0, likedBy: [] };
  }

  const idx = map[slug].likedBy.indexOf(userId);
  let liked = false;
  if (idx >= 0) {
    // Unlike
    map[slug].likedBy.splice(idx, 1);
    map[slug].likes = Math.max(0, map[slug].likes - 1);
  } else {
    // Like
    map[slug].likedBy.push(userId);
    map[slug].likes += 1;
    liked = true;
  }

  saveStatsMap(map);
  return { stats: map[slug], liked };
}

export function recordShare(slug: string): PrankStats {
  const map = getStatsMap();
  if (!map[slug]) {
    map[slug] = { views: 0, likes: 0, shares: 0, likedBy: [] };
  }
  map[slug].shares += 1;
  saveStatsMap(map);
  return map[slug];
}

export function hasUserLiked(slug: string, userId: string): boolean {
  const map = getStatsMap();
  return map[slug]?.likedBy?.includes(userId) ?? false;
}

export function getAllStats(): PrankStatsMap {
  return getStatsMap();
}
