import type { FinalEvaluation, PlayerStats, Question, UserProfile } from '../types/game';

type Answer = PlayerStats['answers'][number] & { explanation: string; tip: string };
export type RankingEntry = { name: string; score: number; maxScore: number; own: boolean };

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'O servidor não conseguiu concluir a operação.');
  return body;
}

export function postJson<T>(path: string, body: unknown) {
  return requestJson<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const getSession = () => requestJson<{ user: UserProfile | null }>('/api/session');
export const getRun = () => requestJson<{ questions: Question[]; answers: Answer[]; report: FinalEvaluation | null }>('/api/answers');
export const getRanking = () => requestJson<RankingEntry[]>('/api/ranking');
export const submitAnswer = (questionId: string, optionId: string) => postJson<Answer>('/api/answers', { questionId, optionId });

export function saveEvaluation(regulatoryDecision: FinalEvaluation['regulatoryDecision'], studentRationale: string) {
  return postJson<FinalEvaluation>('/api/evaluations', { regulatoryDecision, studentRationale });
}
