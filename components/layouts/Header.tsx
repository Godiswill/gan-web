import { ThemeProvider } from '@/components/ThemeProvider';
import Navigation from './Navigation';
import ThemeIcon from './ThemeIcon';
import User from '@/components/User';

export default function Header() {
  return (
    <header className="px-4">
      <nav className="flex justify-between items-center h-18 border-b border-gray-950/5 dark:border-white/10">
        <Navigation />
        <div className="flex gap-10 items-center">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeIcon />
          </ThemeProvider>
          <User />
        </div>
      </nav>
    </header>
  );
}
