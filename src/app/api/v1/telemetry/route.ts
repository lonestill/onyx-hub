import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, distinct_id, properties } = body;

    if (!event || !distinct_id) {
      return NextResponse.json({ error: 'missing event or distinct_id' }, { status: 400 });
    }

    await initDb();
    const now = new Date().toISOString();
    const cleanId = String(distinct_id).trim();

    if (event === 'app_launch') {
      const os = properties?.os || properties?.$os || properties?.platform || null;
      const arch = properties?.arch || null;
      const locale = properties?.locale || null;
      const launcherVersion = properties?.launcher_version || properties?.version || null;

      await db.execute({
        sql: `
          INSERT INTO users (distinct_id, first_seen_at, last_seen_at, launches_count, os, arch, locale, launcher_version)
          VALUES (?, ?, ?, 1, ?, ?, ?, ?)
          ON CONFLICT(distinct_id) DO UPDATE SET
            last_seen_at = excluded.last_seen_at,
            launches_count = users.launches_count + 1,
            os = coalesce(excluded.os, users.os),
            arch = coalesce(excluded.arch, users.arch),
            locale = coalesce(excluded.locale, users.locale),
            launcher_version = coalesce(excluded.launcher_version, users.launcher_version)
        `,
        args: [cleanId, now, now, os, arch, locale, launcherVersion],
      });
    } else if (event === 'game_session') {
      const instanceName = properties?.instance_name || properties?.instanceName || null;
      const minecraftVersion = properties?.minecraft_version || properties?.minecraftVersion || null;
      const loader = properties?.loader || properties?.loader_type || null;
      const durationMinutes = Math.max(1, Number(properties?.duration_minutes ?? properties?.durationMinutes ?? 1));
      const exitCode = typeof properties?.exit_code === 'number' ? properties.exit_code : (typeof properties?.exitCode === 'number' ? properties.exitCode : null);
      const avgFps = typeof properties?.avg_fps === 'number' ? properties.avg_fps : (typeof properties?.avgFps === 'number' ? properties.avgFps : null);
      const modCount = Number(properties?.mod_count ?? properties?.modCount ?? 0);
      const sessionId = properties?.session_id || properties?.sessionId || (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now()));

      await db.execute({
        sql: `
          INSERT INTO game_sessions (id, distinct_id, instance_name, minecraft_version, loader, duration_minutes, exit_code, avg_fps, mod_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [sessionId, cleanId, instanceName, minecraftVersion, loader, durationMinutes, exitCode, avgFps, modCount, now],
      });

      await db.execute({
        sql: `
          INSERT INTO users (distinct_id, first_seen_at, last_seen_at, launches_count, game_launches_count, total_playtime_minutes)
          VALUES (?, ?, ?, 1, 1, ?)
          ON CONFLICT(distinct_id) DO UPDATE SET
            last_seen_at = excluded.last_seen_at,
            game_launches_count = users.game_launches_count + 1,
            total_playtime_minutes = users.total_playtime_minutes + excluded.total_playtime_minutes
        `,
        args: [cleanId, now, now, durationMinutes],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDb();
    const [usersRes, sessionsRes, totalStats] = await Promise.all([
      db.execute(`SELECT * FROM users ORDER BY last_seen_at DESC LIMIT 100`),
      db.execute(`SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT 50`),
      db.execute(`
        SELECT 
          COUNT(*) as total_users,
          COALESCE(SUM(launches_count), 0) as total_launches,
          COALESCE(SUM(game_launches_count), 0) as total_game_launches,
          COALESCE(SUM(total_playtime_minutes), 0) as total_playtime_minutes
        FROM users
      `),
    ]);

    const summary = totalStats.rows[0] || {
      total_users: 0,
      total_launches: 0,
      total_game_launches: 0,
      total_playtime_minutes: 0,
    };

    return NextResponse.json({
      success: true,
      summary,
      users: usersRes.rows,
      sessions: sessionsRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
