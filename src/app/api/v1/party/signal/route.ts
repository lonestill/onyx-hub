import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CORS = { 'Access-Control-Allow-Origin': '*' };
// Signals older than 60s are stale and purged on poll
const SIGNAL_TTL_SECONDS = 60;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * POST /api/v1/party/signal
 * Push a WebRTC signaling envelope (offer, answer, candidate).
 * Body: { roomCode, fromPeerId, toPeerId, type: 'offer'|'answer'|'candidate', payload: <SDP or ICE> }
 */
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json() as {
      roomCode?: string;
      fromPeerId?: string;
      toPeerId?: string;
      type?: string;
      payload?: unknown;
    };

    const { roomCode, fromPeerId, toPeerId, type, payload } = body;

    if (!roomCode || !fromPeerId || !toPeerId || !type || payload === undefined) {
      return NextResponse.json({ error: 'roomCode, fromPeerId, toPeerId, type, payload are all required' }, { status: 400, headers: CORS });
    }

    const allowed = ['offer', 'answer', 'candidate', 'tunnel-info', 'heartbeat'];
    if (!allowed.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${allowed.join(', ')}` }, { status: 400, headers: CORS });
    }

    // Verify room exists
    const roomResult = await db.execute({ sql: 'SELECT code FROM party_rooms WHERE code = ?', args: [roomCode] });
    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404, headers: CORS });
    }

    const now = new Date().toISOString();

    // Purge stale signals for this room first
    const cutoff = new Date(Date.now() - SIGNAL_TTL_SECONDS * 1000).toISOString();
    await db.execute({ sql: 'DELETE FROM party_signals WHERE room_code = ? AND created_at < ?', args: [roomCode, cutoff] });

    await db.execute({
      sql: 'INSERT INTO party_signals (room_code, from_peer_id, to_peer_id, type, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [roomCode, fromPeerId, toPeerId, type, JSON.stringify(payload), now],
    });

    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    console.error('POST /party/signal error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS });
  }
}

/**
 * GET /api/v1/party/signal?roomCode=FOX-429&peerId=xxx
 * Poll and consume all signals addressed to this peer.
 * Signals are deleted after retrieval (consume-once).
 * Launcher polls this every ~1.5s during signaling phase.
 */
export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const peerId = searchParams.get('peerId');

    if (!roomCode || !peerId) {
      return NextResponse.json({ error: 'roomCode and peerId are required' }, { status: 400, headers: CORS });
    }

    // Purge stale signals globally for this room
    const cutoff = new Date(Date.now() - SIGNAL_TTL_SECONDS * 1000).toISOString();
    await db.execute({ sql: 'DELETE FROM party_signals WHERE room_code = ? AND created_at < ?', args: [roomCode, cutoff] });

    // Fetch all signals addressed to this peer
    const result = await db.execute({
      sql: 'SELECT id, from_peer_id, type, payload, created_at FROM party_signals WHERE room_code = ? AND to_peer_id = ? ORDER BY id ASC',
      args: [roomCode, peerId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ signals: [] }, { headers: CORS });
    }

    // Consume: delete fetched rows
    const ids = result.rows.map(r => r.id as number);
    await db.execute({
      sql: `DELETE FROM party_signals WHERE id IN (${ids.map(() => '?').join(',')})`,
      args: ids,
    });

    const signals = result.rows.map(r => ({
      fromPeerId: r.from_peer_id,
      type: r.type,
      payload: (() => { try { return JSON.parse(r.payload as string); } catch { return r.payload; } })(),
      createdAt: r.created_at,
    }));

    return NextResponse.json({ signals }, { headers: CORS });
  } catch (err) {
    console.error('GET /party/signal error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS });
  }
}
