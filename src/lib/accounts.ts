import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readRecord, updateRecord } from './serverStore';

const derive = promisify(scrypt);
interface Account { name: string; email: string; salt: string; hash: string }

export async function register(id: string, name: string, email: string, password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await derive(password, salt, 64) as Buffer).toString('hex');
  const account = { name, email, salt, hash };
  const result = await updateRecord<Account>(`accounts/${id}`, existing => existing ?? account);
  return result.hash === hash;
}

export async function login(id: string, password: string) {
  const account = await readRecord<Account>(`accounts/${id}`);
  const candidate = await derive(password, account?.salt ?? 'audit-quest-no-account', 64) as Buffer;
  if (!account || !timingSafeEqual(candidate, Buffer.from(account.hash, 'hex'))) return null;
  return { id: `student-${id}`, name: account.name, email: account.email, role: 'STUDENT' as const, createdAt: Date.now() };
}
