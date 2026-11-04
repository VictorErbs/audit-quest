import { NextResponse } from 'next/server';
import { INITIAL_QUESTIONS } from '@/data/defaultQuestions';

// In-memory cache for serverless environments
let serverQuestions = [...INITIAL_QUESTIONS];

export async function GET() {
  return NextResponse.json(serverQuestions);
}

export async function POST(request: Request) {
  try {
    const question = await request.json();
    const index = serverQuestions.findIndex(q => q.id === question.id);
    if (index >= 0) {
      serverQuestions[index] = question;
    } else {
      serverQuestions.push(question);
    }
    return NextResponse.json({ success: true, questions: serverQuestions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      serverQuestions = serverQuestions.filter(q => q.id !== id);
    }
    return NextResponse.json({ success: true, questions: serverQuestions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 400 });
  }
}
