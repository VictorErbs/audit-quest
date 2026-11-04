'use client';

import React, { useState, useEffect } from 'react';
import { PlayerStats, Question, FinalEvaluation, UserProfile, Category } from '../types/game';
import { saveEvaluation } from '../lib/storage';
import { retroAudio } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Award, ShieldAlert, CheckCircle, FileCheck2, Printer, RotateCcw } from 'lucide-react';

interface FinalReportModalProps {
  stats: PlayerStats;
  questions: Question[];
  user: UserProfile | null;
  onClose: () => void;
  onRestart: () => void;
}

export const FinalReportModal: React.FC<FinalReportModalProps> = ({
  stats,
  questions,
  user,
  onClose,
  onRestart,
}) => {
  const [decision, setDecision] = useState<FinalEvaluation['regulatoryDecision']>('MULTA_PESADA');
  const [rationale, setRationale] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Categories corresponding to the 3 levels of Theme 4.10
  const categories: { key: Category; label: string }[] = [
    { key: 'CONCENTRACAO', label: '1. Concentração & Foco dos Reguladores' },
    { key: 'DIVULGACAO', label: '2. As Quatro Áreas de Divulgação' },
    { key: 'RESISTENCIA_RISCO', label: '3. Resistência & Risco Sistêmico' },
  ];

  const breakdown: Record<Category, { correct: number; total: number; score: number }> = {
    CONCENTRACAO: { correct: 0, total: 0, score: 0 },
    DIVULGACAO: { correct: 0, total: 0, score: 0 },
    RESISTENCIA_RISCO: { correct: 0, total: 0, score: 0 },
  };

  questions.forEach(q => {
    if (breakdown[q.category]) {
      breakdown[q.category].total += 1;
      const ans = stats.answers.find(a => a.questionId === q.id);
      if (ans?.isCorrect) {
        breakdown[q.category].correct += 1;
        breakdown[q.category].score += ans.pointsEarned;
      }
    }
  });

  const totalPossiblePoints = questions.reduce((acc, q) => acc + q.points, 0);
  const percentage = Math.round((stats.score / (totalPossiblePoints || 1)) * 100);

  let rankTitle = 'Fiscal Contábil Trainee';
  if (percentage >= 85) rankTitle = 'Inspetor Regulador Chefe (Nível CVM/CFC)';
  else if (percentage >= 60) rankTitle = 'Auditor Fiscal Sênior';
  else if (percentage >= 40) rankTitle = 'Auditor Fiscal Pleno';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluation: FinalEvaluation = {
      id: 'eval-' + Date.now(),
      userId: user?.id || 'guest',
      userName: user?.name || 'Estudante de Contábeis',
      totalScore: stats.score,
      maxScore: totalPossiblePoints,
      percentage,
      rankTitle,
      regulatoryDecision: decision,
      studentRationale: rationale || 'Constatada forte resistência na divulgação de informações financeiras e processos disciplinares, além de risco de escassez de oferta de auditoria para grandes corporações segundo o Item 4.10.',
      categoryBreakdown: breakdown,
      submittedAt: Date.now(),
    };

    saveEvaluation(evaluation);
    setSubmitted(true);
    retroAudio.playCorrect();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-amber-500 rounded-xl shadow-pixel overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800 border-b-2 border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-pixel text-sm text-amber-300">
                RELATÓRIO DE FISCALIZAÇÃO REGULATÓRIA (TEMA 4.10)
              </h2>
              <div className="text-xs font-mono text-slate-300">
                Avaliação Técnica: <span className="text-white font-bold">Transparência e Concentração em Auditoria</span>
              </div>
            </div>
          </div>
          <span className="font-pixel text-xs bg-amber-400 text-slate-950 px-3 py-1 rounded shadow-sm">
            {rankTitle}
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6 text-slate-200 print:text-black">
          {/* Top Score Box */}
          <div className="bg-slate-950 border border-slate-700 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-slate-400">PONTUAÇÃO OBTIDA</div>
              <div className="text-2xl font-pixel text-emerald-400">
                {stats.score} <span className="text-sm text-slate-400">/ {totalPossiblePoints} PTS</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-slate-400">APROVEITAMENTO INVESTIGATIVO</div>
              <div className="text-2xl font-pixel text-amber-400">{percentage}%</div>
            </div>
          </div>

          {/* Performance Breakdown Per Category */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Desempenho por Eixo da Transparência (Item 4.10 do Livro):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map(cat => {
                const b = breakdown[cat.key];
                const catPct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
                return (
                  <div key={cat.key} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                      <span className="text-slate-300 font-semibold truncate pr-1">{cat.label}</span>
                      <span className={`font-bold ${catPct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {b.correct}/{b.total} ({catPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${catPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regulatory Decision & Rationale Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                  Decisão do Fiscal / Parecer Regulatório:
                </label>
                <select
                  value={decision}
                  onChange={e => setDecision(e.target.value as FinalEvaluation['regulatoryDecision'])}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 text-white font-mono text-sm rounded-lg p-3 outline-none"
                >
                  <option value="MULTA_PESADA">Determinação de Adoção de Medidas de Transparência Financeira com Penalidade Pecuniária</option>
                  <option value="TERMO_AJUSTAMENTO">Termo de Ajustamento de Conduta (TAC) para Divulgação de Indicadores e Balanço Próprio</option>
                  <option value="CASSAÇÃO_REGISTRO">Recomendação de Intervenção Regulatória no Mercado Oligopolizado das Big Four</option>
                  <option value="ADVERTENCIA">Advertência Formal com Notificação de Risco de Falta de Oferta para Corporações</option>
                  <option value="REGULAR">Conformidade Plena com os Padrões de Transparência do Item 4.10</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                  Fundamentação Técnica do Fiscal (Conclusão Fundamentada no Item 4.10):
                </label>
                <textarea
                  rows={3}
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  placeholder="Ex: Conforme Crepaldi (Item 4.10), as auditorias aceitam divulgar governança e pessoal, porém resistem a publicar balanços auditados próprios, processos disciplinares e dados de clientes rejeitados..."
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 text-white font-mono text-sm rounded-lg p-3 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg font-pixel text-xs tracking-wider shadow-pixel transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-5 h-5" />
                <span>Assinar e Lavrar Relatório Regulatório Final</span>
              </button>
            </form>
          ) : (
            <div className="bg-emerald-950/40 border-2 border-emerald-600 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
                <CheckCircle className="w-5 h-5" />
                RELATÓRIO LAVRADO E REGISTRADO COM SUCESSO!
              </div>
              <div className="text-xs font-mono text-slate-300">
                <span className="font-bold text-white">Deliberação Regulatória:</span> {decision}
              </div>
              <div className="text-xs font-mono text-slate-300">
                <span className="font-bold text-white">Fundamentação:</span> {rationale || 'Evidências do item 4.10 devidamente anexadas ao dossiê fiscal.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t border-slate-700 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-xs font-mono flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onRestart}
              className="bg-slate-700 hover:bg-slate-600 text-amber-300 px-3 py-2 rounded text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar do Piso 1</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded text-xs font-pixel shadow-pixel transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
