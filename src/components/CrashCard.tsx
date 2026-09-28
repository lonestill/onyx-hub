'use client';

import React, { useState } from 'react';
import { CrashReportItem } from '../types';
import { AlertCircle, Copy, Check, ChevronDown, ChevronUp, Flame, RefreshCw, Layers } from 'lucide-react';

export const CrashCard: React.FC<{ item: CrashReportItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyTrace = () => {
    navigator.clipboard.writeText(item.stackTrace);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="panel-hover rounded-lg p-4 relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500">{item.id}</span>
              <span className="text-zinc-700">•</span>
              <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800/80 px-1.5 py-0.2 rounded border border-zinc-700/50">
                MC {item.minecraftVersion}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                {item.loader}
              </span>
              {item.occurrences > 1 && (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.2 rounded">
                  ×{item.occurrences} раз(а)
                </span>
              )}
            </div>
            <h3 className="text-xs font-mono font-semibold text-zinc-200 mt-1">
              {item.errorTitle}
            </h3>
          </div>
        </div>

        {item.suspectedCulprit && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2 py-1 rounded shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Виновник: <strong>{item.suspectedCulprit}</strong></span>
          </div>
        )}
      </div>

      <div className="mt-3 pl-7">
        <div className="flex items-center justify-between text-[11px]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expanded ? 'Свернуть Java Stack Trace' : 'Развернуть Java Stack Trace'}</span>
          </button>
          <span className="text-zinc-500 font-mono">Модов в сборке: {item.modCount}</span>
        </div>

        {expanded && (
          <div className="mt-2 rounded bg-[#07090d] border border-zinc-800/90 p-3 relative">
            <button
              onClick={copyTrace}
              className="absolute top-2.5 right-2.5 text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>
            <pre className="text-[11px] font-mono text-rose-300/80 overflow-x-auto max-h-56 pr-14 leading-relaxed">
              {item.stackTrace}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] pl-7 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>{item.os} • Onyx v{item.launcherVersion}</span>
        <span>{new Date(item.timestamp).toLocaleString('ru-RU')}</span>
      </div>
    </div>
  );
};
