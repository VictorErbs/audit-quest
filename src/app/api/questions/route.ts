import { campaign, publicQuestions } from '@/lib/campaign';
import { getSession, json } from '@/lib/session';
import { INITIAL_QUESTIONS } from '@/data/defaultQuestions';
import { updateRecord } from '@/lib/serverStore';
import type { Question } from '@/types/game';

export async function GET(request: Request) {
  try {
    const questions = await campaign();
    return json(getSession(request)?.role === 'TEACHER' ? questions : publicQuestions(questions));
  } catch {
    return json({ error: 'Banco de questões indisponível.' }, 503);
  }
}

function text(value: unknown, limit: number): value is string {
  return typeof value === 'string' && value.length <= limit;
}

export async function PUT(request: Request) {
  if (getSession(request)?.role !== 'TEACHER') return json({ error: 'Acesso restrito a professores.' }, 403);
  const q = await request.json().catch(() => null);
  const original = INITIAL_QUESTIONS.find(item => item.id === q?.id);
  if (!original || !text(q.title, 160) || !q.title.trim() || !text(q.prompt, 5000) || !q.prompt.trim() ||
      !text(q.scenario, 3000) || !text(q.normReference, 500) || !text(q.didacticTip, 1500) ||
      !['RELATORIO', 'PARECER', 'PLANILHA', 'MEMORANDO', 'DOSSIE'].includes(q.documentType) ||
      !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8 ||
      q.options.some((option: Question['options'][number]) => !text(option?.id, 80) || !option.id ||
        !text(option.text, 2000) || !option.text.trim() || typeof option.isCorrect !== 'boolean' || !text(option.explanation, 2000)) ||
      new Set(q.options.map((option: Question['options'][number]) => option.id)).size !== q.options.length ||
      q.options.filter((option: Question['options'][number]) => option.isCorrect).length !== 1) {
    return json({ error: 'Preencha os campos e marque uma única alternativa correta.' }, 400);
  }
  const { title, prompt, scenario, normReference, didacticTip, documentType, options } = q;
  const updated: Question = { ...original, title, prompt, scenario, normReference, didacticTip, documentType,
    options: options.map(({ id, text, isCorrect, explanation }: Question['options'][number]) => ({ id, text, isCorrect, explanation })) };
  try {
    await updateRecord<Question[]>('questions', existing => (existing ?? []).filter(item => item.id !== updated.id).concat(updated));
    return json(updated);
  } catch {
    return json({ error: 'Não foi possível salvar a questão.' }, 503);
  }
}

export async function POST(request: Request) {
  if (getSession(request)?.role !== 'TEACHER') return json({ error: 'Acesso restrito a professores.' }, 403);
  try {
    await updateRecord<Question[]>('questions', () => []);
    return json(INITIAL_QUESTIONS);
  } catch {
    return json({ error: 'Não foi possível restaurar as questões.' }, 503);
  }
}
