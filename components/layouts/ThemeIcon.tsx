'use client';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeIcon() {
  const { setTheme } = useTheme();

  return (
    <button aria-label="theme toggle" className="border-0 bg-none">
      <SunIcon
        className="h-6 w-6 sun-icon block dark:hidden"
        onClick={() => setTheme('dark')}
      />
      <MoonIcon
        className="h-6 w-6 hidden dark:block"
        onClick={() => setTheme('light')}
      />
    </button>
  );
}
