import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
      title: 'Сборка не найдена | Onyx Launcher',
    };
  }

  const row = res.rows[0];
  const title = `${row.name} (${row.version} ${row.loader}) — Onyx Launcher`;
  const description = `Скачать готовую сборку Minecraft ${row.name} (${row.mod_count} модов) в один клик через Onyx Launcher.`;

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

  if (!res.rows || res.rows.length === 0) {
    notFound();
  }

  const row = res.rows[0];
  let profile = {};
  try {
    profile = JSON.parse(row.profile_data as string);
  } catch {
    notFound();
  }

  const packData = {
    id: String(row.id),
    name: String(row.name),
    version: String(row.version),
    loader: String(row.loader),
    modCount: Number(row.mod_count) || 0,
    author: row.author ? String(row.author) : null,
    downloads: Number(row.downloads) || 0,
    createdAt: String(row.created_at),
    profile,
  };

  return <PackViewClient pack={packData} />;
}
