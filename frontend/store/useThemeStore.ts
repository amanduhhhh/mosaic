import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeName } from '@/components/types';

interface ThemeState {
    currentTheme: ThemeName;
    setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            currentTheme: 'tokyo-night',
            setTheme: (theme) => {
                set({ currentTheme: theme });
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', theme);
                }
            },
        }),
        {
            name: 'theme-storage',
        }
    )
);
