'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SlidersHorizontal, 
  CheckCircle, 
  XCircle, 
  Wand2, 
  Volume2, 
  Save,
  LogIn,
  ShieldAlert,
  Eye,
  Heart,
  Share2,
  Flame,
  Flag,
  Users,
  Settings,
  DollarSign,
  Ban,
  UserCheck,
  Megaphone,
  BarChart3,
  Trash2
} from 'lucide-react';
import { MASTER_PRANKS, PrankTemplate } from '@/lib/pranks-data';
import { getCustomPranks, CustomPrank } from '@/lib/builder-store';
import { audioSynth } from '@/lib/audio-synthesizer';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, deleteUserAccountInDB, makeUserAdmin, DBUser } from '@/lib/db';
import { getPrankStats } from '@/lib/prank-stats';
import { getPendingReports, resolveReport, Report } from '@/lib/reports-store';
import AuthModal from '@/components/auth-modal';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [authorized, setAuthorized] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'studio' | 'moderation' | 'reports' | 'users' | 'settings'>('studio');

  // Studio Form State
  const [adminTitle, setAdminTitle] = useState('Admin Featured Prank');
  const [adminCategory, setAdminCategory] = useState<string>('Fake Hacker');
  const [adminOS, setAdminOS] = useState<string>('Cross-platform');
  const [adminDuration, setAdminDuration] = useState(15);
  const [adminSound, setAdminSound] = useState('sirenAlarm');
  const [adminRevealMsg, setAdminRevealMsg] = useState('😂 Admin Prank Activated!');
  const [adminCustomImg, setAdminCustomImg] = useState('');
  const [adminSpeechAlert, setAdminSpeechAlert] = useState('System security level 5 warning!');
  const [adminSuccessNotice, setAdminSuccessNotice] = useState(false);

  // Moderation & Reports
  const [communityBuilds, setCommunityBuilds] = useState<CustomPrank[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Ads & Site Settings
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adPlacement, setAdPlacement] = useState<'banner' | 'interstitial' | 'sidebar'>('banner');
  const [siteMaintenance, setSiteMaintenance] = useState(false);
  const [maxPrankDuration, setMaxPrankDuration] = useState(60);

  // Real Users Management
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);

  // Real analytics
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [topPranks, setTopPranks] = useState<{ title: string; views: number; likes: number }[]>([]);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setAuthorized(!!u?.isAdmin);
    setCommunityBuilds(getCustomPranks());
    setReports(getPendingReports());
    setDbUsers(getAllUsers());
    setUser(u);
    setAuthorized(!!u?.isAdmin);
    setCommunityBuilds(getCustomPranks());
    setReports(getPendingReports());

    let views = 0, likes = 0, shares = 0;
    const prankMetrics = MASTER_PRANKS.map((p) => {
      const s = getPrankStats(p.slug);
      const v = p.views + s.views;
      const l = p.likes + s.likes;
      const sh = p.shares + s.shares;
      views += v;
      likes += l;
      shares += sh;
      return { title: p.title, views: v, likes: l };
    });
    setTotalViews(views);
    setTotalLikes(likes);
    setTotalShares(shares);
    setTopPranks(prankMetrics.sort((a, b) => b.views - a.views).slice(0, 5));
  }, []);

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-4xl">
          🔒
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">Admin Access Only</h1>
        <p className="text-sm text-slate-400">
          This page is restricted to platform administrators.
        </p>
        <p className="text-xs text-slate-500 font-mono">
          Admin credentials: admin@prankstar.io / admin123
        </p>
        <button
          onClick={() => setShowAuth(true)}
          className="px-8 py-4 rounded-xl btn-neon-purple font-heading font-bold text-sm text-white flex items-center justify-center space-x-2 mx-auto shadow-lg"
        >
          <LogIn className="w-5 h-5" />
          <span>Sign In as Admin</span>
        </button>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onAuth={(u) => {
            setUser(u);
            setShowAuth(false);
            if (u.isAdmin) {
              setAuthorized(true);
            }
          }}
        />
      </div>
    );
  }

  const handleAdminSavePrank = () => {
    setAdminSuccessNotice(true);
    setTimeout(() => setAdminSuccessNotice(false), 3000);
  };

  const handleApprovePrank = (id: string) => {
    setCommunityBuilds(communityBuilds.filter(p => p.id !== id));
  };

  const handleResolveReport = (id: string, status: 'reviewed' | 'dismissed') => {
    resolveReport(id, status);
    setReports(reports.filter(r => r.id !== id));
  };

  const handleAdminDeleteUser = (targetUserId: string) => {
    deleteUserAccountInDB(targetUserId);
    setDbUsers(dbUsers.filter(u => u.id !== targetUserId));
  };

  const toggleBanUser = (email: string) => {
    if (bannedUsers.includes(email)) {
      setBannedUsers(bannedUsers.filter(n => n !== email));
    } else {
      setBannedUsers([...bannedUsers, email]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 page-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Admin Studio &amp; Governance
          </h1>
          <p className="text-sm text-slate-400">
            Logged in as <span className="text-amber-300 font-semibold">{user?.displayName}</span> ({user?.email})
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 glass-panel p-1 rounded-xl">
          {[
            { id: 'studio', label: 'Studio', icon: Wand2 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'moderation', label: `Approvals (${communityBuilds.length})`, icon: CheckCircle },
            { id: 'reports', label: `Reports (${reports.length})`, icon: Flag },
            { id: 'users', label: 'Users & Bans', icon: Users },
            { id: 'settings', label: 'Ads & Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                  activeTab === tab.id ? 'btn-neon-purple text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STUDIO TAB */}
      {activeTab === 'studio' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-heading font-bold text-lg text-white">Admin Visual Prank Creator</h3>
            </div>
            <button
              onClick={handleAdminSavePrank}
              className="px-6 py-2.5 rounded-xl btn-neon-cyan font-heading font-bold text-xs text-white flex items-center space-x-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{adminSuccessNotice ? 'Published to Catalog!' : 'Save & Publish'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input type="text" value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category &amp; OS Target</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={adminCategory} onChange={(e) => setAdminCategory(e.target.value)} placeholder="Category" className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
                  <input type="text" value={adminOS} onChange={(e) => setAdminOS(e.target.value)} placeholder="OS Target" className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Custom Image URL</label>
                <input type="text" value={adminCustomImg} onChange={(e) => setAdminCustomImg(e.target.value)} placeholder="https://example.com/image.png" className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duration (seconds)</label>
                <input type="number" value={adminDuration} onChange={(e) => setAdminDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sound FX</label>
                <div className="flex gap-2">
                  <select value={adminSound} onChange={(e) => setAdminSound(e.target.value)} className="flex-grow px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white">
                    <option value="sirenAlarm">Emergency Siren</option>
                    <option value="windowsError">Windows Error</option>
                    <option value="matrixTyping">Matrix Typing</option>
                    <option value="glassShatter">Glass Shatter</option>
                    <option value="robotSpeech">AI Voice Speech</option>
                    <option value="glitchBuzz">Glitch Buzz</option>
                    <option value="notificationChime">Notification Chime</option>
                    <option value="explosion">Dramatic Explosion</option>
                    <option value="laugh">Evil Villain Laugh</option>
                    <option value="lightning">Thunder Lightning</option>
                    <option value="heartbeat">Heartbeat Pulse</option>
                    <option value="scanline">CRT Scanline</option>
                  </select>
                  <button onClick={() => audioSynth.playSound(adminSound)} className="p-2 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">AI Voice Speech Text</label>
                <input type="text" value={adminSpeechAlert} onChange={(e) => setAdminSpeechAlert(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
                <button onClick={() => audioSynth.speakText(adminSpeechAlert, 0.8, 0.9)} className="mt-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 hover:bg-purple-500/30">
                  ▶ Preview Speech
                </button>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Custom Reveal Message</label>
                <input type="text" value={adminRevealMsg} onChange={(e) => setAdminRevealMsg(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <Eye className="w-4 h-4" />
                <span>TOTAL VIEWS (ALL PRANKS)</span>
              </div>
              <div className="font-heading font-extrabold text-3xl text-neon-purple">{totalViews.toLocaleString()}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <Heart className="w-4 h-4" />
                <span>TOTAL LIKES (ALL PRANKS)</span>
              </div>
              <div className="font-heading font-extrabold text-3xl text-neon-pink">{totalLikes.toLocaleString()}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <Share2 className="w-4 h-4" />
                <span>TOTAL SHARES (ALL PRANKS)</span>
              </div>
              <div className="font-heading font-extrabold text-3xl text-neon-cyan">{totalShares.toLocaleString()}</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Top Most Viewed Pranks</span>
            </h3>
            <div className="space-y-3">
              {topPranks.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{p.title}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                    <span>{p.views.toLocaleString()} views</span>
                    <span>{p.likes.toLocaleString()} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODERATION APPROVALS TAB */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">Pending Community Submissions</h3>
          {communityBuilds.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card text-center text-xs text-slate-400">
              No pending community submissions. All clear!
            </div>
          ) : (
            communityBuilds.map((build) => (
              <div key={build.id} className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">{build.title}</h4>
                  <p className="text-xs text-slate-400">By {build.author} &bull; Target: {build.targetName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleApprovePrank(build.id)} className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 text-xs font-bold flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button onClick={() => handleApprovePrank(build.id)} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REPORTS MODERATION TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
            <Flag className="w-5 h-5 text-red-400" />
            <span>User Reports Queue</span>
          </h3>
          {reports.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card text-center text-xs text-slate-400">
              Zero pending reports. Community is clean!
            </div>
          ) : (
            reports.map(r => (
              <div key={r.id} className="glass-card rounded-2xl p-5 border border-red-500/30 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 uppercase">{r.reason}</span>
                    <span className="text-xs text-slate-400 font-mono">Prank: {r.prankSlug}</span>
                  </div>
                  <p className="text-xs text-slate-200">{r.description || 'No description provided.'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleResolveReport(r.id, 'reviewed')} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">Dismiss &amp; Clear</button>
                  <button onClick={() => handleResolveReport(r.id, 'dismissed')} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">Remove Prank</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* USERS & BANS TAB */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-neon-cyan" />
              <span>User Management &amp; Accounts ({dbUsers.length})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Registered: {dbUsers.length}</span>
          </div>

          <div className="space-y-3">
            {dbUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No user accounts registered yet.</div>
            ) : (
              dbUsers.map(u => {
                const isBanned = bannedUsers.includes(u.email);
                return (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-white/5 gap-4">
                    <div className="space-y-0.5">
                      <div className="font-heading font-bold text-sm text-white flex items-center space-x-2">
                        <span className="text-xl">{u.avatar}</span>
                        <span>{u.displayName}</span>
                        {u.isAdmin && <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">ADMIN</span>}
                        {isBanned && <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-300">BANNED</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {u.email} &bull; XP: <span className="text-neon-cyan font-bold">{u.xp}</span> (Lvl {u.level}) &bull; Joined {u.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => toggleBanUser(u.email)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                          isBanned
                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        <span>{isBanned ? 'Unban' : 'Ban User'}</span>
                      </button>

                      <button
                        onClick={() => handleAdminDeleteUser(u.id)}
                        className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 text-xs font-bold flex items-center space-x-1 transition-all"
                        title="Delete account from Local Storage & Supabase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ADS & SITE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>Ad Network &amp; Monetization Settings</span>
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/10">
                <span className="text-slate-300 font-semibold">Enable Banner Ads</span>
                <input type="checkbox" checked={adsEnabled} onChange={e => setAdsEnabled(e.target.checked)} className="w-4 h-4 accent-purple-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ad Placement Mode</label>
                <select value={adPlacement} onChange={e => setAdPlacement(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white">
                  <option value="banner">Bottom Banner Bar</option>
                  <option value="interstitial">Pre-Prank Interstitial</option>
                  <option value="sidebar">Sidebar Overlay</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-neon-purple" />
              <span>Global Platform Settings</span>
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/10">
                <span className="text-slate-300 font-semibold">Maintenance Mode</span>
                <input type="checkbox" checked={siteMaintenance} onChange={e => setSiteMaintenance(e.target.checked)} className="w-4 h-4 accent-red-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Simulation Timer (sec)</label>
                <input type="number" value={maxPrankDuration} onChange={e => setMaxPrankDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
