import { Metadata } from 'next';
import { db, initDb } from '@/lib/db';
import PartyViewClient from './PartyViewClient';

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  await initDb();
  const upperCode = code.toUpperCase();

  const res = await db.execute({
    sql: `SELECT code, host_display_name, instance_manifest, status, expires_at FROM party_rooms WHERE code = ?`,
    args: [upperCode],
  });

  if (!res.rows || res.rows.length === 0) {
    return {
      title: 'Комната не найдена | Scope Launcher',
    };
  }

  const row = res.rows[0];
  const hostName = (row.host_display_name as string) || 'Хост';
  let instanceName = 'Minecraft';
  if (row.instance_manifest) {
    try {
      const manifest = JSON.parse(row.instance_manifest as string);
      if (manifest.instanceName) instanceName = manifest.instanceName;
    } catch {}
  }

  const title = `Комната ${upperCode} (${hostName}) — Scope Party`;
  const description = `Подключиться к совместной игре в ${instanceName} без настройки портов через Scope Launcher.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function PartyRoomPage({ params }: PageProps) {
  const { code } = await params;
  await initDb();
  const upperCode = code.toUpperCase();

  const res = await db.execute({
    sql: `SELECT code, host_peer_id, host_display_name, instance_manifest, peers, status, expires_at FROM party_rooms WHERE code = ?`,
    args: [upperCode],
  });

  const isNotFound = !res.rows || res.rows.length === 0;
  const row = isNotFound ? null : res.rows[0];
  const expiresAt = row ? String(row.expires_at) : '';
  const isExpired = row ? new Date(expiresAt).getTime() < Date.now() : false;

  let peersCount = 1;
  if (row) {
    try {
      const peers = JSON.parse(row.peers as string);
      if (Array.isArray(peers)) peersCount = peers.length;
    } catch {}
  }

  let instanceName = undefined;
  let minecraftVersion = undefined;
  let loader = undefined;
  let modCount = undefined;

  if (row && row.instance_manifest) {
    try {
      const manifest = JSON.parse(row.instance_manifest as string);
      instanceName = manifest.instanceName;
      minecraftVersion = manifest.minecraftVersion;
      loader = manifest.loader;
      modCount = Array.isArray(manifest.mods) ? manifest.mods.length : undefined;
    } catch {}
  }

  const roomData = {
    code: upperCode,
    hostDisplayName: row ? String(row.host_display_name || 'Хост') : 'Ожидание хоста',
    status: !row ? 'not_found' : String(row.status),
    expiresAt,
    isExpired,
    isNotFound,
    peersCount,
    instanceName,
    minecraftVersion,
    loader,
    modCount,
  };

  return <PartyViewClient room={roomData} />;
}
