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

export const getQuestions = () => requestJson<Question[]>('/api/questions');
export const resetQuestionsToDefault = () => postJson<Question[]>('/api/questions', {});
export const getSession = () => requestJson<{ user: UserProfile | null }>('/api/session');
export const getRun = () => requestJson<{ questions: Question[]; answers: Answer[]; report: FinalEvaluation | null }>('/api/answers');
export const getRanking = () => requestJson<RankingEntry[]>('/api/ranking');
export const submitAnswer = (questionId: string, optionId: string) => postJson<Answer>('/api/answers', { questionId, optionId });

export function saveQuestion(question: Question) {
  return requestJson<Question>('/api/questions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question),
  });
}

export async function getSharedEvaluations() {
  const records: FinalEvaluation[] = [];
  let cursor: string | undefined;
  do {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    const page = await requestJson<{ records: FinalEvaluation[]; cursor?: string }>(`/api/evaluations${query}`);
    records.push(...page.records);
    cursor = page.cursor;
  } while (cursor);
  return records.sort((a, b) => b.submittedAt - a.submittedAt);
}

export function saveEvaluation(regulatoryDecision: FinalEvaluation['regulatoryDecision'], studentRationale: string) {
  return postJson<FinalEvaluation>('/api/evaluations', { regulatoryDecision, studentRationale });
}
