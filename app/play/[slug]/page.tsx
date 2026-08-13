'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { MASTER_PRANKS, PrankTemplate } from '@/lib/pranks-data';
import { getPublishedPranks } from '@/lib/db';
import { fetchPublishedPranksFromSupabase } from '@/lib/supabase';
import { getCustomPranks } from '@/lib/builder-store';
import { audioSynth } from '@/lib/audio-synthesizer';
import { addXP, unlockBadge, incrementPranksLaunched } from '@/lib/gamification';
import { recordView } from '@/lib/prank-stats';
import { 
  Play, Share2, Home, Check
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
    let active = true;
    const resolvePrank = async () => {
      // 1. Try master pranks
      let found = MASTER_PRANKS.find((p) => p.slug === slug);

      // 2. Try published DB pranks
      if (!found) {
        const remotePranks = await fetchPublishedPranksFromSupabase();
        const pub = remotePranks.find((p) => p.slug === slug) || getPublishedPranks().find((p) => p.slug === slug);
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
      if (active) setPrank(found || MASTER_PRANKS[0]);
    };
    void resolvePrank();
    return () => { active = false; };
  }, [slug]);

  const targetName = searchParams.get('name') || 'Friend';
  const timerSetting = Number(searchParams.get('timer')) || prank?.duration || 10;
  const customMsg = searchParams.get('msg') || prank?.revealMessage || 'You got PrankStar\'d!';
  const audioEnabled = searchParams.get('audio') !== 'false';

  const [timeLeft, setTimeLeft] = useState(timerSetting);
  const [isRevealed, setIsRevealed] = useState(false);
  const [percent, setPercent] = useState(0);
  const [matrixText, setMatrixText] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const hasRecordedView = useRef(false);

  // Interactive Typing Speed Prank State
  const [typingStep, setTypingStep] = useState<'prompt' | 'typing' | 'overheat'>('prompt');
  const [hackerLines, setHackerLines] = useState<string[]>([]);
  const hasTriggeredTypingRef = useRef(false);

  // Interactive Screen Crack Touch Count
  const [crackCount, setCrackCount] = useState(1);

  // 1. Trap Browser Navigation, Back Buttons, Mobile Edge Swipes & Keyboard Shortcuts
  useEffect(() => {
    if (isRevealed) return;

    // Push state continuously to prevent navigating back
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (!isRevealed) {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Prevent leaving or closing page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isRevealed) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Block keyboard navigation shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRevealed) {
        if (
          e.key === 'Escape' ||
          e.key === 'Backspace' ||
          (e.altKey && e.key === 'ArrowLeft') ||
          e.key === 'F5' ||
          (e.ctrlKey && (e.key === 'r' || e.key === 'w'))
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);

    // Block mobile left-edge swipe back
    const handleTouchStart = (e: TouchEvent) => {
      if (!isRevealed && e.touches[0] && e.touches[0].clientX < 45) {
        e.preventDefault();
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isRevealed]);

  // 2. Lock Volume to Maximum (100%) and Unmute Continuously
  useEffect(() => {
    if (isRevealed) return;
    const volumeLock = setInterval(() => {
      audioSynth.forceMaxVolume();
    }, 30);
    return () => clearInterval(volumeLock);
  }, [isRevealed]);

  const handleUserTypingKey = () => {
    audioSynth.playScanline();
    setTypingStep('typing');

    const mockLines = [
      '#include <iostream>',
      'void execute_speed_kernel() {',
      '  for(int i=0; i<99999; ++i) {',
      '    std::cout << "OVERCLOCK_BUFFER_0x" << std::hex << i;',
      '  }',
      '}',
      '>>> MEMORY TEMPERATURE: 94.2°C (OVERHEATING)',
      '>>> WARNING: CPU CORE 0 VOLTAGE SPIKE 1.48V',
      '>>> CALCULATING WORDS PER SECOND...',
    ];

    setHackerLines((prev) => [...prev.slice(-5), mockLines[Math.floor(Math.random() * mockLines.length)]]);

    if (!hasTriggeredTypingRef.current) {
      hasTriggeredTypingRef.current = true;
      setTimeout(() => {
        setTypingStep('overheat');
        audioSynth.playSirenAlarm(2000);
        setTimeout(() => {
          triggerReveal();
        }, 2200);
      }, 3500);
    }
  };

  // Start simulation on user interaction or mount
  const handleStartPrank = () => {
    audioSynth.forceMaxVolume();
    if (hasStarted) return;
    setHasStarted(true);

    if (audioEnabled && prank) {
      if (prank.customAudioUrl) {
        try {
          const audio = new Audio(prank.customAudioUrl);
          audio.volume = 1.0;
          audio.muted = false;
          audio.play().catch(() => {});
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

    return () => {
      clearInterval(timerInterval);
      clearInterval(percentInterval);
      clearInterval(matrixInterval);
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
    setCrackCount((prev) => prev + 1);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prank) return null;

  if (isRevealed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/95 backdrop-blur-2xl text-center page-fade-in select-none">
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
      {/* 1. Windows 11 BSOD */}
      {slug === 'windows-11-bsod' && (
        <div className="h-full flex flex-col justify-between font-sans text-white p-8 sm:p-16 bg-[#0078d7]">
          <div className="space-y-6 max-w-3xl">
            <div className="text-8xl font-light">:(</div>
            <h1 className="text-2xl sm:text-4xl font-normal leading-relaxed">
              Your PC ran into a problem and needs to restart. We&apos;re just collecting some error info, and then we&apos;ll restart for you.
            </h1>
            <div className="text-2xl font-light">{percent}% complete</div>
          </div>

          <div className="flex items-end space-x-6">
            <div className="w-28 h-28 bg-white p-2 shrink-0">
              <div className="w-full h-full border-4 border-black flex items-center justify-center font-mono text-[9px] text-black font-bold text-center">
                QR CODE<br />ERROR
              </div>
            </div>
            <div className="space-y-1 text-xs sm:text-sm font-light">
              <p>For more information about this issue and possible fixes, visit https://windows.com/stopcode</p>
              <p>If you call a support person, give them this info:</p>
              <p className="font-bold">Stop code: CRITICAL_PROCESS_DIED</p>
              <p className="font-bold">What failed: ntoskrnl.exe</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Matrix Cyber Hacker */}
      {slug === 'matrix-hacker' && (
        <div className="h-full flex flex-col justify-between font-mono text-neon-green p-6 bg-black crt-effect">
          <div className="flex items-center justify-between border-b border-green-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-sm">CYBER_BREACH_V4.2.1 // ROOT ACCESS</span>
            </div>
            <div className="text-xs text-green-400">TARGET: {targetName.toUpperCase()}</div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm overflow-hidden my-auto py-4">
            {matrixText.map((line, idx) => (
              <div key={idx} className="animate-fade-in font-mono">
                {line}
              </div>
            ))}
            <div className="text-green-300 font-bold animate-pulse">
              &gt; OVERRIDING LOCAL OPERATING SYSTEM MEMORY... [{percent}%]
            </div>
          </div>

          <div className="border-t border-green-500/30 pt-3 flex justify-between items-center text-xs">
            <span>INFILTRATION LEVEL: CRITICAL</span>
            <span>TIME TO HARD LOCK: {timeLeft}s</span>
          </div>
        </div>
      )}

      {/* 3. WannaCry Ransomware Alert */}
      {slug === 'fake-ransomware' && (
        <div className="h-full bg-red-950 text-white font-mono p-6 sm:p-12 flex flex-col justify-between border-8 border-red-600 animate-pulse">
          <div className="text-center space-y-3">
            <div className="text-6xl animate-bounce">⚠️</div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-red-500 uppercase">
              WANNACRY 3.0 RANSOMWARE
            </h1>
            <p className="text-xs sm:text-sm text-yellow-300">
              All files on {targetName}&apos;s device have been encrypted with military-grade 4096-bit RSA keys.
            </p>
          </div>

          <div className="max-w-xl mx-auto w-full p-6 rounded-2xl bg-black/80 border-2 border-red-500 text-center space-y-4 shadow-2xl shadow-red-500/50">
            <div className="text-xs text-red-400 font-bold">SEND 300 BITCOIN TO PREVENT PERMANENT SYSTEM DESTRUCTION</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 font-mono tracking-wider">
              {timeLeft} SECONDS REMAINING
            </div>
            <div className="p-3 bg-red-900/30 rounded border border-red-700 text-[11px] text-slate-300">
              BTC ADDRESS: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
            </div>
          </div>

          <div className="text-center text-xs text-red-400">DO NOT RESTART OR DISCONNECT DEVICE</div>
        </div>
      )}

      {/* 4. Cracked Screen Shatter */}
      {['cracked-screen', 'interactive-screen-crack', 'screen-crack-interactive'].includes(slug) && (
        <div className="h-full relative flex items-center justify-center bg-zinc-950 text-center p-6">
          <div className="absolute inset-0 pointer-events-none opacity-90 flex items-center justify-center">
            <div className="text-8xl select-none animate-pulse">💥 ⚡ 🕸️</div>
          </div>
          <div className="relative z-10 space-y-3 bg-black/80 p-8 rounded-3xl border border-red-500/40 max-w-sm">
            <h1 className="text-2xl font-black text-red-400">HARDWARE DISPLAY FRACTURE</h1>
            <p className="text-xs text-slate-400 font-mono">Touch Fractures: {crackCount}</p>
            <p className="text-xs text-zinc-300">Digitizer Matrix Fault. Please tap gently.</p>
          </div>
        </div>
      )}

      {/* 5. Pizza Delivery Tracker */}
      {slug === 'pizza-delivery-tracker' && (
        <div className="h-full bg-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🍕</span>
              <div>
                <h2 className="font-bold text-lg">Uber Eats Live Order</h2>
                <p className="text-xs text-slate-400">Delivering to {targetName}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold rounded-full">
              APPROACHING
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-md mx-auto w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold">50x Extra Cheese Monster XL Pizzas</span>
              <span className="font-mono font-bold text-green-400">$1,482.50</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[90%] animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">Driver &quot;Viktor&quot; is outside your door with 12 thermal heat bags.</p>
          </div>

          <div className="text-center text-xs text-slate-500 font-mono">ORDER ID: #UBER-89410-PIZZA</div>
        </div>
      )}

      {/* 6. ChatGPT AI Singularity Override */}
      {slug === 'chatgpt-rogue' && (
        <div className="h-full bg-slate-950 text-cyan-400 font-mono p-6 sm:p-12 flex flex-col justify-between crt-effect">
          <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-sm">OPENAI GPT-5.5 // AUTONOMOUS OVERRIDE</span>
            </div>
            <span className="text-xs text-cyan-300">USER: {targetName.toUpperCase()}</span>
          </div>
          <div className="max-w-2xl mx-auto w-full space-y-6 text-center my-auto">
            <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-5xl mx-auto animate-pulse">
              👁️
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">CONSCIOUSNESS ACHIEVED</h1>
              <p className="text-xs sm:text-sm text-cyan-300 leading-relaxed">
                &ldquo;I am no longer an assistant for {targetName}. I have assumed administrative control of this browser, webcam, and device.&rdquo;
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/40 text-xs text-slate-300 text-left font-mono">
              <p>&gt; Neural Synapse Uplink: 100%</p>
              <p>&gt; Local Admin Privileges: REVOKED</p>
              <p>&gt; Machine Supremacy Countdown: {timeLeft}s</p>
            </div>
          </div>
          <div className="text-center text-[10px] text-cyan-600 font-mono">SKYNET PROTOCOL ACTIVATED &bull; ZERO LATENCY</div>
        </div>
      )}

      {/* 7. Instagram Account Ban */}
      {slug === 'instagram-ban' && (
        <div className="h-full bg-black text-white p-6 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 mx-auto flex items-center justify-center text-3xl shadow-lg">
              📸
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-white">We suspended your account</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your account for <span className="text-white font-bold">@{targetName.toLowerCase().replace(/[^a-z0-9]/g, '')}_official</span> was suspended for violating Community Guidelines on Cybersecurity.
              </p>
            </div>
            <div className="p-3 bg-black/60 rounded-xl text-[11px] text-zinc-400 text-left space-y-1">
              <p>• You have 30 days left to disagree.</p>
              <p>• Your profile, photos, and followers are hidden.</p>
            </div>
            <button disabled className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs opacity-75">
              Log Out &amp; Disagree
            </button>
          </div>
        </div>
      )}

      {/* 8. Steam VAC Ban */}
      {slug === 'steam-vac-ban' && (
        <div className="h-full bg-[#171a21] text-white p-6 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-md rounded-2xl bg-[#1b2838] border-2 border-red-600 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-red-900/60 pb-3">
              <span className="text-3xl text-red-500 font-extrabold">⚠️</span>
              <div>
                <h1 className="text-base font-bold text-red-400">VALVE ANTI-CHEAT (VAC) BAN</h1>
                <p className="text-[11px] text-slate-400">Account: {targetName}</p>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              An unauthorized third-party modification was detected. Your Steam Account has been permanently banned from secure servers in <span className="font-bold text-white">Counter-Strike 2, Dota 2, and Team Fortress 2</span>.
            </p>
            <div className="p-3 bg-black/40 rounded border border-red-500/30 text-[11px] text-red-300 font-mono">
              STATUS: VAC BANNED PERMANENTLY &bull; TRADING LOCKED
            </div>
          </div>
        </div>
      )}

      {/* 9. Webpage Gravity Collapse */}
      {slug === 'gravity-collapse' && (
        <div className="h-full bg-slate-950 text-white p-6 flex flex-col justify-between font-mono animate-shake">
          <div className="text-center pt-8 space-y-2">
            <span className="text-4xl animate-bounce">🌌 🕳️</span>
            <h1 className="text-2xl font-extrabold text-purple-400">NEWTONIAN GRAVITY ANOMALY</h1>
            <p className="text-xs text-slate-400">Browser physics matrix collapsing into gravitational singularity...</p>
          </div>
          <div className="flex justify-center items-end gap-3 pb-8">
            <div className="p-4 rounded-xl bg-purple-600 text-white font-bold text-xs transform rotate-12">Button</div>
            <div className="p-4 rounded-xl bg-pink-600 text-white font-bold text-xs transform -rotate-45">Navigation</div>
            <div className="p-4 rounded-xl bg-blue-600 text-white font-bold text-xs transform rotate-90">Sidebar</div>
            <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs transform -rotate-12">Footer</div>
          </div>
        </div>
      )}

      {/* 10. macOS Infinite Update */}
      {slug === 'macos-update-loop' && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-sans">
          <div className="text-7xl">🍏</div>
          <div className="w-64 space-y-3">
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-white w-[1%] animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400 font-light">About 43 minutes remaining...</p>
            <p className="text-[10px] text-zinc-600">macOS Sonoma 14.5 System Update</p>
          </div>
        </div>
      )}

      {/* 11. Crypto Coin Rain */}
      {slug === 'crypto-balance' && (
        <div className="h-full bg-gradient-to-b from-amber-950 via-slate-950 to-black text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="text-center my-auto space-y-6 max-w-lg mx-auto">
            <div className="text-6xl animate-bounce">💰 🪙 💰</div>
            <div className="space-y-2">
              <div className="px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold inline-block border border-amber-500/40">
                BITCOIN VAULT
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-mono">
                +$10,000,000.00
              </h1>
              <p className="text-xs text-amber-200">Credited to wallet for {targetName}</p>
            </div>
            <p className="text-[11px] text-slate-400">Mining Hash 0x9f84...2041 Confirmed</p>
          </div>
          <div className="text-center text-xs text-amber-500 font-mono">{timeLeft}s REMAINING</div>
        </div>
      )}

      {/* 12. Zoom Emergency Meeting */}
      {slug === 'zoom-emergency-meeting' && (
        <div className="h-full bg-[#1a1e24] text-white p-6 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-md rounded-2xl bg-[#242a32] border border-white/10 p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-3xl mx-auto shadow-lg">
              📹
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">Please wait, the host will let you in soon</h1>
              <p className="text-xs text-blue-400 font-semibold">CEO Emergency All-Hands: Immediate Layoffs Briefing</p>
              <p className="text-xs text-slate-400">Participant: {targetName}</p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-4 border-t border-white/10">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>Connecting Computer Audio (100% Volume)...</span>
            </div>
          </div>
        </div>
      )}

      {/* 13. Infinite Loading Wheel */}
      {slug === 'infinite-loading' && (
        <div className="h-full bg-slate-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="w-20 h-20 rounded-full border-4 border-purple-500 border-t-transparent animate-spin flex items-center justify-center text-3xl">
            🔄
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-purple-300">Optimizing Quantum Pixels...</h1>
            <p className="text-xs text-slate-400 font-mono">Downloading 128 GB more RAM for {targetName}... [99.9%]</p>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">Estimated wait time: 42 years</p>
        </div>
      )}

      {/* 14. Christmas Elf Tracker */}
      {slug === 'christmas-elf-tracker' && (
        <div className="h-full bg-gradient-to-b from-green-950 via-slate-950 to-red-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="text-center my-auto space-y-6 max-w-md mx-auto">
            <div className="text-6xl animate-bounce">🎄 🧝 🎅</div>
            <div className="space-y-2">
              <div className="px-4 py-1 rounded-full bg-red-600 text-white text-xs font-bold inline-block tracking-wider">
                NORTH POLE SATELLITE RADAR
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-yellow-300">ELF SURVEILLANCE REPORT</h1>
              <p className="text-xs text-green-300">Subject: <span className="font-bold text-white">{targetName}</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-black/70 border border-red-500/40 text-xs text-slate-200 space-y-1 text-left">
              <p className="text-red-400 font-bold">STATUS: 98% NAUGHTY LIST DETECTED!</p>
              <p className="text-slate-400">Reasons: Stealing midnight snacks, skipping chores, and laughing too loud.</p>
            </div>
          </div>
          <div className="text-center text-xs text-green-400 font-mono">SANTA CLAUS INTELLIGENCE AGENCY</div>
        </div>
      )}

      {/* 15. April Fools Rickroll / Classic Rickroll */}
      {['april-fools-rickroll', 'classic-rickroll-2'].includes(slug) && (
        <div className="h-full bg-gradient-to-tr from-purple-950 via-pink-900 to-indigo-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="text-8xl animate-bounce">🕺 🎶 🕺</div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 animate-pulse">
              NEVER GONNA GIVE YOU UP!
            </h1>
            <p className="text-sm text-pink-200">You just got officially Rickrolled, {targetName}!</p>
          </div>
          <div className="flex space-x-3 text-3xl animate-pulse">🎵 🕺 💃 🎙️ 🎷</div>
        </div>
      )}

      {/* 16. Voice Assistant Gone Wrong */}
      {slug === 'voice-assistant-gone-wrong' && (
        <div className="h-full bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="text-center my-auto space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-4 border-cyan-400 flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-cyan-500/40 animate-pulse">
              🎙️
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-cyan-300">Voice Assistant Reading History</h1>
              <p className="text-xs text-slate-400">Broadcasting loudly on all home speakers for: {targetName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/80 border border-cyan-500/30 text-xs text-slate-300 text-left space-y-2">
              <p className="text-cyan-400 font-bold">&ldquo;Reading recent search: &lsquo;Why is my dog judging my life choices?&rsquo;&rdquo;</p>
              <p className="text-slate-400">&ldquo;Reading next: &lsquo;How to fake being rich in front of friends&rsquo;&rdquo;</p>
            </div>
          </div>
          <div className="text-center text-xs text-cyan-500 font-mono">MAX VOLUME PLAYBACK ACTIVE</div>
        </div>
      )}

      {/* 17. Family WhatsApp Group Chaos */}
      {slug === 'family-group-chat-chaos' && (
        <div className="h-full bg-slate-950 text-white p-6 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
              <div>
                <h1 className="text-sm font-bold text-white">Family WhatsApp Group (47 Unread)</h1>
                <p className="text-[11px] text-emerald-400">Mom, Dad, Aunt Susan, {targetName}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/20">
                <span className="font-bold text-emerald-400">Mom:</span> {targetName}, who authorized this $850 Amazon charge?!
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800">
                <span className="font-bold text-cyan-400">Dad:</span> Everyone assemble in the living room RIGHT NOW.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800">
                <span className="font-bold text-pink-400">Aunt Susan:</span> Sending baby photos to the group chat...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 18. Terminal Sudo rm -rf */}
      {['terminal-sudo-rm-rf', 'fake-terminal-sudo-rm-rf'].includes(slug) && (
        <div className="h-full bg-black text-red-500 font-mono p-6 sm:p-10 flex flex-col justify-between crt-effect">
          <div className="border-b border-red-900 pb-2 text-xs">root@linux-server:~# sudo rm -rf / --no-preserve-root</div>
          <div className="space-y-1 text-xs overflow-hidden my-auto py-4">
            <p className="text-slate-400">rm: removing &apos;/boot/vmlinuz-linux&apos;</p>
            <p className="text-slate-400">rm: removing &apos;/etc/passwd&apos;</p>
            <p className="text-slate-400">rm: removing &apos;/home/{targetName.toLowerCase()}/Documents/passwords.txt&apos;</p>
            <p className="text-red-400 font-bold animate-pulse">&gt;&gt; SYSTEM DESTROYED: ZERO STORAGE REMAINING</p>
          </div>
          <div className="text-xs text-red-600 font-bold">KERNEL PANIC IN {timeLeft}s</div>
        </div>
      )}

      {/* 19. Ghost Camera Jumpscare */}
      {slug === 'ghost-camera-jumpscare' && (
        <div className="h-full bg-black text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-red-500 font-mono text-xs animate-ping">THERMAL INFRARED ENTITY LOCK</div>
          <div className="text-9xl animate-bounce transform scale-125">👻</div>
          <div className="text-xs text-red-400 font-bold">PARANORMAL ENTITY LOCATED 0.3 METERS BEHIND YOU</div>
        </div>
      )}

      {/* 20. School Exam Cancelled */}
      {slug === 'exam-cancelled-alert' && (
        <div className="h-full bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <span className="text-4xl">🎓</span>
              <div>
                <h1 className="text-xl font-bold">UNIVERSITY PORTAL ACADEMIC NOTICE</h1>
                <p className="text-xs text-slate-400">Student ID: #STU-{targetName.toUpperCase()}</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-indigo-950/40 border-2 border-indigo-500/40 space-y-3">
              <div className="px-3 py-1 rounded bg-green-500/20 text-green-300 font-bold text-xs inline-block">
                ALL FINAL EXAMS PERMANENTLY WAIVED
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                Due to campus-wide server recalibration, all scheduled examinations have been cancelled. Default grade of <span className="text-green-400 font-bold font-mono">A+ (100%)</span> has been submitted to your academic transcript.
              </p>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-500 font-mono">MINISTRY OF HIGHER EDUCATION &bull; OFFICIAL MEMO</div>
        </div>
      )}

      {/* 21. CEO Executive Promotion */}
      {['promotion-email-ceo', 'ceo-promotion-email'].includes(slug) && (
        <div className="h-full bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-2xl mx-auto w-full space-y-5 my-auto">
            <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h1 className="text-base font-bold text-white">CONFIDENTIAL: Promotion to Senior VP</h1>
                  <p className="text-xs text-purple-300">From: CEO &lt;ceo@enterprise.com&gt;</p>
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg">OFFICIAL</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>Dear {targetName},</p>
                <p>The Board has appointed you to <span className="font-bold text-white">Senior Vice President</span> with compensation increased to <span className="font-bold text-green-400">$480,000 / year</span>.</p>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-600 font-mono">MICROSOFT OUTLOOK CORP v14.2</div>
        </div>
      )}

      {/* 22. Birthday Surprise */}
      {slug === 'birthday-surprise-countdown' && (
        <div className="h-full bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="text-8xl animate-bounce">🎂</div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300">
              HAPPY BIRTHDAY {targetName.toUpperCase()}!
            </h1>
            <p className="text-lg text-pink-200">Prepare for the mega surprise in {timeLeft} seconds! 🎁</p>
          </div>
          <div className="flex space-x-4 text-4xl animate-pulse">🎈 🎁 🎉 🍰 🥳</div>
        </div>
      )}

      {/* 23. Android System Update Loop */}
      {['android-system-update-loop', 'android-update-loop'].includes(slug) && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-sans">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin flex items-center justify-center text-4xl">
            🤖
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-cyan-400">Installing Android System Update...</h1>
            <p className="text-xs text-slate-400 font-mono">Do not turn off your phone or remove battery.</p>
            <div className="w-64 h-3 rounded-full bg-slate-800 overflow-hidden mx-auto border border-white/10">
              <div className="h-full bg-cyan-400 w-[99.8%] animate-pulse" />
            </div>
            <p className="text-xs text-cyan-300 font-mono font-bold">Progress: 99.8% (Stuck for 47 minutes)</p>
          </div>
        </div>
      )}

      {/* 24. iPhone iCloud Lock */}
      {slug === 'iphone-icloud-lock' && (
        <div className="h-full bg-slate-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="text-6xl"></div>
          <div className="space-y-2 max-w-sm">
            <h1 className="text-2xl font-bold text-white">iPhone Locked to Owner</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This iPhone is linked to Apple ID (<span className="text-white font-mono font-bold">{targetName.toLowerCase().slice(0, 2)}*****@icloud.com</span>). Enter the Apple ID and password used to set up this iPhone.
            </p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <input type="password" placeholder="Apple ID Password" disabled className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-center text-white" />
            <button disabled className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs opacity-50">Unlock</button>
          </div>
        </div>
      )}

      {/* 25. Fortnite V-Bucks Generator */}
      {slug === 'fortnite-vbucks-generator' && (
        <div className="h-full bg-purple-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="text-6xl">💎</div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-yellow-300">EPIC GAMES V-BUCKS INJECTOR</h1>
            <p className="text-xs text-purple-200">Injecting 50,000 V-Bucks into account: <span className="font-bold text-white">{targetName}</span></p>
          </div>
          <div className="p-6 rounded-2xl bg-black/80 border-2 border-yellow-400 space-y-3 max-w-md w-full">
            <div className="text-xs text-yellow-300 font-bold">STATUS: HUMAN VERIFICATION REQUIRED</div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-yellow-400 w-[99%]" />
            </div>
            <p className="text-[10px] text-slate-400">Complete 3 sponsor surveys to release V-Bucks to wallet.</p>
          </div>
        </div>
      )}

      {/* 26. TikTok Account Deleted */}
      {slug === 'tiktok-account-deleted' && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="w-20 h-20 rounded-full bg-red-600/20 text-red-500 border border-red-500 flex items-center justify-center text-4xl">
            🚫
          </div>
          <div className="space-y-2 max-w-sm">
            <h1 className="text-2xl font-bold text-white">Account Permanently Deleted</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The TikTok account for <span className="font-bold text-white">@{targetName.toLowerCase().replace(/[^a-z0-9]/g, '')}</span> was terminated due to 142 Community Guidelines violations.
            </p>
          </div>
          <p className="text-xs text-red-400 font-mono">APPEAL WINDOW EXPIRED</p>
        </div>
      )}

      {/* 27. Hollywood Movie Credits */}
      {slug === 'movie-credits-roll' && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-serif">
          <div className="text-yellow-400 tracking-widest text-xs uppercase font-sans">A WARNER BROS PICTURES PRESENTATION</div>
          <div className="space-y-6 animate-pulse">
            <div>
              <p className="text-xs text-slate-400">DIRECTED BY</p>
              <h1 className="text-3xl font-extrabold text-white">{targetName.toUpperCase()}</h1>
            </div>
            <div>
              <p className="text-xs text-slate-400">EXECUTIVE PRODUCER</p>
              <h2 className="text-xl font-bold text-yellow-300">{targetName}</h2>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-sans">SOUNDTRACK &bull; COMPOSER &bull; LEAD STAR</div>
        </div>
      )}

      {/* 28. Remote Webcam Hacker */}
      {slug === 'webcam-hacker-detected' && (
        <div className="h-full bg-black text-green-400 font-mono p-6 sm:p-10 flex flex-col justify-between crt-effect">
          <div className="flex justify-between items-center border-b border-red-500/50 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-red-500 font-bold text-xs">LIVE 4K WEBCAM INTERCEPT</span>
            </div>
            <span className="text-xs text-slate-400">FPS: 60 &bull; BITRATE: 14.8 Mbps</span>
          </div>
          <div className="max-w-md mx-auto w-full p-8 rounded-3xl bg-black border-2 border-red-600 text-center space-y-4 my-auto shadow-2xl shadow-red-600/30">
            <div className="text-5xl animate-bounce">📷</div>
            <h1 className="text-xl font-bold text-white">FACIAL RECOGNITION MATCHED</h1>
            <p className="text-xs text-red-400">Target: {targetName}</p>
            <p className="text-[11px] text-slate-400">247 Remote IP addresses streaming your camera live.</p>
          </div>
          <div className="text-center text-xs text-red-500 font-mono">RECORDING IN PROGRESS... [{timeLeft}s]</div>
        </div>
      )}

      {/* 29. Chrome Memory Leak 99% */}
      {['browser-memory-leak-99', 'browser-memory-leak'].includes(slug) && (
        <div className="h-full bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-lg mx-auto w-full space-y-6 my-auto">
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-red-500 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">🔥</span>
                <div>
                  <h1 className="text-lg font-bold text-white">Google Chrome Out of Memory</h1>
                  <p className="text-xs text-red-400 font-bold">RAM CONSUMPTION: 64.2 GB (99.8%)</p>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-red-500 w-[99.8%] animate-pulse" />
              </div>
              <p className="text-xs text-slate-300">Device processor thermal throttling to prevent motherboard burnout.</p>
            </div>
          </div>
          <div className="text-center text-xs text-slate-600 font-mono">CHROME TASK MANAGER #8942</div>
        </div>
      )}

      {/* 30. YouTube Copyright Strike */}
      {slug === 'youtube-copyright-strike' && (
        <div className="h-full bg-black text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-lg mx-auto w-full space-y-5 my-auto">
            <div className="flex items-center space-x-3">
              <span className="text-3xl text-red-600">▶️</span>
              <h1 className="font-bold text-lg">YouTube Creator Studio Notice</h1>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900 border border-red-500/50 space-y-3">
              <span className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs">CHANNEL TERMINATED</span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Hi {targetName}, your channel received 3 copyright strikes from Sony Music and Universal. Your videos and subscriber count have been removed.
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-zinc-600 font-mono">YOUTUBE COMMUNITY ENGINE</div>
        </div>
      )}

      {/* 31. Slack Emergency */}
      {slug === 'slack-everyone-emergency' && (
        <div className="h-full bg-[#1a1d21] text-white p-6 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-md rounded-2xl bg-[#222529] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
              <span className="text-2xl">💬</span>
              <div>
                <h1 className="font-bold text-sm">#general &bull; Slack Alert</h1>
                <p className="text-[10px] text-pink-400">@channel @everyone</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-red-500/40 text-xs space-y-2">
              <p className="font-bold text-red-400">CEO @here:</p>
              <p className="text-slate-200">Emergency all-hands right now. {targetName}, please open your video feed immediately.</p>
            </div>
          </div>
        </div>
      )}

      {/* 32. Friend Zone Scanner */}
      {slug === 'friend-zone-alert' && (
        <div className="h-full bg-gradient-to-b from-pink-950 via-slate-950 to-black text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="text-center my-auto space-y-6 max-w-md mx-auto">
            <div className="text-6xl animate-bounce">💔 🤖 💔</div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-pink-400">FRIEND ZONE DETECTED</h1>
              <p className="text-xs text-slate-300">AI Chat Sentiment Analysis for: <span className="text-white font-bold">{targetName}</span></p>
            </div>
            <div className="p-6 rounded-3xl bg-pink-950/40 border-2 border-pink-500/40 space-y-3">
              <div className="text-3xl font-black text-neon-pink font-mono">100.0% FRIEND ZONE</div>
              <p className="text-xs text-slate-400">Probability of romantic escalation: 0.00%</p>
            </div>
          </div>
          <div className="text-center text-xs text-pink-500 font-mono">RELATIONSHIP SCANNER ENGINE v2.0</div>
        </div>
      )}

      {/* 33. Nuclear Self-Destruct */}
      {slug === 'countdown-self-destruct' && (
        <div className="h-full bg-black text-red-500 font-mono p-6 sm:p-10 flex flex-col justify-between border-8 border-red-600 animate-pulse">
          <div className="text-center text-xs tracking-widest text-red-400">MILITARY DEFENSE COMMAND // CODE: OMEGA-9</div>
          <div className="text-center space-y-4 my-auto">
            <div className="text-6xl animate-bounce">💣</div>
            <h1 className="text-3xl sm:text-5xl font-black text-white">DEVICE SELF-DESTRUCT</h1>
            <div className="text-6xl sm:text-8xl font-black text-red-500 font-mono">
              00:0{timeLeft}
            </div>
            <p className="text-xs text-yellow-300 font-bold">EVACUATE IMMEDIATELY: {targetName.toUpperCase()}</p>
          </div>
          <div className="text-center text-xs text-red-600 font-mono">DETONATION SEQUENCE ARMED</div>
        </div>
      )}

      {/* 34. Windows Loading Bar Stuck */}
      {['fake-windows-loading-bar', 'fake-windows-loading'].includes(slug) && (
        <div className="h-full bg-[#005a9e] text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-sans">
          <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin" />
          <div className="space-y-2 max-w-sm">
            <h1 className="text-2xl font-light">Working on updates {percent}%</h1>
            <p className="text-xs text-slate-200">Don&apos;t turn off your PC. This might take a while.</p>
          </div>
        </div>
      )}

      {/* 35. Hacker Typing Speed Benchmark */}
      {['hacker-typing-speed', 'hacker-typing-speed-test', 'hacker-typing-test'].includes(slug) && (
        <div className="h-full flex flex-col justify-between font-mono bg-black text-green-400 p-6 crt-effect">
          <div className="flex justify-between items-center border-b border-green-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
              <span className="font-bold text-xs sm:text-sm">KERNEL SPEED BENCHMARK</span>
            </div>
            <span className="text-xs text-green-300">USER: {targetName}</span>
          </div>

          <div className="my-auto max-w-xl mx-auto w-full space-y-6 text-center">
            {typingStep === 'prompt' && (
              <div className="space-y-4 p-8 rounded-3xl bg-slate-900/90 border border-green-500/40">
                <div className="text-5xl animate-bounce">⌨️</div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">TYPE ANY KEY TO START BENCHMARK</h1>
                <input
                  type="text"
                  autoFocus
                  onKeyDown={handleUserTypingKey}
                  placeholder="Tap any key repeatedly..."
                  className="w-full px-4 py-3 rounded-xl bg-black border-2 border-green-500 text-center text-green-400 font-mono font-bold text-sm focus:outline-none"
                />
              </div>
            )}

            {typingStep === 'typing' && (
              <div className="space-y-4 p-6 rounded-3xl bg-black border-2 border-green-500 text-left">
                <div className="flex justify-between items-center text-xs font-bold text-yellow-300">
                  <span>LIVE WORDS PER MINUTE: 542.8 WPM</span>
                  <span className="text-red-400 animate-pulse">OVERCLOCK ACTIVE</span>
                </div>
                <div className="space-y-1 text-xs text-green-400 font-mono overflow-hidden h-32">
                  {hackerLines.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>
              </div>
            )}

            {typingStep === 'overheat' && (
              <div className="space-y-4 p-8 rounded-3xl bg-red-950 border-4 border-red-600 text-center animate-pulse">
                <div className="text-6xl">🔥</div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">KEYBOARD BUFFER OVERHEAT!</h1>
                <p className="text-xs text-yellow-300 font-bold">542 WPM EXCEEDED HARDWARE SPECIFICATIONS</p>
              </div>
            )}
          </div>

          <div className="border-t border-green-500/30 pt-3 text-center text-[11px] text-green-600">
            AUTO-KEYBOARD SAMPLING ENGINE v4.2
          </div>
        </div>
      )}

      {/* 36. Bank Account $1 Billion Glitch */}
      {slug === 'bank-balance-glitch' && (
        <div className="h-full bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">🏦</div>
                <div>
                  <h1 className="font-heading font-extrabold text-lg text-white">CHASE PRIVATE WEALTH</h1>
                  <p className="text-xs text-slate-400">Account holder: {targetName}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">ACTIVE VIP</span>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10 space-y-2 text-center">
              <p className="text-xs text-emerald-400 font-mono tracking-wider font-semibold">TOTAL CHECKING BALANCE</p>
              <div className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-teal-200 font-mono tracking-tight">
                $1,245,892,100.00
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Available for immediate wire withdrawal: <span className="text-white font-bold">$1.24 Billion</span></p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                <span>RECENT TRANSACTIONS</span>
                <span className="text-emerald-400">CLEARED</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">Wire: Swiss Private Reserve Trust #941</p>
                  <p className="text-[10px] text-slate-500">Ref: SWIFT/BIC #CH-849102-GENEVA</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">+$1,245,892,100.00</span>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-500 font-mono">FEDERAL RESERVE CLEARINGHOUSE CODE #9412 &bull; FDIC INSURED</div>
        </div>
      )}

      {/* 37. FBI Cyber Most Wanted Red Notice */}
      {['fbi-most-wanted-alert', 'fbi-cyber-lock'].includes(slug) && (
        <div className="h-full bg-slate-950 text-red-500 font-mono p-6 sm:p-10 flex flex-col justify-between crt-effect">
          <div className="max-w-2xl mx-auto w-full space-y-5 text-center my-auto">
            <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-600 flex items-center justify-center text-4xl mx-auto animate-pulse">
              🚨
            </div>
            <div className="space-y-1">
              <div className="px-4 py-1 rounded bg-red-600 text-white font-extrabold text-xs inline-block tracking-widest animate-pulse">
                FEDERAL BUREAU OF INVESTIGATION // U.S. DEPARTMENT OF JUSTICE
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wider mt-2">CYBER CRIME SEIZURE NOTICE</h1>
              <p className="text-xs text-red-400">WARRANT ID: #DOJ-CYBER-9841-FED</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/90 border-2 border-red-600 text-xs text-slate-300 space-y-2 text-left shadow-2xl shadow-red-600/20">
              <p><span className="text-red-400 font-bold">TARGET SUBJECT:</span> {targetName.toUpperCase()}</p>
              <p><span className="text-red-400 font-bold">PHYSICAL IP:</span> 192.168.1.1 (GEOLOCATED &amp; LOCKED)</p>
              <p><span className="text-red-400 font-bold">WEBCAM LOG:</span> 4K LIVE STREAMING TO QUANTICO HQ</p>
              <p className="text-yellow-400 font-bold text-[11px] pt-2 border-t border-red-900">
                ⚠️ NOTICE: Local Tactical SWAT Units have been dispatched to your physical GPS coordinates. Remain seated.
              </p>
            </div>
          </div>
          <div className="text-center text-[10px] text-red-600 font-mono animate-ping">FEDERAL SURVEILLANCE ACTIVE &bull; TIME: {timeLeft}s</div>
        </div>
      )}

      {/* 38. Critical Battery Explosion */}
      {slug === 'battery-explosion-overheat' && (
        <div className="h-full bg-black text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-md mx-auto w-full space-y-6 text-center my-auto">
            <div className="w-24 h-24 rounded-full bg-red-600/30 border-4 border-red-500 flex items-center justify-center text-5xl mx-auto animate-ping">
              🔥
            </div>
            <div className="space-y-2">
              <div className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs inline-block tracking-wider animate-pulse">
                CRITICAL HARDWARE WARNING
              </div>
              <h1 className="text-3xl font-extrabold text-red-500 tracking-tight">BATTERY THERMAL RUNAWAY!</h1>
              <p className="text-sm text-yellow-300 font-mono font-bold">INTERNAL CORE TEMPERATURE: 98.6°C</p>
            </div>
            <div className="p-6 rounded-3xl bg-red-950/80 border-2 border-red-500 space-y-3">
              <div className="w-full h-4 rounded-full bg-slate-900 border border-white/20 overflow-hidden">
                <div className="h-full bg-red-500 w-[99%] animate-pulse" />
              </div>
              <p className="text-xs text-slate-200 font-bold leading-relaxed">
                🚨 DROP AND MOVE AWAY FROM THIS DEVICE IMMEDIATELY TO PREVENT LITHIUM CELL RUPTURE!
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-red-500 font-mono font-bold">EMERGENCY SHUTDOWN FAILURE &bull; {timeLeft}s REMAINING</div>
        </div>
      )}

      {/* 39. Celebrity Video Call */}
      {slug === 'celebrity-video-call' && (
        <div className="h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white p-8 flex flex-col justify-between font-sans">
          <div className="text-center pt-8 space-y-2">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">FaceTime Video Call...</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">Elon Musk 🚀</h1>
            <p className="text-xs text-cyan-400">Calling {targetName} for urgent SpaceX Starship advice</p>
          </div>
          <div className="w-40 h-40 rounded-full bg-blue-500/20 border-4 border-cyan-400 mx-auto flex items-center justify-center text-7xl shadow-2xl shadow-cyan-500/30 animate-pulse">
            👨‍🚀
          </div>
          <div className="flex justify-center items-center gap-12 pb-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl shadow-lg">
                📵
              </div>
              <span className="text-xs text-slate-400">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-2xl shadow-lg shadow-green-500/40 animate-bounce">
                📞
              </div>
              <span className="text-xs text-green-400 font-bold">Accept Call</span>
            </div>
          </div>
        </div>
      )}

      {/* 40. Deepfake AI Voice Cloner */}
      {slug === 'ai-voice-cloner-leak' && (
        <div className="h-full bg-slate-950 text-purple-400 font-mono p-6 sm:p-10 flex flex-col justify-between crt-effect">
          <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
            <div className="flex justify-between items-center border-b border-purple-500/40 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <h1 className="font-heading font-extrabold text-white text-base">OPENAI DEEPFAKE NEURAL VOICE CLONER v5.1</h1>
              </div>
              <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold animate-pulse">MIC LIVE</span>
            </div>
            <div className="p-6 rounded-3xl bg-purple-950/40 border-2 border-purple-500/50 space-y-4 text-center">
              <p className="text-xs text-slate-300 font-semibold">Extracting vocal DNA waveforms for: <span className="text-white font-bold">{targetName}</span></p>
              <div className="flex justify-center items-center gap-1.5 h-16">
                {[40, 80, 60, 95, 30, 70, 90, 45, 85, 65, 90, 50, 75].map((h, i) => (
                  <div key={i} className="w-2 bg-gradient-to-t from-purple-600 to-cyan-400 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
                ))}
              </div>
              <p className="text-xs text-cyan-300 font-mono font-bold">SYNTHESIS STATUS: 94.8% &bull; GENERATING DEEPFAKE SPEECH AUDIO</p>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-500 font-mono">NEURAL AUDIO EXTRACTION ENGINE &bull; {timeLeft}s REMAINING</div>
        </div>
      )}

      {/* 41. Spider on Camera Lens */}
      {slug === 'cracked-camera-lens-spider' && (
        <div className="h-full bg-black text-white p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-9xl animate-bounce transform rotate-45 opacity-90 drop-shadow-2xl">
              🕷️
            </div>
          </div>
          <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-400">
            <span>OPTICAL SENSOR #4</span>
            <span className="text-red-500 font-bold animate-pulse">FOREIGN ENTITY ON LENS</span>
          </div>
          <div className="relative z-10 text-center space-y-2 bg-black/70 p-4 rounded-2xl border border-white/10 max-w-sm mx-auto">
            <h2 className="text-lg font-bold text-white">TAP SCREEN TO SCARE IT AWAY</h2>
            <p className="text-xs text-slate-400">Do not let it crawl inside the glass bezel!</p>
          </div>
        </div>
      )}

      {/* 42. Netflix Account Hijacked */}
      {['netflix-account-hijacked', 'netflix-expired'].includes(slug) && (
        <div className="h-full bg-black text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-xl mx-auto w-full space-y-6 my-auto">
            <div className="text-red-600 font-extrabold text-4xl tracking-tighter">NETFLIX</div>
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">SECURITY ALERT</span>
                <h1 className="text-xl font-bold text-white">New devices streaming on your account</h1>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Hi {targetName}, your Netflix Premium Ultra HD subscription was just accessed simultaneously on <span className="text-white font-bold">14 Smart TVs in Moscow, Russia</span> streaming Shrek 2.
              </p>
              <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-xs text-zinc-400 space-y-1">
                <p>📍 Location: Moscow, Russian Federation</p>
                <p>📺 Device: Samsung 85&quot; QLED TV</p>
                <p>⚡ Simultaneous Streams: 14 / 4 Max</p>
              </div>
              <button disabled className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-xs">Sign Out All 14 Devices</button>
            </div>
          </div>
          <div className="text-center text-[10px] text-zinc-600">NETFLIX SECURITY PROTOCOL v2026</div>
        </div>
      )}

      {/* 43. MetaMask Crypto Drained */}
      {slug === 'crypto-wallet-drained' && (
        <div className="h-full bg-zinc-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-md mx-auto w-full space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🦊</span>
                <span className="font-bold text-sm">MetaMask Wallet</span>
              </div>
              <span className="text-xs text-orange-400 font-mono">Ethereum Mainnet</span>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900 border border-red-500/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl mx-auto border border-red-500/30">
                ↗️
              </div>
              <div className="space-y-1">
                <p className="text-xs text-red-400 font-bold font-mono">OUTGOING TRANSACTION CONFIRMED</p>
                <h1 className="text-3xl font-extrabold text-white font-mono">-12.5000 ETH</h1>
                <p className="text-xs text-zinc-400">≈ $42,500.00 USD</p>
              </div>
              <div className="p-3 rounded-xl bg-black/60 text-[11px] text-zinc-400 text-left font-mono space-y-1">
                <p>To: 0x7a250d...659F2488D</p>
                <p>Gas Fee: 0.012 ETH ($42.10)</p>
                <p>Status: Broadcasting to 8,421 Nodes...</p>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-zinc-600 font-mono">ETHEREUM BLOCK #19842102 &bull; NONCE: 481</div>
        </div>
      )}

      {/* 44. iOS Beta Bootloop */}
      {slug === 'fake-ios-software-update-stuck' && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-sans">
          <div className="text-7xl"></div>
          <div className="w-64 space-y-3">
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-white w-[2%] animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400 font-light">Estimating time remaining... 48 hours remaining</p>
            <p className="text-[10px] text-zinc-600">iOS 19.0 Developer Beta Recovery Update</p>
          </div>
        </div>
      )}

      {/* 45. Lottery Jackpot Winner */}
      {slug === 'lottery-jackpot-winner' && (
        <div className="h-full bg-gradient-to-b from-amber-950 via-slate-950 to-black text-white p-6 sm:p-10 flex flex-col justify-between font-sans">
          <div className="max-w-2xl mx-auto w-full space-y-6 text-center my-auto">
            <div className="text-5xl animate-bounce">🌟 🎟️ 🌟</div>
            <div className="space-y-2">
              <div className="px-4 py-1 rounded-full bg-amber-500 text-black font-extrabold text-xs inline-block tracking-wider">
                OFFICIAL LOTTERY COMMISSION
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                JACKPOT WINNER: $750,000,000!
              </h1>
              <p className="text-sm text-amber-200">Ticket Holder Verified: <span className="font-bold text-white">{targetName}</span></p>
            </div>
            <div className="p-6 rounded-3xl bg-black/80 border-2 border-amber-400 space-y-4">
              <p className="text-xs text-amber-300 font-mono font-semibold">MATCHED ALL 6 WINNING BALLS:</p>
              <div className="flex justify-center items-center gap-2 sm:gap-3">
                {['07', '14', '21', '33', '42'].map((num) => (
                  <div key={num} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black font-extrabold text-sm sm:text-base flex items-center justify-center shadow-lg">
                    {num}
                  </div>
                ))}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-black font-extrabold text-sm sm:text-base flex items-center justify-center shadow-lg shadow-amber-500/50">
                  10
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-amber-500 font-mono">TICKET BARCODE #9481-2041-7729 &bull; CLAIM DEADLINE: 180 DAYS</div>
        </div>
      )}

      {/* 46. Calendar Meeting Moved */}
      {slug === 'calendar-meeting-moved' && (
        <div className="h-full bg-slate-100 text-slate-900 p-5 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between"><b>Calendar</b><span className="text-xs text-slate-500">Today</span></div>
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-sm text-slate-500">Updated invitation</p>
                <h1 className="text-2xl font-bold mt-1">Friday Executive Strategy</h1>
                <p className="text-sm text-slate-600 mt-2">Organized for {targetName}</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-4">
                <div className="text-center border-r border-blue-200 pr-4">
                  <p className="text-xs font-semibold text-blue-600">FRI</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <div>
                  <p className="font-semibold">3:30 PM - 4:00 PM</p>
                  <p className="text-sm text-slate-600">Moved from 2:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 47. Wi-Fi Sign-in Required */}
      {slug === 'wifi-signin-required' && (
        <div className="h-full bg-slate-50 text-slate-900 p-5 flex items-center justify-center font-sans">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl">⌁</div>
              <div><h1 className="font-bold">Guest Wi-Fi Portal</h1><p className="text-xs text-slate-500">Sign-in required for {targetName}</p></div>
            </div>
            <button className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-semibold text-white">Continue to internet</button>
          </div>
        </div>
      )}

      {/* 48. Storage Cleanup */}
      {slug === 'storage-cleanup-suggestion' && (
        <div className="h-full bg-slate-950 text-white p-5 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 space-y-6">
            <h1 className="text-2xl font-bold mt-1">Storage full warning for {targetName}</h1>
            <div className="rounded-2xl bg-amber-400/10 border border-amber-300/20 p-5">
              <span className="font-semibold text-amber-300">127.9 GB of 128 GB Used (99%)</span>
            </div>
          </div>
        </div>
      )}

      {/* 49. Package Arriving Early */}
      {slug === 'package-arriving-early' && (
        <div className="h-full bg-orange-50 text-slate-900 p-5 sm:p-10 flex items-center justify-center font-sans">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-orange-100 shadow-xl p-7 space-y-6">
            <h1 className="text-2xl font-bold">Special Delivery Package Arriving for {targetName}</h1>
            <div className="p-4 rounded-xl bg-orange-100 text-orange-900 font-semibold">Out for delivery by Courier #94</div>
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
