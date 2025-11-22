'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { currentTheme } = useThemeStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    return <>{children}</>;
}

