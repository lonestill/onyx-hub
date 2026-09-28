export type FeedbackType = 'review' | 'bug' | 'feature';
export type FeedbackStatus = 'new' | 'investigating' | 'in_progress' | 'resolved' | 'archived';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  rating?: number; // 1-5 for reviews
  title: string;
  comment: string;
  contact?: string;
  status: FeedbackStatus;
  launcherVersion: string;
  os: 'Windows' | 'macOS' | 'Linux';
  arch: string;
  anonymousId: string;
  createdAt: string;
  upvotes?: number;
  tags?: string[];
  logsSnippet?: string;
  adminNotes?: string;
}

export interface CrashReportItem {
  id: string;
  timestamp: string;
  launcherVersion: string;
  minecraftVersion: string;
  loader: 'Fabric' | 'Forge' | 'NeoForge' | 'Quilt' | 'Vanilla';
  os: string;
  suspectedCulprit?: string;
  errorTitle: string;
  stackTrace: string;
  modCount: number;
  status: 'unresolved' | 'investigating' | 'fixed';
  occurrences: number;
}

export interface UserItem {
  distinct_id: string;
  first_seen_at: string;
  last_seen_at: string;
  launches_count: number;
  game_launches_count: number;
  total_playtime_minutes: number;
  os?: string;
  arch?: string;
  locale?: string;
  launcher_version?: string;
}

export interface GameSessionItem {
  id: string;
  distinct_id: string;
  instance_name?: string;
  minecraft_version?: string;
  loader?: string;
  duration_minutes: number;
  exit_code?: number;
  avg_fps?: number;
  mod_count?: number;
  created_at: string;
}

export interface DailyMetric {
  date: string;
  appLaunches: number;
  gameLaunches: number;
  uniqueUsers: number;
  crashes: number;
}

export interface OsBreakdown {
  os: string;
  share: number;
  count: number;
}

export interface LoaderBreakdown {
  name: string;
  count: number;
  color: string;
}
