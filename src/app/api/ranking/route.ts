import { listReports } from '@/lib/serverStore';
import { getSession, json } from '@/lib/session';
import type { FinalEvaluation } from '@/types/game';

export async function GET(request: Request) {
  const user = getSession(request);
  if (!user) return json({ error: 'Entre na sua conta.' }, 401);
  try {
    const best: FinalEvaluation[] = [];
    const order = (a: FinalEvaluation, b: FinalEvaluation) =>
      b.totalScore - a.totalScore || a.submittedAt - b.submittedAt || a.id.localeCompare(b.id);
    let cursor: string | undefined;
    do {
      const page = await listReports<FinalEvaluation>(cursor);
      best.push(...page.records);
      best.sort(order);
      best.splice(50);
      cursor = page.cursor;
    } while (cursor);
    return json(best.map(({ userId, userName, totalScore, maxScore }) =>
      ({ name: userName, score: totalScore, maxScore, own: userId === user.id })));
  } catch {
    return json({ error: 'Ranking indisponível.' }, 503);
  }
}
