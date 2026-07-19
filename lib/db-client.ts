/**
 * Unified DB client factory.
 *
 * - When DATABASE_URL is set  → uses PostgreSQL (production / Render + Railway)
 * - Otherwise                 → uses SQLite via better-sqlite3 (local dev)
 *
 * Usage in API routes:
 *   const { db, isPg, release } = await getClient();
 *   try { ... } finally { release(); }
 */

import { getPgPool, ensurePgSchema } from './db-pg';
import { getDb } from './db';
import type { Pool, PoolClient } from 'pg';
import type Database from 'better-sqlite3';

export type DbMode = 'sqlite' | 'postgres';

export interface DbClient {
  mode: DbMode;
  // SQLite handle (null in postgres mode)
  sqlite: Database.Database | null;
  // Postgres pool client (null in sqlite mode)
  pg: PoolClient | null;
  // Postgres pool reference for helpers that need it
  pool: Pool | null;
  // Call when done (releases pg client; no-op for sqlite)
  release: () => void;
}

export async function getClient(): Promise<DbClient> {
  if (process.env.DATABASE_URL) {
    await ensurePgSchema();
    const pool = getPgPool();
    const client = await pool.connect();
    return {
      mode: 'postgres',
      sqlite: null,
      pg: client,
      pool,
      release: () => client.release(),
    };
  }
  return {
    mode: 'sqlite',
    sqlite: getDb(),
    pg: null,
    pool: null,
    release: () => { /* no-op */ },
  };
}
