import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
    </button>
  );
} 