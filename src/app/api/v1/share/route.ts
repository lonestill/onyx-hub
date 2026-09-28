import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, author } = body;

    if (!profile || !profile.instance) {
      return NextResponse.json(
        { error: 'Invalid modpack profile. Missing instance metadata.' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { name, version, loader } = profile.instance;
    if (!name || !version) {
      return NextResponse.json(
        { error: 'Profile must include instance name and Minecraft version.' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const profileString = JSON.stringify(profile);
    if (profileString.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Profile exceeds maximum allowed size (5MB).' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    await initDb();

    // Generate clean short identifier, e.g. pk_a8f9c2d1
    const id = `pk_${crypto.randomBytes(4).toString('hex')}`;
    const modCount = Array.isArray(profile.mods) ? profile.mods.length : 0;
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO shared_packs (id, name, version, loader, mod_count, author, profile_data, downloads, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [
        id,
        String(name).slice(0, 100),
        String(version).slice(0, 50),
        String(loader || 'vanilla').slice(0, 50),
        modCount,
        author ? String(author).slice(0, 60) : null,
        profileString,
        createdAt,
      ],
    });

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'onyx-launcher-hub.vercel.app';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    return NextResponse.json(
      {
        success: true,
        id,
        url: `${baseUrl}/pack/${id}`,
        deepLink: `onyx://pack/${id}`,
        name,
        version,
        loader: loader || 'vanilla',
        modCount,
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('Error sharing modpack profile:', error);
    return NextResponse.json(
      { error: 'Failed to save modpack profile' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" is required' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    await initDb();

    const result = await db.execute({
      sql: `SELECT id, name, version, loader, mod_count, author, profile_data, downloads, created_at
            FROM shared_packs
            WHERE id = ?`,
      args: [id],
    });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Modpack profile not found' },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    const row = result.rows[0];

    // Increment downloads count asynchronously
    db.execute({
      sql: `UPDATE shared_packs SET downloads = downloads + 1 WHERE id = ?`,
      args: [id],
    }).catch((e) => console.error('Failed to increment downloads:', e));

    let profile = null;
    try {
      profile = JSON.parse(row.profile_data as string);
    } catch {
      return NextResponse.json(
        { error: 'Corrupt profile payload in database' },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: row.id,
        name: row.name,
        version: row.version,
        loader: row.loader,
        modCount: row.mod_count,
        author: row.author,
        downloads: ((row.downloads as number) || 0) + 1,
        createdAt: row.created_at,
        profile,
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('Error fetching shared modpack:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve modpack profile' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
