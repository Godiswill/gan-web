'use client';
import dynamic from 'next/dynamic';
import Navigation from './Navigation';
// import ThemeIcon from './ThemeIcon';

const ThemeIcon = dynamic(() => import('./ThemeIcon'), { ssr: false });

export default function Header() {
  return (
    <header>
      <nav className="flex justify-between items-center h-18 border-b border-gray-950/5 dark:border-white/10">
        <Navigation />

        <ThemeIcon />
      </nav>
    </header>
  );
}
