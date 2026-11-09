'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MAPS, MapData, InteractiveNode } from './engine/tileMaps';
import { SpriteRenderer, Direction } from './engine/spriteRenderer';
import { retroAudio } from '../lib/audio';
import { Question, PlayerStats, UserProfile } from '../types/game';
import { LEVEL_METADATA } from '../data/levels';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Briefcase,
  Award,
  LogOut,
  ChevronRight,
  Gamepad2,
} from 'lucide-react';

interface GameCanvasProps {
  currentLevel: number;
  stats: PlayerStats;
  questions: Question[];
  user: UserProfile | null;
  audioEnabled: boolean;
  isModalOpen?: boolean;
  onToggleAudio: () => void;
  onTriggerQuestion: (question: Question, node: InteractiveNode) => void;
  onTriggerDialogue: (npc: InteractiveNode) => void;
  onLevelComplete: (nextLevel: number) => void;
  onOpenDossier: () => void;
  onOpenRanking: () => void;
  onLogout: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevel,
  stats,
  questions,
  user,
  audioEnabled,
  isModalOpen = false,
  onToggleAudio,
  onTriggerQuestion,
  onTriggerDialogue,
  onLevelComplete,
  onOpenDossier,
  onOpenRanking,
  onLogout,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [nearbyNode, setNearbyNode] = useState<InteractiveNode | null>(null);

  const mapData: MapData = MAPS[currentLevel] || MAPS[1];
  const curMeta = LEVEL_METADATA.find(m => m.level === currentLevel) || LEVEL_METADATA[0];

