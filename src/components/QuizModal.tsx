'use client';

import React, { useState, useEffect } from 'react';
import { Question, QuestionOption } from '../types/game';
import { retroAudio } from '../lib/audio';
import confetti from 'canvas-confetti';
import { FileText, AlertTriangle, CheckCircle2, XCircle, BookOpen, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  question: Question;
  isAlreadyAnswered: boolean;
  onAnswer: (option: QuestionOption) => Promise<QuestionOption & { tip: string; pointsEarned: number }>;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  isAlreadyAnswered,
  onAnswer,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<(QuestionOption & { tip: string; pointsEarned: number }) | null>(null);
  const [error, setError] = useState('');
  const pending = React.useRef(false);
  const [busy, setBusy] = useState(false);
  const showFeedback = selectedOption !== null;

  const handleSelect = async (option: QuestionOption) => {
    if (showFeedback || pending.current || isAlreadyAnswered) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await onAnswer(option);
      setSelectedOption(result);
      if (result.isCorrect) {
        retroAudio.playCorrect();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        retroAudio.playWrong();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar a resposta.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  // Keyboard navigation: SPACE to confirm/close, 1-4/A-D to answer, ESC to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          onClose();
        }
      } else {
        if (e.code === 'Digit1' || e.code === 'KeyA') {
          if (question.options[0]) handleSelect(question.options[0]);
        } else if (e.code === 'Digit2' || e.code === 'KeyB') {
          if (question.options[1]) handleSelect(question.options[1]);
        } else if (e.code === 'Digit3' || e.code === 'KeyC') {
          if (question.options[2]) handleSelect(question.options[2]);
        } else if (e.code === 'Digit4' || e.code === 'KeyD') {
          if (question.options[3]) handleSelect(question.options[3]);
        }
      }
      if (e.code === 'Escape' && !pending.current) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, question.options, onClose, onAnswer, isAlreadyAnswered]);

  const getDocBadgeColor = (type: string) => {
    switch (type) {
      case 'EMAIL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'RELATORIO': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'PLANILHA': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CONTRATO': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-slate-700 rounded-xl shadow-pixel overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-slate-800 border-b-2 border-slate-700 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getDocBadgeColor(question.documentType)}`}>
              [{question.documentType}]
            </span>
            <span className="text-sm font-pixel text-amber-300 tracking-wide">
              EVIDÊNCIA #{question.id.toUpperCase()}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-400">
            VALOR: <span className="text-emerald-400">+{question.points} PTS</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* Title */}
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            {question.title}
          </h2>

          {/* Scenario / Case Paper */}
          <div className="bg-slate-950 p-4 rounded-lg border-2 border-dashed border-slate-700 text-slate-200 text-sm leading-relaxed font-retro shadow-inner">
            <div className="text-xs text-amber-400 font-mono font-bold mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              DOCUMENTO INVESTIGATIVO ENCONTRADO:
            </div>
            {question.scenario}
          </div>

          {/* Prompt */}
          <div className="bg-blue-950/40 border border-blue-800/60 p-3 rounded-lg text-blue-200 text-sm font-semibold">
            {question.prompt}
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-1">
            {question.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption?.id === opt.id;
              
              let btnStyle = "bg-slate-800/90 border-slate-700 hover:border-amber-400 hover:bg-slate-700/80 text-slate-200";
              if (showFeedback) {
                if (isSelected && selectedOption?.isCorrect) {
                  btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50";
                } else if (isSelected && !selectedOption?.isCorrect) {
                  btnStyle = "bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/50";
                } else {
                  btnStyle = "bg-slate-800/40 border-slate-800 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={showFeedback || busy || isAlreadyAnswered}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-3.5 rounded-lg border-2 transition-all flex items-start gap-3 text-sm ${btnStyle}`}
                >
                  <span className="font-pixel text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded shrink-0 font-bold text-amber-400">
                    {letter}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  {showFeedback && isSelected && selectedOption?.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {showFeedback && isSelected && !selectedOption?.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          {/* Didactic Feedback Box (shown after answering) */}
          {showFeedback && selectedOption && (
            <div className={`p-4 rounded-lg border-2 animate-fade-in ${
              selectedOption.isCorrect 
                ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-600/80 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2 font-mono">
                {selectedOption.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>CORRETO! Evidência comprovada. (+{selectedOption.pointsEarned} PTS)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>ANÁLISE INCORRETA! A reguladora alerta:</span>
                  </>
                )}
              </div>

              <p className="text-sm text-slate-200 mb-3 leading-relaxed">
                {selectedOption.explanation}
              </p>

              {/* Accounting Norm Reference */}
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700 text-xs font-mono text-amber-300 flex items-start gap-2">
                <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold text-white">Fundamentação Normativa:</span> {question.normReference}
                  <div className="text-slate-400 text-[11px] mt-0.5">{selectedOption.tip}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/80 border-t border-slate-700 p-4 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {isAlreadyAnswered && !showFeedback && (
              <span className="text-emerald-400">✓ Evidência já catalogada</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showFeedback ? (
              <button
                onClick={onClose}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs md:text-sm flex items-center gap-2 font-pixel shadow-pixel transition transform active:scale-95"
              >
                <span>Adicionar ao Dossiê [ ␣ ESPAÇO ]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                disabled={busy}
                className="text-slate-400 hover:text-white px-3 py-2 text-xs font-mono"
              >
                Fechar [ESC]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
