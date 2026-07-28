'use client';

import React, { useState } from 'react';
import { 
  Wand2, 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Sparkles, 
  MessageSquare, 
  Bell, 
  Terminal, 
  Volume2, 
  Bot, 
  Clock, 
  Eye, 
  Share2,
  Sliders
} from 'lucide-react';
import { CustomPrank, CustomPrankStep, saveCustomPrank } from '@/lib/builder-store';
import { audioSynth } from '@/lib/audio-synthesizer';
import { addXP, unlockBadge } from '@/lib/gamification';
import { publishPrankToDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export default function BuilderPage() {
  const [prankTitle, setPrankTitle] = useState('My Custom Mega Prank');
  const [targetName, setTargetName] = useState('Alex');
  const [timerDuration, setTimerDuration] = useState(10);
  const [soundFx, setSoundFx] = useState('sirenAlarm');
  const [bgTheme, setBgTheme] = useState('#050816');
  const [revealMessage, setRevealMessage] = useState('😂 You got PrankStar\'d!');
  const [speechText, setSpeechText] = useState('Warning! Autonomous system alert!');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [steps, setSteps] = useState<CustomPrankStep[]>([
    { id: '1', type: 'notification', delayMs: 1000, title: 'Security Alert', message: 'Unauthorized connection detected' },
    { id: '2', type: 'sound', delayMs: 2000, soundId: 'sirenAlarm' },
    { id: '3', type: 'speech', delayMs: 3500, message: 'Initiating emergency system lockdown' },
    { id: '4', type: 'popup', delayMs: 5000, title: 'CRITICAL SYSTEM ERROR', message: 'Battery voltage exceeded safe threshold!' }
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const addStep = (type: CustomPrankStep['type']) => {
    const newStep: CustomPrankStep = {
      id: Date.now().toString(),
      type,
      delayMs: (steps.length + 1) * 1500,
      title: type === 'notification' ? 'New Message' : type === 'popup' ? 'System Notice' : undefined,
      message: type === 'speech' ? 'System alert active' : 'Click to inspect details',
      soundId: type === 'sound' ? 'windowsError' : undefined
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, fields: Partial<CustomPrankStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  const handleGenerateAiPrank = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setTimeout(() => {
      setPrankTitle(`AI Generated: ${aiPrompt.slice(0, 20)}...`);
      setSpeechText(`Warning! ${aiPrompt}`);
      setSteps([
        { id: '101', type: 'notification', delayMs: 1000, title: 'AI Assistant', message: `Processing: ${aiPrompt}` },
        { id: '102', type: 'sound', delayMs: 2500, soundId: 'robotSpeech' },
        { id: '103', type: 'terminal', delayMs: 4000, message: 'override_protocol --force' },
        { id: '104', type: 'popup', delayMs: 6500, title: 'AI Override Active', message: 'Control handed to Autonomous Core' }
      ]);
      setIsGeneratingAi(false);
      addXP(50);
      unlockBadge('badge-ai-overlord');
    }, 1200);
  };

  const handleSavePrank = () => {
    const slug = prankTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const user = getCurrentUser();
    const authorId = user?.id || 'guest';
    const authorName = user?.displayName || 'Anonymous Creator';
    const authorAvatar = user?.avatar || '🎭';

    const newPrank: CustomPrank = {
      id: `custom-${Date.now()}`,
      title: prankTitle,
      slug: slug || `custom-${Date.now()}`,
      targetName,
      timerDuration,
      soundFx,
      bgTheme,
      revealMessage,
      speechText,
      steps,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 1,
      author: authorName,
    };

    saveCustomPrank(newPrank);

    // Publish into central DB accessible by all users
    publishPrankToDB({
      title: prankTitle,
      slug: slug || `custom-${Date.now()}`,
      description: `User-created custom prank by ${authorName}`,
      category: 'Interactive',
      os: 'Cross-platform',
      difficulty: 'Easy',
      duration: timerDuration,
      thumbnail: '🎨',
      soundFx,
      revealMessage,
      tags: ['custom', 'user-created', 'builder'],
      authorId,
      authorName,
      authorAvatar,
    });

    addXP(100);
    unlockBadge('badge-builder-rookie');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const previewSound = (sndId: string) => {
    audioSynth.playSound(sndId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            <span>No-Code Visual Studio</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Prank Builder & Generator
          </h1>
          <p className="text-sm text-slate-400">
            Build custom multi-step prank simulations visually without code.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSavePrank}
            className="px-6 py-3 rounded-xl btn-neon-purple font-heading font-bold text-sm text-white flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved to Marketplace!' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Prompt Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-dark-800 to-cyan-900/30 space-y-3">
        <div className="flex items-center space-x-2 text-neon-cyan font-heading text-sm font-bold">
          <Sparkles className="w-4 h-4" />
          <span>AI Prank Assistant Prompt</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'Create a prank where my friend thinks his smart fridge bought 500 pizzas'"
            className="flex-grow px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white focus:outline-none focus:border-neon-cyan"
          />
          <button
            onClick={handleGenerateAiPrank}
            disabled={isGeneratingAi}
            className="px-6 py-2.5 rounded-xl btn-neon-cyan font-heading font-bold text-xs text-white shrink-0 flex items-center justify-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>{isGeneratingAi ? 'Generating...' : 'AI Build Timeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Configurator + Timeline Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Prank Settings */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-neon-purple" />
            <span>General Configuration</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prank Title</label>
              <input
                type="text"
                value={prankTitle}
                onChange={(e) => setPrankTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Name</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Countdown Delay (Seconds)</label>
              <input
                type="number"
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Sound FX</label>
              <div className="flex gap-2">
                <select
                  value={soundFx}
                  onChange={(e) => setSoundFx(e.target.value)}
                  className="flex-grow px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white"
                >
                  <option value="sirenAlarm">Siren Alarm</option>
                  <option value="windowsError">Windows Error</option>
                  <option value="matrixTyping">Matrix Typing</option>
                  <option value="glassShatter">Glass Shatter</option>
                  <option value="robotSpeech">AI Robot Speech</option>
                </select>
                <button
                  type="button"
                  onClick={() => previewSound(soundFx)}
                  className="p-2 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custom Speech Alert</label>
              <input
                type="text"
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reveal Message</label>
              <input
                type="text"
                value={revealMessage}
                onChange={(e) => setRevealMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Right: Drag & Drop Layer Timeline Editor */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-neon-cyan" />
              <span>Event Timeline Sequence</span>
            </h3>

            {/* Add Layer Buttons */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button onClick={() => addStep('notification')} className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center space-x-1">
                <Bell className="w-3 h-3" />
                <span>Notice</span>
              </button>
              <button onClick={() => addStep('sound')} className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center space-x-1">
                <Volume2 className="w-3 h-3" />
                <span>Audio</span>
              </button>
              <button onClick={() => addStep('speech')} className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30 flex items-center space-x-1">
                <Bot className="w-3 h-3" />
                <span>Voice</span>
              </button>
              <button onClick={() => addStep('popup')} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center space-x-1">
                <Plus className="w-3 h-3" />
                <span>Popup</span>
              </button>
            </div>
          </div>

          {/* Timeline Steps List */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{(step.delayMs / 1000).toFixed(1)}s</span>
                </div>

                <div className="flex-grow space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-bold text-white uppercase text-[10px] tracking-wider text-neon-cyan">
                      {step.type}
                    </span>
                    {step.title && (
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    )}
                  </div>
                  {step.message && (
                    <input
                      type="text"
                      value={step.message}
                      onChange={(e) => updateStep(step.id, { message: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-white/10 text-slate-300 text-xs"
                    />
                  )}
                </div>

                <button
                  onClick={() => removeStep(step.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
