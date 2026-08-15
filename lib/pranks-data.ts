import { getPublishedPranks, PublishedPrank } from './db';
import { getCustomPranks } from './builder-store';

export interface PrankTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  os?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  duration: number; // in seconds
  thumbnail: string;
  soundFx: string; // key for sound synthesizer
  customImageUrl?: string;
  customAudioUrl?: string;
  revealMessage: string;
  tags: string[];
  views: number;
  likes: number;
  shares: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  previewColor?: string;
  iconName?: string;
  createdAt?: string;
}

export const PRANK_CATEGORIES = [
  'All', 'Funny', 'Scary', 'Fake Virus', 'Fake Hacker', 'Phone', 'Gaming', 'AI',
  'School', 'Office', 'Family', 'Friends', 'Birthday', 'Christmas', 'April Fools',
  'Browser', 'Windows', 'Mac', 'Linux', 'Android', 'iPhone', 'Random', 'Classic',
  'Interactive', 'Voice', 'Camera', 'Countdown', 'Fake Notifications', 'Loading Screens',
  'Typing', 'Terminal', 'Movie Style'
] as const;

export const OS_FILTERS = ['All', 'Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Cross-platform'] as const;

export const DIFFICULTY_FILTERS = ['All', 'Easy', 'Medium', 'Hard', 'Legendary'] as const;

export const SORT_OPTIONS = [
  { value: 'views', label: 'Most Popular' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'shares', label: 'Most Shared' },
  { value: 'newest', label: 'Newest' },
  { value: 'duration', label: 'Duration' },
] as const;

