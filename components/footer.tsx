'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Terminal, Cpu, Github, Twitter, Disc as Discord } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-white/10 mt-20 bg-dark-900/90 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-purple to-neon-cyan p-0.5">
                <div className="w-full h-full bg-dark-900 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                </div>
              </div>
              <span className="font-heading font-bold text-lg text-white">PrankStar.io</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The world&apos;s premier browser simulation &amp; safe prank platform. Discover, customize, and share safe browser-based experiences with friends.
            </p>
            <div className="flex items-center space-x-3 text-slate-400">
              <Twitter className="w-4 h-4 hover:text-neon-cyan cursor-pointer transition-colors" />
              <Discord className="w-4 h-4 hover:text-neon-purple cursor-pointer transition-colors" />
              <Github className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/explore?category=Operating System" className="hover:text-neon-purple transition-colors">Operating Systems</Link></li>
              <li><Link href="/explore?category=Hacker" className="hover:text-neon-purple transition-colors">Hacker & Matrix</Link></li>
              <li><Link href="/explore?category=AI %26 Singularity" className="hover:text-neon-purple transition-colors">AI Takeover</Link></li>
              <li><Link href="/explore?category=Social Media" className="hover:text-neon-purple transition-colors">Social & Streaming</Link></li>
              <li><Link href="/explore?category=Shopping %26 Delivery" className="hover:text-neon-purple transition-colors">Food Delivery Tracker</Link></li>
            </ul>
          </div>

          {/* Tools & Platform */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-3">Platform Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/builder" className="hover:text-neon-cyan transition-colors">No-Code Prank Builder</Link></li>
              <li><Link href="/sounds" className="hover:text-neon-cyan transition-colors">Web Audio Sound Studio</Link></li>
              <li><Link href="/marketplace" className="hover:text-neon-cyan transition-colors">Creator Marketplace</Link></li>
              <li><Link href="/dashboard" className="hover:text-neon-cyan transition-colors">User Dashboard & Badges</Link></li>
              <li><Link href="/admin" className="hover:text-neon-cyan transition-colors">Admin Studio & Analytics</Link></li>
            </ul>
          </div>

          {/* Safety Principles */}
          <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-neon-green">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-heading text-xs font-semibold text-white">Safe Prank Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              All pranks run 100% inside your browser sandbox. No software downloads, no credential harvesting, zero system changes. ESC key reveals immediately.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrankStar.io — Built for safe entertainment & browser simulation.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Powered by</span>
            <span className="text-neon-purple font-mono font-medium">Next.js 14 & Web Audio API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
