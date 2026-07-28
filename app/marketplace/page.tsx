'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  Play, 
  Wand2, 
  User, 
  Clock, 
  Sparkles, 
  Copy, 
  Check 
} from 'lucide-react';
import { getCustomPranks, CustomPrank } from '@/lib/builder-store';
import { addXP } from '@/lib/gamification';

export default function MarketplacePage() {
  const [pranks, setPranks] = useState<CustomPrank[]>(() => getCustomPranks());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPranks = pranks.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = (id: string) => {
    setPranks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
    addXP(10);
  };

  const handleCopyLink = (prank: CustomPrank) => {
    const url = `${window.location.origin}/play/${prank.slug}?name=${encodeURIComponent(prank.targetName)}&timer=${prank.timerDuration}&msg=${encodeURIComponent(prank.revealMessage)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(prank.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Community Prank Hub</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Creator Marketplace
          </h1>
          <p className="text-sm text-slate-400">
            Browse, play, upvote, and fork custom prank simulations built by creators worldwide.
          </p>
        </div>

        <Link
          href="/builder"
          className="px-6 py-3 rounded-xl btn-neon-purple font-heading font-bold text-sm text-white flex items-center space-x-2 shadow-lg"
        >
          <Wand2 className="w-4 h-4" />
          <span>Publish Your Prank</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search community pranks by name or creator..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white focus:outline-none focus:border-neon-purple"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPranks.map((prank) => (
          <div
            key={prank.id}
            className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  By {prank.author}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {prank.createdAt}
                </span>
              </div>

              <h3 className="font-heading font-bold text-lg text-white">{prank.title}</h3>
              <p className="text-xs text-slate-400">Target: <span className="text-slate-200 font-semibold">{prank.targetName}</span> • Delay: <span className="text-neon-cyan font-mono">{prank.timerDuration}s</span></p>

              <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-white/5">
                "{prank.revealMessage}"
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleLike(prank.id)}
                className="flex items-center space-x-1 text-xs font-mono text-slate-400 hover:text-neon-pink transition-colors"
              >
                <Heart className="w-4 h-4 fill-current text-neon-pink" />
                <span>{prank.likes}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyLink(prank)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Copy Share Link"
                >
                  {copiedId === prank.id ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                </button>

                <Link
                  href={`/play/${prank.slug}?name=${encodeURIComponent(prank.targetName)}&timer=${prank.timerDuration}&msg=${encodeURIComponent(prank.revealMessage)}`}
                  className="px-4 py-2 rounded-xl btn-neon-cyan font-heading text-xs font-bold text-white flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
