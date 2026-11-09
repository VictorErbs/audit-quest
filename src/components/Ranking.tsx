'use client';

import { useEffect, useState } from 'react';
import { getRanking, type RankingEntry } from '../lib/storage';

export function Ranking({ onClose, finished = false }: { onClose: () => void; finished?: boolean }) {
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getRanking().then(rows => { if (active) setEntries(rows); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/95 p-5 text-white">
      <section className="mx-auto max-w-xl space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h1 className="font-pixel text-lg text-amber-300">Ranking</h1>
        {finished && <p>Sua partida foi concluída. O resultado está registrado e a matrícula não pode jogar novamente.</p>}
        <p className="text-xs text-slate-300">Até 50 melhores notas. Em caso de empate, vale quem concluiu primeiro.</p>
        {error ? <p role="alert">Não foi possível carregar o ranking. <button className="underline" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Tentar novamente</button></p>
          : !entries ? <p role="status">Carregando…</p>
          : entries.length === 0 ? <p>Nenhuma partida concluída.</p>
          : <ol className="space-y-2">{entries.map((entry, index) => (
            <li key={index} className={`flex justify-between gap-3 rounded px-3 py-2 ${entry.own ? 'bg-amber-900 text-amber-100' : 'bg-slate-800'}`}>
              <span className="break-all">{index + 1}. {entry.name}{entry.own ? ' (você)' : ''}</span>
              <span className="shrink-0 font-mono">{entry.score}/{entry.maxScore}</span>
            </li>
          ))}</ol>}
        <button className="rounded bg-slate-700 px-4 py-2" onClick={onClose}>{finished ? 'Sair' : 'Voltar'}</button>
      </section>
    </div>
  );
}
