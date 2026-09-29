import { Metadata } from 'next';
import { db, initDb } from '@/lib/db';
import PackViewClient from './PackViewClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  await initDb();
  const res = await db.execute({
    sql: `SELECT name, version, loader, mod_count FROM shared_packs WHERE id = ?`,
    args: [id],
  });

  if (!res.rows || res.rows.length === 0) {
    return {
      title: 'Сборка не найдена | Scope Launcher',
    };
  }

  const row = res.rows[0];
  const title = `${row.name} (${row.version} ${row.loader}) — Scope Launcher`;
  const description = `Скачать готовую сборку Minecraft ${row.name} (${row.mod_count} модов) в один клик через Scope Launcher.`;

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

export default async function PackPage({ params }: PageProps) {
  const { id } = await params;
  await initDb();

  const res = await db.execute({
    sql: `SELECT id, name, version, loader, mod_count, author, profile_data, downloads, created_at
          FROM shared_packs
          WHERE id = ?`,
    args: [id],
  });

  const row = res.rows && res.rows.length > 0 ? res.rows[0] : null;
  let profile = {};
  if (row?.profile_data) {
    try {
      profile = JSON.parse(row.profile_data as string);
    } catch {}
  }

  const packData = {
    id: id,
    name: row ? String(row.name) : 'Сборка',
    version: row ? String(row.version) : '',
    loader: row ? String(row.loader) : '',
    modCount: row ? (Number(row.mod_count) || 0) : 0,
    author: row?.author ? String(row.author) : null,
    downloads: row ? (Number(row.downloads) || 0) : 0,
    createdAt: row ? String(row.created_at) : '',
    isNotFound: !row,
    profile,
  };

  return <PackViewClient pack={packData} />;
}
