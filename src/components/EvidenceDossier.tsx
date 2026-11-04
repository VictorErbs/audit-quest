'use client';

import React, { useState, useEffect } from 'react';
import { PlayerStats, Question, Category } from '../types/game';
import { Briefcase, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface EvidenceDossierProps {
  stats: PlayerStats;
  questions: Question[];
  onClose: () => void;
  onOpenFinalReport?: () => void;
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({
  stats,
  questions,
  onClose,
  onOpenFinalReport,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyB' || e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const categories: { key: Category | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Todas as Evidências' },
    { key: 'CONCENTRACAO', label: '1. Concentração' },
    { key: 'DIVULGACAO', label: '2. Divulgação' },
    { key: 'RESISTENCIA_RISCO', label: '3. Resistência/Risco' },
  ];

  const filteredQuestions = questions.filter(q => {
    if (activeCategory !== 'ALL' && q.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-slate-700 rounded-xl shadow-pixel overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-800 border-b-2 border-slate-700 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-sm text-white tracking-wide">
              DOSSIÊ DO FISCAL DE AUDITORIA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs (Clean responsive grid, zero text clipping) */}
        <div className="bg-slate-950/80 p-2.5 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono shrink-0">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2 py-2 rounded text-center transition font-semibold truncate ${
                activeCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={cat.label}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Evidence List */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-sm">
              Nenhuma evidência localizada nesta categoria.
            </div>
          ) : (
            filteredQuestions.map(q => {
              const answer = stats.answers.find(a => a.questionId === q.id);
              const isFound = !!answer;
              const isCorrect = answer?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    isFound
                      ? isCorrect
                        ? 'bg-slate-800/80 border-emerald-600/70'
                        : 'bg-slate-800/80 border-rose-600/70'
                      : 'bg-slate-900/40 border-slate-800 border-dashed opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${isFound ? 'text-amber-400' : 'text-slate-600'}`} />
                      <span className="font-bold text-white text-sm">{q.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300">
                        {q.documentType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      {isFound ? (
                        isCorrect ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Solucionado
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Inconclusivo
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500">Não investigado ainda</span>
                      )}
                    </div>
                  </div>

                  {/* Scenario snippet */}
                  <p className="text-xs text-slate-300 font-mono mb-2 line-clamp-2">
                    {q.scenario}
                  </p>

                  {/* Norm Reference */}
                  <div className="text-[11px] font-mono text-amber-400/90 bg-slate-950/70 p-2 rounded border border-slate-800/80">
                    <span className="font-bold text-slate-200">Norma Aplicável:</span> {q.normReference}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t border-slate-700 p-4 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-300">
            Total Investigado: <span className="text-amber-400 font-bold">{stats.answers.length}</span> de <span className="text-white">{questions.length}</span>
          </div>

          {onOpenFinalReport && (
            <button
              onClick={() => {
                onClose();
                onOpenFinalReport();
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded font-pixel text-xs shadow-pixel transition transform active:scale-95"
            >
              Emitir Parecer Final ⚖️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
