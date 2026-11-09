'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { postJson } from '../lib/storage';
import type { UserProfile } from '../types/game';

type Action = 'login' | 'register' | 'practice';

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (user: UserProfile, openRanking: boolean) => void }) {
  const [action, setAction] = useState<Action>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const openRanking = action === 'practice' && button?.value === 'ranking';
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const { user } = await postJson<{ user: UserProfile }>('/api/session', {
        action, name: form.get('name'), email: form.get('email'),
        registration: form.get('registration'), password: form.get('password'),
      });
      onLoginSuccess(user, openRanking);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  const field = 'mt-1 block w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-white';
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-md space-y-5 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-pixel">
        <Shield className="mx-auto text-amber-400" size={38} aria-hidden />
        <h1 className="text-center font-pixel text-lg text-amber-300">Audit Quest</h1>
        <p className="text-center text-sm text-slate-300">Operação Transparência</p>
        <div className="flex flex-wrap justify-center gap-3 text-sm" aria-label="Tipo de acesso">
          {([['login', 'Entrar'], ['register', 'Criar conta'], ['practice', 'Professor']] as const).map(([value, label]) => (
            <button key={value} type="button" disabled={busy} aria-pressed={action === value}
              onClick={() => { setAction(value); setError(''); }}
              className={action === value ? 'font-bold text-amber-300 underline' : 'text-slate-300'}>
              {label}
            </button>
          ))}
        </div>
        <form key={action} onSubmit={submit} className="space-y-4">
          {(action === 'register' || action === 'practice') && <>
            <label className="block text-sm">Nome<input className={field} name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
            {action === 'register' && <label className="block text-sm">E-mail<input className={field} name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
          </>}
          {action !== 'practice' && <label className="block text-sm">Matrícula<input className={field} name="registration" autoComplete="username" pattern="[A-Za-z0-9_\-]+" maxLength={64} required /></label>}
          {action !== 'practice' && <label className="block text-sm">Senha
            <input className={field} name="password" type="password" autoComplete={action === 'register' ? 'new-password' : 'current-password'} minLength={10} maxLength={128} required />
          </label>}
          {action === 'register' && <p className="text-xs text-slate-300">Cada matrícula tem uma partida. Ao concluir, seu nome e sua pontuação aparecem no ranking para usuários logados.</p>}
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button disabled={busy} className="w-full rounded bg-amber-400 px-4 py-2 font-bold text-slate-950 disabled:opacity-50">
            {busy ? 'Aguarde…' : action === 'register' ? 'Criar conta e jogar' : action === 'practice' ? 'Jogar' : 'Entrar'}
          </button>
          {action === 'practice' && (
            <button type="submit" value="ranking" disabled={busy} className="w-full rounded border border-slate-500 px-4 py-2 font-bold text-amber-300 disabled:opacity-50">
              Ver ranking geral
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
