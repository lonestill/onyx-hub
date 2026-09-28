'use client';

import React, { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '../types';
import { Star, Bug, Lightbulb, Copy, Check, ChevronDown, ChevronUp, MessageSquare, ThumbsUp, Tag, ShieldAlert } from 'lucide-react';

interface FeedbackCardProps {
  item: FeedbackItem;
  onStatusChange?: (id: string, status: FeedbackStatus) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ item, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [showStatusSelect, setShowStatusSelect] = useState(false);

  const handleStatusSelect = (newStatus: FeedbackStatus) => {
    setStatus(newStatus);
    setShowStatusSelect(false);
    onStatusChange?.(item.id, newStatus);
  };

  const getStatusBadge = (s: FeedbackStatus) => {
    switch (s) {
      case 'resolved':
        return <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-900/40">● Resolved</span>;
      case 'in_progress':
        return <span className="text-[11px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-900/40">● In Progress</span>;
      case 'investigating':
        return <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-900/40">● Investigating</span>;
      case 'archived':
        return <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-800">● Archived</span>;
      default:
        return <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-700">● New</span>;
    }
  };

  const copyLog = () => {
    if (item.logsSnippet) {
      navigator.clipboard.writeText(item.logsSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="panel-hover rounded-lg p-4 relative group">
      {/* Top row: Type indicator, Title, Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-zinc-400">
            {item.type === 'review' && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
            {item.type === 'bug' && <Bug className="w-4 h-4 text-red-400" />}
            {item.type === 'feature' && <Lightbulb className="w-4 h-4 text-blue-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wide text-zinc-500">
                {item.id}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-zinc-400">
                {item.type === 'review' ? 'Ревью игрока' : item.type === 'bug' ? 'Баг-репорт' : 'Предложение фичи'}
              </span>
              {item.rating && (
                <div className="flex items-center gap-0.5 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < item.rating! ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-mono text-amber-400 ml-1">({item.rating}.0)</span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mt-1">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <div onClick={() => setShowStatusSelect(!showStatusSelect)}>
            {getStatusBadge(status)}
          </div>
          {showStatusSelect && (
            <div className="absolute right-0 top-full mt-1 w-32 rounded bg-[#13161c] border border-zinc-700/80 shadow-xl py-1 z-20 text-[11px] font-mono">
              {(['new', 'investigating', 'in_progress', 'resolved', 'archived'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusSelect(s)}
                  className="w-full text-left px-2.5 py-1 text-zinc-300 hover:bg-[#1f2633] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main feedback text */}
      <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed pl-7 whitespace-pre-line">
        {item.comment}
      </p>

      {/* Attached crash logs */}
      {item.logsSnippet && (
        <div className="mt-3 pl-7">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Лог окружения IPC ({item.logsSnippet.split('\n').length} строк)</span>
          </button>

          {expanded && (
            <div className="mt-2 rounded bg-[#090b0e] border border-zinc-800/90 p-3 relative">
              <button
                onClick={copyLog}
                className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <pre className="text-[11px] text-zinc-400 overflow-x-auto max-h-36 pr-14 font-mono leading-relaxed">
                {item.logsSnippet}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Admin Notes block if present */}
      {item.adminNotes && (
        <div className="mt-3 pl-7">
          <div className="rounded bg-[#161a22] border-l-2 border-purple-500/80 px-3 py-1.5 text-[11px] text-zinc-400 flex items-center gap-2">
            <span className="font-semibold text-purple-400 uppercase tracking-wider text-[9px]">Заметка:</span>
            <span>{item.adminNotes}</span>
          </div>
        </div>
      )}

      {/* Meta Footer */}
      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] pl-7 flex flex-wrap items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="font-mono text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/40">
            v{item.launcherVersion}
          </span>
          <span className="text-zinc-400">{item.os} ({item.arch})</span>
          {item.contact && (
            <span className="text-zinc-300 font-mono bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/30">
              {item.contact}
            </span>
          )}
          {item.upvotes && (
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <ThumbsUp className="w-3 h-3 text-zinc-500" />
              <span>{item.upvotes}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.tags?.map((t) => (
            <span key={t} className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono">
              #{t}
            </span>
          ))}
          <span className="font-mono text-zinc-600">
            {new Date(item.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
