import { INITIAL_QUESTIONS } from '@/data/defaultQuestions';
import type { Question, FinalEvaluation, PlayerStats } from '@/types/game';
import { readRecord } from './serverStore';

export type Answer = PlayerStats['answers'][number] & { explanation: string; tip: string };
export interface Run {
  questions: Question[];
  answers: Answer[];
  report?: FinalEvaluation;
}

export async function campaign() {
  const saved = await readRecord<Question[]>('questions');
  return INITIAL_QUESTIONS.map(question => saved?.find(item => item.id === question.id) ?? question);
}

export function publicQuestions(questions: Question[]) {
  return questions.map(({ didacticTip, options, ...question }) => ({
    ...question,
    didacticTip: '',
    options: options.map(({ id, text }) => ({ id, text, isCorrect: false, explanation: '' })),
  }));
}

export function progress(run: Run | null) {
  return { answers: run?.answers ?? [], report: run?.report ?? null };
}

export const decisions = ['REGULAR', 'ADVERTENCIA', 'TERMO_AJUSTAMENTO', 'MULTA_PESADA', 'CASSAÇÃO_REGISTRO'] as const;

export function rankTitle(percentage: number) {
  if (percentage >= 85) return 'Inspetor Regulador Chefe (Nível CVM/CFC)';
  if (percentage >= 60) return 'Auditor Fiscal Sênior';
  if (percentage >= 40) return 'Auditor Fiscal Pleno';
  return 'Fiscal Contábil Trainee';
}
