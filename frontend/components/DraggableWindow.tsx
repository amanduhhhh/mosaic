'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableWindowProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  initialWidth?: number;
  initialHeight?: number;
  headerActions?: ReactNode;
}

export function DraggableWindow({
  title,
  children,
  onClose,
  onBack,
  canGoBack = false,
  initialWidth = 800,
  initialHeight = 600,
  headerActions,
}: DraggableWindowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed z-40 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col pointer-events-auto"
      style={{
        left: `calc(50% - ${initialWidth / 2}px + ${position.x}px)`,
        top: `calc(50% - ${initialHeight / 2}px + ${position.y}px)`,
        width: `${initialWidth}px`,
        height: `${initialHeight}px`,
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 shrink-0",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={onBack}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Back"
            >
              <ChevronLeft size={14} className="text-white/70" />
            </button>
          )}
          
          {title && (
            <span 
              className="text-sm font-medium text-white" 
              style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4)' }}
            >
              {title}
            </span>
          )}
          
          {headerActions && <div className="ml-4">{headerActions}</div>}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all group"
        >
          <X size={14} className="text-white/60 group-hover:text-red-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden rounded-b-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/30">
        {children}
      </div>
    </motion.div>
  );
}

