'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Play, 
  Heart, 
  Share2, 
  Eye, 
  SlidersHorizontal,
  Check,
  Sparkles,
  Flame,
  Clock,
  Filter,
  Grid,
  LayoutGrid
} from 'lucide-react';
import { getAllPranksCombined, mergePrankCatalog, PRANK_CATEGORIES, OS_FILTERS, DIFFICULTY_FILTERS, SORT_OPTIONS, PrankTemplate } from '@/lib/pranks-data';
import { fetchPublishedPranksFromSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getPrankStats, toggleLike, hasUserLiked, recordShare } from '@/lib/prank-stats';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOS, setSelectedOS] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'shares' | 'newest' | 'duration'>('views');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  
  const [likedSlugs, setLikedSlugs] = useState<Set<string>>(new Set());
  const [liveStats, setLiveStats] = useState<Record<string, { views: number; likes: number; shares: number }>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('guest');
  const [allPranks, setAllPranks] = useState<PrankTemplate[]>([]);

  useEffect(() => {
    let active = true;
    const loadPranks = async () => {
      const localPranks = getAllPranksCombined();
      const remotePranks = await fetchPublishedPranksFromSupabase();
      if (!active) return;
      const pranks = mergePrankCatalog(localPranks, remotePranks);
    setAllPranks(pranks);
    const user = getCurrentUser();
    const uid = user?.id || 'guest';
    setUserId(uid);

    const statsMap: Record<string, { views: number; likes: number; shares: number }> = {};
    const liked = new Set<string>();
    pranks.forEach((p) => {
      const s = getPrankStats(p.slug);
      statsMap[p.slug] = { views: p.views + s.views, likes: p.likes + s.likes, shares: p.shares + s.shares };
      if (hasUserLiked(p.slug, uid)) liked.add(p.slug);
    });
    setLiveStats(statsMap);
    setLikedSlugs(liked);
    };
    void loadPranks();
    return () => { active = false; };
  }, []);

  const getStats = (slug: string) => liveStats[slug] || { views: 0, likes: 0, shares: 0 };

  const filteredPranks = useMemo(() => {
    return allPranks.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesOS = selectedOS === 'All' || p.os === selectedOS || p.os === 'Cross-platform';
      const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      return matchesSearch && matchesCat && matchesOS && matchesDiff;
    }).sort((a, b) => {
      const sa = getStats(a.slug);
      const sb = getStats(b.slug);
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      if (sortBy === 'likes') return sb.likes - sa.likes;
      if (sortBy === 'shares') return sb.shares - sa.shares;
      return sb.views - sa.views;
    });
  }, [allPranks, searchQuery, selectedCategory, selectedOS, selectedDifficulty, sortBy, liveStats]);

  const handleLike = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleLike(slug, userId);
    const prank = allPranks.find(p => p.slug === slug);
    const baseLikes = prank?.likes || 0;
    setLiveStats((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], likes: baseLikes + result.stats.likes }
    }));
    setLikedSlugs((prev) => {
      const next = new Set(prev);
      if (result.liked) next.add(slug); else next.delete(slug);
      return next;
    });
  };

  const handleQuickShare = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/pranks/${slug}`;
    navigator.clipboard.writeText(url);
    recordShare(slug);
    const prank = allPranks.find(p => p.slug === slug);
    const baseShares = prank?.shares || 0;
    const s = getPrankStats(slug);
    setLiveStats((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], shares: baseShares + s.shares }
    }));
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 page-fade-in">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-neon-purple text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Prank Library ({allPranks.length}+ Simulations)</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Explore Prank Catalog
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Browse through our massive collection of safe browser simulations. Filter by 30+ categories, OS targets, difficulty, or popularity.
        </p>
      </div>

      {/* Search, Sort, View Toggle */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Instant search by title, tag, or keyword..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-3 px-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-neon-purple cursor-pointer font-mono"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="py-3 px-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-neon-purple cursor-pointer font-mono"
            >
              {DIFFICULTY_FILTERS.map(diff => (
                <option key={diff} value={diff}>Difficulty: {diff}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 glass-panel p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-500/20 text-neon-purple' : 'text-slate-400 hover:text-white'}`}
              title="Standard Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'masonry' ? 'bg-purple-500/20 text-neon-purple' : 'text-slate-400 hover:text-white'}`}
              title="Pinterest Masonry Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills (30+ categories) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {PRANK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'btn-neon-purple text-white shadow-lg'
                : 'glass-card border border-white/10 text-slate-300 hover:text-white hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* OS Target Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-mono text-slate-500 shrink-0">OS Target:</span>
        {OS_FILTERS.map((os) => (
          <button
            key={os}
            onClick={() => setSelectedOS(os)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              selectedOS === os
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {os}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
        <span>Showing <span className="text-white font-bold">{filteredPranks.length}</span> prank simulations</span>
        {selectedCategory !== 'All' && (
          <button onClick={() => { setSelectedCategory('All'); setSelectedOS('All'); setSelectedDifficulty('All'); setSearchQuery(''); }} className="text-neon-cyan hover:underline">
            Reset Filters
          </button>
        )}
      </div>

      {/* Catalog Grid / Pinterest Masonry */}
      <div className={viewMode === 'masonry' ? 'masonry-grid' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {filteredPranks.map((prank) => {
          const isFav = likedSlugs.has(prank.slug);
          const isCopied = copiedSlug === prank.slug;
          const stats = getStats(prank.slug);

          return (
            <Link
              key={prank.id}
              href={`/pranks/${prank.slug}`}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-1 relative card-tilt glass-hover-shine"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                    {prank.thumbnail}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleQuickShare(prank.slug, e)}
                      className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-neon-cyan hover:bg-slate-700 transition-colors"
                      title="Copy Share Link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-neon-green" /> : <Share2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => handleLike(prank.slug, e)}
                      className={`p-2 rounded-lg bg-slate-800/80 transition-colors ${isFav ? 'text-neon-pink' : 'text-slate-400 hover:text-neon-pink'}`}
                      title={isFav ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-mono text-neon-purple font-semibold">{prank.category}</span>
                    <span className="text-[10px] font-mono text-slate-500">&bull;</span>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">{prank.difficulty}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-neon-cyan transition-colors">
                    {prank.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prank.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {prank.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center space-x-1" title="Views">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{stats.views >= 1000 ? `${(stats.views / 1000).toFixed(0)}k` : stats.views}</span>
                  </span>
                  <span className="flex items-center space-x-1" title="Likes">
                    <Heart className="w-3.5 h-3.5 text-slate-500" />
                    <span>{stats.likes >= 1000 ? `${(stats.likes / 1000).toFixed(1)}k` : stats.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1" title="Shares">
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{stats.shares >= 1000 ? `${(stats.shares / 1000).toFixed(1)}k` : stats.shares}</span>
                  </span>
                </div>
                <div className="px-4 py-2 rounded-xl btn-neon-purple font-heading text-xs font-bold text-white flex items-center space-x-1.5 shadow-md group-hover:scale-105 transition-transform">
                  <span>Launch</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
