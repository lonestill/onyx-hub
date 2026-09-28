'use client';

import { useState, useEffect } from 'react';

interface PartyRoomData {
  code: string;
  hostDisplayName: string;
  status: string;
  expiresAt: string;
  isExpired: boolean;
  peersCount: number;
  instanceName?: string;
  minecraftVersion?: string;
  loader?: string;
  modCount?: number;
}

export default function PartyViewClient({ room }: { room: PartyRoomData }) {
  const [copied, setCopied] = useState(false);
  const [redirected, setRedirected] = useState(false);

  const scopeDeepLink = `scope://party/${room.code}`;
  const onyxDeepLink = `onyx://party/${room.code}`;

  useEffect(() => {
    if (!room.isExpired && room.status !== 'closed' && !redirected) {
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
    <main className="min-h-screen bg-[#090d16] text-[#f3f4f6] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#84cc16]/30">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-white/5">
        <a href="/" className="flex items-center gap-2 font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#84cc16] to-[#10b981] flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_20px_rgba(132,204,22,0.3)]">
            S
          </div>
          <span className="text-lg">Scope Hub</span>
        </a>
        <a
          href="https://github.com/lonestill/scope-launcher"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#9ca3af] hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
        >
          GitHub Repository
        </a>
      </header>

      <div className="max-w-xl mx-auto w-full py-12 flex-1 flex flex-col justify-center">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#84cc16]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20">
              <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse" />
              Scope Party Room
            </span>
            <span className="text-xs text-[#9ca3af]">
              {room.isExpired ? 'Expired' : room.status === 'hosting' ? 'In Game' : 'Waiting for Players'}
            </span>
          </div>

          <div className="text-center my-6">
            <p className="text-xs uppercase tracking-widest text-[#9ca3af] mb-2 font-semibold">Join Code</p>
            <button
              onClick={copyCode}
              title="Click to copy code"
              className="inline-block px-8 py-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#84cc16]/50 rounded-2xl text-4xl sm:text-5xl font-mono font-black tracking-wider text-white shadow-inner transition-all group"
            >
              <span className="group-hover:text-[#84cc16] transition-colors">{room.code}</span>
            </button>
            <p className="text-xs text-[#64748b] mt-2">
              {copied ? 'Copied code to clipboard!' : 'Click code to copy'}
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3 mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9ca3af]">Host</span>
              <span className="font-semibold text-white">{room.hostDisplayName}</span>
            </div>
            {room.instanceName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af]">Instance</span>
                <span className="font-semibold text-white">{room.instanceName}</span>
              </div>
            )}
            {room.minecraftVersion && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af]">Minecraft</span>
                <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded text-white">
                  {room.loader || 'Vanilla'} {room.minecraftVersion}
                </span>
              </div>
            )}
            {typeof room.modCount === 'number' && room.modCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af]">Mods</span>
                <span className="font-semibold text-white">{room.modCount} active mods</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9ca3af]">Lobby Players</span>
              <span className="font-semibold text-[#84cc16]">{room.peersCount} connected</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={scopeDeepLink}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#84cc16] to-[#10b981] hover:opacity-95 text-black font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(132,204,22,0.3)] transition-all"
            >
              <span>Залететь в Scope Launcher</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={copyLink}
                className="text-xs text-[#9ca3af] hover:text-white transition-colors underline"
              >
                Скопировать ссылку для друга
              </button>
              <span className="text-[#64748b]">•</span>
              <a
                href={onyxDeepLink}
                className="text-xs text-[#64748b] hover:text-[#9ca3af] transition-colors"
                title="Legacy deep-link fallback"
              >
                Открыть через onyx://
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-[#64748b]">
            Не установлен лаунчер?{' '}
            <a
              href="https://github.com/lonestill/scope-launcher/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="text-[#84cc16] hover:underline font-medium"
            >
              Скачать Scope Launcher (Windows, Linux, macOS)
            </a>
          </div>
        </div>
      </div>

      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-white/5 text-xs text-[#64748b]">
        Scope Launcher • Zero-Config P2P Multiplayer System • No Port Forwarding Required
      </footer>
    </main>
  );
}
