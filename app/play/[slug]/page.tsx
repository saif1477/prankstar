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
  const [typedInput, setTypedInput] = useState('');
  const [typingWpm, setTypingWpm] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [typingStep, setTypingStep] = useState<'prompt' | 'typing' | 'overheat'>('prompt');
  const [hackerLines, setHackerLines] = useState<string[]>([]);
  const hasTriggeredTypingRef = useRef(false);

  const handleUserTypingKey = () => {
    audioSynth.playScanline();
    setIsShaking(true);
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
    setTypingWpm((prev) => (prev === 0 ? 142 : Math.min(prev + 55, 542)));

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
    if (hasStarted) return;
    setHasStarted(true);

    if (audioEnabled && prank) {
      if (prank.customAudioUrl) {
        try {
          const audio = new Audio(prank.customAudioUrl);
          audio.volume = 0.65;
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

      {/* Interactive Speed Typing Test Simulation */}
      {(['hacker-typing-speed', 'hacker-typing-speed-test', 'hacker-typing-test', 'fake-terminal-sudo-rm-rf'].includes(slug) || slug.includes('typing')) && (
        <div className={`h-full bg-slate-950 text-cyan-400 font-mono p-6 sm:p-10 flex flex-col justify-between crt-effect select-none ${isShaking ? 'animate-shake' : ''}`}>
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⌨️</span>
                <h2 className="font-heading font-extrabold text-lg text-white">SPEED TYPING BENCHMARK v4.2</h2>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold ${typingWpm > 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {typingWpm > 0 ? `${typingWpm} WPM (OVERHEAT)` : 'READY TO TEST'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
              <p className="text-xs text-slate-400 font-semibold">Instructions for {targetName}:</p>
              <p className="text-sm text-slate-200">
                Type the paragraph below into the text box as fast as possible to measure your Words Per Second:
              </p>
              <div className="p-3 rounded bg-black/60 border border-white/10 text-xs text-yellow-300 font-mono italic">
                &quot;The quick brown fox jumps over the lazy dog and bypasses firewall security layer 9.&quot;
              </div>
            </div>

            {/* Interactive Input Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Type Here (Press Any Keys):</label>
              <input
                type="text"
                autoFocus
                value={typedInput}
                onChange={(e) => {
                  setTypedInput(e.target.value);
                  handleUserTypingKey();
                }}
                onKeyDown={() => handleUserTypingKey()}
                placeholder="Click here and start typing fast..."
                className="w-full px-4 py-3 rounded-xl bg-black border-2 border-neon-cyan text-green-400 text-base font-mono focus:outline-none shadow-lg shadow-cyan-500/20"
              />
            </div>

            {/* Auto Hacker Terminal Stream */}
            {hackerLines.length > 0 && (
              <div className="p-4 rounded-xl bg-black/90 border border-red-500/50 space-y-1 text-xs text-green-400 font-mono h-40 overflow-hidden shadow-inner">
                <div className="text-[10px] text-red-400 font-bold mb-1">[AUTO-STREAMING HARDWARE KERNEL DATA]</div>
                {hackerLines.map((line, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>{line}</span>
                    <span className="text-[10px] text-yellow-400">⚡ BUSY</span>
                  </div>
                ))}
              </div>
            )}

            {typingStep === 'overheat' && (
              <div className="p-4 rounded-xl bg-red-900/80 border-2 border-red-500 text-center animate-bounce space-y-1">
                <div className="text-lg font-bold text-yellow-300">🔥 CRITICAL CPU OVERHEAT!</div>
                <div className="text-xs text-white">Calculated Speed: 542.8 WPM! Keyboard Hardware Buffer Exhausted!</div>
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-3">
            STATUS: MONITORING TYPING INPUT FREQUENCY &bull; {timeLeft}s SIMULATION TIME REMAINING
          </div>
        </div>
      )}

      {/* Ghost Camera Jumpscare */}
      {slug === 'ghost-camera-jumpscare' && (
        <div className="h-full bg-slate-950 text-red-500 font-mono p-8 flex flex-col items-center justify-center text-center space-y-6 animate-pulse crt-effect">
          <div className="text-7xl animate-bounce">👻</div>
          <div className="p-4 rounded-2xl bg-black border-2 border-red-600 space-y-2">
            <div className="text-xs text-red-400 font-bold font-mono">INFRARED THERMAL CAMERA SENSOR</div>
            <h2 className="text-2xl font-extrabold text-white">GHOST ENTITY DETECTED BEHIND YOU!</h2>
            <p className="text-xs text-slate-300">Spatial audio anomaly detected at coordinates (X:14, Y:89, Z:0.2)</p>
          </div>
          <div className="text-4xl font-extrabold text-red-500 font-mono animate-ping">LOOK BEHIND YOU NOW!</div>
        </div>
      )}

      {/* Exam Cancelled Alert */}
      {slug === 'exam-cancelled-alert' && (
        <div className="h-full bg-slate-900 text-white p-8 flex flex-col justify-between font-sans">
          <div className="space-y-4 max-w-2xl mx-auto w-full mt-6">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <span className="text-3xl">🎓</span>
              <div>
                <h2 className="text-xl font-bold text-white">MINISTRY OF EDUCATION PORTAL</h2>
                <p className="text-xs text-slate-400">Official Academic Records for {targetName}</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-green-500/10 border-2 border-green-500 space-y-3">
              <div className="px-3 py-1 rounded bg-green-500 text-black font-bold text-xs inline-block">OFFICIAL NOTICE</div>
              <h1 className="text-2xl font-extrabold text-green-400">ALL FINAL EXAMS CANCELLED!</h1>
              <p className="text-sm text-slate-200 leading-relaxed">
                Due to server grid maintenance, all upcoming examinations for <span className="font-bold text-white">{targetName}</span> have been waived. A default grade of <span className="font-bold text-green-300">A+ (100%)</span> has been automatically recorded.
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 font-mono">
            VERIFIED STAMP #98412-EDU &bull; STATUS: RECORDED
          </div>
        </div>
      )}

      {/* CEO Promotion Email */}
      {['promotion-email-ceo', 'ceo-promotion-email'].includes(slug) && (
        <div className="h-full bg-slate-950 text-slate-100 p-8 flex flex-col justify-between font-sans">
          <div className="space-y-4 max-w-3xl mx-auto w-full mt-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400 font-mono">Microsoft Outlook Express</span>
                <span className="text-xs text-green-400 font-bold">CONFIDENTIAL</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p><span className="text-slate-500 font-semibold">From:</span> CEO &amp; Executive Board &lt;ceo@corporate.com&gt;</p>
                <p><span className="text-slate-500 font-semibold">To:</span> {targetName} &lt;{targetName.toLowerCase()}@corporate.com&gt;</p>
                <p><span className="text-slate-500 font-semibold">Subject:</span> Immediate Promotion to Executive Vice President &amp; Salary Adjustment</p>
              </div>
              <div className="p-4 rounded-lg bg-black/60 border border-purple-500/30 text-sm space-y-3 text-slate-200 leading-relaxed">
                <p>Dear {targetName},</p>
                <p>Effective immediately, the Board of Directors has unanimously appointed you to <span className="font-bold text-purple-300">Senior Vice President of Operations</span>.</p>
                <p>Your base compensation will be increased to <span className="font-bold text-green-400">$480,000 / year</span> with immediate stock options.</p>
                <p>Best regards,<br /><span className="font-bold text-white">Chief Executive Officer</span></p>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 font-mono">OUTLOOK CORPORATE ENGINE v14.2</div>
        </div>
      )}

      {/* Birthday Surprise */}
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

      {/* Android System Update Loop */}
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

      {/* iPhone iCloud Lock */}
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

      {/* Fortnite V-Bucks Generator */}
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

      {/* TikTok Account Suspended */}
      {slug === 'tiktok-account-deleted' && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="w-20 h-20 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center text-4xl">
            🎵
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-pink-500/40 space-y-3 max-w-sm">
            <h2 className="text-xl font-bold text-red-500">Account Permanently Banned</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your TikTok account <span className="font-bold text-white">@{targetName.toLowerCase()}</span> has been permanently suspended due to 142 multiple Community Guidelines violations.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">DECISION IS FINAL AND CANNOT BE APPEALED</div>
          </div>
        </div>
      )}

      {/* Movie Credits Roll */}
      {slug === 'movie-credits-roll' && (
        <div className="h-full bg-black text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-serif crt-effect">
          <div className="text-xs font-mono tracking-widest text-slate-500 uppercase">WARNER BROS PICTURES PRESENTS</div>
          <div className="space-y-4 animate-pulse">
            <h1 className="text-4xl font-extrabold tracking-widest text-gold text-yellow-400">THE LEGEND OF {targetName.toUpperCase()}</h1>
            <p className="text-sm font-mono text-slate-400">DIRECTED BY &bull; {targetName.toUpperCase()}</p>
            <p className="text-sm font-mono text-slate-400">PRODUCED BY &bull; {targetName.toUpperCase()}</p>
            <p className="text-sm font-mono text-slate-400">STARRING &bull; {targetName.toUpperCase()} AS THE MASTER PRANKSTER</p>
          </div>
        </div>
      )}

      {/* Webcam Hacker Detected */}
      {slug === 'webcam-hacker-detected' && (
        <div className="h-full bg-black text-red-500 font-mono p-6 flex flex-col justify-between crt-effect">
          <div className="flex items-center justify-between border-b border-red-500/40 pb-2">
            <span className="flex items-center space-x-2 text-xs font-bold text-red-500">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span>LIVE WEBCAM STREAM DETECTED</span>
            </span>
            <span className="text-xs text-slate-400">FPS: 60 // 4K HIGH DEF</span>
          </div>
          <div className="my-auto text-center space-y-4">
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-red-500 mx-auto flex items-center justify-center text-6xl animate-spin">
              📷
            </div>
            <h1 className="text-2xl font-extrabold text-white">FACIAL TRACKING MATCHED: {targetName.toUpperCase()}</h1>
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-500 max-w-md mx-auto text-xs text-slate-200">
              ⚠️ WARNING: 247 remote viewers are currently streaming your front camera feed live on DarkWeb TV!
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-500">DARKNET VIDEO TRANSMITTER ID #9841</div>
        </div>
      )}

      {/* Browser Memory Leak 99% */}
      {['browser-memory-leak-99', 'browser-memory-leak'].includes(slug) && (
        <div className="h-full bg-slate-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="text-7xl animate-bounce">⚠️</div>
          <div className="p-6 rounded-2xl bg-red-950/90 border-2 border-red-500 max-w-md w-full space-y-3">
            <h1 className="text-2xl font-extrabold text-red-400">SYSTEM MEMORY EXHAUSTED!</h1>
            <p className="text-xs text-slate-300">
              Tab <span className="font-bold text-white">&apos;{targetName} Active Session&apos;</span> is consuming <span className="font-bold text-yellow-300">64.2 GB RAM (99.8% Memory)</span>.
            </p>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-red-500 w-[99.8%]" />
            </div>
            <p className="text-[10px] text-red-300 font-mono">YOUR BROWSER WILL FREEEZE AND RESTART IN {timeLeft} SECONDS!</p>
          </div>
        </div>
      )}

      {/* YouTube Copyright Strike */}
      {slug === 'youtube-copyright-strike' && (
        <div className="h-full bg-slate-900 text-white p-8 flex flex-col justify-between font-sans">
          <div className="space-y-4 max-w-2xl mx-auto w-full mt-6">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <span className="text-3xl text-red-500">▶</span>
              <div>
                <h2 className="text-xl font-bold text-white">YouTube Studio Creator Hub</h2>
                <p className="text-xs text-slate-400">Channel ID: {targetName.toLowerCase()}_official</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-red-500/10 border-2 border-red-500 space-y-3">
              <div className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs inline-block">CHANNEL TERMINATED</div>
              <h1 className="text-2xl font-extrabold text-red-400">3 COPYRIGHT STRIKES RECEIVED</h1>
              <p className="text-sm text-slate-200 leading-relaxed">
                Your YouTube channel for <span className="font-bold text-white">{targetName}</span> has been permanently disabled. All uploaded videos, subscribers, and monetization earnings have been removed.
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 font-mono">YOUTUBE CREATOR COMPLIANCE v2026</div>
        </div>
      )}

      {/* Slack @everyone Emergency */}
      {slug === 'slack-everyone-emergency' && (
        <div className="h-full bg-[#1a1d21] text-white p-8 flex flex-col justify-between font-sans">
          <div className="space-y-4 max-w-2xl mx-auto w-full mt-6">
            <div className="flex items-center space-x-3 border-b border-slate-700 pb-3">
              <span className="text-2xl">💬</span>
              <h2 className="text-lg font-bold text-white"># general &bull; Corporate Workspace</h2>
            </div>
            <div className="p-4 rounded-xl bg-[#222529] border border-red-500/50 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-purple-400 text-sm">CEO &amp; Founder</span>
                <span className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[10px]">@everyone</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                <span className="text-yellow-400 font-bold">@everyone</span> URGENT EMERGENCY NOTICE for <span className="font-bold text-white">{targetName}</span>: Please report to executive board room immediately!
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 font-mono">SLACK ENTERPRISE GRID</div>
        </div>
      )}

      {/* Friend Zone Alert */}
      {slug === 'friend-zone-alert' && (
        <div className="h-full bg-slate-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="text-7xl animate-bounce">💔</div>
          <div className="p-6 rounded-2xl bg-pink-950/80 border-2 border-pink-500 max-w-md w-full space-y-3">
            <div className="text-xs text-pink-300 font-mono font-bold">AI CHAT &amp; RELATIONSHIP SCANNER v3.0</div>
            <h1 className="text-2xl font-extrabold text-pink-400">100% PERMANENT FRIEND ZONE CONFIRMED!</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analysis of text message frequency for <span className="font-bold text-white">{targetName}</span> indicates zero romantic probability.
            </p>
          </div>
        </div>
      )}

      {/* Countdown Self Destruct */}
      {slug === 'countdown-self-destruct' && (
        <div className="h-full bg-red-950 text-white p-8 flex flex-col items-center justify-center text-center space-y-8 font-mono crt-effect">
          <div className="text-8xl text-yellow-400 animate-ping">⚠️</div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-red-500 tracking-widest">NUCLEAR SELF-DESTRUCT INITIATED!</h1>
            <p className="text-xs text-slate-300">Target Override Protocol Authorized for {targetName.toUpperCase()}</p>
            <div className="text-7xl font-extrabold text-yellow-300 font-mono tracking-wider">
              00:0{timeLeft}
            </div>
          </div>
        </div>
      )}

      {/* Fake Windows Loading Bar */}
      {['fake-windows-loading-bar', 'fake-windows-loading'].includes(slug) && (
        <div className="h-full bg-[#0078d4] text-white p-8 flex flex-col items-center justify-center text-center space-y-6 font-sans">
          <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-light">Working on updates {percent}% complete.</h1>
            <p className="text-xs text-slate-200">Don&apos;t turn off your PC. This will take a while.</p>
            <p className="text-[10px] text-slate-300 font-mono mt-4">Your PC will restart several times.</p>
          </div>
        </div>
      )}

      {/* Everyday notification simulations: familiar but deliberately low-stakes. */}
      {slug === 'calendar-meeting-moved' && (
        <div className="h-full bg-slate-100 text-slate-900 p-5 sm:p-10 flex items-center justify-center font-sans"><div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"><div className="px-6 py-4 border-b border-slate-200 flex justify-between"><b>Calendar</b><span className="text-xs text-slate-500">Today</span></div><div className="p-6 sm:p-8 space-y-6"><div><p className="text-sm text-slate-500">Updated invitation</p><h1 className="text-2xl font-bold mt-1">Friday catch-up</h1><p className="text-sm text-slate-600 mt-2">Organized for {targetName}</p></div><div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-4"><div className="text-center border-r border-blue-200 pr-4"><p className="text-xs font-semibold text-blue-600">FRI</p><p className="text-2xl font-bold">18</p></div><div><p className="font-semibold">3:30 PM - 4:00 PM</p><p className="text-sm text-slate-600">Moved from 2:30 PM</p></div></div><p className="text-sm text-slate-600">A quick shift so everyone can make it. See you then!</p></div></div></div>
      )}

      {slug === 'wifi-signin-required' && (
        <div className="h-full bg-slate-50 text-slate-900 p-5 flex items-center justify-center font-sans"><div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-7 space-y-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl">⌁</div><div><h1 className="font-bold">Guest Wi-Fi</h1><p className="text-xs text-slate-500">Network sign-in required</p></div></div><div className="border-y border-slate-100 py-5 space-y-2"><p className="text-sm font-medium">Welcome back, {targetName}</p><p className="text-sm text-slate-600">Accept the guest-network terms to connect securely.</p></div><button className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-semibold text-white">Continue to internet</button><p className="text-center text-[11px] text-slate-400">This network does not collect passwords or payment details.</p></div></div>
      )}

      {slug === 'storage-cleanup-suggestion' && (
        <div className="h-full bg-slate-950 text-white p-5 sm:p-10 flex items-center justify-center font-sans"><div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 space-y-6"><div><p className="text-xs text-slate-400">Device care</p><h1 className="text-2xl font-bold mt-1">Storage suggestions</h1></div><div className="rounded-2xl bg-amber-400/10 border border-amber-300/20 p-5"><div className="flex justify-between text-sm"><span>Storage used</span><span className="font-semibold text-amber-300">82 GB of 128 GB</span></div><div className="h-2 mt-3 rounded-full bg-slate-700 overflow-hidden"><div className="h-full w-[64%] bg-amber-400 rounded-full" /></div></div><div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between"><div><p className="font-semibold text-sm">Review duplicate screenshots</p><p className="text-xs text-slate-400 mt-1">46 items, about 680 MB</p></div><button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold">Review</button></div><p className="text-xs text-slate-500">Nothing will be removed without your approval.</p></div></div>
      )}

      {slug === 'package-arriving-early' && (
        <div className="h-full bg-orange-50 text-slate-900 p-5 sm:p-10 flex items-center justify-center font-sans"><div className="w-full max-w-xl rounded-2xl bg-white border border-orange-100 shadow-xl overflow-hidden"><div className="h-2 bg-orange-500" /><div className="p-7 space-y-6"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Delivery update</p><h1 className="text-2xl font-bold">Your package is arriving early</h1></div><span className="text-3xl">📦</span></div><div className="rounded-xl bg-orange-50 border border-orange-100 p-4"><p className="text-sm font-semibold text-green-700">Out for delivery</p><p className="text-sm text-slate-600 mt-1">Expected today between 2:00 PM and 4:00 PM</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Delivery preferences are unchanged for {targetName}.</div></div></div></div>
      )}

      {/* Generic Dynamic Prank Player for All Other Pranks */}
      {!['windows-11-bsod', 'matrix-hacker', 'fake-ransomware', 'pizza-delivery-tracker', 'hacker-typing-speed', 'hacker-typing-speed-test', 'hacker-typing-test', 'fake-terminal-sudo-rm-rf', 'ghost-camera-jumpscare', 'exam-cancelled-alert', 'promotion-email-ceo', 'ceo-promotion-email', 'birthday-surprise-countdown', 'android-system-update-loop', 'android-update-loop', 'iphone-icloud-lock', 'fortnite-vbucks-generator', 'tiktok-account-deleted', 'movie-credits-roll', 'webcam-hacker-detected', 'browser-memory-leak-99', 'browser-memory-leak', 'youtube-copyright-strike', 'slack-everyone-emergency', 'friend-zone-alert', 'countdown-self-destruct', 'fake-windows-loading-bar', 'fake-windows-loading', 'calendar-meeting-moved', 'wifi-signin-required', 'storage-cleanup-suggestion', 'package-arriving-early'].includes(slug) && !slug.includes('typing') && (
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
