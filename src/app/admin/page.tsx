'use client';

import React, { useState } from 'react';
import { mockFeedbacks, mockCrashes, mockDailyMetrics, mockOsBreakdown, mockLoaderBreakdown } from '../../data/mockData';
import { FeedbackItem, CrashReportItem, FeedbackType, FeedbackStatus } from '../../types';
import { MetricsOverview } from '../../components/MetricsOverview';
import { FeedbackCard } from '../../components/FeedbackCard';
import { CrashCard } from '../../components/CrashCard';
import { FeedbackModal } from '../../components/FeedbackModal';
import { Search, Plus, ExternalLink, Lock, Key, LogOut } from 'lucide-react';

export default function AdminSecretDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true on dev
  const [tokenInput, setTokenInput] = useState('');
  const [activeTab, setActiveTab] = useState<'feedback' | 'metrics' | 'crashes'>('feedback');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(mockFeedbacks);
  const [crashes] = useState<CrashReportItem[]>(mockCrashes);
  const [typeFilter, setTypeFilter] = useState<'all' | FeedbackType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewFeedback = (item: FeedbackItem) => {
    setFeedbacks([item, ...feedbacks]);
  };

  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    setFeedbacks(feedbacks.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));
  };

  const filtered = feedbacks.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  const reviewsWithRating = feedbacks.filter((f) => f.rating);
  const avgRating = (
    reviewsWithRating.reduce((acc, f) => acc + (f.rating || 0), 0) / (reviewsWithRating.length || 1)
  ).toFixed(1);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="panel max-w-sm w-full p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Onyx Control Plane Auth
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Введите секретный ключ администратора для доступа к дашборду и сырым логам.
          </p>
          <input
            type="password"
            placeholder="ADMIN_SECRET..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full px-3 py-1.5 rounded bg-[#090b0e] border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => setIsAuthenticated(true)}
            className="w-full py-1.5 rounded bg-zinc-200 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors"
          >
            Войти в консоль
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Top Header */}
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-zinc-100 uppercase">
                Onyx Admin Console
              </span>
            </div>
            <span className="text-zinc-700">/</span>
            <span className="text-[11px] text-zinc-400 font-mono">Telemetry & Secret Feed</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/reviews"
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-800/60 font-mono transition-colors"
            >
              Перейти в /reviews →
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181c24] hover:bg-[#202632] border border-zinc-700/60 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Тест отзыва</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-4">
        {/* Sub-header / Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] pb-3">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'feedback'
                  ? 'bg-[#181c24] text-zinc-100 border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Отзывы игроков ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'metrics'
                  ? 'bg-[#181c24] text-zinc-100 border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Телеметрия & ОС
            </button>
            <button
              onClick={() => setActiveTab('crashes')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'crashes'
                  ? 'bg-[#181c24] text-zinc-100 border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Краш-логи ({crashes.length})
            </button>
          </div>

          {activeTab === 'feedback' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск по отзывам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-2.5 py-1 rounded bg-[#13161c] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 w-40"
                />
              </div>

              {/* Status filter */}
              <div className="flex rounded p-0.5 bg-[#13161c] border border-zinc-800 text-[11px] font-mono">
                {(['all', 'new', 'in_progress', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      statusFilter === s ? 'bg-[#1e232d] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {s === 'all' ? 'Все' : s === 'new' ? 'New' : s === 'in_progress' ? 'Active' : 'Fixed'}
                  </button>
                ))}
              </div>

              {/* Type filter */}
              <div className="flex rounded p-0.5 bg-[#13161c] border border-zinc-800 text-[11px]">
                {(['all', 'review', 'bug', 'feature'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      typeFilter === t ? 'bg-[#1e232d] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t === 'all' ? 'Все' : t === 'review' ? 'Ревью' : t === 'bug' ? 'Баги' : 'Идеи'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Feedbacks */}
        {activeTab === 'feedback' && (
          <div className="space-y-3">
            <div className="panel rounded-lg p-3 flex flex-wrap items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-4">
                <span>
                  Рейтинг: <strong className="text-amber-400 font-mono">{avgRating} / 5.0</strong> ({reviewsWithRating.length} оценок)
                </span>
                <span className="text-zinc-700">•</span>
                <span>
                  В работе: <strong className="text-blue-400 font-mono">{feedbacks.filter((f) => f.status === 'in_progress').length}</strong>
                </span>
                <span className="text-zinc-700">•</span>
                <span>
                  Решено: <strong className="text-emerald-400 font-mono">{feedbacks.filter((f) => f.status === 'resolved').length}</strong>
                </span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500">Режим: Full Access</span>
            </div>

            <div className="space-y-2.5">
              {filtered.map((item) => (
                <FeedbackCard key={item.id} item={item} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Metrics */}
        {activeTab === 'metrics' && (
          <MetricsOverview
            metrics={mockDailyMetrics}
            osBreakdown={mockOsBreakdown}
            loaderBreakdown={mockLoaderBreakdown}
          />
        )}

        {/* Tab 3: Crashes */}
        {activeTab === 'crashes' && (
          <div className="space-y-2.5">
            <div className="panel rounded-lg p-3 flex items-center justify-between text-xs text-zinc-400">
              <span>
                Авто-детекция бисектом: <strong className="text-emerald-400 font-mono">100% покрытие</strong>
              </span>
              <span className="text-zinc-500 font-mono text-[11px]">Всего отчётов: {crashes.length}</span>
            </div>

            {crashes.map((crash) => (
              <CrashCard key={crash.id} item={crash} />
            ))}
          </div>
        )}
      </main>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewFeedback}
      />
    </div>
  );
}
