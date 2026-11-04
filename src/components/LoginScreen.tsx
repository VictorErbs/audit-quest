'use client';

import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { setCurrentUser } from '../lib/storage';
import { retroAudio } from '../lib/audio';
import { Shield, User, Lock, Sparkles, BookOpen, Settings } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenAdmin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenAdmin }) => {
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (role === 'TEACHER' ? 'Prof. Auditor Chefe' : 'Estudante de Contábeis');
    const user: UserProfile = {
      id: 'usr-' + Date.now(),
      name: finalName,
      email: `${finalName.toLowerCase().replace(/\s+/g, '')}@auditquest.edu`,
      role,
      createdAt: Date.now(),
    };

    setCurrentUser(user);
    retroAudio.playCorrect();
    onLoginSuccess(user);
  };

  const handleQuickPlay = () => {
    const user: UserProfile = {
      id: 'guest-' + Date.now(),
      name: 'Fiscal ' + Math.floor(100 + Math.random() * 900),
      email: 'fiscal@investigacao.gov.br',
      role: 'STUDENT',
      createdAt: Date.now(),
    };
    setCurrentUser(user);
    retroAudio.playBlip();
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Retro Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-6">
        {/* Animated Badge */}
        <div className="relative group">
          <div className="w-20 h-20 bg-amber-500 rounded-2xl border-4 border-slate-900 shadow-pixel flex items-center justify-center text-slate-950 transition transform group-hover:scale-105">
            <Shield className="w-12 h-12" />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-pixel font-bold px-1.5 py-0.5 rounded shadow">
            CFC/CVM
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl text-amber-400 tracking-wider drop-shadow-md">
            AUDIT QUEST
          </h1>
          <div className="font-pixel text-xs sm:text-sm text-slate-300">
            OPERAÇÃO TRANSPARÊNCIA
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto pt-1">
            Simulador investigativo RPG em Pixel Art para estudantes de Ciências Contábeis • Tema 4.10: Transparência de Auditorias (NBC PA 11)
          </p>
        </div>

        {/* Login / Identification Card */}
        <div className="w-full bg-slate-900/90 border-4 border-slate-800 rounded-2xl shadow-pixel p-6 backdrop-blur-md">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`py-2 px-3 rounded-lg text-xs font-pixel transition flex items-center justify-center gap-2 ${
                role === 'STUDENT'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Estudante</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`py-2 px-3 rounded-lg text-xs font-pixel transition flex items-center justify-center gap-2 ${
                role === 'TEACHER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Docente / CRUD</span>
            </button>
          </div>

          <form onSubmit={handleStart} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-bold mb-1">
                Nome do Fiscal / Estudante:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'STUDENT' ? 'Ex: Lucas Almeida (6º Período)' : 'Ex: Prof. Dr. Marcelo'}
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white font-mono text-sm rounded-lg p-3 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Matrícula / Turma (Opcional):
              </label>
              <input
                type="text"
                value={registration}
                onChange={e => setRegistration(e.target.value)}
                placeholder="Ex: CONT-2026.2"
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white font-mono text-sm rounded-lg p-3 outline-none transition"
              />
            </div>

            {/* Play Button */}
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl font-pixel text-xs tracking-wider shadow-pixel transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>▶ INICIAR FISCALIZAÇÃO</span>
            </button>
          </form>

          {/* Alternative Quick Entry */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleQuickPlay}
              className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entrada Rápida (Convidado)</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Painel Docente / CRUD</span>
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 text-[11px] font-mono text-slate-400 pt-2">
          <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            🎮 4 Labirintos Investigativos
          </span>
          <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            📋 Parecer Regulatório Final
          </span>
          <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            💡 Didática NBC PA 11
          </span>
        </div>
      </div>
    </div>
  );
};
