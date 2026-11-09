'use client';

import React, { useState, useEffect } from 'react';
import { Question, FinalEvaluation } from '../types/game';
import { saveQuestion, resetQuestionsToDefault, getSharedEvaluations } from '../lib/storage';
import { Edit2, RotateCcw, X, Check, BookOpen, Users, Award, Shield } from 'lucide-react';

interface AdminCrudProps {
  questions: Question[];
  onQuestionsUpdated: (updated: Question[]) => void;
  onClose: () => void;
}

export const AdminCrud: React.FC<AdminCrudProps> = ({
  questions,
  onQuestionsUpdated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'EVALUATIONS'>('QUESTIONS');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'ALL'>('ALL');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [evaluationError, setEvaluationError] = useState(false);

  // Form state for the selected campaign question
  const [formData, setFormData] = useState<Question>({
    id: '',
    category: 'CONCENTRACAO',
    levelNumber: 1,
    difficulty: 'FACIL',
    title: '',
    scenario: '',
    documentType: 'RELATORIO',
    prompt: '',
    normReference: '',
    didacticTip: '',
    points: 200,
    options: [
      { id: 'opt-1', text: '', isCorrect: true, explanation: '' },
      { id: 'opt-2', text: '', isCorrect: false, explanation: '' },
      { id: 'opt-3', text: '', isCorrect: false, explanation: '' },
    ],
  });

  const [evaluations, setEvaluations] = useState<FinalEvaluation[]>([]);

  useEffect(() => {
    getSharedEvaluations()
      .then(setEvaluations)
      .catch(() => setEvaluationError(true));
  }, []);

  const handleStartEdit = (question: Question) => {
    setFormData(question);
    setEditingQuestion(question);
    setError('');
  };

  const handleResetDefaults = async () => {
    if (saving || !confirm('Restaurar banco original de questões de auditoria do Item 4.10?')) return;
    setSaving(true);
    setError('');
    try {
      onQuestionsUpdated(await resetQuestionsToDefault());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao restaurar as questões.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const updated = await saveQuestion(formData);
      onQuestionsUpdated(questions.map(question => question.id === updated.id ? updated : question));
      setEditingQuestion(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao salvar a questão.');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (selectedLevelFilter !== 'ALL' && q.levelNumber !== selectedLevelFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border-4 border-slate-700 rounded-xl shadow-pixel overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-800 border-b-2 border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-pixel text-sm text-white">PAINEL DO PROFESSOR / FISCAL CHEFE</h2>
              <div className="text-xs font-mono text-slate-400">
                Gerenciamento de Casos Investigativos & Relatórios de Alunos
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('QUESTIONS'); setEditingQuestion(null); }}
              className={`px-4 py-2 rounded text-xs font-pixel transition flex items-center gap-2 ${
                activeTab === 'QUESTIONS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Questões da campanha ({questions.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('EVALUATIONS'); setEditingQuestion(null); }}
              className={`px-4 py-2 rounded text-xs font-pixel transition flex items-center gap-2 ${
                activeTab === 'EVALUATIONS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Relatórios dos Alunos ({evaluations.length})</span>
            </button>
          </div>

          {activeTab === 'QUESTIONS' && !editingQuestion && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                disabled={saving}
                title="Restaurar padrão"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
          {/* TAB 1: QUESTIONS */}
          {activeTab === 'QUESTIONS' && (
            <div>
              {/* Question editor */}
              {editingQuestion ? (
                <form onSubmit={handleSaveForm} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-pixel text-xs text-amber-400">
                      {`EDITAR QUESTÃO: ${formData.id}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setEditingQuestion(null); }}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Piso / Nível:</label>
                      <select
                        value={formData.levelNumber}
                        disabled
                        className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                      >
                        <option value={1}>Nível 1: Concentração Big Four (Fácil)</option>
                        <option value={2}>Nível 2: As 4 Áreas de Divulgação (Médio)</option>
                        <option value={3}>Nível 3: Resistência & Risco (Difícil)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Tipo de Documento:</label>
                      <select
                        value={formData.documentType}
                        onChange={e => setFormData({ ...formData, documentType: e.target.value as Question['documentType'] })}
                        className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                      >
                        <option value="RELATORIO">Relatório</option>
                        <option value="MEMORANDO">Memorando</option>
                        <option value="PLANILHA">Planilha</option>
                        <option value="DOSSIE">Dossiê</option>
                        <option value="PARECER">Parecer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Pontos:</label>
                      <input
                        type="number"
                        value={formData.points}
                        readOnly
                        className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Título do Caso:</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Conflito de Interesses na Construtora Alfa"
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Cenário / Documento Encontrado:</label>
                    <textarea
                      rows={2}
                      value={formData.scenario}
                      onChange={e => setFormData({ ...formData, scenario: e.target.value })}
                      placeholder="Descreva o documento ou evidência encontrada na mesa/computador..."
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Pergunta Investigativa (Prompt):</label>
                    <input
                      type="text"
                      value={formData.prompt}
                      onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                      placeholder="Qual norma ou princípio contábil foi violado nesta situação?"
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Referência Normativa (NBC / CVM):</label>
                      <input
                        type="text"
                        value={formData.normReference}
                        onChange={e => setFormData({ ...formData, normReference: e.target.value })}
                        placeholder="Ex: NBC PA 11 item 4 / Resolução CVM nº 23"
                        className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Dica Didática:</label>
                      <input
                        type="text"
                        value={formData.didacticTip}
                        onChange={e => setFormData({ ...formData, didacticTip: e.target.value })}
                        placeholder="Ex: Lembre-se que o limite de permanência é de 5 anos."
                        className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-mono font-bold text-amber-300">
                      Alternativas (Marque o rádio para a correta):
                    </label>
                    {formData.options.map((opt, i) => (
                      <div key={opt.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={opt.isCorrect}
                            onChange={() => {
                              const updatedOpts = formData.options.map((o, idx) => ({
                                ...o,
                                isCorrect: idx === i,
                              }));
                              setFormData({ ...formData, options: updatedOpts });
                            }}
                            className="w-4 h-4 accent-amber-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold font-mono text-slate-300">Alternativa {String.fromCharCode(65 + i)}:</span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => {
                              const updatedOpts = [...formData.options];
                              updatedOpts[i].text = e.target.value;
                              setFormData({ ...formData, options: updatedOpts });
                            }}
                            placeholder="Texto da alternativa..."
                            className="flex-1 bg-slate-800 border border-slate-700 text-white p-1.5 rounded text-xs font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          value={opt.explanation}
                          onChange={e => {
                            const updatedOpts = [...formData.options];
                            updatedOpts[i].explanation = e.target.value;
                            setFormData({ ...formData, options: updatedOpts });
                          }}
                          placeholder="Explicação didática que aparecerá após o estudante responder..."
                          className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-1.5 rounded text-[11px] font-mono"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setEditingQuestion(null); }}
                      className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded text-xs font-pixel shadow-pixel transition"
                    >
                      Salvar Questão
                    </button>
                  </div>
                </form>
              ) : (
                /* List Mode */
                <div className="space-y-4">
                  {/* Filter by Level */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                    <span className="text-slate-500">Filtrar:</span>
                    {[
                      { val: 'ALL', label: 'Todos (Tema 4.10)' },
                      { val: 1, label: '1. Concentração' },
                      { val: 2, label: '2. Divulgação' },
                      { val: 3, label: '3. Resistência/Risco' },
                    ].map(f => (
                      <button
                        key={String(f.val)}
                        onClick={() => setSelectedLevelFilter(f.val as number | 'ALL')}
                        className={`px-2.5 py-1 rounded transition ${
                          selectedLevelFilter === f.val
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Questions Table */}
                  <div className="space-y-2">
                    {filteredQuestions.map(q => (
                      <div
                        key={q.id}
                        className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 flex items-start justify-between gap-4 hover:border-slate-600 transition"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-950 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 font-bold">
                              NÍVEL {q.levelNumber}
                            </span>
                            <span className="font-bold text-white text-sm">{q.title}</span>
                            <span className="text-xs text-emerald-400 font-mono">+{q.points} pts</span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono line-clamp-1">{q.prompt}</p>
                          <div className="text-[11px] font-mono text-slate-400">
                            Norma: <span className="text-amber-300">{q.normReference}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleStartEdit(q)}
                            title="Editar"
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 p-2 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENT EVALUATIONS */}
          {activeTab === 'EVALUATIONS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                <span>Histórico de Fiscalizações Concluídas pelos Estudantes:</span>
                <span>{evaluations.length} relatório(s) arquivado(s)</span>
              </div>

              {evaluationError && (
                <p role="status" className="mb-4 text-sm text-amber-300">
                  Relatórios compartilhados indisponíveis. Exibindo os registros antigos deste navegador.
                </p>
              )}
              {evaluations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-sm">
                  Nenhum aluno submeteu o relatório final ainda. Ao concluir a partida, as fiscalizações aparecerão aqui!
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluations.map(ev => (
                    <div key={ev.id} className="bg-slate-800/90 border border-slate-700 p-4 rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{ev.userName}</span>
                            <span className="text-xs font-pixel bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                              {ev.rankTitle}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {new Date(ev.submittedAt).toLocaleString('pt-BR')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-pixel text-emerald-400">{ev.totalScore} pts</div>
                          <div className="text-xs font-mono text-amber-300">{ev.percentage}% acertos</div>
                        </div>
                      </div>

                      <div className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                        <span className="font-bold text-amber-400">Sanção Reguladora Aplicada:</span> {ev.regulatoryDecision}
                        <div className="mt-1 text-slate-400">{ev.studentRationale}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-3 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Audit Quest • Modo Docente / Fiscalizador</span>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded font-pixel text-xs transition"
          >
            Voltar ao Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
