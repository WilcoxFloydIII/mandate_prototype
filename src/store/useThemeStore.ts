import { create } from 'zustand';

type Theme = 'dark' | 'light';

const THEME_COLOR = { dark: '#09090b', light: '#ffffff' };

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.getElementById('theme-color-meta')?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem('mandate-theme', theme);
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
}

function initialTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
}));
