'use client';

import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Cpu,
  Package,
  Calendar,
  Sparkles,
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
  const [downloading, setDownloading] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://onyx-launcher-hub.vercel.app/pack/${pack.id}`;
  const deepLink = `onyx://pack/${pack.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadFile = () => {
    setDownloading(true);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pack.profile, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = pack.name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim() || 'modpack';
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${safeName}.onyxprofile`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => setDownloading(false), 1000);
  };

  const mods = pack.profile?.mods || [];
  const recognizedMods = mods.filter((m) => m.versionId).length;

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f3f4f6] flex flex-col justify-between selection:bg-[#84cc16]/20 selection:text-[#a3e635]">
      {/* Background ambient neon glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-[#84cc16]/7 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] bg-[#10b981]/5 blur-[140px] rounded-full" />
      </div>

      {/* Header bar matching main site */}
      <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#0c0e12]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181c24] border border-[rgba(255,255,255,0.12)] flex items-center justify-center font-mono font-black text-xs text-[#84cc16] shadow-sm">
              NX
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono font-bold tracking-wider text-base text-[#f3f4f6]">ONYX</span>
              <span className="hidden sm:inline text-[11px] font-mono tracking-widest text-[#64748b] uppercase">
                Command Center for Minecraft
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/lonestill/onyx-launcher/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181c24] hover:bg-[#202632] text-xs font-mono text-[#f3f4f6] transition-colors"
            >
              <span>СКАЧАТЬ ONYX</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#84cc16]" />
            </a>
          </div>
        </div>
      </header>

      {/* Main pack card */}
      <main className="relative z-10 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 flex-1 flex flex-col justify-center">
        <div className="rounded-2xl bg-[#13161c] border border-[rgba(255,255,255,0.08)] shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Accent top line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#84cc16]" />

          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#84cc16] mb-2 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ONYX SYNC · ГОТОВАЯ СБОРКА</span>
          </div>

          {/* Pack Name */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6] mb-4">
            {pack.name}
          </h1>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181c24] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#f3f4f6]">
              <Package className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>Minecraft {pack.version}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181c24] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#f3f4f6] uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>{pack.loader}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181c24] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#f3f4f6]">
              <Layers className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>{pack.modCount} {pack.modCount === 1 ? 'мод' : pack.modCount < 5 ? 'мода' : 'модов'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0c0e12] border border-[rgba(255,255,255,0.06)] text-[11px] font-mono text-[#64748b] ml-auto">
              <Calendar className="w-3 h-3" />
              <span>{new Date(pack.createdAt).toLocaleDateString('ru-RU')}</span>
            </span>
          </div>

          {/* Primary CTA: Open in Launcher */}
          <div className="space-y-3">
            <a
              href={deepLink}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#84cc16] hover:bg-[#a3e635] text-[#111609] font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-[#84cc16]/15 hover:shadow-[#84cc16]/30 active:scale-[0.99] cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>ОТКРЫТЬ В ONYX LAUNCHER</span>
            </a>
            <p className="text-center text-[11px] text-[#64748b] font-mono">
              Если лаунчер установлен, клик откроет окно импорта сборки автоматически.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#181c24] hover:bg-[#202632] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#f3f4f6] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#84cc16]" /> : <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />}
              <span>{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#181c24] hover:bg-[#202632] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#f3f4f6] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#9ca3af]" />
              <span>{downloading ? 'Экспорт...' : 'Скачать .onyxprofile'}</span>
            </button>
          </div>

          {/* Mods list preview */}
          {mods.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-[#f3f4f6]">Список модов в сборке:</span>
                <span className="text-[11px] font-mono text-[#64748b]">
                  {recognizedMods} из {mods.length} с автозагрузкой
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl bg-[#0c0e12] border border-[rgba(255,255,255,0.08)] p-3 space-y-1 text-[11px] font-mono text-[#9ca3af]">
                {mods.map((mod, index) => (
                  <div key={index} className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#181c24]">
                    <span className="truncate pr-2">• {mod.name}</span>
                    <span className="text-[10px] text-[#64748b] shrink-0">
                      {mod.versionId ? 'Modrinth' : 'Локальный'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual instructions card */}
        <div className="mt-5 p-4 rounded-xl bg-[#13161c] border border-[rgba(255,255,255,0.08)] text-xs text-[#9ca3af] leading-relaxed font-mono">
          <div className="text-[#f3f4f6] font-semibold mb-1.5">Как установить через лаунчер вручную:</div>
          <ol className="list-decimal list-inside space-y-1 text-[#9ca3af] text-[11px]">
            <li>Открой Onyx Launcher.</li>
            <li>В разделе «Библиотека» нажми «+ Импорт» → «По ссылке или коду».</li>
            <li>Вставь код сборки: <code className="text-[#84cc16] bg-[#0c0e12] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">{pack.id}</code></li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.08)] bg-[#0c0e12] py-5 text-center text-xs text-[#64748b] font-mono">
        Onyx Launcher &copy; {new Date().getFullYear()} — Command Center for Minecraft
      </footer>
    </div>
  );
}
