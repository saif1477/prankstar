'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Search, Volume2, VolumeX, Wand2, Compass, LayoutDashboard, Crown, SlidersHorizontal, ShoppingBag, LogIn, LogOut, User } from 'lucide-react';
import { getUserStats } from '@/lib/gamification';
import { getCurrentUser, logout, User as AuthUser } from '@/lib/auth';
import AuthModal from '@/components/auth-modal';

import { getRealLeaderboard } from '@/lib/db';

export default function Navbar() {
  const pathname = usePathname();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);

    if (u) {
      const dbUsers = getRealLeaderboard();
      const match = dbUsers.find((dbu) => dbu.email.toLowerCase() === u.email.toLowerCase());
      if (match) {
        setUserLevel(match.level);
        setUserXp(match.xp);
      } else {
        const stats = getUserStats();
        setUserLevel(stats.level);
        setUserXp(stats.xp);
      }
    } else {
      const stats = getUserStats();
      setUserLevel(stats.level);
      setUserXp(stats.xp);
    }
  }, [pathname]);

  const handleAuth = (user: AuthUser) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setShowProfileMenu(false);
  };

  const navLinks = [
    { name: 'Explore', href: '/explore', icon: Compass },
    { name: 'No-Code Builder', href: '/builder', icon: Wand2 },
    { name: 'Sound Studio', href: '/sounds', icon: Volume2 },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(currentUser?.isAdmin ? [{ name: 'Admin Studio', href: '/admin', icon: SlidersHorizontal }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple via-neon-cyan to-neon-pink p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-purple-400">
                  PrankStar<span className="text-neon-cyan">.io</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 font-mono">Simulation Platform</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-500/15 text-neon-purple border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-neon-purple' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* User Level Badge (only when logged in) */}
              {currentUser && (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-purple-500/30 text-xs font-medium text-slate-200 hover:border-purple-500 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-neon-cyan font-bold">Lvl {userLevel}</span>
                  <span className="text-slate-400 font-mono hidden sm:inline">({userXp} XP)</span>
                </Link>
              )}

              {/* Quick Search Button */}
              <Link
                href="/explore"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={soundEnabled ? 'Audio FX Enabled' : 'Audio FX Muted'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-neon-green" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
              </button>

              {/* Auth Button / Profile */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-card border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <span className="text-lg">{currentUser.avatar}</span>
                    <span className="text-xs font-semibold text-white hidden sm:inline max-w-[100px] truncate">
                      {currentUser.displayName}
                    </span>
                    {currentUser.isAdmin && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl glass-card border border-white/10 shadow-2xl shadow-purple-500/10 p-3 space-y-1 z-50">
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 space-y-1 mb-2">
                        <div className="font-heading font-bold text-sm text-white flex items-center space-x-2">
                          <span className="text-lg">{currentUser.avatar}</span>
                          <span>{currentUser.displayName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{currentUser.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Provider: {currentUser.provider} • Joined {currentUser.createdAt}
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard & Badges</span>
                      </Link>

                      {currentUser.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>Admin Studio</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl btn-neon-purple font-heading font-bold text-xs text-white shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />
    </>
  );
}
