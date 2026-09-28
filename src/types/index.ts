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
