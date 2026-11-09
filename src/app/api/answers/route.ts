import { campaign, progress, publicQuestions, type Run } from '@/lib/campaign';
import { getSession, json } from '@/lib/session';
import { readRecord, updateRecord } from '@/lib/serverStore';

export async function GET(request: Request) {
  const user = getSession(request);
  if (!user) return json({ error: 'Entre na sua conta.' }, 401);
  try {
    const run = await readRecord<Run>(`runs/${user.id}`);
    if (run?.report) {
      const report = run.report;
      await updateRecord(`reports/${user.id}`, existing => existing ?? report);
    }
    return json({ ...progress(run), questions: publicQuestions(run?.questions ?? await campaign()) });
  } catch {
    return json({ error: 'Partida indisponível.' }, 503);
  }
}

export async function POST(request: Request) {
  const user = getSession(request);
  if (!user) return json({ error: 'Entre na sua conta.' }, 401);
  const body = await request.json().catch(() => null);
  if (typeof body?.questionId !== 'string' || typeof body.optionId !== 'string' ||
      body.questionId.length > 80 || body.optionId.length > 80) return json({ error: 'Resposta inválida.' }, 400);

  const key = `runs/${user.id}`;
  try {
    const initial: Run = { questions: await campaign(), answers: [] };
    const run = await updateRecord<Run>(key, current => {
      const state = current ?? initial;
      if (state.report) return state;
      const question = state.questions.find(item => item.id === body.questionId);
      const option = question?.options.find(item => item.id === body.optionId);
      if (!question || !option) return state;
      if (user.role !== 'PRACTICE' && state.questions.some(item => item.levelNumber < question.levelNumber &&
          !state.answers.some(answer => answer.questionId === item.id && answer.isCorrect))) return state;
      const previous = state.answers.find(answer => answer.questionId === question.id);
      if (previous?.isCorrect || previous?.optionId === option.id) return state;
      const pointsEarned = option.isCorrect ? (previous ? Math.round(question.points / 2) : question.points) : 0;
      return { ...state, answers: [...state.answers.filter(answer => answer.questionId !== question.id), {
        questionId: question.id, optionId: option.id, isCorrect: option.isCorrect,
        pointsEarned, explanation: option.explanation, tip: question.didacticTip,
      }] };
    });
    if (run.report) return json({ error: 'Sua partida já foi concluída.' }, 409);
    const answer = run.answers.find(item => item.questionId === body.questionId);
    if (!answer) return json({ error: 'Questão bloqueada ou alternativa inválida.' }, 400);
    return json(answer);
  } catch (error) {
    console.error('Falha ao salvar resposta', error instanceof Error ? error.name : 'Erro desconhecido');
    return json({ error: 'Não foi possível registrar a resposta. Tente novamente.' }, 503);
  }
}
