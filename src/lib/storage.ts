import { Question, PlayerStats, UserProfile, FinalEvaluation } from '../types/game';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';

const STATS_KEY = 'audit_quest_stats_v3';
const USER_KEY = 'audit_quest_user_v3';
const EVALUATIONS_KEY = 'audit_quest_evaluations_v3';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  score: 0,
  maxScore: INITIAL_QUESTIONS.reduce((total, question) => total + question.points, 0),
  answers: [],
  evidences: [],
  currentLevel: 1,
  completedLevels: [],
  visitedNodes: [],
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'O servidor não conseguiu concluir a operação.');
  return body;
}

export function getQuestions(): Promise<Question[]> {
  return requestJson('/api/questions');
}

export function saveQuestion(question: Question): Promise<Question> {
  return requestJson('/api/questions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question),
  });
}

export function resetQuestionsToDefault(): Promise<Question[]> {
  return requestJson('/api/questions', { method: 'POST' });
}

export function getPlayerStats(userId: string, migrateLegacy = false): PlayerStats {
  try {
    const key = `${STATS_KEY}:${userId}`;
    const raw = localStorage.getItem(key) ?? (migrateLegacy ? localStorage.getItem(STATS_KEY) : null);
    const previous: PlayerStats = raw ? JSON.parse(raw) : INITIAL_PLAYER_STATS;
    const answers = INITIAL_QUESTIONS.flatMap(question => {
      const answer = previous.answers.find(item => item.questionId === question.id);
      return answer ? [{ ...answer, pointsEarned: Math.min(answer.pointsEarned, question.points) }] : [];
    });
    const completedLevels = previous.completedLevels.filter(level =>
      INITIAL_QUESTIONS.filter(question => question.levelNumber <= level)
        .every(question => answers.some(answer => answer.questionId === question.id && answer.isCorrect))
    );
    const stats = {
      ...previous,
      runId: previous.runId ?? crypto.randomUUID(),
      answers,
      completedLevels,
      currentLevel: Math.min(previous.currentLevel, completedLevels.includes(2) ? 3 : completedLevels.includes(1) ? 2 : 1),
      maxScore: INITIAL_PLAYER_STATS.maxScore,
      score: answers.reduce((total, answer) => total + answer.pointsEarned, 0),
    };
    savePlayerStats(userId, stats);
    if (migrateLegacy) localStorage.removeItem(STATS_KEY);
    return stats;
  } catch {
    return { ...INITIAL_PLAYER_STATS, runId: crypto.randomUUID() };
  }
}

export function savePlayerStats(userId: string, stats: PlayerStats): void {
  localStorage.setItem(`${STATS_KEY}:${userId}`, JSON.stringify(stats));
}

export function resetPlayerStats(userId: string): PlayerStats {
  const fresh = { ...INITIAL_PLAYER_STATS, runId: crypto.randomUUID() };
  savePlayerStats(userId, fresh);
  return fresh;
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STATS_KEY);
  }
}

export function getEvaluations(): FinalEvaluation[] {
  try {
    const raw = localStorage.getItem(EVALUATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSharedEvaluations(): Promise<FinalEvaluation[]> {
  return requestJson('/api/evaluations');
}

export async function saveEvaluation(evaluation: FinalEvaluation): Promise<void> {
  await requestJson('/api/evaluations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evaluation),
  });
}
