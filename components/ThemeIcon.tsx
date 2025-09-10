'use client';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeIcon() {
  const toggleTheme = () => {
    let newTheme;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      newTheme = savedTheme === 'dark' ? 'light' : 'dark';
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      newTheme = prefersDark ? 'light' : 'dark';
    }

    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      aria-label="change toggle"
      className="border-0 bg-none"
      onClick={toggleTheme}
    >
      <SunIcon className="h-6 w-6 sun-icon" />
      <MoonIcon className="h-6 w-6 moon-icon" />
    </button>
  );
}
