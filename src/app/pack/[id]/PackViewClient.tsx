'use client';

import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Package,
  Layers,
  Cpu,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface SharedPackData {
  id: string;
  name: string;
  version: string;
  loader: string;
  modCount: number;
  author?: string | null;
  downloads: number;
  createdAt: string;
  isNotFound?: boolean;
  profile: {
    instance?: {
      name: string;
      version: string;
      loader: string;
      description?: string;
      color?: string;
    };
    mods?: Array<{
      name: string;
      enabled: boolean;
      projectId?: string | null;
      versionId?: string | null;
    }>;
  };
}

export default function PackViewClient({ pack }: { pack: SharedPackData }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://scope-hub.vercel.app/pack/${pack.id}`;
  const scopeDeepLink = `scope://pack/${pack.id}`;
  const onyxDeepLink = `onyx://pack/${pack.id}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pack.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    setDownloading(true);
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(pack.profile, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName =
      pack.name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim() || 'modpack';
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${safeName}.scopeprofile`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => setDownloading(false), 1000);
  };

  const mods = pack.profile?.mods || [];
  const recognizedMods = mods.filter((m) => m.versionId).length;

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
            <span className="text-xs text-zinc-400 font-medium">Share</span>
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
                Scope Share
              </span>
              {pack.isNotFound ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  <Clock className="w-3 h-3" /> Сборка не найдена
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <Package className="w-3 h-3" /> Готовая сборка
                </span>
              )}
            </div>

            {pack.createdAt && (
              <span className="text-[11px] font-mono text-zinc-500">
                {new Date(pack.createdAt).toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {pack.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {pack.isNotFound
                ? 'Сборка не найдена в базе данных хаба или была удалена.'
                : 'Готовый профиль Minecraft для быстрой установки в один клик через Scope Launcher.'}
            </p>
          </div>

          {/* Not Found Banner */}
          {pack.isNotFound && (
            <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 text-xs text-amber-200/90 leading-relaxed">
              Сборка с идентификатором <strong className="font-mono text-amber-300 font-semibold">{pack.id}</strong> не найдена. Проверьте правильность ссылки или кода.
            </div>
          )}

          {/* Code Container */}
          <div className="bg-[#090b0e] p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                Код сборки
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-zinc-100">
                {pack.id}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
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
          {!pack.isNotFound && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-mono block">Версия</span>
                <span className="font-mono text-zinc-200 block mt-0.5">{pack.version}</span>
              </div>

              <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-mono block">Ядро</span>
                <span className="font-mono text-zinc-200 block mt-0.5 uppercase">{pack.loader}</span>
              </div>

              <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-mono block">Моды</span>
                <span className="font-mono text-zinc-200 block mt-0.5">{pack.modCount} шт.</span>
              </div>

              <div className="bg-[#090b0e] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-mono block">Загрузок</span>
                <span className="font-mono text-zinc-200 block mt-0.5">{pack.downloads}</span>
              </div>
            </div>
          )}

          {/* Primary CTA and Actions */}
          <div className="space-y-2.5 pt-2">
            <a
              href={scopeDeepLink}
              className="w-full py-2.5 px-4 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Package className="w-3.5 h-3.5 fill-current" />
              <span>Открыть в Scope Launcher</span>
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyLink}
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

              <button
                onClick={handleDownloadFile}
                disabled={downloading || pack.isNotFound}
                className="py-1.5 px-3 rounded bg-[#13161c] hover:bg-[#181c24] border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-3 h-3 text-zinc-500" />
                <span>{downloading ? 'Экспорт...' : 'Скачать файл'}</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <a
                href={onyxDeepLink}
                className="text-[11px] text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
                title="Legacy protocol fallback"
              >
                Открыть через legacy onyx://
              </a>
            </div>
          </div>

          {/* Mods List */}
          {mods.length > 0 && (
            <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Список модов в сборке</span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {recognizedMods} из {mods.length} с автозагрузкой
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg bg-[#090b0e] border border-zinc-800/80 p-2 space-y-1 text-xs font-mono">
                {mods.map((mod, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#181c24] transition-colors"
                  >
                    <span className="truncate pr-2 text-zinc-300">• {mod.name}</span>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {mod.versionId ? 'Modrinth' : 'Локальный'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual instructions card */}
        <div className="panel rounded-xl p-4 text-xs font-mono text-zinc-400 space-y-2">
          <div className="text-zinc-200 font-semibold">Установка в лаунчере вручную:</div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
            <li>Откройте Scope Launcher.</li>
            <li>В разделе «Библиотека» нажмите «+ Импорт» → «По ссылке или коду».</li>
            <li>
              Вставьте код сборки:{' '}
              <code className="text-zinc-200 bg-[#090b0e] px-1.5 py-0.5 rounded border border-zinc-800">
                {pack.id}
              </code>
            </li>
          </ol>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] font-mono text-zinc-600">
          Scope Launcher • Community Profiles & Sharing
        </p>
      </main>
    </div>
  );
}
