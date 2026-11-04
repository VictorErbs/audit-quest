import { Question, PlayerStats, UserProfile, FinalEvaluation } from '../types/game';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';

const QUESTIONS_KEY = 'audit_quest_questions_v3';
const STATS_KEY = 'audit_quest_stats_v3';
const USER_KEY = 'audit_quest_user_v3';
const EVALUATIONS_KEY = 'audit_quest_evaluations_v3';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  score: 0,
  maxScore: 1200,
  answers: [],
  evidences: [],
  currentLevel: 1,
  completedLevels: [],
  visitedNodes: [],
};

// ================= QUESTION CRUD =================
export function getQuestions(): Question[] {
  if (typeof window === 'undefined') return INITIAL_QUESTIONS;
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QUESTIONS;
  } catch (e) {
    console.error('Error loading questions:', e);
    return INITIAL_QUESTIONS;
  }
}

export function saveQuestion(question: Question): Question[] {
  const current = getQuestions();
  const index = current.findIndex(q => q.id === question.id);
  let updated: Question[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = question;
  } else {
    updated = [...current, question];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteQuestion(questionId: string): Question[] {
  const current = getQuestions();
  const updated = current.filter(q => q.id !== questionId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function resetQuestionsToDefault(): Question[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
  }
  return INITIAL_QUESTIONS;
}

// ================= PLAYER PROGRESS =================
export function getPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return INITIAL_PLAYER_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return INITIAL_PLAYER_STATS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PLAYER_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
}

export function resetPlayerStats(): PlayerStats {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STATS_KEY, JSON.stringify(INITIAL_PLAYER_STATS));
  }
  return INITIAL_PLAYER_STATS;
}

// ================= USER PROFILE & AUTH =================
export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }
}

// ================= FINAL EVALUATIONS / REPORTS =================
export function getEvaluations(): FinalEvaluation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVALUATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEvaluation(evaluation: FinalEvaluation): void {
  if (typeof window === 'undefined') return;
  const current = getEvaluations();
  const updated = [evaluation, ...current.filter(e => e.id !== evaluation.id)];
  localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(updated));

  // Sync to API route asynchronously for teacher/server access
  try {
    fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}
