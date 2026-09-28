'use client';

import React from 'react';
import { UserItem, GameSessionItem } from '../types';
import { Users, Play, Clock, Gamepad2, Laptop, CheckCircle2, AlertCircle } from 'lucide-react';

interface MetricsOverviewProps {
  summary: {
    total_users: number;
    total_launches: number;
    total_game_launches: number;
    total_playtime_minutes: number;
  };
  users: UserItem[];
  sessions: GameSessionItem[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ summary, users, sessions }) => {
  const totalHours = Math.floor((summary.total_playtime_minutes || 0) / 60);
  const remainingMins = (summary.total_playtime_minutes || 0) % 60;
  const avgSessionMins = summary.total_game_launches > 0
    ? Math.round((summary.total_playtime_minutes || 0) / summary.total_game_launches)
    : 0;

  const stats = [
    {
      label: 'Уникальных игроков',
      val: summary.total_users || 0,
      sub: 'Каждый клиент отделён',
      icon: Users,
      color: 'text-emerald-400',
    },
    {
      label: 'Запусков лаунчера',
      val: summary.total_launches || 0,
      sub: 'Суммарно по всем игрокам',
      icon: Play,
      color: 'text-blue-400',
    },
    {
      label: 'Игровых сессий Minecraft',
      val: summary.total_game_launches || 0,
      sub: `~${avgSessionMins} мин / средняя сессия`,
      icon: Gamepad2,
      color: 'text-purple-400',
    },
    {
      label: 'Общее игровое время',
      val: `${totalHours} ч ${remainingMins} м`,
      sub: `${summary.total_playtime_minutes || 0} минут в игре`,
      icon: Clock,
      color: 'text-amber-400',
    },
  ];

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="panel rounded-lg p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-mono uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-semibold font-mono text-zinc-100">{s.val}</span>
                <span className="text-[11px] text-zinc-500 font-mono">{s.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Section */}
      <div className="panel rounded-lg p-4 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Пользователи ({users.length})
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            1 строка = 1 уникальный лаунчер
          </span>
        </div>

        {users.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Пользователей пока нет в базе
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] text-zinc-500">
                  <th className="pb-2 font-medium">Клиент ID</th>
                  <th className="pb-2 font-medium">ОС / Платформа</th>
                  <th className="pb-2 font-medium">Версия</th>
                  <th className="pb-2 font-medium text-center">Запусков</th>
                  <th className="pb-2 font-medium text-center">Игр</th>
                  <th className="pb-2 font-medium">Наиграно</th>
                  <th className="pb-2 font-medium text-right">Посл. активность</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((u) => {
                  const hours = Math.floor((u.total_playtime_minutes || 0) / 60);
                  const mins = (u.total_playtime_minutes || 0) % 60;
                  return (
                    <tr key={u.distinct_id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-2.5 pr-2">
                        <span
                          className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]"
                          title={u.distinct_id}
                        >
                          {u.distinct_id.length > 12 ? `${u.distinct_id.slice(0, 10)}…` : u.distinct_id}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-zinc-300">
                        {u.os || 'unknown'} {u.arch ? `(${u.arch})` : ''}
                      </td>
                      <td className="py-2.5 pr-2 text-zinc-400">
                        {u.launcher_version ? `v${u.launcher_version}` : '—'}
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                          {u.launches_count}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">
                          {u.game_launches_count || 0}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-zinc-200">
                        {hours > 0 ? `${hours}ч ` : ''}{mins}м
                      </td>
                      <td className="py-2.5 text-right text-zinc-500 text-[11px]">
                        {formatDate(u.last_seen_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Game Sessions Section */}
      <div className="panel rounded-lg p-4 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Игровые сессии ({sessions.length})
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Длительность, FPS и стабильность
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Игровых сессий пока не зафиксировано
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] text-zinc-500">
                  <th className="pb-2 font-medium">Инстанс</th>
                  <th className="pb-2 font-medium">Версия / Loader</th>
                  <th className="pb-2 font-medium">Игрок</th>
                  <th className="pb-2 font-medium text-center">Длительность</th>
                  <th className="pb-2 font-medium text-center">Avg FPS</th>
                  <th className="pb-2 font-medium text-center">Статус</th>
                  <th className="pb-2 font-medium text-right">Время</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 pr-2 font-medium text-zinc-200">
                      {s.instance_name || 'Minecraft'}
                      {s.mod_count ? (
                        <span className="ml-1.5 text-[10px] text-zinc-500">({s.mod_count} mods)</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-2 text-zinc-400">
                      {s.minecraft_version || '1.21'} <span className="text-zinc-600">/</span> {s.loader || 'Vanilla'}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className="text-zinc-500 text-[11px]" title={s.distinct_id}>
                        {s.distinct_id.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-center text-zinc-200">
                      {s.duration_minutes} мин
                    </td>
                    <td className="py-2.5 pr-2 text-center">
                      {s.avg_fps ? (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                          s.avg_fps >= 60 ? 'text-emerald-400 bg-emerald-500/10' :
                          s.avg_fps >= 30 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {Math.round(s.avg_fps)}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-center">
                      {s.exit_code === 0 || s.exit_code === null ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400" title={`Exit code ${s.exit_code}`}>
                          <AlertCircle className="w-3 h-3" />
                          <span>Код {s.exit_code}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-zinc-500 text-[11px]">
                      {formatDate(s.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
