'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Heart, Share2, MessageCircle, Clock, Eye, Copy, Check,
  Flag, X, Send, ThumbsUp, ExternalLink, Bookmark, QrCode,
  ChevronRight
} from 'lucide-react';
import { getAllPranksCombined, PrankTemplate } from '@/lib/pranks-data';
import { getCurrentUser } from '@/lib/auth';
import { getPrankStats, toggleLike, hasUserLiked, recordShare } from '@/lib/prank-stats';
import { toggleFavoritePrank, getUserStats, addToHistory } from '@/lib/gamification';
import { getCommentsForPrank, addComment, likeComment, Comment } from '@/lib/comments-store';
import { submitReport } from '@/lib/reports-store';
import { incrementComments } from '@/lib/gamification';
import AuthModal from '@/components/auth-modal';

export default function PrankConfiguratorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const allPranks = getAllPranksCombined();
  const prank = allPranks.find((p) => p.slug === slug);

  const [targetName, setTargetName] = useState('');
  const [timer, setTimer] = useState(prank?.duration || 15);
  const [revealMsg, setRevealMsg] = useState(prank?.revealMessage || '');
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [stats, setStats] = useState({ views: 0, likes: 0, shares: 0 });
  const [user, setUser] = useState(getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Report
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<'inappropriate' | 'misleading' | 'harmful' | 'spam' | 'other'>('inappropriate');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Share menu
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (!prank) return;
    const u = getCurrentUser();
    setUser(u);
    const uid = u?.id || 'guest';
    const s = getPrankStats(slug);
    setStats({ views: (prank.views || 0) + s.views, likes: (prank.likes || 0) + s.likes, shares: (prank.shares || 0) + s.shares });
    setLiked(hasUserLiked(slug, uid));
    const userStats = getUserStats();
    setFavorited(userStats.favorites.includes(slug));
    setComments(getCommentsForPrank(slug));
    if (u) addToHistory(slug);
  }, [slug]);

  if (!prank) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <h1 className="font-heading font-extrabold text-2xl text-white">Prank Not Found</h1>
        <Link href="/explore" className="text-neon-cyan text-sm hover:underline">Browse All Pranks →</Link>
      </div>
    );
  }

  const handleLike = () => {
    if (!user) { setShowAuthModal(true); return; }
    const result = toggleLike(slug, user.id);
    setLiked(result.liked);
    setStats(prev => ({ ...prev, likes: (prank.likes || 0) + result.stats.likes }));
  };

  const handleFavorite = () => {
    if (!user) { setShowAuthModal(true); return; }
    const isFav = toggleFavoritePrank(slug);
    setFavorited(isFav);
  };

  const generateLink = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    if (targetName) params.set('name', targetName);
    params.set('timer', timer.toString());
    if (revealMsg !== prank.revealMessage) params.set('msg', revealMsg);
    return `${base}/play/${slug}?${params.toString()}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateLink());
    recordShare(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(generateLink());
  const shareText = encodeURIComponent('Hey, you got something to see 👀');

  const socialLinks = [
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${shareText}%20${shareUrl}`, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { name: 'Telegram', icon: '✈️', url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { name: 'Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, color: 'bg-blue-600/20 text-blue-300 border-blue-600/30' },
    { name: 'X (Twitter)', icon: '🐦', url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, color: 'bg-slate-700/40 text-slate-200 border-slate-600/30' },
    { name: 'Discord', icon: '🎮', url: `https://discord.com/channels/@me`, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { name: 'Reddit', icon: '🔴', url: `https://reddit.com/submit?url=${shareUrl}&title=${shareText}`, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  ];

  const handleAddComment = () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!newComment.trim()) return;
    const c = addComment(slug, user.id, user.displayName, user.avatar, newComment.trim());
    setComments([c, ...comments]);
    setNewComment('');
    incrementComments();
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId);
    setComments(getCommentsForPrank(slug));
  };

  const handleReport = () => {
    if (!user) { setShowAuthModal(true); return; }
    submitReport(slug, user.id, reportReason, reportDesc);
    setReportSubmitted(true);
    setTimeout(() => { setShowReport(false); setReportSubmitted(false); setReportDesc(''); }, 2000);
  };

  // Related pranks from same category
  const relatedPranks = allPranks.filter(p => p.category === prank?.category && p.slug !== slug).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 page-fade-in">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-slate-900/90 border border-white/10 flex items-center justify-center text-5xl shrink-0 hover-zoom">
            {prank.thumbnail}
          </div>
          <div className="flex-grow space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">{prank.category}</span>
              {prank.os && <span className="px-3 py-1 rounded-lg text-xs font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">{prank.os}</span>}
              {'difficulty' in prank && <span className="px-3 py-1 rounded-lg text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">{(prank as any).difficulty || 'Easy'}</span>}
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">{prank.title}</h1>
            <p className="text-sm text-slate-400 leading-relaxed">{prank.description}</p>

            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /><span>{stats.views.toLocaleString()} views</span></span>
              <span className="flex items-center space-x-1"><Heart className="w-3.5 h-3.5" /><span>{stats.likes.toLocaleString()} likes</span></span>
              <span className="flex items-center space-x-1"><Share2 className="w-3.5 h-3.5" /><span>{stats.shares.toLocaleString()} shares</span></span>
              <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{prank.duration}s</span></span>
              <span className="flex items-center space-x-1"><MessageCircle className="w-3.5 h-3.5" /><span>{comments.length} comments</span></span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {prank.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/5">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <button onClick={handleLike} className={`p-3 rounded-xl border transition-all ${liked ? 'bg-pink-500/20 text-neon-pink border-pink-500/40' : 'glass-card text-slate-400 border-white/10 hover:text-neon-pink'}`} title="Like">
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleFavorite} className={`p-3 rounded-xl border transition-all ${favorited ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'glass-card text-slate-400 border-white/10 hover:text-amber-400'}`} title="Bookmark">
              <Bookmark className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-3 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-neon-cyan transition-all" title="Share">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={() => setShowReport(true)} className="p-3 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-red-400 transition-all" title="Report">
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Social Share Panel */}
      {showShareMenu && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4 animate-blur-in">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white">Share This Prank</h3>
            <button onClick={() => setShowShareMenu(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {socialLinks.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-xl border text-center space-y-1.5 hover:scale-105 transition-transform ${s.color}`}>
                <div className="text-2xl">{s.icon}</div>
                <div className="text-[10px] font-bold">{s.name}</div>
              </a>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleCopyLink} className="flex-grow py-3 rounded-xl btn-neon-cyan font-heading font-bold text-xs text-white flex items-center justify-center space-x-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Prank Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Configurator + Launch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
          <h3 className="font-heading font-bold text-lg text-white">Configure &amp; Launch</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Target Name</label>
              <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="Enter victim's name" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:border-neon-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Timer (seconds): {timer}s</label>
              <input type="range" min={5} max={60} value={timer} onChange={e => setTimer(Number(e.target.value))} className="w-full accent-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Custom Reveal Message</label>
              <input type="text" value={revealMsg} onChange={e => setRevealMsg(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-neon-purple focus:outline-none" />
            </div>
          </div>
          <button onClick={handleCopyLink} className="w-full py-3 rounded-xl btn-neon-cyan font-heading font-bold text-sm text-white flex items-center justify-center space-x-2">
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Shareable Prank Link'}</span>
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4">
          <Link href={`/play/${slug}?name=${encodeURIComponent(targetName || 'Friend')}&timer=${timer}&msg=${encodeURIComponent(revealMsg)}`} className="flex-grow glass-card rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500 flex flex-col items-center justify-center text-center space-y-4 group transition-all">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform pulse-ring">
              <Play className="w-10 h-10 text-neon-purple fill-current" />
            </div>
            <div className="font-heading font-extrabold text-xl text-white">Launch Prank Now</div>
            <div className="text-xs text-slate-400">Preview this prank in fullscreen</div>
          </Link>
          <button onClick={() => { const randomPrank = allPranks[Math.floor(Math.random() * allPranks.length)]; router.push(`/pranks/${randomPrank.slug}`); }} className="w-full py-3 rounded-xl glass-card border border-white/10 hover:border-cyan-500/40 font-heading text-sm font-bold text-slate-300 hover:text-neon-cyan flex items-center justify-center space-x-2 transition-all">
            <span>🎲</span>
            <span>Random Prank</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-neon-cyan" />
          <h3 className="font-heading font-bold text-lg text-white">Comments ({comments.length})</h3>
        </div>

        {/* Add Comment */}
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg shrink-0">
            {user?.avatar || '👤'}
          </div>
          <div className="flex-grow flex gap-2">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={user ? 'Write a comment...' : 'Sign in to comment'} onKeyDown={e => e.key === 'Enter' && handleAddComment()} className="flex-grow px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:border-neon-purple focus:outline-none" disabled={!user} />
            <button onClick={handleAddComment} disabled={!user || !newComment.trim()} className="px-4 py-2.5 rounded-xl btn-neon-purple font-bold text-xs text-white disabled:opacity-40"><Send className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-4">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm shrink-0">{c.userAvatar}</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-white">{c.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{c.text}</p>
                  <button onClick={() => handleLikeComment(c.id)} className="flex items-center space-x-1 mt-1.5 text-[10px] text-slate-500 hover:text-neon-pink transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{c.likes}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Pranks */}
      {relatedPranks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white">Related Pranks</h3>
            <Link href="/explore" className="text-xs text-neon-cyan hover:underline flex items-center space-x-1"><span>View All</span><ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPranks.map(rp => (
              <Link key={rp.id} href={`/pranks/${rp.slug}`} className="glass-card rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 space-y-3 group transition-all card-tilt">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{rp.thumbnail}</div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-white group-hover:text-neon-cyan transition-colors">{rp.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{rp.category}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">{rp.views.toLocaleString()} views</span>
                  <span className="text-xs text-neon-purple font-bold flex items-center space-x-1"><Play className="w-3 h-3 fill-current" /><span>Launch</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2"><Flag className="w-5 h-5 text-red-400" /><span>Report Prank</span></h3>
              <button onClick={() => setShowReport(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            {reportSubmitted ? (
              <div className="text-center py-6 space-y-2"><div className="text-4xl">✅</div><p className="text-sm text-green-400 font-semibold">Report submitted. Thank you!</p></div>
            ) : (
              <>
                <select value={reportReason} onChange={e => setReportReason(e.target.value as any)} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white">
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="misleading">Misleading / Phishing</option>
                  <option value="harmful">Potentially Harmful</option>
                  <option value="spam">Spam</option>
                  <option value="other">Other</option>
                </select>
                <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Describe the issue..." rows={3} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-red-500" />
                <button onClick={handleReport} className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-heading font-bold text-xs">Submit Report</button>
              </>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={(u) => { setUser(u); setShowAuthModal(false); }} />
    </div>
  );
}
