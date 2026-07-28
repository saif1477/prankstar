'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Sliders, 
  Bot, 
  Sparkles, 
  Music, 
  Radio, 
  Copy, 
  Check 
} from 'lucide-react';
import { SOUND_STUDIO_TRACKS } from '@/lib/pranks-data';
import { audioSynth } from '@/lib/audio-synthesizer';
import { addXP, unlockBadge } from '@/lib/gamification';

export default function SoundStudioPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [speechInput, setSpeechInput] = useState('Warning! Autonomous system takeover initiated!');
  const [speechPitch, setSpeechPitch] = useState(0.8);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [copiedCode, setCopiedCode] = useState(false);

  const handlePlayTrack = (trackId: string) => {
    setPlayingId(trackId);
    audioSynth.playSound(trackId);
    addXP(15);
    unlockBadge('badge-sound-maestro');
    setTimeout(() => setPlayingId(null), 1200);
  };

  const handleSpeakSpeech = () => {
    if (!speechInput.trim()) return;
    setPlayingId('speech-tts');
    audioSynth.speakText(speechInput, speechPitch, speechRate);
    addXP(20);
    setTimeout(() => setPlayingId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5" />
          <span>Web Audio API Synthesizer Studio</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Prank Sound Studio & FX Player
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Preview, trigger, and layer synthesized audio effects directly in your browser without downloading any sound files.
        </p>
      </div>

      {/* Robot AI Speech Generator Studio */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/30 space-y-6">
        <div className="flex items-center space-x-3 text-neon-purple font-heading text-lg font-bold">
          <Bot className="w-6 h-6 text-neon-cyan" />
          <span>Browser Speech Synthesizer (AI Robot Voice Studio)</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Text</label>
            <input
              type="text"
              value={speechInput}
              onChange={(e) => setSpeechInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-neon-cyan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Voice Pitch: {speechPitch}</label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(Number(e.target.value))}
                className="w-full accent-neon-cyan"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Voice Speed Rate: {speechRate}</label>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="w-full accent-neon-purple"
              />
            </div>
          </div>

          <button
            onClick={handleSpeakSpeech}
            className="w-full sm:w-auto px-6 py-3 rounded-xl btn-neon-cyan font-heading font-bold text-xs text-white flex items-center justify-center space-x-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Synthesize AI Speech Voice</span>
          </button>
        </div>
      </div>

      {/* Soundboard Grid */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-xl text-white flex items-center space-x-2">
          <Music className="w-5 h-5 text-neon-cyan" />
          <span>Synthesized FX Tracks</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SOUND_STUDIO_TRACKS.map((track) => {
            const isPlaying = playingId === track.id;
            return (
              <div
                key={track.id}
                className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {track.type}
                  </span>
                  <h4 className="font-heading font-bold text-base text-white mt-1">{track.name}</h4>
                  <p className="text-xs text-slate-400">{track.desc}</p>
                </div>

                <button
                  onClick={() => handlePlayTrack(track.id)}
                  className={`w-full py-3 rounded-xl font-heading text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    isPlaying
                      ? 'bg-neon-cyan text-black font-extrabold scale-95 shadow-lg shadow-cyan-500/30'
                      : 'btn-neon-purple text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPlaying ? 'Playing FX...' : 'Play Synthesized Track'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
