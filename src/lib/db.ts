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

    await db.execute(`
      CREATE TABLE IF NOT EXISTS shared_packs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        loader TEXT NOT NULL,
        mod_count INTEGER DEFAULT 0,
        author TEXT,
        profile_data TEXT NOT NULL,
        downloads INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // Party rooms for P2P multiplayer (v2.0.0)
    // Rooms live for max 8 hours; cleanup happens on read
    await db.execute(`
      CREATE TABLE IF NOT EXISTS party_rooms (
        code TEXT PRIMARY KEY,
        host_peer_id TEXT NOT NULL,
        host_display_name TEXT,
        instance_manifest TEXT,
        peers TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'waiting',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
    `);

    // Ephemeral WebRTC signaling envelopes (offer/answer/candidate)
    // Each envelope has a target peer_id and is consumed once (deleted after read)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS party_signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        from_peer_id TEXT NOT NULL,
        to_peer_id TEXT NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    isInitialized = true;
  } catch (e) {
    console.error('Database initialization error:', e);
  }
}
