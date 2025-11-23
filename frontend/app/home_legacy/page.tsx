'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamStore } from '@/stores/stream';
import { useThemeStore } from '@/store/useThemeStore';
import { HybridRenderer } from '@/components/HybridRenderer';
import { DraggableWindow } from '@/components/DraggableWindow';
import { DebugWindow } from '@/components/DebugWindow';
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
    Box,
    Edit,
    ChevronUp,
    Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
    "Show my Spotify top songs and listening stats",
    "Lakers vs Celtics - compare their season records",
    "My running stats from Strava with recent activities",
    "AAPL, GOOGL, MSFT stock prices and performance",
    "Cowboys, Yankees, and Bruins - my favorite teams",
    "My Clash Royale stats for #LP8U0V8PC",
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editQuery, setEditQuery] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [showThinking, setShowThinking] = useState(true);

    const {
        isStreaming,
        dataContext,
        htmlContent,
        rawResponse,
        thinkingMessages,
        viewStack,
        startStream,
        reset,
        refineStream,
        handleInteraction,
        goBack,
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

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        startStream(suggestion);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isStreaming) return;
        startStream(query);
        setQuery('');
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editQuery.trim() || isStreaming) return;
        refineStream(editQuery);
        setEditQuery('');
        setIsEditOpen(false);
    };

    const hasContent = htmlContent || isStreaming;

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-black text-white selection:bg-white/20">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80')" }}
                />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse delay-1000" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Thinking Indicator - Fixed Top Right */}
            <AnimatePresence>
                {isStreaming && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-6 right-6 z-50 flex items-start gap-3"
                    >
                        <AnimatePresence>
                            {showThinking && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="w-80 bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 pointer-events-auto"
                                >
                                    <div className="text-xs font-medium text-white/90 mb-3">Mosaic thinking...</div>
                                    
                                    <div className="space-y-1.5 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-mono text-[11px]">
                                        {thinkingMessages && thinkingMessages.length > 0 ? (
                                            thinkingMessages.map((msg, i) => (
                                                <div key={i} className="text-xs">
                                                    {msg.type === 'thinking' && (
                                                        <div className="flex items-start gap-2 text-white/70">
                                                            <span className="text-white/50 mt-0.5">—</span>
                                                            <span>{msg.message}</span>
                                                        </div>
                                                    )}

                                                    {msg.type === 'tool_call' && (
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-blue-400 mt-0.5">{'>'}</span>
                                                            <div>
                                                                <span className="text-blue-400 font-mono">{msg.function}</span>
                                                                {msg.args && Object.keys(msg.args).length > 0 && (
                                                                    <span className="text-white/40 ml-1 text-[10px]">
                                                                        ({Object.entries(msg.args).map(([k, v]) =>
                                                                            `${k}: ${JSON.stringify(v)}`
                                                                        ).join(', ')})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {msg.type === 'tool_result' && (
                                                        <div className="flex items-center gap-2 text-emerald-400">
                                                            <span>{'<'}</span>
                                                            <span className="font-mono">{msg.function}</span>
                                                            <span className="text-emerald-500">ok</span>
                                                        </div>
                                                    )}

                                                    {msg.type === 'tool_error' && (
                                                        <div className="flex items-start gap-2 text-red-400">
                                                            <span className="mt-0.5">!</span>
                                                            <div>
                                                                <span className="font-mono">{msg.function}</span>
                                                                <span className="text-red-500 ml-1">failed: {msg.error}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-white/50 flex items-start gap-2">
                                                <span className="mt-0.5">—</span>
                                                <span>Planning query...</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <button
                            onClick={() => setShowThinking(!showThinking)}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors shrink-0"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.6, 1, 0.6],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-6 h-6 rounded-full bg-white/90"
                            />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="relative z-0 flex flex-col h-screen p-6 gap-6 pointer-events-none">


                {/* Main Window */}
                <AnimatePresence>
                    {hasContent && (
                        <DraggableWindow
                            title={viewStack.length > 0 ? 'Detail View' : ''}
                            onClose={() => reset()}
                            onBack={goBack}
                            canGoBack={viewStack.length > 0}
                            initialWidth={900}
                            initialHeight={700}
                            headerActions={
                                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTheme('tokyo-night')}
                                        className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1",
                                            currentTheme === 'tokyo-night' ? "bg-white/10 text-white" : "text-white/60 hover:text-white/80"
                                        )}
                                    >
                                        <Moon size={10} /> Tokyo
                                    </button>
                                    <button
                                        onClick={() => setTheme('impact')}
                                        className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1",
                                            currentTheme === 'impact' ? "bg-white/10 text-white" : "text-white/60 hover:text-white/80"
                                        )}
                                    >
                                        <Zap size={10} /> Impact
                                    </button>
                                    <button
                                        onClick={() => setTheme('elegant')}
                                        className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1",
                                            currentTheme === 'elegant' ? "bg-white/10 text-white" : "text-white/60 hover:text-white/80"
                                        )}
                                    >
                                        <Feather size={10} /> Elegant
                                    </button>
                                    <button
                                        onClick={() => setTheme('neobrutalism')}
                                        className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1",
                                            currentTheme === 'neobrutalism' ? "bg-white/10 text-white" : "text-white/60 hover:text-white/80"
                                        )}
                                    >
                                        <Box size={10} /> Neo
                                    </button>
                                </div>
                            }
                        >
                            <div className="bg-background p-6 min-h-full">
                                <HybridRenderer
                                    htmlContent={htmlContent}
                                    dataContext={dataContext}
                                    onInteraction={handleInteraction}
                                    isInteracting={isStreaming && viewStack.length > 0}
                                />
                            </div>
                        </DraggableWindow>
                    )}
                </AnimatePresence>

                {/* Debug Window */}
                <AnimatePresence>
                    {showDebug && hasContent && (
                        <DraggableWindow
                            title="Debug"
                            onClose={() => setShowDebug(false)}
                            initialWidth={600}
                            initialHeight={500}
                        >
                            <DebugWindow dataContext={dataContext} rawResponse={rawResponse} />
                        </DraggableWindow>
                    )}
                </AnimatePresence>

                {/* Floating Action Buttons */}
                {hasContent && !isStreaming && (
                    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsEditOpen(!isEditOpen)}
                            className="p-3 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg transition-colors"
                            title="Edit/Refine"
                        >
                            <Edit size={16} className="text-white/70" />
                        </motion.button>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setShowDebug(!showDebug)}
                            className="p-3 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg transition-colors"
                            title="Debug"
                        >
                            <Bug size={16} className="text-white/70" />
                        </motion.button>
                    </div>
                )}

                {/* Edit Modal */}
                <AnimatePresence>
                    {isEditOpen && hasContent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-36 right-6 z-50 bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg p-4 shadow-2xl min-w-[300px] pointer-events-auto"
                        >
                            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={editQuery}
                                    onChange={(e) => setEditQuery(e.target.value)}
                                    placeholder="Refine: e.g., make it more compact"
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/75 placeholder-white/30 focus:outline-none focus:border-white/20"
                                    autoFocus
                                />
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(false)}
                                        className="text-xs text-white/50 hover:text-white/70 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!editQuery.trim() || isStreaming}
                                        className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-md transition-colors disabled:opacity-30"
                                    >
                                        Refine
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Search Area - Fixed */}
                <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <div className="w-full max-w-2xl px-6 pointer-events-auto">

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
                                            "px-4 py-2 text-sm transition-all shadow-lg backdrop-blur-xl",
                                            "text-white hover:text-white",
                                            "border border-white/10 hover:border-white/20",
                                            hasContent 
                                                ? "bg-white/10 hover:bg-white/15 rounded-lg" 
                                                : "bg-white/5 hover:bg-white/10 rounded-full"
                                        )}
                                        style={{ 
                                            backdropFilter: 'blur(12px)',
                                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4)'
                                        }}
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
        </div>
    );
}
