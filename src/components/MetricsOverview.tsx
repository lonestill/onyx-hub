'use client';

import React from 'react';
import { DailyMetric, OsBreakdown, LoaderBreakdown } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Laptop, Cpu, Terminal, Activity, Zap } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: DailyMetric[];
  osBreakdown: OsBreakdown[];
  loaderBreakdown: LoaderBreakdown[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics, osBreakdown, loaderBreakdown }) => {
  const latest = metrics[metrics.length - 1];
  const totalLaunches = metrics.reduce((acc, m) => acc + m.appLaunches, 0);
  const totalGameLaunches = metrics.reduce((acc, m) => acc + m.gameLaunches, 0);
  const totalCrashes = metrics.reduce((acc, m) => acc + m.crashes, 0);

  const stats = [
    { label: 'DAU (Активные сегодня)', val: latest.uniqueUsers, sub: '+18% к началу недели', border: 'border-zinc-800' },
    { label: 'Запусков лаунчера (24ч)', val: latest.appLaunches, sub: `${totalLaunches} всего за 14д`, border: 'border-zinc-800' },
    { label: 'Игровых сессий Minecraft', val: latest.gameLaunches, sub: `${totalGameLaunches} сессий`, border: 'border-zinc-800' },
    { label: 'Crash Rate (Индекс сбоев)', val: `${((latest.crashes / latest.gameLaunches) * 100).toFixed(1)}%`, sub: `${totalCrashes} крашей в базе`, border: 'border-rose-950/40' },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, idx) => (
          <div key={idx} className={`panel rounded-lg p-3.5 ${s.border}`}>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{s.label}</span>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-semibold font-mono text-zinc-100">{s.val}</span>
              <span className="text-[11px] text-zinc-500 font-mono">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="panel rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-medium text-zinc-200">Динамика нагрузки (14 дней)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Соотношение открытий лаунчера к реальным запускам инстансов</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Лаунчер ({totalLaunches})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Minecraft ({totalGameLaunches})
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#13161c',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#e4e4e7',
                }}
              />
              <Area type="monotone" dataKey="appLaunches" name="Лаунчер" stroke="#10b981" strokeWidth={1.5} fill="rgba(16, 185, 129, 0.08)" />
              <Area type="monotone" dataKey="gameLaunches" name="Игра" stroke="#06b6d4" strokeWidth={1.5} fill="rgba(6, 182, 212, 0.08)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Grid: OS and Mod Loaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* OS Share */}
        <div className="panel rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">Распределение по платформам</span>
            <Laptop className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="space-y-2 pt-1">
            {osBreakdown.map((item) => (
              <div key={item.os} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-300">{item.os}</span>
                  <span className="text-zinc-500">{item.share}% ({item.count})</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-400"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mod Loaders */}
        <div className="panel rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">Популярность загрузчиков модов</span>
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="space-y-2 pt-1">
            {loaderBreakdown.map((item) => {
              const total = loaderBreakdown.reduce((a, b) => a + b.count, 0);
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-300">{item.name}</span>
                    <span className="text-zinc-500">{pct}% ({item.count} сессий)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
