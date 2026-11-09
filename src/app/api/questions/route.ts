import { NextResponse } from 'next/server';
import { INITIAL_QUESTIONS } from '@/data/defaultQuestions';
import { readRecords, writeRecords } from '@/lib/serverStore';
import { Question } from '@/types/game';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const saved = await readRecords<Question>('questions');
    return NextResponse.json(INITIAL_QUESTIONS.map(question =>
      saved.find(item => item.id === question.id) ?? question
    ));
  } catch {
    return NextResponse.json({ error: 'Banco de questões indisponível.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const question: Question | null = await request.json().catch(() => null);
  const original = INITIAL_QUESTIONS.find(item => item.id === question?.id);
  if (!original || !question
    || typeof question.title !== 'string' || !question.title.trim()
    || typeof question.prompt !== 'string' || !question.prompt.trim()
    || !Array.isArray(question.options) || question.options.length < 2
    || question.options.some(option => typeof option?.id !== 'string'
      || typeof option.text !== 'string' || !option.text.trim()
      || typeof option.isCorrect !== 'boolean')
    || new Set(question.options.map(option => option.id)).size !== question.options.length
    || question.options.filter(option => option.isCorrect).length !== 1) {
    return NextResponse.json({ error: 'Preencha o título, o enunciado e as alternativas e marque uma resposta correta.' }, { status: 400 });
  }

  const updated = {
    ...question,
    levelNumber: original.levelNumber,
    category: original.category,
    difficulty: original.difficulty,
    points: original.points,
  };

  try {
    await writeRecords('questions', [updated]);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Não foi possível salvar a questão compartilhada.' }, { status: 503 });
  }
}

export async function POST() {
  try {
    await writeRecords('questions', INITIAL_QUESTIONS);
    return NextResponse.json(INITIAL_QUESTIONS);
  } catch {
    return NextResponse.json({ error: 'Não foi possível restaurar as questões.' }, { status: 503 });
  }
}
