import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      rating,
      title,
      comment,
      contact,
      launcher_version,
      os,
      arch,
      anonymous_id,
      tags,
      logs_snippet,
    } = body;

    if (!title || !comment) {
      return NextResponse.json({ error: 'title and comment are required' }, { status: 400 });
    }

    await initDb();

    const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO feedback (id, type, rating, title, comment, contact, status, launcher_version, os, arch, anonymous_id, tags, logs_snippet, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        type || 'review',
        rating || null,
        title,
        comment,
        contact || null,
        launcher_version || 'unknown',
        os || 'unknown',
        arch || 'unknown',
        anonymous_id || null,
        JSON.stringify(tags || []),
        logs_snippet || null,
        createdAt,
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
    const res = await db.execute(`SELECT * FROM feedback ORDER BY created_at DESC`);
    return NextResponse.json({ success: true, count: res.rows.length, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'missing id' }, { status: 400 });
    }

    await initDb();

    if (status !== undefined && admin_notes !== undefined) {
      await db.execute({
        sql: `UPDATE feedback SET status = ?, admin_notes = ? WHERE id = ?`,
        args: [status, admin_notes, String(id)],
      });
    } else if (status !== undefined) {
      await db.execute({
        sql: `UPDATE feedback SET status = ? WHERE id = ?`,
        args: [status, String(id)],
      });
    } else if (admin_notes !== undefined) {
      await db.execute({
        sql: `UPDATE feedback SET admin_notes = ? WHERE id = ?`,
        args: [admin_notes, String(id)],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
