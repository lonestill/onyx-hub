'use client';

import React, { useState } from 'react';
import { mockFeedbacks } from '../../data/mockData';
import { FeedbackItem, FeedbackType } from '../../types';
import { FeedbackModal } from '../../components/FeedbackModal';
import { Star, Bug, Lightbulb, MessageSquarePlus, ThumbsUp, Search, ExternalLink, ShieldCheck } from 'lucide-react';

export default function PublicReviewsPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(mockFeedbacks);
  const [typeFilter, setTypeFilter] = useState<'all' | FeedbackType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const handleNewFeedback = (item: FeedbackItem) => {
    setFeedbacks([item, ...feedbacks]);
  };

  const toggleUpvote = (id: string) => {
    setUpvotedIds((prev) => {
      const isUpvoted = !!prev[id];
      setFeedbacks((items) =>
        items.map((it) => (it.id === id ? { ...it, upvotes: (it.upvotes || 0) + (isUpvoted ? -1 : 1) } : it))
      );
      return { ...prev, [id]: !isUpvoted };
    });
  };

  const filtered = feedbacks.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const reviewsWithRating = feedbacks.filter((f) => f.rating);
  const avgRating = (
    reviewsWithRating.reduce((acc, f) => acc + (f.rating || 0), 0) / (reviewsWithRating.length || 1)
  ).toFixed(1);

  return (
    <div className="min-h-screen pb-20">
      {/* Public Navbar */}
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">Onyx Launcher</span>
            <span className="text-zinc-700">/</span>
            <span className="text-xs text-zinc-400 font-medium">Community Feedback & Reviews</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Оставить отзыв / идею</span>
            </button>
            <a
              href="https://github.com/lonestill/onyx-launcher"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-zinc-300 p-1 flex items-center gap-1 text-xs font-mono"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Hero Section */}
        <div className="panel rounded-xl p-6 relative">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                  Публичный фидбек
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <ShieldCheck className="w-3 h-3" /> Open Source & Verified
                </span>
              </div>
              <h1 className="text-xl font-bold text-zinc-100 mt-1">
                Отзывы, предложения и известные проблемы
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Мы открыто собираем обратную связь игроков Onyx Launcher. Голосуйте за полезные идеи, сообщайте о багах или пишите свои впечатления от сборок.
              </p>
            </div>

            <div className="flex items-baseline gap-2 bg-[#090b0e] p-3.5 rounded-lg border border-zinc-800 shrink-0">
              <span className="text-2xl font-bold font-mono text-amber-400">{avgRating}</span>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">на основе {reviewsWithRating.length} оценок</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <div className="flex rounded p-0.5 bg-[#13161c] border border-zinc-800 text-xs">
            {(['all', 'review', 'feature', 'bug'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded transition-colors font-medium ${
                  typeFilter === t ? 'bg-[#1e232d] text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'all'
                  ? `Все (${feedbacks.length})`
                  : t === 'review'
                  ? 'Отзывы'
                  : t === 'feature'
                  ? 'Идеи'
                  : 'Баги'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по темам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded bg-[#13161c] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 w-52"
            />
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const hasUpvoted = !!upvotedIds[item.id];
            return (
              <div key={item.id} className="panel rounded-lg p-4 transition-colors hover:border-zinc-700/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Upvote button for community */}
                    <button
                      onClick={() => toggleUpvote(item.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded border transition-colors shrink-0 ${
                        hasUpvoted
                          ? 'bg-purple-950/40 border-purple-700/60 text-purple-300'
                          : 'bg-[#090b0e] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-purple-300' : ''}`} />
                      <span className="text-[10px] font-mono mt-1 font-semibold">{item.upvotes || 0}</span>
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                          {item.type === 'review' ? 'Отзыв' : item.type === 'bug' ? 'Баг' : 'Идея'}
                        </span>
                        {item.rating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < item.rating! ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-100 mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-300 mt-2 leading-relaxed whitespace-pre-line">
                        {item.comment}
                      </p>
                    </div>
                  </div>

                  <div>
                    {item.status === 'resolved' && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                        Решено
                      </span>
                    )}
                    {item.status === 'in_progress' && (
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded">
                        В разработке
                      </span>
                    )}
                    {item.status === 'investigating' && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                        Анализ
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] pl-12 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">v{item.launcherVersion}</span>
                    <span>{item.os}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.tags?.map((t) => (
                      <span key={t} className="text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 text-[10px]">
                        #{t}
                      </span>
                    ))}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewFeedback}
      />
    </div>
  );
}
