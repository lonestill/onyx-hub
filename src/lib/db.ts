import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || (process.env.VERCEL ? 'file:/tmp/local.db' : 'file:local.db');
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  try {
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
      CREATE TABLE IF NOT EXISTS users (
        distinct_id TEXT PRIMARY KEY,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        launches_count INTEGER DEFAULT 1,
        game_launches_count INTEGER DEFAULT 0,
        total_playtime_minutes INTEGER DEFAULT 0,
        os TEXT,
        arch TEXT,
        locale TEXT,
        launcher_version TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        distinct_id TEXT NOT NULL,
        instance_name TEXT,
        minecraft_version TEXT,
        loader TEXT,
        duration_minutes INTEGER NOT NULL,
        exit_code INTEGER,
        avg_fps REAL,
        mod_count INTEGER,
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
    isInitialized = true;
  } catch (e) {
    console.error('Database initialization error:', e);
  }
}
