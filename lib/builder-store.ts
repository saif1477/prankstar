export interface CustomPrankStep {
  id: string;
  type: 'notification' | 'chat' | 'terminal' | 'speech' | 'sound' | 'glitch' | 'popup';
  delayMs: number;
  title?: string;
  message?: string;
  soundId?: string;
  avatar?: string;
  author?: string;
}

export interface CustomPrank {
  id: string;
  title: string;
  slug: string;
  targetName: string;
  timerDuration: number;
  soundFx: string;
  bgTheme: string;
  revealMessage: string;
  customImageUrl?: string;
  speechText?: string;
  steps: CustomPrankStep[];
  createdAt: string;
  likes: number;
  author: string;
}

export const SAMPLE_MARKETPLACE_PRANKS: CustomPrank[] = [
  {
    id: 'custom-smart-fridge',
    title: 'Smart Fridge 500 Pizza Order',
    slug: 'smart-fridge-order',
    targetName: 'Alex',
    timerDuration: 10,
    soundFx: 'notificationChime',
    bgTheme: '#0b0f28',
    revealMessage: '🍕 Relax! Your fridge didn\'t buy $5,000 worth of pizza!',
    speechText: 'Smart Fridge automated ordering system engaged.',
    steps: [
      { id: '1', type: 'notification', delayMs: 1000, title: 'SmartFridge OS', message: 'Order #9481 Placed: 500 Pepperoni Pizzas' },
      { id: '2', type: 'sound', delayMs: 2000, soundId: 'sirenAlarm' },
      { id: '3', type: 'popup', delayMs: 4000, title: 'Payment Authorized', message: 'Card ending in 4921 charged $5,420.00' }
    ],
    createdAt: '2026-07-25',
    likes: 340,
    author: 'CyberTroller'
  },
  {
    id: 'custom-discord-nuke',
    title: 'Discord Server Nuke Alert',
    slug: 'discord-server-nuke',
    targetName: 'Gamers',
    timerDuration: 12,
    soundFx: 'sirenAlarm',
    bgTheme: '#1e1f22',
    revealMessage: '🎮 Your Discord server is 100% fine!',
    speechText: 'Warning! Server deletion in progress.',
    steps: [
      { id: '1', type: 'chat', delayMs: 1000, author: 'System Bot', message: 'CRITICAL: Security Breach Detected in General Channel' },
      { id: '2', type: 'glitch', delayMs: 3000 }
    ],
    createdAt: '2026-07-26',
    likes: 520,
    author: 'ModPolice'
  }
];

const CUSTOM_PRANKS_KEY = 'prankstar_custom_builds';

export function getCustomPranks(): CustomPrank[] {
  if (typeof window === 'undefined') return SAMPLE_MARKETPLACE_PRANKS;
  const stored = localStorage.getItem(CUSTOM_PRANKS_KEY);
  if (!stored) {
    localStorage.setItem(CUSTOM_PRANKS_KEY, JSON.stringify(SAMPLE_MARKETPLACE_PRANKS));
    return SAMPLE_MARKETPLACE_PRANKS;
  }
  try {
    return JSON.parse(stored) as CustomPrank[];
  } catch {
    return SAMPLE_MARKETPLACE_PRANKS;
  }
}

export function saveCustomPrank(prank: CustomPrank): CustomPrank[] {
  const current = getCustomPranks();
  const updated = [prank, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_PRANKS_KEY, JSON.stringify(updated));
  }
  return updated;
}
