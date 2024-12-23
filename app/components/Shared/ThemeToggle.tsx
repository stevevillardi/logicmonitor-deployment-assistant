import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
} 