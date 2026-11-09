import { clearSession, getSession, json, matches, setSession } from '@/lib/session';
import { login, register } from '@/lib/accounts';

export async function GET(request: Request) {
  return json({ user: getSession(request) });
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return json({ error: 'Envie credenciais em JSON.' }, 415);
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== 'string' || body.password.length > 128) {
    return json({ error: 'Credenciais inválidas.' }, 400);
  }
  try {
    if (body.action === 'teacher') {
      return matches(body.password, process.env.AUDIT_TEACHER_CODE)
        ? setSession({ id: 'teacher', role: 'TEACHER', name: 'Professor', email: '', createdAt: Date.now() })
        : json({ error: 'Código inválido.' }, 401);
    }
    const id = typeof body.registration === 'string' ? body.registration.trim().toLowerCase() : '';
    if (!/^[a-z0-9_-]{1,64}$/.test(id) || body.password.length < 10) {
      return json({ error: 'Informe a matrícula e uma senha de pelo menos 10 caracteres.' }, 400);
    }
    if (body.action === 'register') {
      if (!process.env.AUDIT_SESSION_SECRET || process.env.AUDIT_SESSION_SECRET.length < 32) {
        return json({ error: 'Cadastro temporariamente indisponível.' }, 503);
      }
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Informe um nome e um e-mail válidos.' }, 400);
      }
      if (process.env.AUDIT_ROSTER_JSON) {
        const roster = JSON.parse(process.env.AUDIT_ROSTER_JSON);
        if (!Object.hasOwn(roster, id) || roster[id] !== email) {
          return json({ error: 'Matrícula e e-mail não constam na lista da turma.' }, 403);
        }
      }
      if (!await register(id, name, email, body.password)) {
        return json({ error: 'Esta matrícula já está cadastrada. Entre com a conta existente.' }, 409);
      }
    } else if (body.action !== 'login') {
      return json({ error: 'Ação inválida.' }, 400);
    }
    const user = await login(id, body.password);
    return user ? setSession(user) : json({ error: 'Matrícula ou senha inválida.' }, 401);
  } catch {
    return json({ error: 'Acesso temporariamente indisponível.' }, 503);
  }
}

export async function DELETE() {
  return clearSession();
}