  const playerPosRef = useRef({
    x: mapData.playerStart.x * SpriteRenderer.TILE_SIZE,
    y: mapData.playerStart.y * SpriteRenderer.TILE_SIZE,
  });
  const targetPosRef = useRef({ ...playerPosRef.current });
  const gridPosRef = useRef({ ...mapData.playerStart });
  const directionRef = useRef<Direction>('DOWN');
  const isMovingRef = useRef(false);
  const frameTickRef = useRef(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Reset player position when level changes
  useEffect(() => {
    const curMap = MAPS[currentLevel] || MAPS[1];
    gridPosRef.current = { ...curMap.playerStart };
    playerPosRef.current = {
      x: curMap.playerStart.x * SpriteRenderer.TILE_SIZE,
      y: curMap.playerStart.y * SpriteRenderer.TILE_SIZE,
    };
    targetPosRef.current = { ...playerPosRef.current };
    directionRef.current = currentLevel === 2 ? 'DOWN' : 'UP';
    setNearbyNode(null);
  }, [currentLevel]);

  // Handle Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Check if door is unlocked (Dev Mode unlocks all doors immediately)
  const isDoorUnlocked = useCallback((node: InteractiveNode): boolean => {
    if (!node.requiresQuestionIds || node.requiresQuestionIds.length === 0) return true;
    return node.requiresQuestionIds.every(qid => 
      stats.answers.some(a => a.questionId === qid && a.isCorrect)
    );
  }, [stats.answers]);

  // Check tile walkability
  const isWalkable = useCallback((gx: number, gy: number): boolean => {
    if (gx < 0 || gx >= mapData.width || gy < 0 || gy >= mapData.height) return false;
    const tile = mapData.tiles[gy]?.[gx];
    if (!tile || tile === 'WALL' || tile === 'DESK' || tile === 'CABINET' || tile === 'PLANT') {
      return false;
    }
    if (tile === 'DOOR_LOCKED') {
      const doorNode = mapData.interactives.find(n => n.x === gx && n.y === gy && n.type === 'DOOR');
      if (doorNode && !isDoorUnlocked(doorNode)) {
        return false;
      }
    }
    return true;
  }, [mapData, isDoorUnlocked]);

  // Check for nearby interactive node
  const checkNearby = useCallback((gx: number, gy: number, dir: Direction) => {
    let targetX = gx;
    let targetY = gy;
    if (dir === 'UP') targetY -= 1;
    if (dir === 'DOWN') targetY += 1;
    if (dir === 'LEFT') targetX -= 1;
    if (dir === 'RIGHT') targetX += 1;

    let found = mapData.interactives.find(n => n.x === targetX && n.y === targetY);
    if (!found) {
      found = mapData.interactives.find(n => n.x === gx && n.y === gy);
    }
    if (!found) {
      found = mapData.interactives.find(n => Math.abs(n.x - gx) <= 1 && Math.abs(n.y - gy) <= 1 && n.type !== 'DOOR');
    }

    setNearbyNode(found || null);
  }, [mapData]);

  // Movement attempt
  const tryMove = useCallback((newDir: Direction) => {
    directionRef.current = newDir;

    if (isMovingRef.current) return;

    let nx = gridPosRef.current.x;
    let ny = gridPosRef.current.y;

    if (newDir === 'UP') ny -= 1;
    if (newDir === 'DOWN') ny += 1;
    if (newDir === 'LEFT') nx -= 1;
    if (newDir === 'RIGHT') nx += 1;

    if (isWalkable(nx, ny)) {
      gridPosRef.current = { x: nx, y: ny };
      targetPosRef.current = {
        x: nx * SpriteRenderer.TILE_SIZE,
        y: ny * SpriteRenderer.TILE_SIZE,
      };
      isMovingRef.current = true;
      retroAudio.playStep();
    }

    checkNearby(gridPosRef.current.x, gridPosRef.current.y, newDir);
  }, [isWalkable, checkNearby]);

  // Interaction trigger
  const handleInteract = useCallback(() => {
    if (!nearbyNode) return;
    retroAudio.playBlip();

    if (nearbyNode.type === 'NPC' || nearbyNode.type === 'HINT') {
      onTriggerDialogue(nearbyNode);
    } else if (nearbyNode.type === 'QUESTION') {
      const q = questions.find(item => item.id === nearbyNode.questionId);
      if (q) {
        onTriggerQuestion(q, nearbyNode);
      }
    } else if (nearbyNode.type === 'DOOR') {
      const unlocked = isDoorUnlocked(nearbyNode);
      if (!unlocked) {
        retroAudio.playWrong();
        onTriggerDialogue({
          ...nearbyNode,
          dialogue: nearbyNode.dialogue || ["Catraca/Porta travada! Resolva as evidências deste setor primeiro."]
        });
      } else {
        retroAudio.playDoorOpen();
        // Emissão do Parecer Final na ÚLTIMA PORTA do Piso 3
        if (nearbyNode.id.includes('final') || (currentLevel === 3 && nearbyNode.requiresQuestionIds?.includes('q-410-6'))) {
          onLevelComplete(4);
        }
      }
    } else if (nearbyNode.type === 'ELEVATOR') {
      const allPassed = isDoorUnlocked(nearbyNode);
      if (!allPassed) {
        retroAudio.playWrong();
        onTriggerDialogue({
          ...nearbyNode,
          dialogue: ["Elevador trancado! Complete todas as investigações do setor para avançar."]
        });
      } else {
        retroAudio.playDoorOpen();
        onLevelComplete(currentLevel + 1);
      }
    }
  }, [nearbyNode, questions, isDoorUnlocked, onTriggerDialogue, onTriggerQuestion, onLevelComplete, currentLevel]);

  // Keyboard controls: Only SPACE handles action/interaction (disabled while modals are open)
  useEffect(() => {
    if (isModalOpen) {
      keysPressedRef.current = {};
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressedRef.current[e.code] = true;

      if (e.code === 'Space') {
        handleInteract();
      }
      if (e.code === 'KeyF') {
        toggleFullscreen();
      }
      if (e.code === 'KeyB') {
        onOpenDossier();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteract, onOpenDossier, isModalOpen]);

  // Canvas resize and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameLoop = () => {
      frameTickRef.current += 1;

      // Handle continuous keyboard movement
      if (!isMovingRef.current) {
        if (keysPressedRef.current['ArrowUp'] || keysPressedRef.current['KeyW']) {
          tryMove('UP');
        } else if (keysPressedRef.current['ArrowDown'] || keysPressedRef.current['KeyS']) {
          tryMove('DOWN');
        } else if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['KeyA']) {
          tryMove('LEFT');
        } else if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['KeyD']) {
          tryMove('RIGHT');
        }
      }

      // Smooth interpolation
      const speed = 4;
      const dx = targetPosRef.current.x - playerPosRef.current.x;
      const dy = targetPosRef.current.y - playerPosRef.current.y;

      if (Math.abs(dx) > speed) {
        playerPosRef.current.x += Math.sign(dx) * speed;
      } else {
        playerPosRef.current.x = targetPosRef.current.x;
      }

      if (Math.abs(dy) > speed) {
        playerPosRef.current.y += Math.sign(dy) * speed;
      } else {
        playerPosRef.current.y = targetPosRef.current.y;
      }

      if (playerPosRef.current.x === targetPosRef.current.x && playerPosRef.current.y === targetPosRef.current.y) {
        isMovingRef.current = false;
      }

      // Center camera with integer pixel-art zoom (2x on desktop, 1x on compact)
      const scale = Math.max(1, Math.min(2, Math.floor(Math.min(canvas.width / 480, canvas.height / 360))));
      const viewW = canvas.width / scale;
      const viewH = canvas.height / scale;
      const camX = Math.round(playerPosRef.current.x + SpriteRenderer.TILE_SIZE / 2 - viewW / 2);
      const camY = Math.round(playerPosRef.current.y + SpriteRenderer.TILE_SIZE / 2 - viewH / 2);

      // Disable blurry antialiasing for authentic crisp pixels
      ctx.imageSmoothingEnabled = false;

      // Clear full container
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(scale, scale);
      ctx.translate(-camX, -camY);

      // Render map tiles
      for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
          const tile = mapData.tiles[y][x];
          const screenX = x * SpriteRenderer.TILE_SIZE;
          const screenY = y * SpriteRenderer.TILE_SIZE;

          if (
            screenX + SpriteRenderer.TILE_SIZE >= camX &&
            screenX <= camX + viewW &&
            screenY + SpriteRenderer.TILE_SIZE >= camY &&
            screenY <= camY + viewH
          ) {
            let doorUnlocked = false;
            if (tile === 'DOOR_LOCKED') {
              const dNode = mapData.interactives.find(n => n.x === x && n.y === y && n.type === 'DOOR');
              if (dNode && isDoorUnlocked(dNode)) {
                doorUnlocked = true;
              }
            }
            SpriteRenderer.renderTile(ctx, tile, screenX, screenY, doorUnlocked, frameTickRef.current);
          }
        }
      }

      // Render interactives
      mapData.interactives.forEach(node => {
        const screenX = node.x * SpriteRenderer.TILE_SIZE;
        const screenY = node.y * SpriteRenderer.TILE_SIZE;

        if (node.type === 'NPC') {
          SpriteRenderer.renderNPC(ctx, node, screenX, screenY, frameTickRef.current);
        } else if (node.type === 'QUESTION') {
          const isSolved = stats.answers.some(a => a.questionId === node.questionId && a.isCorrect);
          SpriteRenderer.renderQuestionMarker(ctx, node, screenX, screenY, isSolved, frameTickRef.current);
        } else if (node.type === 'HINT') {
          SpriteRenderer.renderHintMarker(ctx, screenX, screenY, frameTickRef.current);
        }
      });

      // Render player
      SpriteRenderer.renderPlayer(
        ctx,
        playerPosRef.current.x,
        playerPosRef.current.y,
        directionRef.current,
        isMovingRef.current,
        frameTickRef.current
      );

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mapData, isDoorUnlocked, stats.answers, tryMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-slate-950 overflow-hidden select-none flex flex-col"
    >
      {/* FLOATING TOP RETRO HUD */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md border-b-2 border-slate-800 px-3 py-2 flex items-center justify-between gap-2 sm:gap-3 text-xs font-mono">
        {/* Left: Brand & Floor Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-pixel text-amber-400 font-bold hidden sm:inline text-xs whitespace-nowrap">AUDIT QUEST</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0">
            <span className="text-[10px] font-pixel text-amber-400 font-bold whitespace-nowrap">
              {`NÍVEL ${currentLevel}`}
            </span>
            <span className="text-slate-400 hidden 2xl:inline truncate max-w-[200px]">• {mapData.name}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Points */}
          <div className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-amber-300 font-pixel text-[11px] whitespace-nowrap">
            {stats.score} <span className="text-[9px] text-slate-400">PTS</span>
          </div>

          {/* Dossier [B] */}
          <button
            onClick={onOpenDossier}
            className="bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/80 px-2.5 py-1 rounded flex items-center gap-1.5 transition text-xs font-mono"
            title="Dossiê de Evidências (Tecla B)"
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Dossiê ({stats.answers.length})</span>
          </button>

          {/* Audio */}
          <button
            onClick={onToggleAudio}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded border border-slate-700 transition"
            title="Ativar/Desativar Som 8-bit"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded border border-slate-700 transition"
            title="Alternar Tela Cheia (Tecla F)"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-amber-400" /> : <Maximize className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button onClick={onOpenRanking}
            className="rounded border border-slate-700 bg-slate-800 p-1.5 text-amber-400 hover:bg-slate-700"
            title="Ranking" aria-label="Ranking">
            <Award className="w-3.5 h-3.5" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white p-1.5 rounded border border-slate-700 transition"
            title="Trocar de Fiscal / Sair"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* FULL-WINDOW GAME CANVAS */}
      <canvas
        ref={canvasRef}
        onClick={handleInteract}
        className="w-full h-full flex-1 block image-rendering-pixelated cursor-pointer"
      />

      {/* FLOATING CONTEXT INTERACTION PROMPT (POSITIONED ABOVE KEYBOARD HELPER) */}
      {nearbyNode && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-xl bg-slate-950/95 border-2 border-amber-400 p-3.5 rounded-xl shadow-pixel text-white flex items-center justify-between backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-1 rounded font-pixel animate-bounce">
              !
            </span>
            <div>
              <div className="font-bold text-amber-300 text-sm">{nearbyNode.name}</div>
              <div className="text-xs text-slate-300 font-mono">
                {nearbyNode.type === 'NPC' && 'Pressione [ESPAÇO] para conversar'}
                {nearbyNode.type === 'HINT' && 'Pressione [ESPAÇO] para examinar curiosidade'}
                {nearbyNode.type === 'QUESTION' && 'Pressione [ESPAÇO] para examinar evidência'}
                {nearbyNode.type === 'DOOR' && (
                  nearbyNode.id.includes('final')
                    ? (isDoorUnlocked(nearbyNode) ? 'Pressione [ESPAÇO] para emitir o Parecer Final' : 'Porta trancada: conclua as evidências do Piso 3')
                    : 'Pressione [ESPAÇO] para destravar passagem'
                )}
                {nearbyNode.type === 'ELEVATOR' && 'Pressione [ESPAÇO] para subir de piso'}
              </div>
            </div>
          </div>
          <button
            onClick={handleInteract}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider font-pixel transition transform active:scale-95 shadow-pixel shrink-0 ml-2 flex items-center gap-1.5"
          >
            {nearbyNode.id.includes('final') && isDoorUnlocked(nearbyNode) ? (
              <>
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>[ ⚖️ EMITIR PARECER ]</span>
              </>
            ) : (
              <span>[ ␣ ESPAÇO ]</span>
            )}
          </button>
        </div>
      )}

      {/* FLOATING RETRO DIRECTIONAL PAD (MOBILE TOUCH ONLY) */}
      {showControls && (
        <div className="md:hidden absolute bottom-4 left-4 z-20 pointer-events-auto">
          <div className="relative w-32 h-32 bg-slate-950/80 backdrop-blur-xs rounded-full border-2 border-slate-700/80 p-2 flex items-center justify-center shadow-lg">
            {/* Up */}
            <button
              onClick={() => tryMove('UP')}
              aria-label="Cima"
              className="absolute top-1 left-11 w-9 h-9 bg-slate-800 active:bg-amber-500 text-white rounded-t font-bold flex items-center justify-center border-t-2 border-slate-600 shadow"
            >
              ▲
            </button>
            {/* Down */}
            <button
              onClick={() => tryMove('DOWN')}
              aria-label="Baixo"
              className="absolute bottom-1 left-11 w-9 h-9 bg-slate-800 active:bg-amber-500 text-white rounded-b font-bold flex items-center justify-center border-b-2 border-slate-900 shadow"
            >
              ▼
            </button>
            {/* Left */}
            <button
              onClick={() => tryMove('LEFT')}
              aria-label="Esquerda"
              className="absolute left-1 top-11 w-9 h-9 bg-slate-800 active:bg-amber-500 text-white rounded-l font-bold flex items-center justify-center border-l-2 border-slate-600 shadow"
            >
              ◀
            </button>
            {/* Right */}
            <button
              onClick={() => tryMove('RIGHT')}
              aria-label="Direita"
              className="absolute right-1 top-11 w-9 h-9 bg-slate-800 active:bg-amber-500 text-white rounded-r font-bold flex items-center justify-center border-r-2 border-slate-900 shadow"
            >
              ▶
            </button>
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700"></div>
          </div>
        </div>
      )}

      {/* ON-SCREEN SPACE BUTTON (MOBILE TOUCH ONLY) */}
      <div className="md:hidden absolute bottom-6 right-4 z-20 pointer-events-auto">
        <button
          onClick={handleInteract}
          className="bg-amber-500 active:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl border-2 border-slate-900 shadow-pixel font-pixel text-xs font-bold flex items-center gap-2"
        >
          <span>[ ␣ ESPAÇO ]</span>
        </button>
      </div>

      {/* QUICK KEYBOARD GUIDE (BOTTOM CENTER DOCKED TO BOTTOM EDGE) */}
      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[11px] font-mono text-slate-300 bg-slate-950/90 px-4 py-1.5 rounded-full border border-slate-800 shadow-pixel pointer-events-none whitespace-nowrap">
        <span><strong className="text-amber-400">Setas / WASD</strong>: Mover</span>
        <span className="mx-2 text-slate-600">•</span>
        <span><strong className="text-emerald-400">[ ␣ ESPAÇO ]</strong>: Interagir</span>
        <span className="mx-2 text-slate-600">•</span>
        <span><strong className="text-cyan-400">B</strong>: Dossiê</span>
        <span className="mx-2 text-slate-600">•</span>
        <span><strong className="text-purple-400">F</strong>: Tela Cheia</span>
      </div>
    </div>
  );
};
