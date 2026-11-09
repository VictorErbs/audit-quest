export type Category = 
  | 'CONCENTRACAO' 
  | 'DIVULGACAO' 
  | 'RESISTENCIA_RISCO';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Question {
  id: string;
  category: Category;
  levelNumber: number; // 1: Fácil, 2: Médio, 3: Difícil
  difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL';
  title: string;
  scenario: string; // The contextual case extracted directly from item 4.10
  documentType: 'RELATORIO' | 'PARECER' | 'PLANILHA' | 'MEMORANDO' | 'DOSSIE';
  prompt: string;
  options: QuestionOption[];
  normReference: string; // "Item 4.10 — Transparência de auditorias está no foco de reguladores (contabil.pdf)"
  didacticTip: string;
  points: number;
}

export interface Evidence {
  questionId: string;
  title: string;
  documentType: string;
  collectedAt: number;
  category: Category;
  summary: string;
}

export interface PlayerStats {
  runId?: string;
  score: number;
  maxScore: number;
  answers: {
    questionId: string;
    optionId: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
  evidences: Evidence[];
  currentLevel: number; // 1, 2, 3
  completedLevels: number[];
  visitedNodes: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'GUEST';
  createdAt: number;
}

export interface FinalEvaluation {
  id: string;
  userId: string;
  userName: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  rankTitle: string;
  regulatoryDecision: 'REGULAR' | 'ADVERTENCIA' | 'TERMO_AJUSTAMENTO' | 'MULTA_PESADA' | 'CASSAÇÃO_REGISTRO';
  studentRationale: string;
  categoryBreakdown: Record<Category, { correct: number; total: number; score: number }>;
  submittedAt: number;
}
