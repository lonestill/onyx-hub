import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

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
    const {
      launcher_version,
      minecraft_version,
      loader,
      os,
      suspected_culprit,
      error_title,
      stack_trace,
      mod_count,
    } = body;

    if (!error_title || !stack_trace) {
      return NextResponse.json({ error: 'error_title and stack_trace required' }, { status: 400 });
    }

    await initDb();

    const id = `cr-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO crashes (id, launcher_version, minecraft_version, loader, os, suspected_culprit, error_title, stack_trace, mod_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        launcher_version || 'unknown',
        minecraft_version || 'unknown',
        loader || 'unknown',
        os || 'unknown',
        suspected_culprit || null,
        error_title,
        stack_trace,
        Number(mod_count) || 0,
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initDb();
    const res = await db.execute(`SELECT * FROM crashes ORDER BY created_at DESC LIMIT 50`);
    return NextResponse.json({ success: true, count: res.rows.length, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
