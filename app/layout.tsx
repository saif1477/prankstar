import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import KonamiListener from '@/components/konami-listener';

export const metadata: Metadata = {
  title: 'PrankStar.io — World\'s Largest Browser Simulation & Prank Platform',
  description: 'Discover, customize, build, and share safe browser simulations, fake OS screens, hacker terminals, food delivery trackers, and AI takeovers.',
  openGraph: {
    title: 'PrankStar.io — The Ultimate Browser Simulation Platform',
    description: 'Safe, beautiful, animated browser-based pranks and simulations.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-dark-900 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-purple-500 selection:text-white">
        <KonamiListener />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
