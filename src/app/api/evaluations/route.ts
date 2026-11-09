import { NextResponse } from 'next/server';
import { readRecords, writeRecords } from '@/lib/serverStore';
import { FinalEvaluation } from '@/types/game';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const evaluations = await readRecords<FinalEvaluation>('evaluations');
    return NextResponse.json(evaluations.sort((a, b) => b.submittedAt - a.submittedAt));
  } catch {
    return NextResponse.json({ error: 'Relatórios compartilhados indisponíveis.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const evaluation: FinalEvaluation | null = await request.json().catch(() => null);
  if (!evaluation?.id || !evaluation.userId || !evaluation.userName || !evaluation.categoryBreakdown
    || !Number.isFinite(evaluation.submittedAt)) {
    return NextResponse.json({ error: 'Relatório inválido.' }, { status: 400 });
  }

  try {
    await writeRecords('evaluations', [evaluation]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível arquivar o relatório.' }, { status: 503 });
  }
}