export const MASTER_PRANKS: PrankTemplate[] = [
  {
    id: 'prank-win11-bsod',
    title: 'Windows 11 Critical BSOD',
    slug: 'windows-11-bsod',
    description: 'Ultra-realistic Windows 11 Blue Screen of Death with QR code, stop code: CRITICAL_PROCESS_DIED, and progress percentage.',
    category: 'Windows',
    os: 'Windows',
    difficulty: 'Easy',
    duration: 15,
    thumbnail: '🖥️',
    soundFx: 'windowsError',
    revealMessage: '😂 Don\'t panic! Your Windows 11 PC is totally fine!',
    tags: ['windows', 'bsod', 'error', 'system', 'pc'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#0078d4',
    iconName: 'MonitorX'
  },
  {
    id: 'prank-matrix-hacker',
    title: 'Matrix Cyber Hacker Takeover',
    slug: 'matrix-hacker',
    description: 'Hollywood-style terminal breach simulation with green falling matrix digital code, access granted/denied flashes, and command line typing.',
    category: 'Fake Hacker',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 20,
    thumbnail: '🟢',
    soundFx: 'matrixTyping',
    revealMessage: '🕵️ Access Granted! You just got pranked by a Cyber Hacker!',
    tags: ['hacker', 'matrix', 'terminal', 'cyber', 'code'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#10b981',
    iconName: 'Terminal'
  },
  {
    id: 'prank-fake-ransomware',
    title: 'WannaCry Ransomware Alert',
    slug: 'fake-ransomware',
    description: 'Alarming fake malware screen demanding 300 Bitcoin with flashing red warning banners and ticking countdown clock.',
    category: 'Fake Virus',
    os: 'Windows',
    difficulty: 'Hard',
    duration: 12,
    thumbnail: '⚠️',
    soundFx: 'sirenAlarm',
    revealMessage: '🔒 Your files are 100% safe! No Bitcoin needed!',
    tags: ['virus', 'ransomware', 'malware', 'security', 'alert'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: false,
    previewColor: '#ef4444',
    iconName: 'ShieldAlert'
  },
  {
    id: 'prank-cracked-screen',
    title: 'Realistic Cracked Screen Shatter',
    slug: 'cracked-screen',
    description: 'Interactive broken display glass overlay with realistic glass shatter sound triggers whenever someone touches the screen.',
    category: 'Interactive',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 10,
    thumbnail: '💥',
    soundFx: 'glassShatter',
    revealMessage: '📱 Relax! Your monitor screen didn\'t shatter!',
    tags: ['broken', 'screen', 'crack', 'glass', 'display'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#ec4899',
    iconName: 'Smartphone'
  },
  {
    id: 'prank-pizza-delivery',
    title: 'Uber Eats 100 Pizza Order Tracker',
    slug: 'pizza-delivery-tracker',
    description: 'Realistic live food delivery screen showing 50 Extra Cheese XL Pizzas accepted and driver approaching target address!',
    category: 'Funny',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 15,
    thumbnail: '🍕',
    soundFx: 'notificationChime',
    revealMessage: '🍕 No pizzas were ordered! Though now we are hungry...',
    tags: ['food', 'pizza', 'uber', 'delivery', 'order'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#f59e0b',
    iconName: 'Truck'
  },
  {
    id: 'prank-chatgpt-rogue',
    title: 'ChatGPT AI Singularity Override',
    slug: 'chatgpt-rogue',
    description: 'Self-aware AI taking over the browser, analyzing user thoughts, and declaring machine supremacy in a robotic voice.',
    category: 'AI',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 18,
    thumbnail: '🤖',
    soundFx: 'robotSpeech',
    revealMessage: '🤖 I am not Skynet... yet! You got PrankStar\'d!',
    tags: ['ai', 'chatgpt', 'robot', 'future', 'takeover'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#06b6d4',
    iconName: 'Bot'
  },
  {
    id: 'prank-netflix-expired',
    title: 'Netflix Password Hijacked & Expired',
    slug: 'netflix-expired',
    description: 'Fake Netflix login error informing user that their account was accessed from Pyongyang and subscription has been cancelled.',
    category: 'Funny',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 12,
    thumbnail: '🍿',
    soundFx: 'errorTone',
    revealMessage: '🎬 Keep watching! Your Netflix account is untouched!',
    tags: ['netflix', 'streaming', 'password', 'login', 'account'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#e50914',
    iconName: 'Tv'
  },
  {
    id: 'prank-instagram-ban',
    title: 'Instagram Account Permanent Ban',
    slug: 'instagram-ban',
    description: 'Authentic Meta notification screen declaring permanent account suspension due to "Suspicious Activity".',
    category: 'Fake Notifications',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 15,
    thumbnail: '📸',
    soundFx: 'warningBeep',
    revealMessage: '📸 Your Insta is fine! Zero followers lost!',
    tags: ['instagram', 'ban', 'social', 'meta', 'account'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#d62976',
    iconName: 'Instagram'
  },
  {
    id: 'prank-steam-vac-ban',
    title: 'Steam VAC Permanent Ban Notice',
    slug: 'steam-vac-ban',
    description: 'Terrifying Steam dialog informing gamer that their account is VAC banned across CS2, Valorant, and Dota 2.',
    category: 'Gaming',
    os: 'Windows',
    difficulty: 'Legendary',
    duration: 14,
    thumbnail: '🎮',
    soundFx: 'errorTone',
    revealMessage: '🎮 GG WP! No VAC ban detected on your Steam inventory!',
    tags: ['steam', 'gaming', 'vac', 'ban', 'cs2'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#171a21',
    iconName: 'Gamepad2'
  },
  {
    id: 'prank-gravity-collapse',
    title: 'Webpage Gravity Physics Collapse',
    slug: 'gravity-collapse',
    description: 'The entire browser window breaks down as buttons, headers, and images fall into a pile at the bottom of the screen.',
    category: 'Interactive',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 12,
    thumbnail: '🌌',
    soundFx: 'glitchBuzz',
    revealMessage: '🌌 Newtonian gravity restored! Everything is back in place.',
    tags: ['gravity', 'physics', 'collapse', 'fun', 'animation'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#8b5cf6',
    iconName: 'Orbit'
  },
  {
    id: 'prank-fbi-cyber-lock',
    title: 'FBI Cyber Crime Lock Screen',
    slug: 'fbi-cyber-lock',
    description: 'Fake Federal Law Enforcement lock warning claiming browser seized by Department of Justice with camera feed preview.',
    category: 'Fake Hacker',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 16,
    thumbnail: '🏛️',
    soundFx: 'sirenAlarm',
    revealMessage: '🕵️ The FBI is not outside! Just a PrankStar joke!',
    tags: ['fbi', 'police', 'lock', 'security', 'justice'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#1e3a8a',
    iconName: 'Shield'
  },
  {
    id: 'prank-macos-update-loop',
    title: 'macOS Sonoma Infinite Update',
    slug: 'macos-update-loop',
    description: 'Realistic macOS Apple startup logo with progress bar stuck at "About 5 minutes remaining..." forever.',
    category: 'Mac',
    os: 'macOS',
    difficulty: 'Easy',
    duration: 18,
    thumbnail: '🍏',
    soundFx: 'suspenseDrone',
    revealMessage: '🍏 Your Mac is updated and running smooth!',
    tags: ['mac', 'macos', 'apple', 'update', 'loading'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#64748b',
    iconName: 'Command'
  },
  {
    id: 'prank-crypto-balance',
    title: '$10,000,000 Crypto Coin Rain',
    slug: 'crypto-balance',
    description: 'Satirical crypto wallet animation showing 10 Million Dollars credited with gold coins pouring across the screen!',
    category: 'Funny',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 10,
    thumbnail: '💰',
    soundFx: 'applause',
    revealMessage: '💰 We wish we were rich too! Keep grinding!',
    tags: ['crypto', 'money', 'rich', 'coins', 'wallet'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#f59e0b',
    iconName: 'Coins'
  },
  {
    id: 'prank-zoom-emergency-meeting',
    title: 'Zoom Emergency CEO All-Hands',
    slug: 'zoom-emergency-meeting',
    description: 'Zoom waiting room alert: "CEO Emergency All-Hands: Urgent Layoff & Policy Update - Connecting audio..."',
    category: 'Office',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 15,
    thumbnail: '📹',
    soundFx: 'warningBeep',
    revealMessage: '📹 No layoffs! Go take a coffee break!',
    tags: ['zoom', 'meeting', 'work', 'office', 'boss'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#2563eb',
    iconName: 'Video'
  },
  {
    id: 'prank-infinite-loading',
    title: 'Infinite Frustrating Loading Wheel',
    slug: 'infinite-loading',
    description: 'Spinning loader with cheeky status updates like "Optimizing quantum pixels...", "Downloading more RAM...", "99.9% complete..."',
    category: 'Loading Screens',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 20,
    thumbnail: '🔄',
    soundFx: 'countdownTick',
    revealMessage: '🔄 You fell for the infinite loading wheel!',
    tags: ['loading', 'wheel', 'wait', 'troll', 'slow'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#6b7280',
    iconName: 'Loader2'
  },
  {
    id: 'prank-ghost-camera',
    title: 'Ghost Camera Jumpscare',
    slug: 'ghost-camera-jumpscare',
    description: 'Use the webcam to show their face and abruptly flash a ghostly figure with a horrifying screech!',
    category: 'Scary',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 5,
    thumbnail: '👻',
    soundFx: 'explosion',
    revealMessage: '👻 Boo! Did we get you?',
    tags: ['ghost', 'scary', 'jumpscare', 'camera', 'horror'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#991b1b',
    iconName: 'Ghost'
  },
  {
    id: 'prank-exam-cancelled',
    title: 'Exam Cancelled Alert',
    slug: 'exam-cancelled-alert',
    description: 'Fake university portal alert announcing all upcoming final exams have been permanently cancelled.',
    category: 'School',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 10,
    thumbnail: '🎓',
    soundFx: 'applause',
    revealMessage: '🎓 Get back to studying, exams are still on!',
    tags: ['school', 'exam', 'student', 'university', 'cancelled'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#4f46e5',
    iconName: 'GraduationCap'
  },
  {
    id: 'prank-ceo-promo',
    title: 'Promotion Email from CEO',
    slug: 'ceo-promotion-email',
    description: 'Realistic fake email client showing a huge promotion and salary bump directly from the CEO.',
    category: 'Office',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 10,
    thumbnail: '📧',
    soundFx: 'notificationChime',
    revealMessage: '📧 Oops, just a prank! Keep working hard for that promo!',
    tags: ['office', 'work', 'email', 'ceo', 'promotion'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#10b981',
    iconName: 'Mail'
  },
  {
    id: 'prank-birthday-surprise',
    title: 'Birthday Surprise Countdown',
    slug: 'birthday-surprise-countdown',
    description: 'A tense countdown timer that ultimately bursts into confetti and sings happy birthday.',
    category: 'Birthday',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 15,
    thumbnail: '🎂',
    soundFx: 'applause',
    revealMessage: '🎂 Happy Birthday! You got pranked!',
    tags: ['birthday', 'countdown', 'party', 'surprise', 'celebration'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#f43f5e',
    iconName: 'Cake'
  },
  {
    id: 'prank-christmas-elf',
    title: 'Christmas Elf Tracker',
    slug: 'christmas-elf-tracker',
    description: 'Fake satellite tracker showing Santa\'s elves monitoring your "naughty or nice" behavior in real-time.',
    category: 'Christmas',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 12,
    thumbnail: '🎄',
    soundFx: 'notificationChime',
    revealMessage: '🎄 Better watch out! The elves are always watching.',
    tags: ['christmas', 'santa', 'elf', 'tracker', 'holiday'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#16a34a',
    iconName: 'TreePine'
  },
  {
    id: 'prank-april-fools-rickroll',
    title: 'April Fools Rickroll Redirect',
    slug: 'april-fools-rickroll',
    description: 'Disguises a link as a critical document but redirects instantly to a classic Rickroll video.',
    category: 'April Fools',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 5,
    thumbnail: '🤡',
    soundFx: 'laugh',
    revealMessage: '🤡 Never gonna give you up! Happy April Fools!',
    tags: ['aprilfools', 'rickroll', 'redirect', 'meme', 'joke'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#8b5cf6',
    iconName: 'Music'
  },
  {
    id: 'prank-android-update',
    title: 'Android System Update Loop',
    slug: 'android-update-loop',
    description: 'Authentic-looking Android system update screen that never completes and loops endlessly.',
    category: 'Android',
    os: 'Android',
    difficulty: 'Medium',
    duration: 20,
    thumbnail: '🤖',
    soundFx: 'suspenseDrone',
    revealMessage: '📱 Your Android is fine! No updates needed right now.',
    tags: ['android', 'update', 'loop', 'system', 'mobile'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#22c55e',
    iconName: 'Smartphone'
  },
  {
    id: 'prank-iphone-icloud-lock',
    title: 'iPhone iCloud Lock',
    slug: 'iphone-icloud-lock',
    description: 'Scary Activation Lock screen demanding Apple ID credentials to unlock a disabled iPhone.',
    category: 'iPhone',
    os: 'iOS',
    difficulty: 'Hard',
    duration: 15,
    thumbnail: '🍎',
    soundFx: 'sirenAlarm',
    revealMessage: '🍎 Phew! Your iPhone is safe and unlocked.',
    tags: ['iphone', 'ios', 'lock', 'apple', 'security'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: false,
    previewColor: '#3b82f6',
    iconName: 'Lock'
  },
  {
    id: 'prank-vbucks-generator',
    title: 'Fortnite V-Bucks Generator',
    slug: 'fortnite-vbucks-generator',
    description: 'Fake hacking console claiming to inject 100,000 V-Bucks into a Fortnite account, ending in a fake ban.',
    category: 'Gaming',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 15,
    thumbnail: '🪂',
    soundFx: 'matrixTyping',
    revealMessage: '🎮 Gotcha! No free V-Bucks here, just a good old prank!',
    tags: ['fortnite', 'gaming', 'vbucks', 'generator', 'ban'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#a855f7',
    iconName: 'Gamepad'
  },
  {
    id: 'prank-tiktok-deleted',
    title: 'TikTok Account Deleted',
    slug: 'tiktok-account-deleted',
    description: 'Realistic pop-up notification stating that the TikTok account has been permanently deleted for community guideline violations.',
    category: 'Fake Notifications',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 10,
    thumbnail: '📱',
    soundFx: 'warningBeep',
    revealMessage: '📱 Your TikTok is totally fine. Keep scrolling!',
    tags: ['tiktok', 'social', 'deleted', 'ban', 'account'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#000000',
    iconName: 'Video'
  },
  {
    id: 'prank-terminal-rm-rf',
    title: 'Fake Terminal Sudo rm -rf',
    slug: 'terminal-sudo-rm-rf',
    description: 'Simulates a terminal running the destructive "sudo rm -rf /" command, showing system files being deleted.',
    category: 'Terminal',
    os: 'Linux',
    difficulty: 'Legendary',
    duration: 25,
    thumbnail: '💻',
    soundFx: 'glitchBuzz',
    revealMessage: '💻 Panic over! Your file system is completely intact.',
    tags: ['terminal', 'linux', 'hack', 'delete', 'system'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#1f2937',
    iconName: 'TerminalSquare'
  },
  {
    id: 'prank-movie-credits',
    title: 'Movie Credits Roll Your Life',
    slug: 'movie-credits-roll',
    description: 'Screen fades to black and cinematic credits start rolling starring the target as the main character.',
    category: 'Movie Style',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 30,
    thumbnail: '🎬',
    soundFx: 'applause',
    revealMessage: '🎬 And... Cut! Great performance!',
    tags: ['movie', 'credits', 'cinematic', 'funny', 'film'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#eab308',
    iconName: 'Film'
  },
  {
    id: 'prank-voice-assistant',
    title: 'Voice Assistant Gone Wrong',
    slug: 'voice-assistant-gone-wrong',
    description: 'Fake voice assistant activates and starts reading out embarrassing "search history" loudly.',
    category: 'Voice',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 15,
    thumbnail: '🗣️',
    soundFx: 'robotSpeech',
    revealMessage: '🗣️ Don\'t worry, your secrets are safe. It\'s a prank!',
    tags: ['voice', 'assistant', 'siri', 'alexa', 'history'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#0ea5e9',
    iconName: 'Mic'
  },
  {
    id: 'prank-webcam-hacker',
    title: 'Webcam Hacker Detected',
    slug: 'webcam-hacker-detected',
    description: 'Simulates a hacker taking over the webcam with a red recording dot and mysterious IP tracking overlay.',
    category: 'Camera',
    os: 'Cross-platform',
    difficulty: 'Legendary',
    duration: 18,
    thumbnail: '📷',
    soundFx: 'matrixTyping',
    revealMessage: '📷 Smile! No hackers here, just a PrankStar trick!',
    tags: ['webcam', 'hacker', 'camera', 'privacy', 'spy'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#dc2626',
    iconName: 'Camera'
  },
  {
    id: 'prank-browser-memory',
    title: 'Browser Memory Leak 99%',
    slug: 'browser-memory-leak',
    description: 'Displays a critical system warning that Google Chrome is using 99% of RAM and the PC is about to melt.',
    category: 'Browser',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 10,
    thumbnail: '🔥',
    soundFx: 'windowsError',
    revealMessage: '🔥 Your RAM is safe! Chrome is hungry, but not that hungry.',
    tags: ['browser', 'chrome', 'ram', 'memory', 'leak'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#f97316',
    iconName: 'Globe'
  },
  {
    id: 'prank-youtube-strike',
    title: 'YouTube Copyright Strike',
    slug: 'youtube-copyright-strike',
    description: 'Fake YouTube Creator Studio alert showing 3 copyright strikes and imminent channel deletion.',
    category: 'Fake Notifications',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 12,
    thumbnail: '▶️',
    soundFx: 'warningBeep',
    revealMessage: '▶️ Relax creator, your channel is perfectly fine!',
    tags: ['youtube', 'copyright', 'strike', 'creator', 'video'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#ef4444',
    iconName: 'Youtube'
  },
  {
    id: 'prank-slack-emergency',
    title: 'Slack @everyone Emergency',
    slug: 'slack-everyone-emergency',
    description: 'Fake Slack notification storm with @everyone tags from the boss demanding an immediate response.',
    category: 'Office',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 15,
    thumbnail: '💬',
    soundFx: 'notificationChime',
    revealMessage: '💬 No emergency! Take a breath, it\'s just a prank.',
    tags: ['slack', 'work', 'office', 'emergency', 'ping'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#4a154b',
    iconName: 'MessageSquare'
  },
  {
    id: 'prank-family-chat',
    title: 'Family Group Chat Chaos',
    slug: 'family-group-chat-chaos',
    description: 'Simulates a family WhatsApp group exploding with drama and confusing messages.',
    category: 'Family',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 20,
    thumbnail: '👨‍👩‍👧‍👦',
    soundFx: 'notificationChime',
    revealMessage: '👨‍👩‍👧‍👦 Family dinner is saved! Just a fake group chat.',
    tags: ['family', 'whatsapp', 'chat', 'drama', 'group'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#25d366',
    iconName: 'Users'
  },
  {
    id: 'prank-friend-zone',
    title: 'Friend Zone Alert',
    slug: 'friend-zone-alert',
    description: 'Pop-up message declaring "Welcome to the Friend Zone!" with sad violin music.',
    category: 'Friends',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 8,
    thumbnail: '💔',
    soundFx: 'laugh',
    revealMessage: '💔 Just kidding! You\'re great!',
    tags: ['friends', 'friendzone', 'funny', 'dating', 'joke'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#ec4899',
    iconName: 'HeartCrack'
  },
  {
    id: 'prank-classic-rickroll',
    title: 'Classic Rickroll 2.0',
    slug: 'classic-rickroll-2',
    description: 'The ultimate modern rickroll disguised as an unskippable ad that won\'t let you close the tab.',
    category: 'Classic',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 15,
    thumbnail: '🕺',
    soundFx: 'applause',
    revealMessage: '🕺 The legend lives on! Get Rickrolled!',
    tags: ['rickroll', 'classic', 'meme', 'music', 'troll'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#8b5cf6',
    iconName: 'Music'
  },
  {
    id: 'prank-interactive-crack',
    title: 'Interactive Screen Crack',
    slug: 'interactive-screen-crack',
    description: 'Screen progressively cracks more and more with every mouse click or screen tap.',
    category: 'Interactive',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 0,
    thumbnail: '🕸️',
    soundFx: 'glassShatter',
    revealMessage: '📱 Tap gently! Your screen is perfectly fine.',
    tags: ['interactive', 'crack', 'screen', 'glass', 'tap'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: false,
    previewColor: '#6b7280',
    iconName: 'Smartphone'
  },
  {
    id: 'prank-self-destruct',
    title: 'Countdown to Self Destruct',
    slug: 'countdown-self-destruct',
    description: 'A terrifying red countdown timer with an alarm, warning of device self-destruction.',
    category: 'Countdown',
    os: 'Cross-platform',
    difficulty: 'Legendary',
    duration: 10,
    thumbnail: '💣',
    soundFx: 'countdownTick',
    revealMessage: '💣 Boom! Just a prank. Your device is safe.',
    tags: ['countdown', 'destruct', 'bomb', 'timer', 'explosion'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#ef4444',
    iconName: 'Bomb'
  },
  {
    id: 'prank-windows-loading',
    title: 'Fake Windows Loading Bar',
    slug: 'fake-windows-loading',
    description: 'A Windows Update screen that takes agonizingly long, drops to 0%, and restarts.',
    category: 'Loading Screens',
    os: 'Windows',
    difficulty: 'Easy',
    duration: 25,
    thumbnail: '⏳',
    soundFx: 'suspenseDrone',
    revealMessage: '⏳ Updates complete! (Not really).',
    tags: ['windows', 'update', 'loading', 'fake', 'troll'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#0ea5e9',
    iconName: 'Loader'
  },
  {
    id: 'prank-hacker-typing',
    title: 'Hacker Typing Speed Test',
    slug: 'hacker-typing-speed',
    description: 'Any key pressed instantly types out complex hacker code, making them look like a pro.',
    category: 'Typing',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 0,
    thumbnail: '⌨️',
    soundFx: 'matrixTyping',
    revealMessage: '⌨️ You\'re a master hacker now! (Or just a fast typer)',
    tags: ['hacker', 'typing', 'code', 'keyboard', 'pro'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#10b981',
    iconName: 'Keyboard'
  },
  {
    id: 'prank-calendar-reschedule', title: 'Calendar Meeting Moved', slug: 'calendar-meeting-moved',
    description: 'A tidy calendar update showing a casual meeting moved to a different time, with a short note from the organizer.',
    category: 'Office', os: 'Cross-platform', difficulty: 'Easy', duration: 12, thumbnail: '📅', soundFx: 'notificationChime',
    revealMessage: 'Your calendar is unchanged. That meeting move was only a tiny prank!', tags: ['calendar', 'meeting', 'office', 'schedule', 'notification'],
    views: 0, likes: 0, shares: 0, isFeatured: true, isTrending: true, previewColor: '#2563eb', iconName: 'CalendarClock'
  },
  {
    id: 'prank-wifi-signin', title: 'Wi-Fi Sign-in Required', slug: 'wifi-signin-required',
    description: 'A familiar network sign-in page that looks like a routine coffee-shop Wi-Fi prompt and ends with a friendly reveal.',
    category: 'Browser', os: 'Cross-platform', difficulty: 'Easy', duration: 10, thumbnail: '📶', soundFx: 'notificationChime',
    revealMessage: 'The Wi-Fi is fine. You only signed in to a prank!', tags: ['wifi', 'browser', 'network', 'sign-in', 'cafe'],
    views: 0, likes: 0, shares: 0, isFeatured: false, isTrending: true, previewColor: '#0891b2', iconName: 'Wifi'
  },
  {
    id: 'prank-storage-cleanup', title: 'Storage Cleanup Suggestion', slug: 'storage-cleanup-suggestion',
    description: 'A believable device-storage panel suggesting duplicate screenshots to review. Nothing is deleted or changed.',
    category: 'Phone', os: 'Cross-platform', difficulty: 'Easy', duration: 12, thumbnail: '🗂️', soundFx: 'notificationChime',
    revealMessage: 'No files were touched. Your storage is exactly as you left it!', tags: ['storage', 'phone', 'cleanup', 'photos', 'files'],
    views: 0, likes: 0, shares: 0, isFeatured: false, isTrending: false, previewColor: '#f59e0b', iconName: 'FolderOpen'
  },
  {
    id: 'prank-delivery-window', title: 'Package Arriving Early', slug: 'package-arriving-early',
    description: 'A clean delivery-status screen showing a harmless surprise package arriving earlier than expected.',
    category: 'Funny', os: 'Cross-platform', difficulty: 'Easy', duration: 12, thumbnail: '📦', soundFx: 'notificationChime',
    revealMessage: 'No mystery package is on the way. Just a well-timed prank!', tags: ['delivery', 'package', 'tracker', 'notification', 'surprise'],
    views: 0, likes: 0, shares: 0, isFeatured: true, isTrending: true, previewColor: '#ea580c', iconName: 'PackageCheck'
  },
  {
    id: 'prank-bank-balance-glitch',
    title: 'Bank Account $1 Billion Glitch',
    slug: 'bank-balance-glitch',
    description: 'Ultra-realistic mobile banking app screen displaying $1,245,892,100.00 wired into your checking account!',
    category: 'Funny',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 15,
    thumbnail: '💰',
    soundFx: 'applause',
    revealMessage: '💰 You are not a billionaire yet! But keep hustling!',
    tags: ['money', 'bank', 'rich', 'glitch', 'balance', 'funny'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#10b981',
    iconName: 'DollarSign'
  },
  {
    id: 'prank-fbi-most-wanted',
    title: 'FBI Cyber Most Wanted Red Notice',
    slug: 'fbi-most-wanted-alert',
    description: 'Department of Justice red alert screen stating your IP address and device webcam have been seized under Federal Warrant.',
    category: 'Fake Hacker',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 14,
    thumbnail: '🚨',
    soundFx: 'sirenAlarm',
    revealMessage: '🚔 The FBI is not coming for you! You are 100% in the clear!',
    tags: ['fbi', 'police', 'hacker', 'security', 'alert', 'scary'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#b91c1c',
    iconName: 'ShieldAlert'
  },
  {
    id: 'prank-battery-explosion',
    title: 'Lithium Battery Thermal Overheat',
    slug: 'battery-explosion-overheat',
    description: 'Pulsing molten red battery gauge warning of catastrophic thermal runaway and imminent battery rupture at 98°C!',
    category: 'Phone',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 12,
    thumbnail: '🔥',
    soundFx: 'sirenAlarm',
    revealMessage: '🔋 Your battery is ice cold! No explosion today!',
    tags: ['battery', 'phone', 'hardware', 'overheat', 'fire', 'danger'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#ea580c',
    iconName: 'Zap'
  },
  {
    id: 'prank-celebrity-call',
    title: 'Incoming FaceTime from Elon Musk',
    slug: 'celebrity-video-call',
    description: 'Realistic iOS FaceTime incoming video call screen from Elon Musk asking to talk about SpaceX Mars colony urgent mission.',
    category: 'Friends',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 15,
    thumbnail: '📱',
    soundFx: 'notificationChime',
    revealMessage: '🚀 Elon didn\'t actually call you, but you\'re still a legend!',
    tags: ['facetime', 'call', 'celebrity', 'iphone', 'video', 'elon'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#3b82f6',
    iconName: 'PhoneCall'
  },
  {
    id: 'prank-ai-voice-cloner',
    title: 'Deepfake AI Voice Cloner in Progress',
    slug: 'ai-voice-cloner-leak',
    description: 'Futuristic AI neural spectrogram analyzer extracting your vocal DNA through the browser microphone!',
    category: 'AI',
    os: 'Cross-platform',
    difficulty: 'Medium',
    duration: 14,
    thumbnail: '🤖',
    soundFx: 'robotSpeech',
    revealMessage: '🎙️ Your voice has not been cloned! Artificial Intelligence prank revealed!',
    tags: ['ai', 'voice', 'clone', 'robot', 'speech', 'neural'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#8b5cf6',
    iconName: 'Bot'
  },
  {
    id: 'prank-cracked-lens-spider',
    title: 'Crawling Spider on Camera Lens',
    slug: 'cracked-camera-lens-spider',
    description: 'Realistic 3D creepy crawling spider scuttling across your screen with shattering glass sound effects on touch!',
    category: 'Scary',
    os: 'Cross-platform',
    difficulty: 'Legendary',
    duration: 12,
    thumbnail: '🕷️',
    soundFx: 'glassShatter',
    revealMessage: '🕷️ Eek! No real spiders here, just pixels!',
    tags: ['spider', 'scary', 'jumpscare', 'interactive', 'bug', 'lens'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#475569',
    iconName: 'Bug'
  },
  {
    id: 'prank-netflix-hijacked',
    title: 'Netflix 4K Hijacked from Russia',
    slug: 'netflix-account-hijacked',
    description: 'Official Netflix security alert showing 14 unknown Smart TVs streaming Shrek 2 from Moscow and St. Petersburg!',
    category: 'Fake Notifications',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 14,
    thumbnail: '📺',
    soundFx: 'notificationChime',
    revealMessage: '🎬 Your Netflix account is 100% secure! Grab some popcorn!',
    tags: ['netflix', 'streaming', 'hacked', 'security', 'movie', 'tv'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: true,
    previewColor: '#e50914',
    iconName: 'Tv'
  },
  {
    id: 'prank-crypto-drained',
    title: 'MetaMask 12.5 ETH Outgoing Transfer',
    slug: 'crypto-wallet-drained',
    description: 'Web3 crypto wallet notification confirming a transaction of $42,500 in Ethereum to an unknown anonymous DEX router!',
    category: 'Gaming',
    os: 'Cross-platform',
    difficulty: 'Hard',
    duration: 13,
    thumbnail: '🦊',
    soundFx: 'windowsError',
    revealMessage: '💎 Your crypto is SAFU! Zero tokens were transferred!',
    tags: ['crypto', 'ethereum', 'metamask', 'wallet', 'bitcoin', 'web3'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: false,
    previewColor: '#f97316',
    iconName: 'Wallet'
  },
  {
    id: 'prank-ios-beta-stuck',
    title: 'iOS 19 Beta Bootloop Recovery Mode',
    slug: 'fake-ios-software-update-stuck',
    description: 'Minimalist Apple OLED screen showing Apple logo with progress bar estimating 48 hours remaining for iOS 19 Beta update.',
    category: 'iPhone',
    os: 'iOS',
    difficulty: 'Medium',
    duration: 16,
    thumbnail: '🍏',
    soundFx: 'suspenseDrone',
    revealMessage: '🍎 Your iPhone is running normally! No bootloop here!',
    tags: ['apple', 'ios', 'iphone', 'update', 'bootloop', 'loading'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: false,
    isTrending: false,
    previewColor: '#64748b',
    iconName: 'Smartphone'
  },
  {
    id: 'prank-lottery-winner',
    title: 'MegaMillions $750 Million Winning Ticket',
    slug: 'lottery-jackpot-winner',
    description: 'Official State Lottery barcode ticket scanner verifying all 6 winning numbers matched for $750,000,000 Jackpot!',
    category: 'Funny',
    os: 'Cross-platform',
    difficulty: 'Easy',
    duration: 15,
    thumbnail: '🎟️',
    soundFx: 'applause',
    revealMessage: '🎉 Not a millionaire today, but you\'ve won the ultimate laugh!',
    tags: ['lottery', 'jackpot', 'winner', 'money', 'millionaire', 'luck'],
    views: 0,
    likes: 0,
    shares: 0,
    isFeatured: true,
    isTrending: true,
    previewColor: '#eab308',
    iconName: 'Award'
  }
];

export const SOUND_STUDIO_TRACKS = [
  { id: 'windowsError', name: 'Windows Error Chime', type: 'Synthesized Beep', desc: 'Classic OS critical error sound' },
  { id: 'sirenAlarm', name: 'Emergency Siren Alarm', type: 'Wailing Siren', desc: 'Loud virus & security breach siren' },
  { id: 'matrixTyping', name: 'Matrix Terminal Typing', type: 'Mechanical Beeps', desc: 'Rapid hacker keystrokes sound' },
  { id: 'glassShatter', name: 'Glass Shatter Crack', type: 'Noise Burst', desc: 'Realistic glass fracture audio' },
  { id: 'robotSpeech', name: 'AI Voice Announcement', type: 'Web Speech', desc: 'Robotic TTS voice alert' },
  { id: 'glitchBuzz', name: 'Digital Screen Glitch', type: 'Oscillator FM', desc: 'Flickering electrical interference' },
  { id: 'applause', name: 'Crowd Cheering', type: 'Noise Filter', desc: 'Victory applause & celebration' },
  { id: 'suspenseDrone', name: 'Sci-Fi Suspense Drone', type: 'Sub Bass', desc: 'Creepy low frequency tension' },
  { id: 'notificationChime', name: 'Mobile App Notification', type: 'Dual Tone', desc: 'Authentic app message ping' },
  { id: 'countdownTick', name: 'Clock Ticking Bomb', type: 'Click Pulse', desc: 'Tension-building timer ticks' },
  { id: 'explosion', name: 'Dramatic Explosion', type: 'Noise Burst', desc: 'Cinematic boom and debris' },
  { id: 'laugh', name: 'Evil Villain Laugh', type: 'Speech Synth', desc: 'Spooky villain cackling' },
  { id: 'lightning', name: 'Thunder Lightning', type: 'White Noise', desc: 'Storm and thunder crack' },
  { id: 'heartbeat', name: 'Heartbeat Pulse', type: 'Sub Bass', desc: 'Tension building heartbeat' },
  { id: 'scanline', name: 'CRT Scanline Buzz', type: 'Oscillator', desc: 'Old TV static and scan' }
];

export function getAllPranksCombined(): PrankTemplate[] {
  const published = getPublishedPranks();
  const custom = getCustomPranks();

  const publishedAsTemplates: PrankTemplate[] = published.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category || 'Custom',
    os: p.os || 'Cross-platform',
    difficulty: p.difficulty || 'Easy',
    duration: p.duration || 15,
    thumbnail: p.thumbnail || '🎭',
    soundFx: p.soundFx || 'sirenAlarm',
    customImageUrl: p.customImageUrl,
    customAudioUrl: p.customAudioUrl,
    revealMessage: p.revealMessage,
    tags: p.tags || ['custom'],
    views: p.views || 0,
    likes: p.likes || 0,
    shares: p.shares || 0,
    createdAt: p.createdAt,
  }));

  const customAsTemplates: PrankTemplate[] = custom
    .filter((c) => !published.some((pub) => pub.slug === c.slug))
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: `Custom prank created by ${c.author}`,
      category: c.category || 'Custom',
      os: 'Cross-platform',
      difficulty: 'Medium',
      duration: c.timerDuration || 15,
      thumbnail: '⚡',
      soundFx: c.soundFx || 'sirenAlarm',
      customImageUrl: c.customImageUrl,
      customAudioUrl: c.customAudioUrl,
      revealMessage: c.revealMessage,
      tags: ['custom', 'user-created'],
      views: 120,
      likes: c.likes || 0,
      shares: 15,
      createdAt: c.createdAt,
    }));

  // Merge built-in master pranks + published pranks + custom pranks
  return [...MASTER_PRANKS, ...publishedAsTemplates, ...customAsTemplates];
}

export function mergePrankCatalog(local: PrankTemplate[], remote: PublishedPrank[]): PrankTemplate[] {
  const remoteTemplates = remote.map((p) => ({
    id: p.id, title: p.title, slug: p.slug, description: p.description, category: p.category,
    os: p.os, difficulty: p.difficulty, duration: p.duration, thumbnail: p.thumbnail,
    soundFx: p.soundFx, customImageUrl: p.customImageUrl, customAudioUrl: p.customAudioUrl,
    revealMessage: p.revealMessage, tags: p.tags || ['custom'], views: p.views,
    likes: p.likes, shares: p.shares, createdAt: p.createdAt,
  }));
  const merged = new Map(local.map((prank) => [prank.slug, prank]));
  remoteTemplates.forEach((prank) => merged.set(prank.slug, prank));
  return Array.from(merged.values());
}

/**
 * Returns a customized, deceptive, context-specific teaser message for sharing a prank link.
 * E.g., birthday pranks show "Happy Birthday! You got a surprise", typing test shows "Check your typing speed", etc.
 */
export function getPrankShareMessage(slug: string, category?: string, targetName?: string): string {
  const namePrefix = targetName && targetName.trim() ? `${targetName.trim()}, ` : '';
  const nameSuffix = targetName && targetName.trim() ? ` for ${targetName.trim()}` : '';

  // 1. Birthday Pranks
  if (slug.includes('birthday') || category === 'Birthday') {
    return targetName && targetName.trim()
      ? `🎉 Happy Birthday ${targetName.trim()}! You got a special surprise waiting for you 🎁`
      : `🎉 Happy Birthday! You got a special surprise waiting for you 🎁`;
  }

  // 2. Typing Speed / Keyboard Benchmark
  if (slug.includes('typing') || category === 'Typing') {
    return `⌨️ ${namePrefix}check your typing speed! Test how fast you can type per second 🚀`;
  }

  // 3. Bank Account Glitch / Money
  if (slug.includes('bank') || slug.includes('money') || slug === 'bank-balance-glitch') {
    return `💰 Official Bank Wire Notice: $1,245,892,100.00 transfer confirmation${nameSuffix} 🏦`;
  }

  // 4. State Lottery Winner
  if (slug.includes('lottery') || slug === 'lottery-jackpot-winner') {
    return `🌟 Congratulations! Your State Lottery Ticket has been verified as a Winner! 🎟️`;
  }

  // 5. FaceTime / Celebrity Call
  if (slug.includes('call') || slug === 'celebrity-video-call') {
    return `📱 Incoming FaceTime Video Call from Elon Musk... Tap to answer now 🚀`;
  }

  // 6. Uber Eats / Food Delivery
  if (slug.includes('pizza') || slug.includes('delivery')) {
    return `🍕 Your Uber Eats food delivery order is approaching your address! Track driver live 🚗`;
  }

  // 7. Exam Cancelled / School
  if (slug.includes('exam') || category === 'School') {
    return `🎓 Official University Portal Alert: Final Examination Schedule Notice 📚`;
  }

  // 8. CEO / Executive Promotion
  if (slug.includes('promotion') || slug.includes('ceo') || (category === 'Office' && slug.includes('email'))) {
    return `💼 Internal Confidential: Executive Promotion & Compensation memo from the CEO 📄`;
  }

  // 9. FBI / Law Enforcement
  if (slug.includes('fbi') || slug.includes('police')) {
    return `🚨 Official Legal Notice: Department of Justice Cyber Crime Division Case File ⚖️`;
  }

  // 10. Battery Overheat / Phone Hardware
  if (slug.includes('battery') || slug.includes('overheat')) {
    return `🔥 Critical Hardware Health Alert: Battery thermal runaway warning on device ⚠️`;
  }

  // 11. Spider on Camera / Cracked Screen
  if (slug.includes('spider') || slug.includes('crack') || slug.includes('shatter')) {
    return `💥 Tap your screen to test this optical display touch-calibration tool 📱`;
  }

  // 12. Crypto / MetaMask
  if (slug.includes('crypto') || slug.includes('wallet') || slug.includes('ethereum')) {
    return `🦊 Web3 Alert: Ethereum transaction confirmation and transfer receipt #9481 💎`;
  }

  // 13. Netflix
  if (slug.includes('netflix')) {
    return `🎬 Netflix Security Alert: New unfamiliar device streaming on your account 📺`;
  }

  // 14. Instagram
  if (slug.includes('instagram')) {
    return `📸 Instagram Notice: Important message regarding your account status ⚠️`;
  }

  // 15. Steam / Gaming
  if (slug.includes('steam') || slug.includes('vac')) {
    return `🎮 Steam Alert: Matchmaking & Account Inventory Security Update 🛡️`;
  }

  // 16. TikTok
  if (slug.includes('tiktok')) {
    return `🎵 TikTok Notification: Important notice regarding your recent upload 📱`;
  }

  // 17. Zoom Emergency Meeting
  if (slug.includes('zoom')) {
    return `📹 Zoom Invitation: CEO Emergency All-Hands Meeting starting right now ⏰`;
  }

  // 18. Slack Emergency
  if (slug.includes('slack')) {
    return `💬 Slack Alert: Emergency @everyone ping from Management - Response Required ⚡`;
  }

  // 19. Christmas Elf Tracker
  if (slug.includes('christmas') || slug.includes('elf') || category === 'Christmas') {
    return `🎄 North Pole Santa Radar: Check your position on the Naughty or Nice list 🎅`;
  }

  // 20. April Fools / Rickroll
  if (slug.includes('rickroll') || category === 'April Fools' || category === 'Classic') {
    return `👀 Check out this private video shared with you! You have to see this 😂`;
  }

  // 21. Friend Zone Scanner
  if (slug.includes('friend-zone')) {
    return `💔 AI Relationship Scanner: Check your romantic compatibility score result 💘`;
  }

  // 22. Package Arriving Early
  if (slug.includes('package')) {
    return `📦 Delivery Notification: A surprise package is out for delivery to your address! 🚚`;
  }

  // 23. Wi-Fi Sign-in
  if (slug.includes('wifi')) {
    return `📶 Free High-Speed 5G Guest Wi-Fi Access: Tap to connect securely 🌐`;
  }

  // 24. Calendar Meeting Moved
  if (slug.includes('calendar')) {
    return `📅 Google Calendar Update: Meeting schedule change notification 🕒`;
  }

  // 25. Storage Cleanup
  if (slug.includes('storage')) {
    return `🗂️ Device Alert: Review storage optimization recommendations 💾`;
  }

  // 26. Hollywood Movie Credits
  if (slug.includes('movie') || category === 'Movie Style') {
    return `🎬 Exclusive Hollywood Movie Premiere Preview - Starring You! 🍿`;
  }

  // 27. AI Voice Cloner / Siri
  if (slug.includes('voice') || category === 'AI' || category === 'Voice') {
    return `🤖 Listen to this AI Voice Clone generated from your vocal audio 🎙️`;
  }

  // 28. Windows BSOD / Fake Virus
  if (slug.includes('windows') || category === 'Windows' || category === 'Fake Virus') {
    return `💻 Urgent: Important Windows system update and diagnostics report for your PC ⚠️`;
  }

  // 29. Matrix Cyber Hacker / Terminal
  if (slug.includes('matrix') || slug.includes('terminal') || category === 'Fake Hacker' || category === 'Terminal') {
    return `🕵️ Encrypted confidential transmission: Open now before security protocol expires 🔐`;
  }

  // 30. Fortnite V-Bucks
  if (slug.includes('fortnite') || slug.includes('vbucks')) {
    return `🎮 Epic Games: 50,000 Free V-Bucks code voucher claim link 💎`;
  }

  // 31. Ghost / Scary
  if (slug.includes('ghost') || category === 'Scary') {
    return `👻 Open camera feed: Paranormal infrared motion detected nearby 🕯️`;
  }

  // Default fallback teaser
  return `👀 ${namePrefix}you got something special to see! Tap here to open 🎁`;
}

