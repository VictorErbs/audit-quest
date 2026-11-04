import { NextResponse } from 'next/server';
import { FinalEvaluation } from '@/types/game';

let serverEvaluations: FinalEvaluation[] = [];

export async function GET() {
  return NextResponse.json(serverEvaluations);
}

export async function POST(request: Request) {
  try {
    const evalData: FinalEvaluation = await request.json();
    serverEvaluations.unshift(evalData);
    return NextResponse.json({ success: true, count: serverEvaluations.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
