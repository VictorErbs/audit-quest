import { BlobPreconditionFailedError, get, list, put } from '@vercel/blob';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const localWrites = new Map<string, Promise<unknown>>();

function useBlob() {
  return Boolean(process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function pathname(key: string) {
  return `audit-quest/${process.env.VERCEL_ENV ?? 'development'}/${key}.json`;
}

function localPath(key: string) {
  return join(process.cwd(), '.audit-quest-data', 'v4', `${key}.json`);
}

function isMissing(error: unknown) {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

async function read<T>(key: string): Promise<{ value: T; etag?: string } | null> {
  if (useBlob()) {
    const result = await get(pathname(key), { access: 'private', useCache: false });
    if (!result) return null;
    if (result.statusCode !== 200) throw new Error('Resposta inesperada do Blob.');
    // Compressed downloads can return a weak ETag. Blob writes require the strong tag.
    const etag = result.blob.etag.replace(/^W\//, '');
    return { value: await new Response(result.stream).json() as T, etag };
  }
  try {
    return { value: JSON.parse(await readFile(localPath(key), 'utf8')) as T };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

export async function readRecord<T>(key: string): Promise<T | null> {
  return (await read<T>(key))?.value ?? null;
}

export async function updateRecord<T>(key: string, update: (value: T | null) => T): Promise<T> {
  if (useBlob()) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await read<T>(key);
      const next = update(current?.value ?? null);
      if (current && next === current.value) return next;
      try {
        await put(pathname(key), JSON.stringify(next), {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: Boolean(current),
          ifMatch: current?.etag,
        });
        return next;
      } catch (error) {
        // A simultaneous first write may create the pathname before this request.
        if (!(error instanceof BlobPreconditionFailedError) &&
          (current || !(await read<T>(key)))) throw error;
      }
    }
    throw new Error('O registro está ocupado. Tente novamente.');
  }

  const pending = (localWrites.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
    const current = await readRecord<T>(key);
    const next = update(current);
    if (next === current) return next;
    const file = localPath(key);
    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(next), { mode: 0o600 });
    await rename(temporary, file);
    return next;
  });
  localWrites.set(key, pending);
  try {
    return await pending;
  } finally {
    if (localWrites.get(key) === pending) localWrites.delete(key);
  }
}

export async function listReports<T extends object>(cursor?: string): Promise<{ records: T[]; cursor?: string }> {
  if (useBlob()) {
    const page = await list({ prefix: pathname('reports/').replace(/\.json$/, ''), limit: 25, cursor });
    const records = await Promise.all(page.blobs.map(async blob => {
      const result = await get(blob.pathname, { access: 'private', useCache: false });
      return result?.statusCode === 200 ? await new Response(result.stream).json() as T : null;
    }));
    return { records: records.flatMap(record => record === null ? [] : [record]), cursor: page.cursor };
  }
  let files: string[];
  try {
    files = await readdir(join(process.cwd(), '.audit-quest-data', 'v4', 'reports'));
  } catch (error) {
    if (isMissing(error)) return { records: [] as T[], cursor: undefined };
    throw error;
  }
  const start = cursor ? Number(cursor) : 0;
  const paths = files.filter(file => file.endsWith('.json')).sort();
  const records = await Promise.all(paths.slice(start, start + 25).map(file => readRecord<T>(`reports/${file.slice(0, -5)}`)));
  return { records: records.flatMap(record => record === null ? [] : [record]), cursor: start + 25 < paths.length ? String(start + 25) : undefined };
}
