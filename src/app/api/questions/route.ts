import { campaign, publicQuestions } from '@/lib/campaign';
import { json } from '@/lib/session';

export async function GET() {
  try {
    return json(publicQuestions(await campaign()));
  } catch {
    return json({ error: 'Banco de questões indisponível.' }, 503);
  }
}
