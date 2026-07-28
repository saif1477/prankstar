'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Wand2, 
  Compass, 
  Play, 
  Share2, 
  Eye, 
  Heart, 
  ShieldCheck, 
  Volume2, 
  ChevronRight, 
  Flame, 
  Monitor, 
  Terminal, 
  Bot, 
  Tv, 
  Truck, 
  Gamepad2, 
  Zap, 
  HelpCircle,
  Award,
  Layers
} from 'lucide-react';
import { MASTER_PRANKS, PRANK_CATEGORIES, PrankTemplate } from '@/lib/pranks-data';
import { audioSynth } from '@/lib/audio-synthesizer';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);

  const featuredPranks = MASTER_PRANKS.filter((p) => p.isFeatured);
  const trendingPranks = MASTER_PRANKS.filter((p) => p.isTrending);

  const filteredPranks = selectedCategory === 'All'
    ? MASTER_PRANKS
    : MASTER_PRANKS.filter((p) => p.category === selectedCategory);

  const playTestSound = (soundId: string) => {
    setActiveSoundId(soundId);
    audioSynth.playSound(soundId);
    setTimeout(() => setActiveSoundId(null), 1000);
  };

  return (
    <div className="relative overflow-hidden space-y-24 pb-20">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-xs font-semibold text-purple-300 mb-8 animate-float-slow">
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <span>The World\'s Largest Browser Simulation Platform</span>
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
          Prank Your Friends With <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink">
            Hyper-Realistic Simulations
          </span>
        </h1>

        <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Choose from 1,000+ safe browser simulations: Windows 11 Blue Screens, Cyber Hacker Terminals, Fake Food Delivery Live Trackers, and AI System Takeovers.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-8 py-4 rounded-xl btn-neon-purple font-heading font-bold text-base text-white flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/30"
          >
            <Compass className="w-5 h-5" />
            <span>Browse All Pranks</span>
          </Link>

          <Link
            href="/builder"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-white/10 font-heading font-bold text-base text-slate-200 border border-white/15 flex items-center justify-center space-x-2 transition-all"
          >
            <Wand2 className="w-5 h-5 text-neon-cyan" />
            <span>No-Code Builder</span>
          </Link>
        </div>

        {/* Hero Cards Floating Preview */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {featuredPranks.slice(0, 4).map((prank, idx) => (
            <Link
              key={prank.id}
              href={`/pranks/${prank.slug}`}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-2"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {prank.thumbnail}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {prank.difficulty}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                {prank.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-normal">
                {prank.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{(prank.views / 1000).toFixed(0)}k</span>
                </span>
                <span className="flex items-center space-x-1 text-neon-purple font-semibold">
                  <span>Play</span>
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-neon-purple">1,000+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Prank Templates</div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-neon-cyan">500+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Web Audio FX</div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-neon-pink">100M+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Pranks Launched</div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-amber-400">4.9 / 5</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Prankster Rating</div>
          </div>
        </div>
      </section>

      {/* Trending Pranks Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5 fill-current animate-bounce" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-white">Trending Right Now</h2>
              <p className="text-xs text-slate-400">Most played simulations across the globe</p>
            </div>
          </div>

          <Link href="/explore" className="text-xs font-semibold text-neon-purple hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingPranks.slice(0, 3).map((prank) => (
            <div key={prank.id} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                  {prank.thumbnail}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">{prank.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {prank.category}
                    </span>
                    <span className="text-[11px] font-mono text-neon-cyan">
                      ⏱️ {prank.duration}s
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {prank.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={`/pranks/${prank.slug}`}
                  className="w-full py-2.5 rounded-xl btn-neon-purple font-heading text-xs font-bold text-white flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Customize & Prank</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* No-Code Builder Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 lg:p-12 border border-purple-500/30 bg-gradient-to-r from-purple-900/40 via-dark-800 to-cyan-900/40 relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Canva For Pranks</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              Create Your Own Pranks With <br />
              No-Code Drag & Drop
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Sequence popups, notification alerts, robotic AI voice speech, hacker matrix rain, and glass shatter audio on a visual timeline. No coding required!
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/builder"
                className="px-6 py-3 rounded-xl btn-neon-cyan font-heading font-bold text-sm text-white flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
              >
                <span>Launch Visual Builder</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Web Audio Studio Tester */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading font-bold text-3xl text-white">Interactive Web Audio Studio</h2>
          <p className="text-xs text-slate-400">
            Click any button below to test synthesized audio effects powered by pure client-side Web Audio API!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { id: 'windowsError', name: 'Windows Error', emoji: '🖥️' },
            { id: 'sirenAlarm', name: 'Siren Alarm', emoji: '🚨' },
            { id: 'matrixTyping', name: 'Matrix Typing', emoji: '🟢' },
            { id: 'glassShatter', name: 'Glass Shatter', emoji: '💥' },
            { id: 'robotSpeech', name: 'AI Robot Voice', emoji: '🤖' },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => playTestSound(snd.id)}
              className={`p-4 rounded-xl glass-card border text-center transition-all ${
                activeSoundId === snd.id
                  ? 'border-neon-cyan bg-neon-cyan/20 scale-95'
                  : 'border-white/10 hover:border-neon-purple'
              }`}
            >
              <div className="text-2xl mb-2">{snd.emoji}</div>
              <div className="font-heading text-xs font-semibold text-white">{snd.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Play FX 🔊</div>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-3xl text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about PrankStar.io</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Are all pranks safe to use?',
              a: 'Yes! All pranks run 100% inside the browser sandbox. No file downloads, no software installations, no password prompts, and zero system modifications.'
            },
            {
              q: 'How does someone exit a fullscreen prank?',
              a: 'Pressing the ESC key immediately exits any prank and displays the "You got PrankStar\'d!" reveal screen with confetti.'
            },
            {
              q: 'Can I generate custom prank links for my friends?',
              a: 'Absolutely! You can customize target names, countdown timers, custom reveal messages, and share direct links via WhatsApp, Telegram, or QR codes.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-white/10 space-y-2 text-left">
              <h3 className="font-heading font-semibold text-base text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-neon-purple shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
