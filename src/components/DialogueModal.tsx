'use client';

import React, { useState, useEffect } from 'react';
import { InteractiveNode } from '../game/engine/tileMaps';
import { retroAudio } from '../lib/audio';
import { User, MessageSquare } from 'lucide-react';

interface DialogueModalProps {
  node: InteractiveNode;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({ node, onClose }) => {
  const dialogueLines = node.dialogue || ["Nada a declarar no momento."];
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const handleNext = () => {
    retroAudio.playBlip();
    if (currentLineIndex < dialogueLines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLineIndex, dialogueLines.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:p-8 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-amber-500 rounded-xl shadow-pixel p-5 flex flex-col md:flex-row items-center gap-4 text-white">
        {/* Character Avatar Box */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
          <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-amber-400 flex items-center justify-center text-amber-300">
            <User className="w-8 h-8" />
          </div>
        </div>

        {/* Text Container */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="font-pixel text-xs text-amber-400 tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {node.name}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {currentLineIndex + 1} / {dialogueLines.length}
            </div>
          </div>

          <p className="text-sm md:text-base text-slate-100 font-mono leading-relaxed min-h-[48px]">
            {dialogueLines[currentLineIndex]}
          </p>

          <div className="flex justify-end mt-3">
            <button
              onClick={handleNext}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded font-pixel text-xs font-bold shadow-pixel transition transform active:scale-95 flex items-center gap-2"
            >
              <span>{currentLineIndex < dialogueLines.length - 1 ? 'Avançar [ ␣ ESPAÇO ]' : 'Concluir [ ␣ ESPAÇO ]'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
