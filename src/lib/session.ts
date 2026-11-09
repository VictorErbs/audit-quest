import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/types/game';

const cookie = 'audit_session';
const lifetime = 60 * 60 * 12;

function secret() {
  const key = process.env.AUDIT_SESSION_SECRET;
  return key && key.length >= 32 ? key : null;
}

function hash(value: string) {
  return createHash('sha256').update(value).digest();
}

export function matches(value: string, expected: string | undefined) {
  return Boolean(expected && expected.length >= 16 && timingSafeEqual(hash(value), hash(expected)));
}

export function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function getSession(request: Request): UserProfile | null {
  const key = secret();
  const token = request.headers.get('cookie')?.split(/;\s*/).find(entry => entry.startsWith(`${cookie}=`))?.slice(cookie.length + 1);
  if (!key || !token || token.length > 2048) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', key).update(payload).digest('base64url');
  if (!matches(signature, expected)) return null;
  try {
    const { user, expires } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return expires > Date.now() ? user : null;
  } catch {
    return null;
  }
}

export function setSession(user: UserProfile) {
  const key = secret();
  if (!key) return json({ error: 'Configure AUDIT_SESSION_SECRET (mínimo de 32 caracteres).' }, 503);
  const payload = Buffer.from(JSON.stringify({ user, expires: Date.now() + lifetime * 1000 })).toString('base64url');
  const signature = createHmac('sha256', key).update(payload).digest('base64url');
  const response = json({ user });
  response.cookies.set(cookie, `${payload}.${signature}`, { httpOnly: true, secure: Boolean(process.env.VERCEL), sameSite: 'strict', path: '/', maxAge: lifetime });
  return response;
}

export function clearSession() {
  const response = json({ user: null });
  response.cookies.set(cookie, '', { httpOnly: true, secure: Boolean(process.env.VERCEL), sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
