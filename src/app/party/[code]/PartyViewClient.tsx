'use client';

import { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Play,
  Download,
  Users,
  Clock,
  Radio,
} from 'lucide-react';

interface PartyRoomData {
  code: string;
  hostDisplayName: string;
  status: string;
  expiresAt: string;
  isExpired: boolean;
  isNotFound?: boolean;
  peersCount: number;
  instanceName?: string;
  minecraftVersion?: string;
  loader?: string;
  modCount?: number;
}

export default function PartyViewClient({ room }: { room: PartyRoomData }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [redirected, setRedirected] = useState(false);

  const scopeDeepLink = `scope://party/${room.code}`;
  const onyxDeepLink = `onyx://party/${room.code}`;

  useEffect(() => {
    if (!room.isNotFound && !room.isExpired && room.status !== 'closed' && !redirected) {
      setRedirected(true);
      const timer = setTimeout(() => {
        try {
          window.location.href = scopeDeepLink;
        } catch {
          // Ignore redirect block
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [room, scopeDeepLink, redirected]);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-200 pb-20 font-sans selection:bg-zinc-800">
      {/* Public Navbar matching reviews/page.tsx */}
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm font-semibold tracking-wider text-zinc-100 uppercase hover:text-white transition-colors"
            >
              Scope Launcher
            </a>
            <span className="text-zinc-700">/</span>
            <span className="text-xs text-zinc-400 font-medium">Party</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/reviews"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Отзывы
            </a>
            <a
              href="https://github.com/lonestill/scope-launcher"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-zinc-300 p-1 flex items-center gap-1.5 text-xs font-mono"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-xl mx-auto px-4 pt-10 space-y-4">
        <div className="panel rounded-xl p-6 relative space-y-5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                Scope Party
              </span>
              {room.isNotFound ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  <Clock className="w-3 h-3" /> Ожидание комнаты
                </span>
              ) : room.isExpired ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  Завершена
                </span>
              ) : room.status === 'hosting' ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <Radio className="w-3 h-3 animate-pulse" /> В игре
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-mono bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                  <Users className="w-3 h-3" /> Ожидание игроков
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-zinc-500">
              {room.peersCount} {room.peersCount === 1 ? 'игрок' : 'игрока'}
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              Комната {room.code}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Прямое подключение к совместной игре без настройки портов и Hamachi.
            </p>
          </div>

          {/* Not Found Banner */}
          {room.isNotFound && (
            <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 text-xs text-amber-200/90 leading-relaxed">
              Комната ещё не создана хостом или игра была завершена. Скопируйте код{' '}
              <strong className="font-mono text-amber-300 font-semibold">{room.code}</strong> и вставьте его
              в лаунчере, когда хост откроет мир.
            </div>
          )}

          {/* Code Container */}
          <div className="bg-[#090b0e] p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                Код комнаты
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-zinc-100">
                {room.code}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#181c24] hover:bg-[#202632] border border-zinc-700/80 text-xs font-mono text-zinc-200 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-mono block">Хост</span>
              <span className="font-medium text-zinc-200 truncate block mt-0.5">
                {room.hostDisplayName}
              </span>
            </div>

            <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-mono block">Сборка</span>
              <span className="font-medium text-zinc-200 truncate block mt-0.5">
                {room.instanceName || 'Minecraft'}
              </span>
            </div>

            {room.minecraftVersion && (
              <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-mono block">Версия</span>
                <span className="font-mono text-zinc-300 block mt-0.5">
                  {room.loader || 'Vanilla'} {room.minecraftVersion}
                </span>
              </div>
            )}

            {typeof room.modCount === 'number' && room.modCount > 0 && (
              <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-mono block">Моды</span>
                <span className="font-mono text-zinc-300 block mt-0.5">
                  {room.modCount} шт.
                </span>
              </div>
            )}
          </div>

          {/* Primary CTA and Actions */}
          <div className="space-y-2.5 pt-2">
            <a
              href={scopeDeepLink}
              className="w-full py-2.5 px-4 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Залететь в Scope Launcher</span>
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={copyLink}
                className="py-1.5 px-3 rounded bg-[#13161c] hover:bg-[#181c24] border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-500" />
                    <span>Скопировать ссылку</span>
                  </>
                )}
              </button>

              <a
                href="https://github.com/lonestill/scope-launcher/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 rounded bg-[#13161c] hover:bg-[#181c24] border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3 h-3 text-zinc-500" />
                <span>Скачать Scope</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] font-mono text-zinc-600">
          Scope Launcher • Zero-Config P2P Multiplayer System
        </p>
      </main>
    </div>
  );
}
