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
  getPlayerStats,
  savePlayerStats,
  resetPlayerStats,
  getCurrentUser,
  setCurrentUser,
} from '../lib/storage';
import { LEVEL_METADATA } from '../data/defaultQuestions';
import { retroAudio } from '../lib/audio';

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
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
    setQuestions(getQuestions());
    setStats(getPlayerStats());
    setUser(getCurrentUser());
    setIsInitialized(true);
  }, []);

  if (!isInitialized || !stats) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-amber-400 font-pixel text-sm">
        Carregando Audit Quest...
      </div>
    );
  }

  // FIRST: If no user is logged in, show the full login screen!
  if (!user) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={(newUser) => setUser(newUser)}
          onOpenAdmin={() => setShowAdminCrud(true)}
        />
        {showAdminCrud && (
          <AdminCrud
            questions={questions}
            onQuestionsUpdated={(updated) => setQuestions(updated)}
            onClose={() => setShowAdminCrud(false)}
          />
        )}
      </>
    );
  }

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

    setStats(updatedStats);
    savePlayerStats(updatedStats);
  };

  // Level progression
  const handleLevelComplete = (nextLevel: number) => {
    const completed = Array.from(new Set([...stats.completedLevels, stats.currentLevel]));
    if (nextLevel > 3 || !MAPS[nextLevel]) {
      const updatedStats: PlayerStats = {
        ...stats,
        completedLevels: completed,
      };
      setStats(updatedStats);
      savePlayerStats(updatedStats);
      setShowFinalReport(true);
      return;
    }

    const updatedStats: PlayerStats = {
      ...stats,
      currentLevel: nextLevel,
      completedLevels: completed,
    };
    setStats(updatedStats);
    savePlayerStats(updatedStats);
  };

  const handleSelectLevel = (lvl: number) => {
    retroAudio.playBlip();
    const updatedStats: PlayerStats = {
      ...stats,
      currentLevel: lvl,
    };
    setStats(updatedStats);
    savePlayerStats(updatedStats);
  };

  const handleRestart = () => {
    if (confirm('Deseja reiniciar a investigação desde o piso inicial?')) {
      const fresh = resetPlayerStats();
      setStats(fresh);
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
        onOpenFinalReport={() => setShowFinalReport(true)}
        onOpenAdmin={() => setShowAdminCrud(true)}
        onLogout={handleLogout}
        onSelectLevel={handleSelectLevel}
      />

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
          onOpenFinalReport={() => setShowFinalReport(true)}
        />
      )}

      {showFinalReport && (
        <FinalReportModal
          stats={stats}
          questions={questions}
          user={user}
          onClose={() => setShowFinalReport(false)}
          onRestart={handleRestart}
        />
      )}

      {showAdminCrud && (
        <AdminCrud
          questions={questions}
          onQuestionsUpdated={(updated) => setQuestions(updated)}
          onClose={() => setShowAdminCrud(false)}
        />
      )}
    </div>
  );
}
