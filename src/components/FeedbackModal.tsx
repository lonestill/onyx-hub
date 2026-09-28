'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { FeedbackType } from '../types';
import { Lang, t as tr } from '../lib/translations';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
  lang?: Lang;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, lang = 'ru' }) => {
  const [type, setType] = useState<FeedbackType>('review');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [contact, setContact] = useState('');

  const dict = tr[lang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    onSubmit({
      id: `fb-${Date.now()}`,
      type,
      rating: type === 'review' ? rating : undefined,
      title,
      comment,
      contact: contact.trim() || undefined,
      status: 'new',
      launcherVersion: '1.6.17',
      os: 'macOS',
      arch: 'arm64',
      anonymousId: 'user-sim',
      createdAt: new Date().toISOString(),
      tags: [type === 'review' ? 'Review' : type === 'bug' ? 'Bug' : 'Feature'],
    });

    onClose();
    setTitle('');
    setComment('');
    setContact('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg panel p-5 border-zinc-700/60 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
          <span className="text-xs font-medium text-zinc-200">{dict.modalHeader}</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Segmented control */}
          <div className="flex rounded-md p-0.5 bg-[#090b0e] border border-zinc-800 text-xs">
            {(['review', 'bug', 'feature'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setType(mode)}
                className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                  type === mode ? 'bg-[#181c24] text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mode === 'review' ? dict.modalTypeReview : mode === 'bug' ? dict.modalTypeBug : dict.modalTypeFeature}
              </button>
            ))}
          </div>

          {type === 'review' && (
            <div className="flex items-center justify-between py-1 px-2 rounded bg-[#090b0e] border border-zinc-800/80">
              <span className="text-xs text-zinc-400">{dict.modalRating}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        s <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">{dict.modalTitleLabel}</label>
            <input
              type="text"
              required
              placeholder={dict.modalTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#090b0e] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">{dict.modalCommentLabel}</label>
            <textarea
              required
              rows={3}
              placeholder={dict.modalCommentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#090b0e] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">{dict.modalContactLabel}</label>
            <input
              type="text"
              placeholder={dict.modalContactPlaceholder}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#090b0e] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200"
            >
              {dict.modalCancel}
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-zinc-200 hover:bg-white text-zinc-950 font-medium text-xs transition-colors cursor-pointer"
            >
              {dict.modalSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
