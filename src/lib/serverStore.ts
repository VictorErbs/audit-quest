import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

type Collection = 'questions' | 'evaluations';

async function redis(command: string[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Configure as credenciais do Redis.');

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  const { result, error } = await response.json();
  if (!response.ok || error) throw new Error('Falha ao acessar o Redis.');
  return result;
}

function usesRedis() {
  return Boolean(process.env.VERCEL || process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN);
}

function localFile(collection: Collection) {
  return join(process.cwd(), '.audit-quest-data', `${collection}.json`);
}

function readLocal(collection: Collection): Record<string, string> {
  try {
    return JSON.parse(readFileSync(localFile(collection), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

export async function readRecords<T>(collection: Collection): Promise<T[]> {
  const values = usesRedis()
    ? await redis(['HVALS', `audit-quest:${collection}`]) as string[]
    : Object.values(readLocal(collection));
  return values.map(value => JSON.parse(value) as T);
}

export async function writeRecords<T extends { id: string }>(collection: Collection, records: T[]) {
  const entries = records.map(record => [record.id, JSON.stringify(record)]);
  if (usesRedis()) {
    await redis(['HSET', `audit-quest:${collection}`, ...entries.flat()]);
    return;
  }

  mkdirSync(join(process.cwd(), '.audit-quest-data'), { recursive: true });
  const path = localFile(collection);
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify({ ...readLocal(collection), ...Object.fromEntries(entries) }));
  renameSync(temporaryPath, path);
}
