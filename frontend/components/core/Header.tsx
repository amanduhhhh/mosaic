'use client';

import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';
import { THEMES } from '@/lib/themes';
import type { ThemeName } from '@/components/types';

interface HeaderProps {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    children: React.ReactNode;
    className?: string;
    theme?: ThemeName;
}

export function Header({
    as: Component = 'h2',
    children,
    className,
    theme: propTheme,
}: HeaderProps) {
    const { currentTheme } = useThemeStore();
    const theme = propTheme || currentTheme;
    const themeConfig = THEMES[theme];

    const baseStyles = cn(
        themeConfig.fonts.heading,
        'text-foreground',
        Component === 'h1' && 'text-4xl',
        Component === 'h2' && 'text-2xl',
        Component === 'h3' && 'text-lg',
        Component === 'h4' && 'text-base',
        Component === 'h5' && 'text-sm',
        Component === 'h6' && 'text-xs',
        className
    );

    return <Component className={baseStyles}>{children}</Component>;
}

