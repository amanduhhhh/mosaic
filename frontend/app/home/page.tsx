'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamStore } from '@/stores/stream';
import { useThemeStore } from '@/store/useThemeStore';
import { HybridRenderer } from '@/components/HybridRenderer';
import {
    Command,
    Terminal,
    Maximize2,
    Minimize2,
    X,
    Sparkles,
    Layout,
    Moon,
    Zap,
    Feather,
    ChevronRight,
    Box
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
    "Show my Spotify top songs and listening stats",
    "Lakers vs Celtics - compare their season records",
    "My running stats from Strava with recent activities",
    "AAPL, GOOGL, MSFT stock prices and performance",
    "Cowboys, Yankees, and Bruins - my favorite teams",
];

const REVOLVING_PLACEHOLDERS = [
    "Visualize your Spotify data...",
    "Compare sports team stats...",
    "Analyze your stock portfolio...",
    "Track your fitness progress...",
];

export default function HomePage() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [showTerminal, setShowTerminal] = useState(true);
    const [activeTab, setActiveTab] = useState<'app' | 'code'>('app');
    const [mosaicExited, setMosaicExited] = useState(false);
    const [mosaicHasBeenHidden, setMosaicHasBeenHidden] = useState(false);

    const {
        isStreaming,
        dataContext,
        htmlContent,
        rawResponse,
        startStream,
        reset,
    } = useStreamStore();

    const { currentTheme, setTheme } = useThemeStore();

    // Rotate placeholders
    useEffect(() => {
        if (isFocused || query) return;
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % REVOLVING_PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isFocused, query]);

    useEffect(() => {
        if (isFocused && !mosaicHasBeenHidden) {
            setMosaicHasBeenHidden(true);
            setMosaicExited(false);
        }
    }, [isFocused, mosaicHasBeenHidden]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isStreaming) return;
        startStream(query);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        startStream(suggestion);
    };

    const hasContent = htmlContent || isStreaming;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-white/20">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80')" }}
                />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse delay-1000" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col h-screen p-6 gap-6">


                {/* Window System */}
                <AnimatePresence>
                    {hasContent && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="flex-1 flex gap-6 min-h-0"
                        >
                            {/* App Window */}
                            <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                                {/* Window Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        </div>
                                    </div>

                                    {/* Theme Tabs */}
                                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
                                        <button
                                            onClick={() => setTheme('tokyo-night')}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                                currentTheme === 'tokyo-night' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
                                            )}
                                        >
                                            <Moon size={12} /> Tokyo
                                        </button>
                                        <button
                                            onClick={() => setTheme('impact')}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                                currentTheme === 'impact' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
                                            )}
                                        >
                                            <Zap size={12} /> Impact
                                        </button>
                                        <button
                                            onClick={() => setTheme('elegant')}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                                currentTheme === 'elegant' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
                                            )}
                                        >
                                            <Feather size={12} /> Elegant
                                        </button>
                                        <button
                                            onClick={() => setTheme('neobrutalism')}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                                currentTheme === 'neobrutalism' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
                                            )}
                                        >
                                            <Box size={12} /> Neo
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowTerminal(!showTerminal)}
                                            className={cn(
                                                "p-1.5 rounded-md transition-colors",
                                                showTerminal ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                                            )}
                                        >
                                            <Terminal size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* App Content */}
                                <div className="flex-1 overflow-hidden p-4 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <div className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {htmlContent ? (
                                            <HybridRenderer
                                                htmlContent={htmlContent}
                                                dataContext={dataContext}
                                                onInteraction={() => { }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white/20">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Terminal Window (Side Panel) */}
                            <AnimatePresence>
                                {showTerminal && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 400, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="flex flex-col bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 relative">
                                            <span className="text-xs font-mono text-white/60 flex items-center gap-2">
                                                <Terminal size={12} />
                                                TERMINAL
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowTerminal(false)}
                                                    className="w-2 h-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"
                                                    title="Collapse terminal"
                                                />
                                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-hidden p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                            <div className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                                <pre className="font-mono text-xs text-green-400/90 leading-relaxed whitespace-pre-wrap break-words">
                                                    {rawResponse || "// Waiting for generation..."}
                                                </pre>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Search Area */}
                <div className={cn(
                    "flex flex-col items-center justify-center transition-all duration-500 relative",
                    hasContent ? "h-auto pb-4" : "h-full pb-20"
                )}>

                    {/* Suggested Prompts */}
                    <AnimatePresence>
                        {isFocused && mosaicExited && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "mb-6 z-30",
                                    hasContent 
                                        ? "absolute bottom-full left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-2 max-w-2xl" 
                                        : "flex flex-wrap justify-center gap-2 max-w-2xl"
                                )}
                            >
                                {SUGGESTED_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(prompt)}
                                        className={cn(
                                            "px-4 py-2 text-sm text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/20 shadow-lg backdrop-blur-xl",
                                            hasContent 
                                                ? "bg-white/10 hover:bg-white/15 rounded-lg" 
                                                : "rounded-full bg-white/5 hover:bg-white/10"
                                        )}
                                        style={{ backdropFilter: 'blur(12px)' }}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mosaic Title */}
                    <AnimatePresence onExitComplete={() => setMosaicExited(true)}>
                        {!query && !isFocused && !mosaicHasBeenHidden && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ 
                                    duration: 0.5,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="mb-8 relative z-10"
                                style={{ filter: 'none', backdropFilter: 'none' }}
                            >
                                <h1 className="text-6xl font-accent font-normal tracking-wide text-white/75" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 400 }}>
                                    Mosaic
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search Bar */}
                    <motion.div
                        className={cn(
                            "relative w-full group transition-all duration-300",
                            hasContent ? "max-w-3xl" : "max-w-2xl",
                            isFocused ? "scale-105" : "scale-100"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            hasContent ? "rounded-lg" : "rounded-2xl"
                        )} />

                        <form onSubmit={handleSubmit} className="relative">
                            <div className={cn(
                                "relative flex items-center bg-white/10 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/20",
                                hasContent ? "rounded-lg" : "rounded-2xl"
                            )}>
                                <div className={cn("text-white/50", hasContent ? "pl-3" : "pl-4")}>
                                    <Sparkles size={hasContent ? 16 : 18} />
                                </div>

                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    className={cn(
                                        "w-full bg-transparent border-none text-white/75 placeholder-transparent focus:outline-none focus:ring-0",
                                        hasContent ? "px-3 py-2 text-sm" : "px-4 py-3 text-base"
                                    )}
                                    style={{ fontSmooth: 'always', WebkitFontSmoothing: 'antialiased' }}
                                />

                                {/* Revolving Placeholder */}
                                <AnimatePresence mode="wait">
                                    {!query && (
                                        <motion.div
                                            key={placeholderIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 0.4, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className={cn(
                                                "absolute pointer-events-none text-white",
                                                hasContent ? "left-10 text-sm" : "left-12 text-base"
                                            )}
                                            style={{ fontSmooth: 'always', WebkitFontSmoothing: 'antialiased' }}
                                        >
                                            {REVOLVING_PLACEHOLDERS[placeholderIndex]}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={!query.trim() || isStreaming}
                                    className={cn(
                                        "mr-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/10",
                                        hasContent ? "p-1.5 rounded-md" : "p-2 rounded-xl"
                                    )}
                                >
                                    {isStreaming ? (
                                        <div className={cn("border-2 border-white/30 border-t-white rounded-full animate-spin", hasContent ? "w-4 h-4" : "w-5 h-5")} />
                                    ) : (
                                        <div className={cn("bg-white text-black", hasContent ? "p-1 rounded-md" : "p-1.5 rounded-lg")}>
                                            <ChevronRight size={hasContent ? 14 : 16} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
