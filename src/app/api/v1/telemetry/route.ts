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
    const { event, distinct_id, properties } = body;

    if (!event || !distinct_id) {
      return NextResponse.json({ error: 'missing event or distinct_id' }, { status: 400 });
    }

    await initDb();

    await db.execute({
      sql: `INSERT INTO telemetry (event, distinct_id, properties, created_at) VALUES (?, ?, ?, ?)`,
      args: [
        String(event),
        String(distinct_id),
        JSON.stringify(properties || {}),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initDb();
    const res = await db.execute(`SELECT * FROM telemetry ORDER BY id DESC LIMIT 100`);
    return NextResponse.json({ success: true, count: res.rows.length, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
