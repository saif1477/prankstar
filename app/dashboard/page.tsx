'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown, Heart, Play, Trophy, Zap, LogIn, Gift, Clock, Eye,
  Star, TrendingUp, ChevronRight, Trash2, AlertTriangle, X
} from 'lucide-react';
import { getUserStats, UserStats, claimDailyReward } from '@/lib/gamification';
import { getCurrentUser, logout, promoteCurrentSessionToAdmin, User as AuthUser } from '@/lib/auth';
import { MASTER_PRANKS } from '@/lib/pranks-data';
import { getPrankStats } from '@/lib/prank-stats';
import { getRealLeaderboard, deleteUserAccountInDB, makeUserAdmin } from '@/lib/db';
import AuthModal from '@/components/auth-modal';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dailyRewardResult, setDailyRewardResult] = useState<{ claimed: boolean; xpGained: number; streak: number } | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    const s = getUserStats();
    if (u) {
      const dbUsers = getRealLeaderboard();
      const match = dbUsers.find(dbu => dbu.email.toLowerCase() === u.email.toLowerCase());
      if (match) {
        s.xp = match.xp;
        s.level = match.level;
      }
    }
    setStats(s);
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-4xl">🔒</div>
        <h1 className="font-heading font-extrabold text-3xl text-white">Sign In Required</h1>
        <p className="text-sm text-slate-400">Sign in to access your dashboard, XP, badges, and favorites.</p>
        <button onClick={() => setShowAuth(true)} className="px-8 py-4 rounded-xl btn-neon-purple font-heading font-bold text-sm text-white flex items-center justify-center space-x-2 mx-auto shadow-lg">
          <LogIn className="w-5 h-5" /><span>Sign In to Continue</span>
        </button>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onAuth={(u) => { setUser(u); setShowAuth(false); setStats(getUserStats()); }} />
      </div>
    );
  }

  if (!stats) return null;

  const nextLevelXp = stats.level * 100;
  const currentXpProgress = Math.min(100, (stats.xp % 100));
  const favoritePranks = MASTER_PRANKS.filter((p) => stats.favorites.includes(p.slug));
  const totalBadgesUnlocked = stats.badges.filter(b => b.unlocked).length;
  const recentPranks = (stats.recentlyViewed || []).slice(0, 6).map(rv => {
    const p = MASTER_PRANKS.find(mp => mp.slug === rv.slug);
    return p ? { ...p, viewedAt: rv.timestamp } : null;
  }).filter(Boolean) as (typeof MASTER_PRANKS[0] & { viewedAt: string })[];

  let totalViews = 0, totalLikes = 0;
  MASTER_PRANKS.forEach((p) => {
    const s = getPrankStats(p.slug);
    totalViews += s.views;
    totalLikes += s.likes;
  });

  const handleClaimDaily = () => {
    const result = claimDailyReward();
    setDailyRewardResult(result);
    setShowDailyReward(true);
    if (result.claimed) setStats(getUserStats());
    setTimeout(() => setShowDailyReward(false), 4000);
  };

  // Real leaderboard from DB (all users start at 0 XP)
  const dbLeaderboard = getRealLeaderboard();
  const userRank = dbLeaderboard.findIndex(l => l.email === user.email) + 1 || 1;

  const handleMakeAdmin = () => {
    if (!user) return;
    makeUserAdmin(user.id);
    const updated = promoteCurrentSessionToAdmin();
    if (updated) setUser(updated);
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    deleteUserAccountInDB(user.id);
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 page-fade-in">
      {/* Profile & XP Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-r from-purple-900/40 via-dark-800 to-cyan-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-neon-purple to-neon-cyan p-1 shadow-lg shadow-purple-500/30 shrink-0">
              <div className="w-full h-full bg-dark-900 rounded-[20px] flex items-center justify-center text-3xl">{user.avatar}</div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">{user.displayName}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Level {stats.level}</span>
                {user.isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">ADMIN</span>
                ) : (
                  <button
                    onClick={handleMakeAdmin}
                    className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center space-x-1.5 shadow-md btn-magnetic"
                    title="Promote Account to Admin"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
                    <span>Make Me Admin</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{user.email}</p>
              <p className="text-xs text-slate-400 font-mono">XP: <span className="text-neon-cyan font-bold">{stats.xp}</span> / {nextLevelXp} &bull; Rank #{userRank} &bull; Joined {user.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.isAdmin && (
              <Link href="/admin" className="px-4 py-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-heading font-bold text-xs flex items-center space-x-1.5 transition-all">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Admin Studio</span>
              </Link>
            )}
            <button onClick={handleClaimDaily} className="px-6 py-3 rounded-xl btn-neon-purple font-heading font-bold text-xs text-white flex items-center space-x-2 shadow-lg btn-magnetic">
              <Gift className="w-5 h-5" />
              <div className="text-left"><div>Daily Reward</div><div className="text-[9px] text-purple-200">Streak: {stats.dailyStreak || 0} days</div></div>
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 font-heading font-bold text-xs flex items-center space-x-1.5 transition-all">
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-red-500/40 space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white">Delete Account?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete your account (<span className="text-red-400 font-bold">{user.email}</span>)? All earned XP, badges, and account stats will be deleted from the database and Supabase.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="py-3 rounded-xl glass-panel text-slate-300 font-heading text-xs font-bold hover:text-white">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} className="py-3 rounded-xl bg-red-600 text-white font-heading text-xs font-bold hover:bg-red-700 shadow-lg">
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Reward Toast */}
        {showDailyReward && dailyRewardResult && (
          <div className={`p-4 rounded-xl border text-center text-sm font-bold animate-blur-in ${dailyRewardResult.claimed ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}`}>
            {dailyRewardResult.claimed ? `🎁 +${dailyRewardResult.xpGained} XP claimed! Streak: ${dailyRewardResult.streak} days` : '⏳ Already claimed today. Come back tomorrow!'}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-white/10 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5"><div className="text-xs text-slate-400 font-medium">Pranks Launched</div><div className="font-heading font-bold text-xl text-white mt-1">{stats.pranksLaunched}</div></div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5"><div className="text-xs text-slate-400 font-medium">Total Views</div><div className="font-heading font-bold text-xl text-neon-cyan mt-1">{totalViews}</div></div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5"><div className="text-xs text-slate-400 font-medium">Likes Given</div><div className="font-heading font-bold text-xl text-neon-pink mt-1">{totalLikes}</div></div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5"><div className="text-xs text-slate-400 font-medium">Comments</div><div className="font-heading font-bold text-xl text-amber-400 mt-1">{stats.commentsCount || 0}</div></div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5"><div className="text-xs text-slate-400 font-medium">Badges</div><div className="font-heading font-bold text-xl text-purple-400 mt-1">{totalBadgesUnlocked}/{stats.badges.length}</div></div>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentPranks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2"><Clock className="w-5 h-5 text-neon-cyan" /><h2 className="font-heading font-bold text-xl text-white">Recently Viewed</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentPranks.map((p) => (
              <Link key={p.slug} href={`/pranks/${p.slug}`} className="glass-card rounded-xl p-4 border border-white/10 hover:border-purple-500/40 flex items-center space-x-3 group transition-all">
                <div className="text-2xl group-hover:scale-110 transition-transform">{p.thumbnail}</div>
                <div className="flex-grow">
                  <h4 className="font-heading font-bold text-sm text-white group-hover:text-neon-cyan transition-colors">{p.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(p.viewedAt).toLocaleDateString()}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-neon-cyan" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2"><Trophy className="w-5 h-5 text-amber-400" /><h2 className="font-heading font-bold text-xl text-white">Achievements &amp; Badges ({totalBadgesUnlocked}/{stats.badges.length})</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stats.badges.map((badge) => (
            <div key={badge.id} className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${badge.unlocked ? 'glass-card border-amber-500/40 bg-amber-500/10' : 'bg-slate-900/40 border-white/5 opacity-50 grayscale'}`}>
              <div className="text-3xl">{badge.icon}</div>
              <div className="font-heading font-bold text-xs text-white">{badge.name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{badge.description}</div>
              {badge.unlocked && <div className="text-[9px] font-mono text-amber-400 font-semibold pt-1">✓ Unlocked {badge.unlockedAt}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2"><TrendingUp className="w-5 h-5 text-neon-purple" /><h2 className="font-heading font-bold text-xl text-white">Live Global Leaderboard</h2></div>
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          {dbLeaderboard.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No users registered yet. Register to be #1!</div>
          ) : (
            dbLeaderboard.map((entry, idx) => (
              <div key={entry.id} className={`flex items-center justify-between px-5 py-3 border-b border-white/5 ${entry.email === user.email ? 'bg-purple-500/10 border-purple-500/30' : ''}`}>
                <div className="flex items-center space-x-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${idx === 0 ? 'bg-amber-500/20 text-amber-300' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>#{idx + 1}</span>
                  <span className="text-lg">{entry.avatar}</span>
                  <span className={`font-heading font-bold text-sm ${entry.email === user.email ? 'text-neon-purple' : 'text-white'}`}>{entry.displayName} {entry.email === user.email && '(You)'}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span className="text-neon-cyan font-bold">Lvl {entry.level}</span>
                  <span className="text-slate-400">{entry.xp.toLocaleString()} XP</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Favorites */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2"><Heart className="w-5 h-5 text-neon-pink fill-current" /><h2 className="font-heading font-bold text-xl text-white">Saved Favorites</h2></div>
        {favoritePranks.length === 0 ? (
          <div className="p-8 rounded-2xl glass-card text-center text-xs text-slate-400">No favorites yet. Like pranks to add them here!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {favoritePranks.map((p) => (
              <div key={p.id} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
                <div className="flex items-center space-x-3"><div className="text-3xl">{p.thumbnail}</div><div><h3 className="font-heading font-bold text-sm text-white">{p.title}</h3><span className="text-[10px] text-neon-cyan font-mono">{p.category}</span></div></div>
                <Link href={`/pranks/${p.slug}`} className="w-full py-2 rounded-xl btn-neon-purple font-heading text-xs font-bold text-white flex items-center justify-center space-x-1"><Play className="w-3.5 h-3.5 fill-current" /><span>Launch</span></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
