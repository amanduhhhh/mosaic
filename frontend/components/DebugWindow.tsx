'use client';

import { useState } from 'react';
import { Code2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugWindowProps {
  dataContext: Record<string, any>;
  rawResponse: string;
}

export function DebugWindow({ dataContext, rawResponse }: DebugWindowProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'raw'>('data');

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
        <button
          onClick={() => setActiveTab('data')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all",
            activeTab === 'data'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          <Database size={12} />
          <span>Data Context</span>
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all",
            activeTab === 'raw'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          <Code2 size={12} />
          <span>Raw HTML</span>
        </button>
        {rawResponse && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {rawResponse.length} chars
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'data' ? (
          <pre className="text-xs text-foreground font-mono leading-relaxed">
            {JSON.stringify(dataContext, null, 2)}
          </pre>
        ) : (
          <pre className="text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap">
            {rawResponse}
          </pre>
        )}
      </div>
    </div>
  );
}

