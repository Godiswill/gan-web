'use client';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

export default function ThemeIcon() {
  const { theme, setTheme } = useTheme();

  return theme ? (
    <button
      aria-label="change toggle"
      className="border-0 bg-none"
      onClick={() => setTheme((pre) => (pre === 'dark' ? 'light' : 'dark'))}
    >
      {/* {theme === 'dark' ? '🌙 Dark' : '☀️ Light'} */}
      {theme === 'dark' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
      {/* <SunIcon className="h-6 w-6 sun" /> */}
      {/* <MoonIcon className="h-6 w-6 moon" /> */}
    </button>
  ) : null;
}

// 'use client';
// import { useEffect, useState } from 'react';

// export default function ThemeToggle() {
//   const [theme, setTheme] = useState<'light' | 'dark'>('light');

//   useEffect(() => {
//     // 初始化读取
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark' || savedTheme === 'light') {
//       setTheme(savedTheme);
//     } else {
//       const prefersDark = window.matchMedia(
//         '(prefers-color-scheme: dark)'
//       ).matches;
//       setTheme(prefersDark ? 'dark' : 'light');
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === 'dark' ? 'light' : 'dark';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//     document.documentElement.setAttribute('data-theme', newTheme);
//   };

//   return (
//     <button
//       onClick={toggleTheme}
//       className="px-4 py-2 rounded-md border bg-gray-200 dark:bg-gray-800"
//     >
//       {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
//     </button>
//   );
// }
