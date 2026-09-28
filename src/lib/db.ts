import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      rating INTEGER,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      contact TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      launcher_version TEXT,
      os TEXT,
      arch TEXT,
      anonymous_id TEXT,
      upvotes INTEGER DEFAULT 0,
      tags TEXT,
      logs_snippet TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      distinct_id TEXT NOT NULL,
      properties TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS crashes (
      id TEXT PRIMARY KEY,
      launcher_version TEXT,
      minecraft_version TEXT,
      loader TEXT,
      os TEXT,
      suspected_culprit TEXT,
      error_title TEXT,
      stack_trace TEXT,
      mod_count INTEGER,
      status TEXT DEFAULT 'unresolved',
      occurrences INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);
}
