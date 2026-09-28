'use client';

import React, { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '../types';
import { Star, Bug, Lightbulb, Copy, Check, ChevronDown, ChevronUp, MessageSquare, ThumbsUp, Send, Loader2 } from 'lucide-react';

interface FeedbackCardProps {
  item: FeedbackItem;
  onStatusChange?: (id: string, status: FeedbackStatus) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ item, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<FeedbackStatus>(item.status || 'new');
  const [showStatusSelect, setShowStatusSelect] = useState(false);

  // Admin reply state
  const [adminReply, setAdminReply] = useState<string>(item.adminNotes || '');
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [replyInput, setReplyInput] = useState(item.adminNotes || '');
  const [savingReply, setSavingReply] = useState(false);

  const isReview = item.type === 'review';
  const isFeature = item.type === 'feature';
  const isBug = item.type === 'bug';

  const handleStatusSelect = async (newStatus: FeedbackStatus) => {
    setStatus(newStatus);
    setShowStatusSelect(false);
    onStatusChange?.(item.id, newStatus);

    await fetch('/api/v1/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, status: newStatus }),
    }).catch((e) => console.error('Failed to update status', e));
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReply(true);
    try {
      await fetch('/api/v1/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, admin_notes: replyInput.trim() }),
      });
      setAdminReply(replyInput.trim());
      setIsEditingReply(false);
    } catch (e) {
      console.error('Failed to save reply', e);
    } finally {
      setSavingReply(false);
    }
  };

  const getStatusBadge = (s: FeedbackStatus) => {
    if (isFeature) {
      switch (s) {
        case 'resolved':
          return <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-900/40">Добавлено</span>;
        case 'in_progress':
          return <span className="text-[11px] font-mono text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-purple-900/40">В разработке</span>;
        case 'archived':
          return <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-800">Отклонено</span>;
        default:
          return <span className="text-[11px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-900/40">На рассмотрении</span>;
      }
    }

    if (isBug) {
      switch (s) {
        case 'resolved':
          return <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-900/40">Пофикшено</span>;
        case 'in_progress':
          return <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-900/40">В работе</span>;
        case 'archived':
          return <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-800">Отклонено</span>;
        default:
          return <span className="text-[11px] font-mono text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded cursor-pointer hover:bg-red-900/40">Новый</span>;
      }
    }

    return null;
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
            {isReview && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
            {isBug && <Bug className="w-4 h-4 text-red-400" />}
            {isFeature && <Lightbulb className="w-4 h-4 text-purple-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wide text-zinc-500">
                {item.id}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-zinc-400">
                {isReview ? 'Отзыв игрока' : isBug ? 'Баг-репорт' : 'Предложение идеи'}
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

        {/* Status Dropdown (ONLY for Feature and Bug!) */}
        {!isReview && (
          <div className="relative">
            <div onClick={() => setShowStatusSelect(!showStatusSelect)}>
              {getStatusBadge(status)}
            </div>
            {showStatusSelect && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded bg-[#13161c] border border-zinc-700/80 shadow-xl py-1 z-20 text-[11px] font-mono">
                {isFeature && (
                  <>
                    <button onClick={() => handleStatusSelect('new')} className="w-full text-left px-2.5 py-1 text-zinc-300 hover:bg-[#1f2633]">
                      На рассмотрении
                    </button>
                    <button onClick={() => handleStatusSelect('in_progress')} className="w-full text-left px-2.5 py-1 text-purple-300 hover:bg-[#1f2633]">
                      В разработке
                    </button>
                    <button onClick={() => handleStatusSelect('resolved')} className="w-full text-left px-2.5 py-1 text-emerald-300 hover:bg-[#1f2633]">
                      Добавлено
                    </button>
                    <button onClick={() => handleStatusSelect('archived')} className="w-full text-left px-2.5 py-1 text-zinc-400 hover:bg-[#1f2633]">
                      Отклонено
                    </button>
                  </>
                )}
                {isBug && (
                  <>
                    <button onClick={() => handleStatusSelect('new')} className="w-full text-left px-2.5 py-1 text-red-300 hover:bg-[#1f2633]">
                      Новый
                    </button>
                    <button onClick={() => handleStatusSelect('in_progress')} className="w-full text-left px-2.5 py-1 text-amber-300 hover:bg-[#1f2633]">
                      В работе
                    </button>
                    <button onClick={() => handleStatusSelect('resolved')} className="w-full text-left px-2.5 py-1 text-emerald-300 hover:bg-[#1f2633]">
                      Пофикшено
                    </button>
                    <button onClick={() => handleStatusSelect('archived')} className="w-full text-left px-2.5 py-1 text-zinc-400 hover:bg-[#1f2633]">
                      Отклонено
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main feedback text */}
      <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed pl-7 whitespace-pre-line">
        {item.comment}
      </p>

      {/* Attached logs */}
      {item.logsSnippet && (
        <div className="mt-3 pl-7">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Лог ({item.logsSnippet.split('\n').length} строк)</span>
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

      {/* Developer Reply Block */}
      <div className="mt-3 pl-7">
        {adminReply && !isEditingReply ? (
          <div className="rounded bg-purple-950/20 border border-purple-800/40 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-purple-400 uppercase tracking-wider text-[10px]">
                Твой ответ (виден игрокам):
              </span>
              <button
                onClick={() => {
                  setReplyInput(adminReply);
                  setIsEditingReply(true);
                }}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono"
              >
                [Изменить]
              </button>
            </div>
            <p className="text-xs text-zinc-200 mt-1 whitespace-pre-line leading-relaxed">
              {adminReply}
            </p>
          </div>
        ) : isEditingReply ? (
          <form onSubmit={handleSaveReply} className="space-y-2">
            <textarea
              rows={2}
              autoFocus
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Напиши официальный ответ игроку (будет показан в лаунчере и на сайте)..."
              className="w-full text-xs p-2.5 rounded bg-[#13161c] border border-purple-500/40 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-400 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingReply(false)}
                className="px-2.5 py-1 rounded text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={savingReply}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition-colors cursor-pointer"
              >
                {savingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                <span>Сохранить ответ</span>
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsEditingReply(true)}
            className="text-[11px] text-zinc-500 hover:text-purple-400 flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
          >
            <MessageSquare className="w-3 h-3" />
            <span>+ Ответить игроку</span>
          </button>
        )}
      </div>

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
