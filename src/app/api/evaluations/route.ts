import { decisions, rankTitle, type Run } from '@/lib/campaign';
import { getSession, json } from '@/lib/session';
import { updateRecord } from '@/lib/serverStore';
import type { FinalEvaluation } from '@/types/game';

export async function POST(request: Request) {
  const user = getSession(request);
  if (user?.role !== 'STUDENT') return json({ error: 'Apenas alunos podem registrar resultados.' }, 403);
  const body = await request.json().catch(() => null);
  const rationale = typeof body?.studentRationale === 'string' ? body.studentRationale.trim() : '';
  if (!decisions.includes(body?.regulatoryDecision) || !rationale || rationale.length > 4000) {
    return json({ error: 'Informe a decisão e uma justificativa de até 4.000 caracteres.' }, 400);
  }
  try {
    const run = await updateRecord<Run | null>(`runs/${user.id}`, current => {
      if (!current || current.report || !current.questions.every(q =>
        current.answers.some(answer => answer.questionId === q.id && answer.isCorrect))) return current;
      const categoryBreakdown: FinalEvaluation['categoryBreakdown'] = {
        CONCENTRACAO: { correct: 0, total: 0, score: 0 },
        DIVULGACAO: { correct: 0, total: 0, score: 0 },
        RESISTENCIA_RISCO: { correct: 0, total: 0, score: 0 },
      };
      for (const q of current.questions) {
        const category = categoryBreakdown[q.category];
        category.total++;
        category.correct++;
        category.score += current.answers.find(answer => answer.questionId === q.id)!.pointsEarned;
      }
      const maxScore = current.questions.reduce((total, q) => total + q.points, 0);
      const totalScore = current.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
      const percentage = Math.round(totalScore / maxScore * 100);
      const report: FinalEvaluation = {
        id: user.id, userId: user.id, userName: user.name, maxScore, totalScore, percentage,
        rankTitle: rankTitle(percentage), regulatoryDecision: body.regulatoryDecision,
        studentRationale: rationale, categoryBreakdown, submittedAt: Date.now(),
      };
      return { ...current, report };
    });
    if (!run?.report) return json({ error: 'Conclua todas as questões antes de enviar o parecer.' }, 409);
    const report = run.report;
    await updateRecord<FinalEvaluation>(`reports/${user.id}`, existing => existing ?? report);
    return json(report);
  } catch {
    return json({ error: 'Falha ao arquivar o parecer. Tente novamente.' }, 503);
  }
}
