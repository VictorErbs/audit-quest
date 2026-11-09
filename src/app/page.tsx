'use client';

import React, { useState, useEffect } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { LoginScreen } from '../components/LoginScreen';
import { QuizModal } from '../components/QuizModal';
import { DialogueModal } from '../components/DialogueModal';
import { EvidenceDossier } from '../components/EvidenceDossier';
import { FinalReportModal } from '../components/FinalReportModal';
import { AdminCrud } from '../components/AdminCrud';

import { Question, QuestionOption, PlayerStats, UserProfile } from '../types/game';
import { InteractiveNode, MAPS } from '../game/engine/tileMaps';
import {
  getQuestions,
  INITIAL_PLAYER_STATS,
  getPlayerStats,
  savePlayerStats,
  resetPlayerStats,
  getCurrentUser,
  setCurrentUser,
} from '../lib/storage';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';
import { retroAudio } from '../lib/audio';

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [savedStats, setSavedStats] = useState<PlayerStats | null>(null);
  const [devStats, setDevStats] = useState<PlayerStats | null>(null);
  const [questionsOffline, setQuestionsOffline] = useState(false);
  const stats = devStats ?? savedStats;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Active Modals
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeDialogueNode, setActiveDialogueNode] = useState<InteractiveNode | null>(null);
  const [showDossier, setShowDossier] = useState(false);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [showAdminCrud, setShowAdminCrud] = useState(false);

  // Load state on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) setSavedStats(getPlayerStats(currentUser.id, true));
    getQuestions()
      .then(setQuestions)
      .catch(() => setQuestionsOffline(true))
      .finally(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-amber-400 font-pixel text-sm">
        Carregando Audit Quest...
      </div>
    );
  }

  // FIRST: If no user is logged in, show the full login screen!
  if (!user || !stats) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={(newUser) => {
            setSavedStats(getPlayerStats(newUser.id));
            setUser(newUser);
          }}
          onOpenAdmin={() => setShowAdminCrud(true)}
        />
        {showAdminCrud && (
          <AdminCrud
            questions={questions}
            onQuestionsUpdated={(updated) => { setQuestions(updated); setQuestionsOffline(false); }}
            onClose={() => setShowAdminCrud(false)}
          />
        )}
      </>
    );
  }

  const canSubmitReport = !devStats && stats.completedLevels.includes(3)
    && questions.every(q => stats.answers.some(answer => answer.questionId === q.id && answer.isCorrect));

  const updateStats = (updated: PlayerStats) => {
    if (devStats) {
      setDevStats(updated);
    } else {
      setSavedStats(updated);
      savePlayerStats(user.id, updated);
    }
  };

  // Answer handler with retry support for learning & unlocking doors
  const handleAnswerQuestion = (option: QuestionOption) => {
    if (!activeQuestion) return;

    const existingIdx = stats.answers.findIndex(a => a.questionId === activeQuestion.id);
    const prevAnswer = existingIdx >= 0 ? stats.answers[existingIdx] : null;

    // If already correctly answered, no need to overwrite
    if (prevAnswer && prevAnswer.isCorrect) return;

    // Award points (full points on first attempt; 50% on retry to encourage learning)
    const basePoints = prevAnswer ? Math.round(activeQuestion.points * 0.5) : activeQuestion.points;
    const pointsEarned = option.isCorrect ? basePoints : 0;

    const newAnswerObj = {
      questionId: activeQuestion.id,
      optionId: option.id,
      isCorrect: option.isCorrect,
      pointsEarned,
    };

    let newAnswers = [...stats.answers];
    if (existingIdx >= 0) {
      newAnswers[existingIdx] = newAnswerObj;
    } else {
      newAnswers.push(newAnswerObj);
    }

    const alreadyHasEvidence = stats.evidences.some(e => e.questionId === activeQuestion.id);
    const newEvidences = (option.isCorrect && !alreadyHasEvidence)
      ? [
          ...stats.evidences,
          {
            questionId: activeQuestion.id,
            title: activeQuestion.title,
            documentType: activeQuestion.documentType,
            collectedAt: Date.now(),
            category: activeQuestion.category,
            summary: activeQuestion.scenario,
          },
        ]
      : stats.evidences;

    const updatedStats: PlayerStats = {
      ...stats,
      score: stats.score + pointsEarned,
      answers: newAnswers,
      evidences: newEvidences,
    };

    updateStats(updatedStats);
  };

  // Level progression
  const handleLevelComplete = (nextLevel: number) => {
    if (!devStats && !questions.filter(q => q.levelNumber <= stats.currentLevel)
      .every(q => stats.answers.some(answer => answer.questionId === q.id && answer.isCorrect))) return;

    const completed = Array.from(new Set([...stats.completedLevels, stats.currentLevel]));
    if (nextLevel > 3 || !MAPS[nextLevel]) {
      const updatedStats: PlayerStats = {
        ...stats,
        completedLevels: completed,
      };
      updateStats(updatedStats);
      setShowFinalReport(true);
      return;
    }

    const updatedStats: PlayerStats = {
      ...stats,
      currentLevel: nextLevel,
      completedLevels: completed,
    };
    updateStats(updatedStats);
  };

  const handleSelectLevel = (lvl: number) => {
    if (!devStats) return;
    retroAudio.playBlip();
    const updatedStats: PlayerStats = {
      ...stats,
      currentLevel: lvl,
    };
    setDevStats(updatedStats);
  };

  const handleRestart = () => {
    if (confirm('Deseja reiniciar a investigação desde o piso inicial?')) {
      if (devStats) setDevStats({ ...INITIAL_PLAYER_STATS, runId: devStats.runId });
      else setSavedStats(resetPlayerStats(user.id));
      setShowFinalReport(false);
      retroAudio.playBlip();
    }
  };

  const handleToggleAudio = () => {
    retroAudio.enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setSavedStats(null);
    setDevStats(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col relative">
      {/* Immersive Game Canvas Arena */}
      <GameCanvas
        currentLevel={stats.currentLevel}
        stats={stats}
        questions={questions}
        user={user}
        audioEnabled={audioEnabled}
        isModalOpen={!!activeQuestion || !!activeDialogueNode || showDossier || showFinalReport || showAdminCrud}
        onToggleAudio={handleToggleAudio}
        onTriggerQuestion={(q) => setActiveQuestion(q)}
        onTriggerDialogue={(npc) => setActiveDialogueNode(npc)}
        onLevelComplete={handleLevelComplete}
        onOpenDossier={() => setShowDossier(true)}
        devMode={!!devStats}
        onToggleDev={() => setDevStats(devStats ? null : savedStats)}
        onOpenAdmin={() => setShowAdminCrud(true)}
        onLogout={handleLogout}
        onSelectLevel={handleSelectLevel}
      />
      {questionsOffline && (
        <p role="status" className="absolute top-14 left-3 z-30 bg-slate-900 px-3 py-2 text-xs text-amber-300">
          Banco compartilhado indisponível. Partida com as questões padrão.
        </p>
      )}

      {/* Interactive Modals Over Game */}
      {activeQuestion && (
        <QuizModal
          question={activeQuestion}
          isAlreadyAnswered={stats.answers.some(a => a.questionId === activeQuestion.id && a.isCorrect)}
          onAnswer={handleAnswerQuestion}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      {activeDialogueNode && (
        <DialogueModal
          node={activeDialogueNode}
          onClose={() => setActiveDialogueNode(null)}
        />
      )}

      {showDossier && (
        <EvidenceDossier
          stats={stats}
          questions={questions}
          onClose={() => setShowDossier(false)}
          onOpenFinalReport={canSubmitReport ? () => setShowFinalReport(true) : undefined}
        />
      )}

      {showFinalReport && (canSubmitReport || devStats) && (
        <FinalReportModal
          stats={stats}
          questions={questions}
          user={user}
          preview={!!devStats}
          onClose={() => setShowFinalReport(false)}
          onRestart={handleRestart}
        />
      )}

      {showAdminCrud && (
        <AdminCrud
          questions={questions}
          onQuestionsUpdated={(updated) => { setQuestions(updated); setQuestionsOffline(false); }}
          onClose={() => setShowAdminCrud(false)}
        />
      )}
    </div>
  );
}
