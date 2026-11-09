'use client';

import { useEffect, useState } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { LoginScreen } from '../components/LoginScreen';
import { QuizModal } from '../components/QuizModal';
import { DialogueModal } from '../components/DialogueModal';
import { EvidenceDossier } from '../components/EvidenceDossier';
import { FinalReportModal } from '../components/FinalReportModal';
import { AdminCrud } from '../components/AdminCrud';
import { Ranking } from '../components/Ranking';
import type { FinalEvaluation, Question, QuestionOption, PlayerStats, UserProfile } from '../types/game';
import type { InteractiveNode } from '../game/engine/tileMaps';
import { getQuestions, getRun, getSession, requestJson, submitAnswer } from '../lib/storage';
import { retroAudio } from '../lib/audio';

function allCorrect(questions: Question[], answers: PlayerStats['answers']) {
  return questions.length > 0 && questions.every(q => answers.some(answer => answer.questionId === q.id && answer.isCorrect));
}

function buildStats(questions: Question[], answers: PlayerStats['answers']): PlayerStats {
  const completedLevels = [1, 2].filter(level => allCorrect(questions.filter(q => q.levelNumber === level), answers));
  return {
    answers, completedLevels, visitedNodes: [],
    currentLevel: completedLevels.length + 1,
    score: answers.reduce((total, answer) => total + answer.pointsEarned, 0),
    maxScore: questions.reduce((total, q) => total + q.points, 0),
    evidences: questions.filter(q => answers.some(answer => answer.questionId === q.id && answer.isCorrect)).map(q => ({
      questionId: q.id, title: q.title, documentType: q.documentType, collectedAt: Date.now(),
      category: q.category, summary: q.scenario,
    })),
  };
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [report, setReport] = useState<FinalEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [dialogue, setDialogue] = useState<InteractiveNode | null>(null);
  const [showDossier, setShowDossier] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRanking, setShowRanking] = useState(false);

  async function load(currentUser?: UserProfile, openRanking = false) {
    setLoading(true);
    setError('');
    try {
      const profile = currentUser ?? (await getSession()).user;
      setUser(profile);
      if (profile?.role === 'PRACTICE' && openRanking) {
        setShowRanking(true);
      } else if (profile?.role === 'TEACHER') {
        setQuestions(await getQuestions());
      } else if (profile) {
        const run = await getRun();
        setQuestions(run.questions);
        setStats(buildStats(run.questions, run.answers));
        setReport(run.report);
      }
    } catch {
      setError('Não foi possível carregar o Audit Quest. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function logout() {
    try {
      await requestJson('/api/session', { method: 'DELETE' });
      window.location.reload();
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    }
  }

  if (loading || error) return (
    <main className="grid min-h-screen place-content-center gap-4 bg-slate-950 px-4 text-center text-amber-300">
      {loading ? <p role="status">Carregando Audit Quest…</p> : <>
        <p role="alert">{error}</p>
        <button className="underline" onClick={() => void load()}>Tentar novamente</button>
        {user && <button className="underline" onClick={() => void logout()}>Sair</button>}
      </>}
    </main>
  );

  if (!user) return <LoginScreen onLoginSuccess={(profile, openRanking) => void load(profile, openRanking)} />;

  if (user.role === 'TEACHER') return (
    <AdminCrud questions={questions} onQuestionsUpdated={setQuestions} onClose={() => void logout()} />
  );

  if (report && !showReport) return <Ranking finished onClose={() => void logout()} />;
  if (!stats) return showRanking ? <Ranking onClose={() => void logout()} /> : null;

  const canSubmit = allCorrect(questions, stats.answers);
  const handleAnswer = async (option: QuestionOption) => {
    if (!activeQuestion) throw new Error('Abra um terminal.');
    const answer = await submitAnswer(activeQuestion.id, option.id);
    setStats(previous => {
      if (!previous) return previous;
      const answers = [...previous.answers.filter(item => item.questionId !== answer.questionId), answer];
      return { ...buildStats(questions, answers), currentLevel: previous.currentLevel, completedLevels: previous.completedLevels };
    });
    return { ...option, id: answer.optionId, isCorrect: answer.isCorrect,
      explanation: answer.explanation, tip: answer.tip, pointsEarned: answer.pointsEarned };
  };

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <GameCanvas
        currentLevel={stats.currentLevel} stats={stats} questions={questions} user={user}
        audioEnabled={audioEnabled}
        isModalOpen={!!activeQuestion || !!dialogue || showDossier || showReport || showRanking}
        onToggleAudio={() => { retroAudio.enabled = !audioEnabled; setAudioEnabled(!audioEnabled); }}
        onTriggerQuestion={setActiveQuestion} onTriggerDialogue={setDialogue}
        onLevelComplete={nextLevel => {
          if (!allCorrect(questions.filter(q => q.levelNumber <= stats.currentLevel), stats.answers)) return;
          if (nextLevel > 3) {
            if (user.role === 'PRACTICE') setShowRanking(true);
            else setShowReport(true);
          }
          else setStats({ ...stats, currentLevel: nextLevel, completedLevels: Array.from(new Set([...stats.completedLevels, stats.currentLevel])) });
        }}
        onOpenDossier={() => setShowDossier(true)}
        onOpenRanking={() => setShowRanking(true)}
        onLogout={() => void logout()}
      />
      {activeQuestion && <QuizModal question={activeQuestion}
        isAlreadyAnswered={stats.answers.some(a => a.questionId === activeQuestion.id && a.isCorrect)}
        onAnswer={handleAnswer} onClose={() => setActiveQuestion(null)} />}
      {dialogue && <DialogueModal node={dialogue} onClose={() => setDialogue(null)} />}
      {showDossier && <EvidenceDossier stats={stats} questions={questions}
        onClose={() => setShowDossier(false)}
        onOpenFinalReport={canSubmit ? () => { setShowDossier(false); if (user.role === 'PRACTICE') setShowRanking(true); else setShowReport(true); } : undefined} />}
      {showReport && canSubmit && <FinalReportModal stats={stats} questions={questions}
        onClose={() => setShowReport(false)} onSubmitted={setReport} />}
      {showRanking && <Ranking onClose={() => setShowRanking(false)} />}
    </main>
  );
}
