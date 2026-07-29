'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { MASTER_PRANKS, PrankTemplate } from '@/lib/pranks-data';
import { getPublishedPranks } from '@/lib/db';
import { getCustomPranks } from '@/lib/builder-store';
import { audioSynth } from '@/lib/audio-synthesizer';
import { addXP, unlockBadge, incrementPranksLaunched } from '@/lib/gamification';
import { recordView } from '@/lib/prank-stats';
import { getCurrentUser } from '@/lib/auth';
import { 
  X, Play, Share2, Home, ShieldAlert, Check, Volume2, Sparkles
} from 'lucide-react';

function PrankPlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params?.slug as string;

  // Resolve prank from MASTER_PRANKS, Published DB pranks, or Custom Builder storage
  const [prank, setPrank] = useState<PrankTemplate | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // 1. Try master pranks
    let found = MASTER_PRANKS.find((p) => p.slug === slug);

    // 2. Try published DB pranks
    if (!found) {
      const pub = getPublishedPranks().find((p) => p.slug === slug);
      if (pub) {
        found = {
          id: pub.id,
          title: pub.title,
          slug: pub.slug,
          description: pub.description,
          category: pub.category,
          os: pub.os,
          difficulty: pub.difficulty,
          duration: pub.duration,
          thumbnail: pub.thumbnail,
          soundFx: pub.soundFx,
          revealMessage: pub.revealMessage,
          tags: pub.tags || ['custom'],
          views: pub.views,
          likes: pub.likes,
          shares: pub.shares,
        };
      }
    }

    // 3. Try custom builder pranks
    if (!found) {
      const cust = getCustomPranks().find((p) => p.slug === slug);
      if (cust) {
        found = {
          id: cust.id,
          title: cust.title,
          slug: cust.slug,
          description: `Custom Prank by ${cust.author}`,
          category: 'Interactive',
          os: 'Cross-platform',
          difficulty: 'Easy',
          duration: cust.timerDuration || 15,
          thumbnail: '🎨',
          soundFx: cust.soundFx || 'sirenAlarm',
          revealMessage: cust.revealMessage || 'You got PrankStar\'d!',
          tags: ['custom'],
          views: 100,
          likes: cust.likes || 1,
          shares: 5,
        };
      }
    }

    // Fallback to first master prank if not found
    setPrank(found || MASTER_PRANKS[0]);
  }, [slug]);

  const targetName = searchParams.get('name') || 'Friend';
  const timerSetting = Number(searchParams.get('timer')) || prank?.duration || 10;
  const customMsg = searchParams.get('msg') || prank?.revealMessage || 'You got PrankStar\'d!';
  const audioEnabled = searchParams.get('audio') !== 'false';

  const [timeLeft, setTimeLeft] = useState(timerSetting);
  const [isRevealed, setIsRevealed] = useState(false);
  const [percent, setPercent] = useState(0);
  const [matrixText, setMatrixText] = useState<string[]>([]);
  const [crackedOverlay, setCrackedOverlay] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasRecordedView = useRef(false);

  // Start simulation on user interaction or mount
  const handleStartPrank = () => {
    if (hasStarted) return;
    setHasStarted(true);

    if (audioEnabled && prank) {
      if (prank.customAudioUrl) {
        try {
          const audio = new Audio(prank.customAudioUrl);
          audio.volume = 1.0; // Force 100% Max Volume
          audio.play().catch(() => {});
          
          // Lock volume at 1.0 max continuously
          const volLock = setInterval(() => {
            if (audio) {
              audio.volume = 1.0;
            }
          }, 50);

          setTimeout(() => clearInterval(volLock), (timerSetting + 5) * 1000);
        } catch {}
      } else {
        audioSynth.playSound(prank.soundFx);
      }
    }
  };

  useEffect(() => {
    if (!prank) return;
    setTimeLeft(timerSetting);

    if (!hasRecordedView.current) {
      recordView(slug);
      incrementPranksLaunched();
      hasRecordedView.current = true;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          triggerReveal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const percentInterval = setInterval(() => {
      setPercent((prev) => (prev >= 99 ? 99 : prev + Math.floor(Math.random() * 8) + 1));
    }, 800);

    const matrixLogs = [
      `[SYSTEM] Connecting to server at 192.168.1.${Math.floor(Math.random()*250)}...`,
      `[BREACH] Bypass firewall protocol 8080...`,
      `[EXTRACT] Downloading target filesystem for user: ${targetName}...`,
      `[STATUS] Access Granted. Extracting encryption keys...`,
      `[WARN] Firewall rule bypassed on port ${3000 + Math.floor(Math.random()*5000)}`,
      `[DATA] Found 4,291 sensitive files in /home/${targetName.toLowerCase()}/`,
    ];
    const matrixInterval = setInterval(() => {
      setMatrixText((prev) => [...prev.slice(-12), matrixLogs[Math.floor(Math.random() * matrixLogs.length)]]);
    }, 1200);

    // Trap browser back button so victim cannot navigate away during active prank
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      if (!isRevealed) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Block keyboard shortcuts, escape, backspace, refresh, and navigation keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRevealed) {
        // Prevent all back/exit/refresh keys while prank is in progress
        if (
          e.key === 'Escape' ||
          e.key === 'Backspace' ||
          e.key === 'F5' ||
          e.key === 'F11' ||
          e.key === 'Tab' ||
          (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 'w' || e.key === 'W')) ||
          (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    // Warn if victim attempts to reload or close tab
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isRevealed) {
        e.preventDefault();
        e.returnValue = 'Prank simulation in progress!';
        return 'Prank simulation in progress!';
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timerInterval);
      clearInterval(percentInterval);
      clearInterval(matrixInterval);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [prank, isRevealed]);

  const triggerReveal = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    if (audioEnabled) {
      audioSynth.playSound('applause');
    }

    addXP(25);
    unlockBadge('badge-first-prank');

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      unlockBadge('badge-night-owl');
    }

    if (slug === 'matrix-hacker') {
      unlockBadge('badge-hacker-pro');
    }

    if (slug === 'pizza-delivery-tracker') {
      unlockBadge('badge-food-troll');
    }

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleTouchShatter = () => {
    handleStartPrank();
    setCrackedOverlay(true);
    if (audioEnabled) {
      audioSynth.playSound('glassShatter');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prank) return null;

  if (isRevealed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/95 backdrop-blur-2xl text-center page-fade-in">
        <div className="max-w-lg w-full p-8 rounded-3xl glass-card border border-purple-500/50 shadow-2xl shadow-purple-500/30 space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-5xl animate-bounce">
            😂
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-3xl text-white tracking-wide">
              You Got PrankStar&apos;d!
            </h2>
            <p className="text-sm font-semibold text-neon-cyan font-mono">
              Target: {targetName}
            </p>
            <p className="text-sm text-slate-300 bg-slate-900/80 p-4 rounded-2xl border border-white/10 italic mt-2">
              &ldquo;{customMsg}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => router.push('/explore')}
              className="py-3 px-4 rounded-xl btn-neon-purple font-heading font-bold text-xs text-white flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Prank Someone Else</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl btn-neon-cyan font-heading font-bold text-xs text-white flex items-center justify-center space-x-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Share Prank'}</span>
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 rounded-xl glass-panel text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to PrankStar Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleTouchShatter}
      className="fixed inset-0 z-[90] bg-black text-white flex flex-col justify-between p-6 select-none overflow-hidden cursor-pointer"
    >
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        {!hasStarted && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartPrank(); }}
            className="px-4 py-2 rounded-full bg-neon-purple text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg animate-pulse"
          >
            <Volume2 className="w-4 h-4" />
            <span>Click to Enable Audio</span>
          </button>
        )}
      </div>

      {crackedOverlay && (
        <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/5 to-white/10 border-4 border-red-500/50 crt-effect">
          <div className="absolute top-1/3 left-1/4 text-6xl opacity-30 select-none font-mono">💥 CRACKED</div>
        </div>
      )}

      {/* BSOD Simulation */}
      {slug === 'windows-11-bsod' && (
        <div className="h-full bg-[#0078d4] text-white p-12 flex flex-col justify-between font-sans">
          <div className="space-y-6 max-w-4xl mt-12">
            <div className="text-8xl font-light">:(</div>
            <h1 className="text-3xl font-light leading-snug">
              Your PC ran into a problem and needs to restart. We&apos;re just collecting some error info, and then we&apos;ll restart for you.
            </h1>
            <div className="text-2xl font-light">{percent}% complete</div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white p-2 shrink-0">
              <div className="w-full h-full border-2 border-black flex items-center justify-center font-mono text-[10px] text-black font-bold">QR CODE</div>
            </div>
            <div className="text-xs space-y-1 text-slate-100 font-mono">
              <p>For more information about this issue and possible fixes, visit https://windows.com/stopcode</p>
              <p>If you call a support person, give them this info:</p>
              <p>Stop code: CRITICAL_PROCESS_DIED</p>
              <p>What failed: {targetName.toUpperCase()}_SYSTEM_CORE.SYS</p>
            </div>
          </div>
        </div>
      )}

      {/* Matrix Hacker Terminal */}
      {slug === 'matrix-hacker' && (
        <div className="h-full bg-black text-green-400 font-mono p-8 flex flex-col justify-between crt-effect">
          <div className="space-y-3">
            <div className="text-xl font-bold border-b border-green-500/40 pb-2 flex items-center justify-between">
              <span>SYSTEM BREACH TERMINAL // TARGET: {targetName.toUpperCase()}</span>
              <span className="animate-pulse text-xs bg-green-400 text-black px-2 py-0.5 font-bold">LIVE HACK</span>
            </div>
            <div className="space-y-1 text-sm text-green-400/90">
              {matrixText.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
          <div className="border border-green-500/30 p-4 rounded bg-green-500/10 text-xs font-mono space-y-1">
            <p className="font-bold text-white">COMMAND EXECUTION STATUS: 100% COMPLETE</p>
            <p>Target identity encrypted. Extracted 4,291 photos from camera roll.</p>
          </div>
        </div>
      )}

      {/* Fake Ransomware */}
      {slug === 'fake-ransomware' && (
        <div className="h-full bg-red-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6">
          <ShieldAlert className="w-20 h-20 text-red-500 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-red-500 tracking-wider">YOUR FILES ARE ENCRYPTED!</h1>
          <p className="text-sm max-w-lg text-slate-300">
            All personal documents, photos, and browser databases for <span className="text-white font-bold">{targetName}</span> have been encrypted with RSA-4096.
          </p>
          <div className="p-6 bg-black/80 rounded-2xl border border-red-500/50 space-y-2">
            <div className="text-xs text-slate-400 font-mono">TIME LEFT TO PAY BITCOIN RANSOM</div>
            <div className="text-4xl font-mono font-bold text-yellow-400">00:0{timeLeft}:59</div>
          </div>
        </div>
      )}

      {/* Pizza Delivery Tracker */}
      {slug === 'pizza-delivery-tracker' && (
        <div className="h-full bg-slate-900 text-white p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🍕</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Uber Eats Live Tracker</h2>
                <p className="text-xs text-slate-400">Order #948192 &bull; Delivery for {targetName}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-green-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span>Driver Approaching Location!</span>
              </div>
              <p className="text-xs text-slate-300">Item: 50x XL Extra Cheese Pepperoni Pizzas ($1,450.00)</p>
              <p className="text-xs text-slate-400">Status: Card charged automatically.</p>
            </div>
          </div>
          <div className="h-48 bg-slate-950 rounded-xl border border-white/10 flex items-center justify-center text-xs font-mono text-slate-500">
            [LIVE MAP SIMULATION: DRIVER IS 50 METERS AWAY]
          </div>
        </div>
      )}

      {/* Generic Dynamic Prank Player for All Other Pranks */}
      {!['windows-11-bsod', 'matrix-hacker', 'fake-ransomware', 'pizza-delivery-tracker'].includes(slug) && (
        <div className="h-full bg-dark-900 text-white p-8 flex flex-col items-center justify-center text-center space-y-6 animate-blur-in">
          {prank.customImageUrl ? (
            <div className="w-full max-w-lg h-64 rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20">
              <img src={prank.customImageUrl} alt={prank.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-6xl animate-pulse pulse-ring">
              {prank.thumbnail}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white font-heading">{prank.title}</h1>
            <p className="text-xs text-neon-cyan font-mono font-bold">Target: {targetName}</p>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{prank.description}</p>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
            <div className="text-xs text-slate-500 font-mono">SIMULATION ACTIVE</div>
            <div className="text-2xl font-mono text-neon-purple font-bold">
              {timeLeft}s remaining
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrankPlayerPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black text-white flex items-center justify-center font-mono text-sm">Loading Prank Simulation...</div>}>
      <PrankPlayerContent />
    </Suspense>
  );
}
