import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CORS = { 'Access-Control-Allow-Origin': '*' };
const ROOM_TTL_HOURS = 8;
const ROOM_MAX_PEERS = 16;

/** Generates a human-friendly 6-char code like "FOX-429" */
function generateRoomCode(): string {
  const words = [
    'FOX', 'OAK', 'SKY', 'JAY', 'ELM', 'RYE', 'BAY', 'FEN',
    'DEW', 'ICE', 'GEM', 'ARC', 'ZEN', 'ORB', 'INK', 'COG',
  ];
  const word = words[Math.floor(Math.random() * words.length)];
  const digits = Math.floor(100 + Math.random() * 900).toString();
  return `${word}-${digits}`;
}

function expiresAt(): string {
  const d = new Date();
  d.setHours(d.getHours() + ROOM_TTL_HOURS);
  return d.toISOString();
}

function isExpired(expiresAtStr: string): boolean {
  return new Date(expiresAtStr) < new Date();
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * POST /api/v1/party
 * Create a new room. Body: { hostPeerId, hostDisplayName?, instanceManifest? }
 * Returns: { code, deepLink, expiresAt }
 */
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { hostPeerId, hostDisplayName, instanceManifest } = body as {
      hostPeerId?: string;
      hostDisplayName?: string;
      instanceManifest?: unknown;
    };

    if (!hostPeerId || typeof hostPeerId !== 'string') {
      return NextResponse.json({ error: 'hostPeerId is required' }, { status: 400, headers: CORS });
    }

    // Retry up to 5 times to get a unique code (collision probability ~1:60000)
    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateRoomCode();
      const existing = await db.execute({ sql: 'SELECT code FROM party_rooms WHERE code = ?', args: [candidate] });
      if (existing.rows.length === 0) { code = candidate; break; }
    }
    if (!code) {
      return NextResponse.json({ error: 'Could not generate unique room code, retry' }, { status: 500, headers: CORS });
    }

    const now = new Date().toISOString();
    const exp = expiresAt();
    const peers = JSON.stringify([{ peerId: hostPeerId, displayName: hostDisplayName || null, isHost: true, joinedAt: now, ready: false }]);

    await db.execute({
      sql: `INSERT INTO party_rooms (code, host_peer_id, host_display_name, instance_manifest, peers, status, created_at, updated_at, expires_at)
            VALUES (?, ?, ?, ?, ?, 'waiting', ?, ?, ?)`,
      args: [
        code,
        hostPeerId,
        hostDisplayName || null,
        instanceManifest ? JSON.stringify(instanceManifest) : null,
        peers,
        now,
        now,
        exp,
      ],
    });

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'onyx-hub.vercel.app';
    const proto = req.headers.get('x-forwarded-proto') || 'https';

    return NextResponse.json({
      success: true,
      code,
      deepLink: `scope://party/${code}`,
      legacyDeepLink: `onyx://party/${code}`,
      webLink: `${proto}://${host}/party/${code}`,
      expiresAt: exp,
    }, { headers: CORS });
  } catch (err) {
    console.error('POST /party error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS });
  }
}

/**
 * GET /api/v1/party?code=FOX-429[&peerId=xxx]
 * Returns room state. If peerId provided, auto-adds peer to list.
 */
export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const peerId = searchParams.get('peerId');
    const displayName = searchParams.get('displayName') || null;

    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400, headers: CORS });
    }

    const result = await db.execute({ sql: 'SELECT * FROM party_rooms WHERE code = ?', args: [code] });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404, headers: CORS });
    }

    const row = result.rows[0];
    if (isExpired(row.expires_at as string)) {
      // Clean up expired room
      await db.execute({ sql: 'DELETE FROM party_rooms WHERE code = ?', args: [code] });
      await db.execute({ sql: 'DELETE FROM party_signals WHERE room_code = ?', args: [code] });
      return NextResponse.json({ error: 'Room has expired' }, { status: 410, headers: CORS });
    }

    let peers: Array<{ peerId: string; displayName: string | null; isHost: boolean; joinedAt: string; ready: boolean }> = [];
    try { peers = JSON.parse(row.peers as string); } catch { peers = []; }

    // Auto-join: add peer to list if not already present and not over limit
    if (peerId && !peers.some(p => p.peerId === peerId)) {
      if (peers.length >= ROOM_MAX_PEERS) {
        return NextResponse.json({ error: 'Room is full' }, { status: 409, headers: CORS });
      }
      peers.push({ peerId, displayName, isHost: false, joinedAt: new Date().toISOString(), ready: false });
      await db.execute({
        sql: 'UPDATE party_rooms SET peers = ?, updated_at = ? WHERE code = ?',
        args: [JSON.stringify(peers), new Date().toISOString(), code],
      });
    }

    let manifest = null;
    if (row.instance_manifest) {
      try { manifest = JSON.parse(row.instance_manifest as string); } catch { manifest = null; }
    }

    return NextResponse.json({
      success: true,
      code,
      hostPeerId: row.host_peer_id,
      status: row.status,
      peers,
      instanceManifest: manifest,
      expiresAt: row.expires_at,
      updatedAt: row.updated_at,
    }, { headers: CORS });
  } catch (err) {
    console.error('GET /party error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS });
  }
}

