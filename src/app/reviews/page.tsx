'use client';

import React, { useState, useEffect } from 'react';
import { FeedbackItem, FeedbackType } from '../../types';
import { FeedbackModal } from '../../components/FeedbackModal';
import { Lang, t as tr } from '../../lib/translations';
import { Star, MessageSquarePlus, ThumbsUp, Search, ExternalLink, ShieldCheck, Inbox, Loader2, Globe } from 'lucide-react';

export default function PublicReviewsPage() {
  const [lang, setLang] = useState<Lang>('ru');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | FeedbackType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const dict = tr[lang];

  useEffect(() => {
    const saved = localStorage.getItem('onyx_lang') as Lang;
    if (saved && (saved === 'ru' || saved === 'en')) {
      setLang(saved);
    }
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('onyx_lang', l);
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/feedback', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: FeedbackItem[] = json.data.map((row: any) => ({
          id: row.id,
          type: row.type || 'review',
          rating: row.rating ? Number(row.rating) : undefined,
          title: row.title,
          comment: row.comment,
          contact: row.contact,
          status: row.status || 'new',
          launcherVersion: row.launcher_version || 'Web',
          os: row.os || 'Web',
          arch: row.arch || '',
          anonymousId: row.anonymous_id || 'anon',
          upvotes: row.upvotes || 0,
          tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
          logsSnippet: row.logs_snippet,
          adminNotes: row.admin_notes,
          createdAt: row.created_at,
        }));
        setFeedbacks(mapped);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleNewFeedback = async (item: FeedbackItem) => {
    try {
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
      fetchFeedbacks();
    } catch (e) {
      console.error('Error submitting feedback:', e);
    }
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
  const avgRating = reviewsWithRating.length > 0
    ? (reviewsWithRating.reduce((acc, f) => acc + (f.rating || 0), 0) / reviewsWithRating.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen pb-20">
      {/* Public Navbar */}
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">Onyx Launcher</span>
            <span className="text-zinc-700">/</span>
            <span className="text-xs text-zinc-400 font-medium">Community</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Lang switcher */}
            <div className="flex rounded p-0.5 bg-[#13161c] border border-zinc-800 text-xs font-mono mr-1">
              <button
                onClick={() => changeLang('ru')}
                className={`px-2 py-0.5 rounded transition-colors ${lang === 'ru' ? 'bg-[#1e232d] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                RU
              </button>
              <button
                onClick={() => changeLang('en')}
                className={`px-2 py-0.5 rounded transition-colors ${lang === 'en' ? 'bg-[#1e232d] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{dict.leaveFeedbackBtn}</span>
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
                  {dict.brandSubtitle}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <ShieldCheck className="w-3 h-3" /> {dict.verifiedBadge}
                </span>
              </div>
              <h1 className="text-xl font-bold text-zinc-100 mt-1">
                {dict.heroTitle}
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                {dict.heroDesc}
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
                        i < Math.round(Number(avgRating)) && Number(avgRating) > 0 ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {dict.reviewsCount.replace('{count}', String(reviewsWithRating.length))}
                </span>
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
                  ? `${dict.all} (${feedbacks.length})`
                  : t === 'review'
                  ? dict.reviews
                  : t === 'feature'
                  ? dict.features
                  : dict.bugs}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={dict.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded bg-[#13161c] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 w-52"
            />
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="panel rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500 space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            <span className="text-xs">{dict.loading}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-300">{dict.noReviewsTitle}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{dict.noReviewsDesc}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-[#181c24] hover:bg-[#202632] border border-zinc-700/60 text-zinc-200 text-xs font-medium transition-colors"
            >
              {dict.writeFirstBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const hasUpvoted = !!upvotedIds[item.id];
              return (
                <div key={item.id} className="panel rounded-lg p-4 transition-colors hover:border-zinc-700/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
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
                            {item.type === 'review' ? dict.reviews : item.type === 'bug' ? dict.bugs : dict.features}
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

                    {item.type !== 'review' && (
                      <div>
                        {item.type === 'feature' ? (
                          item.status === 'resolved' ? (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                              Добавлено
                            </span>
                          ) : item.status === 'in_progress' ? (
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded">
                              В разработке
                            </span>
                          ) : item.status === 'archived' ? (
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                              Отклонено
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded">
                              На рассмотрении
                            </span>
                          )
                        ) : (
                          item.status === 'resolved' ? (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                              Пофикшено
                            </span>
                          ) : item.status === 'in_progress' ? (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                              В работе
                            </span>
                          ) : item.status === 'archived' ? (
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                              Отклонено
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded">
                              Новый
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {item.adminNotes && (
                    <div className="mt-3 pl-12">
                      <div className="rounded bg-purple-950/20 border border-purple-800/40 p-3">
                        <span className="text-[10px] font-semibold font-mono text-purple-400 uppercase tracking-wider block mb-1">
                          Ответ разработчика (Onyx):
                        </span>
                        <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
                          {item.adminNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] pl-12 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <div className="flex items-center gap-3">
                      {item.launcherVersion && (
                        <span className="text-zinc-400">
                          {item.launcherVersion.toLowerCase() === 'web' || !item.launcherVersion.match(/^\d/)
                            ? item.launcherVersion
                            : `v${item.launcherVersion}`}
                        </span>
                      )}
                      {item.os && <span>{item.os}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.tags?.map((tag) => (
                        <span key={tag} className="text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
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
        )}
      </main>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewFeedback}
        lang={lang}
      />
    </div>
  );
}
