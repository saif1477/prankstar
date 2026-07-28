'use client';

import React, { useEffect, useState } from 'react';
import { unlockBadge, addXP } from '@/lib/gamification';
import { audioSynth } from '@/lib/audio-synthesizer';
import { Sparkles, Terminal, X, Trophy } from 'lucide-react';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function KonamiListener() {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [showSecretModal, setShowSecretModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      setInputSequence((prev) => {
        const nextSequence = [...prev, key].slice(-KONAMI_CODE.length);
        if (JSON.stringify(nextSequence.map(k => k.toLowerCase())) === JSON.stringify(KONAMI_CODE.map(k => k.toLowerCase()))) {
          triggerSecret();
        }
        return nextSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSecret = () => {
    audioSynth.playSound('matrixTyping');
    addXP(100);
    unlockBadge('badge-konami-secret');
    setShowSecretModal(true);
  };

  if (!showSecretModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl glass-card border border-neon-cyan/50 shadow-2xl shadow-cyan-500/20 text-center space-y-4">
        <button
          onClick={() => setShowSecretModal(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-3xl animate-bounce">
          🕹️
        </div>

        <h3 className="font-heading font-extrabold text-2xl text-white tracking-wide">
          KONAMI CODE ACTIVATED!
        </h3>

        <p className="text-sm text-neon-cyan font-mono">
          You unlocked the hidden Retro Matrix Developer Mode!
        </p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center space-x-3 text-left">
          <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">SECRET BADGE UNLOCKED</div>
            <div className="text-xs text-slate-400 font-mono">+100 XP • Retro Matrix Lord</div>
          </div>
        </div>

        <button
          onClick={() => setShowSecretModal(false)}
          className="w-full py-2.5 rounded-xl btn-neon-cyan font-heading text-sm font-semibold text-white shadow-lg"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
}