/**
 * PATCH /api/v1/party
 * Update room state: push new manifest, change status, mark peer ready, update host tunnel address.
 * Body: { code, hostPeerId, action: 'update-manifest'|'set-status'|'set-peer-ready'|'set-tunnel', ...payload }
 */
export async function PATCH(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json() as {
      code?: string;
      hostPeerId?: string;
      action?: string;
      instanceManifest?: unknown;
      status?: string;
      peerId?: string;
      ready?: boolean;
      tunnelHost?: string;
      tunnelPort?: number;
    };
    const { code, hostPeerId, action } = body;

    if (!code || !action) {
      return NextResponse.json({ error: 'code and action are required' }, { status: 400, headers: CORS });
    }

    const result = await db.execute({ sql: 'SELECT * FROM party_rooms WHERE code = ?', args: [code] });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404, headers: CORS });
    }

    const row = result.rows[0];
    if (isExpired(row.expires_at as string)) {
      return NextResponse.json({ error: 'Room has expired' }, { status: 410, headers: CORS });
    }

    const now = new Date().toISOString();

    if (action === 'update-manifest') {
      if (row.host_peer_id !== hostPeerId) {
        return NextResponse.json({ error: 'Only host can update manifest' }, { status: 403, headers: CORS });
      }
      await db.execute({
        sql: 'UPDATE party_rooms SET instance_manifest = ?, updated_at = ? WHERE code = ?',
        args: [body.instanceManifest ? JSON.stringify(body.instanceManifest) : null, now, code],
      });
    } else if (action === 'set-status') {
      if (row.host_peer_id !== hostPeerId) {
        return NextResponse.json({ error: 'Only host can set status' }, { status: 403, headers: CORS });
      }
      const allowed = ['waiting', 'hosting', 'closed'];
      if (!body.status || !allowed.includes(body.status)) {
        return NextResponse.json({ error: `status must be one of: ${allowed.join(', ')}` }, { status: 400, headers: CORS });
      }
      await db.execute({
        sql: 'UPDATE party_rooms SET status = ?, updated_at = ? WHERE code = ?',
        args: [body.status, now, code],
      });
    } else if (action === 'set-peer-ready') {
      if (!body.peerId) {
        return NextResponse.json({ error: 'peerId required for set-peer-ready' }, { status: 400, headers: CORS });
      }
      let peers: Array<{ peerId: string; displayName: string | null; isHost: boolean; joinedAt: string; ready: boolean }> = [];
      try { peers = JSON.parse(row.peers as string); } catch { peers = []; }
      peers = peers.map(p => p.peerId === body.peerId ? { ...p, ready: body.ready ?? true } : p);
      await db.execute({
        sql: 'UPDATE party_rooms SET peers = ?, updated_at = ? WHERE code = ?',
        args: [JSON.stringify(peers), now, code],
      });
    } else if (action === 'set-tunnel') {
      if (row.host_peer_id !== hostPeerId) {
        return NextResponse.json({ error: 'Only host can set tunnel address' }, { status: 403, headers: CORS });
      }
      if (!body.tunnelHost || !body.tunnelPort) {
        return NextResponse.json({ error: 'tunnelHost and tunnelPort required' }, { status: 400, headers: CORS });
      }
      // Store tunnel info inside instance_manifest or as separate fields via JSON merge
      let manifest: Record<string, unknown> = {};
      if (row.instance_manifest) { try { manifest = JSON.parse(row.instance_manifest as string); } catch { manifest = {}; } }
      manifest._tunnel = { host: body.tunnelHost, port: body.tunnelPort, setAt: now };
      await db.execute({
        sql: 'UPDATE party_rooms SET instance_manifest = ?, status = \'hosting\', updated_at = ? WHERE code = ?',
        args: [JSON.stringify(manifest), now, code],
      });
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400, headers: CORS });
    }

    return NextResponse.json({ success: true, updatedAt: now }, { headers: CORS });
  } catch (err) {
    console.error('PATCH /party error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS });
  }
}

/**
 * DELETE /api/v1/party?code=FOX-429&hostPeerId=xxx
 * Close and delete the room (host only).
 */
export async function DELETE(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const hostPeerId = searchParams.get('hostPeerId');

    if (!code || !hostPeerId) {
      return NextResponse.json({ error: 'code and hostPeerId are required' }, { status: 400, headers: CORS });
    }

    const result = await db.execute({ sql: 'SELECT host_peer_id FROM party_rooms WHERE code = ?', args: [code] });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404, headers: CORS });
    }
    if (result.rows[0].host_peer_id !== hostPeerId) {
      return NextResponse.json({ error: 'Only host can close room' }, { status: 403, headers: CORS });
    }

    await db.execute({ sql: 'DELETE FROM party_rooms WHERE code = ?', args: [code] });
    await db.execute({ sql: 'DELETE FROM party_signals WHERE room_code = ?', args: [code] });

    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    console.error('DELETE /party error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS });
  }
}
