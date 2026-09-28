'use client';

import React, { useState, useEffect } from 'react';
import { FeedbackItem, FeedbackType, FeedbackStatus, UserItem, GameSessionItem } from '../../types';
import { MetricsOverview } from '../../components/MetricsOverview';
import { FeedbackCard } from '../../components/FeedbackCard';
import { FeedbackModal } from '../../components/FeedbackModal';
import { Search, Plus, LogOut, Loader2, Inbox } from 'lucide-react';

export default function AdminSecretDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<'feedback' | 'metrics'>('feedback');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [telemetryData, setTelemetryData] = useState<{
    summary: {
      total_users: number;
      total_launches: number;
      total_game_launches: number;
      total_playtime_minutes: number;
    };
    users: UserItem[];
    sessions: GameSessionItem[];
  }>({
    summary: { total_users: 0, total_launches: 0, total_game_launches: 0, total_playtime_minutes: 0 },
    users: [],
    sessions: [],
  });
  const [loading, setLoading] = useState(false);

  const [typeFilter, setTypeFilter] = useState<'all' | FeedbackType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkServerSession();
  }, []);

  const checkServerSession = async () => {
    try {
      const res = await fetch('/api/v1/auth');
      if (res.ok) {
        setIsAuthenticated(true);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: tokenInput.trim() }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setAuthError(true);
      }
    } catch (e) {
      setAuthError(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fbRes, telRes] = await Promise.all([
        fetch('/api/v1/feedback', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/v1/telemetry', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      ]);

      if (fbRes.success && Array.isArray(fbRes.data)) {
        setFeedbacks(fbRes.data.map((row: any) => ({
          id: row.id,
          type: row.type || 'review',
          rating: row.rating ? Number(row.rating) : undefined,
          title: row.title,
          comment: row.comment,
          contact: row.contact,
          status: row.status || 'new',
          launcherVersion: row.launcher_version || 'unknown',
          os: row.os || 'unknown',
          arch: row.arch || 'unknown',
          anonymousId: row.anonymous_id || 'anon',
          upvotes: row.upvotes || 0,
          tags: row.tags ? JSON.parse(row.tags) : [],
          logsSnippet: row.logs_snippet,
          adminNotes: row.admin_notes,
          createdAt: row.created_at,
        })));
      }

      if (telRes.success) {
        setTelemetryData({
          summary: telRes.summary || { total_users: 0, total_launches: 0, total_game_launches: 0, total_playtime_minutes: 0 },
          users: Array.isArray(telRes.users) ? telRes.users : [],
          sessions: Array.isArray(telRes.sessions) ? telRes.sessions : [],
        });
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
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
  const avgRating = reviewsWithRating.length > 0
    ? (reviewsWithRating.reduce((acc, f) => acc + (f.rating || 0), 0) / reviewsWithRating.length).toFixed(1)
    : '0.0';

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0c0e12]">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0c0e12]">
        <form onSubmit={handleLogin} className="max-w-xs w-full space-y-2">
          <input
            type="password"
            autoFocus
            placeholder="Password"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setAuthError(false);
            }}
            className="w-full px-3 py-2 rounded bg-[#13161c] border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 font-mono text-center tracking-widest"
          />
          {authError && (
            <p className="text-[11px] text-red-400 font-mono text-center">Invalid password</p>
          )}
        </form>
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
                Onyx Control Plane
              </span>
            </div>
            <span className="text-zinc-700">/</span>
            <span className="text-[11px] text-zinc-400 font-mono">Live Telemetry & Feed</span>
          </div>

          <div className="flex items-center gap-3">
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
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              title="Выйти"
            >
              <LogOut className="w-3.5 h-3.5" />
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
              Отзывы, баги и идеи ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'metrics'
                  ? 'bg-[#181c24] text-zinc-100 border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Телеметрия ({telemetryData.summary.total_users || 0} игроков)
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

              <div className="flex rounded p-0.5 bg-[#13161c] border border-zinc-800 text-[11px] font-mono">
                {(['all', 'new', 'in_progress', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      statusFilter === s ? 'bg-[#1e232d] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {s === 'all' ? 'Все статусы' : s === 'new' ? 'New' : s === 'in_progress' ? 'Active' : 'Fixed'}
                  </button>
                ))}
              </div>

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
              <button onClick={loadAllData} className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer">
                [Обновить]
              </button>
            </div>

            {loading ? (
              <div className="panel rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                <span className="text-xs">Загрузка данных...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="panel rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-300">В базе пока нет записей</h3>
                <p className="text-xs text-zinc-500">Отправьте первый тестовый отзыв через кнопку вверху</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((item) => (
                  <FeedbackCard key={item.id} item={item} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Metrics */}
        {activeTab === 'metrics' && (
          <MetricsOverview
            summary={telemetryData.summary}
            users={telemetryData.users}
            sessions={telemetryData.sessions}
          />
        )}
      </main>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (item) => {
          await fetch('/api/v1/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: item.type,
              rating: item.rating,
              title: item.title,
              comment: item.comment,
              contact: item.contact,
              launcher_version: item.launcherVersion,
              os: item.os,
              arch: item.arch,
              tags: item.tags,
              logs_snippet: item.logsSnippet,
            }),
          });
          loadAllData();
        }}
      />
    </div>
  );
}
