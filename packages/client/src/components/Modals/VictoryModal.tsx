import React, { useEffect, useRef } from 'react';
import type { GameState } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';
import { CharacterIcon } from '../../utils/characterIcons';

interface VictoryModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

// Runs a pure Canvas confetti effect for ~5 seconds
function runConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fbbf24', '#f97316'];
  const PARTICLE_COUNT = 120;

  type Particle = {
    x: number; y: number; w: number; h: number;
    color: string; rotation: number; rotSpeed: number;
    vx: number; vy: number; gravity: number; opacity: number;
  };

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 100,
    w: 6 + Math.random() * 8,
    h: 3 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 3,
    vy: 1.5 + Math.random() * 3,
    gravity: 0.04 + Math.random() * 0.04,
    opacity: 1,
  }));

  let frame: number;
  let elapsed = 0;

  function draw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    elapsed++;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      if (elapsed > 120) p.opacity = Math.max(0, p.opacity - 0.008);

      ctx!.save();
      ctx!.globalAlpha = p.opacity;
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    });

    if (elapsed < 300) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  frame = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(frame);
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  onPlayAgain,
  onHome,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const cleanup = runConfetti(canvasRef.current);
    return cleanup;
  }, []);

  const winner: import('@dhandha/shared').Player | undefined =
    (gameState.winner
      ? gameState.players.find((p) => p.id === gameState.winner)
      : undefined) ??
    gameState.players.find((p) => !p.isBankrupt) ??
    gameState.players[0];

  const winnerProps = (gameState.properties || []).filter(
    (p) => p.ownerId === winner?.id
  );

  // Ranked players
  const rankedPlayers = [...(gameState.players || [])].sort((a, b) => {
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;
    return (b.money ?? 0) - (a.money ?? 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      {/* Confetti canvas — full screen overlay, pointer-events-none */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[51]"
      />

      <div className="bg-gradient-to-b from-[#18181b] via-[#121215] to-[#09090b] border-2 border-[#D9A441] rounded-3xl w-full max-w-lg shadow-2xl shadow-amber-900/40 overflow-hidden text-[#fafafa] flex flex-col animate-scale-up text-center relative z-[52]">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="pt-6 pb-2 px-4 relative z-10 flex flex-col items-center">
          <div className="text-5xl my-1 animate-bounce">👑</div>
          <div className="text-[11px] font-black uppercase tracking-widest text-[#D9A441] px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 mb-2">
            GAME FINISHED • MATCH OVER
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 uppercase tracking-wide">
            VYAPAR SAMRAT
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            The undisputed business tycoon of India!
          </p>
        </div>

        {/* Winner Hero Card */}
        <div className="mx-6 my-3 p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-zinc-900/60 border border-amber-500/40 relative z-10 flex flex-col items-center gap-2 shadow-inner">
          <div className="relative">
            {winner?.character ? (
              <CharacterIcon id={winner.character} className="w-16 h-16 drop-shadow-xl" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-2 shadow-xl"
                style={{ borderColor: winner?.color, backgroundColor: `${winner?.color}33` }}
              >
                {winner?.avatar}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 text-xl">🏆</span>
          </div>

          <div className="text-lg font-black text-amber-300 font-display">
            {winner?.name}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-1 pt-2 border-t border-amber-600/30">
            <div className="bg-[#09090b]/80 p-2 rounded-xl border border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Final Wealth</div>
              <div className="font-display font-black text-sm text-green-400">
                {formatRupee(winner?.money ?? 0)}
              </div>
            </div>
            <div className="bg-[#09090b]/80 p-2 rounded-xl border border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Properties Owned</div>
              <div className="font-display font-black text-sm text-amber-300">
                🏢 {winnerProps.length} Properties
              </div>
            </div>
          </div>
        </div>

        {/* Other Players Leaderboard */}
        <div className="px-6 py-2 text-left space-y-1.5 max-h-36 overflow-y-auto">
          <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1 text-center">
            FINAL STANDINGS
          </div>
          {rankedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                player.id === winner?.id
                  ? 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                  : player.isBankrupt
                  ? 'bg-zinc-950/60 border-red-950 text-zinc-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-zinc-500 text-[10px]">
                  #{idx + 1}
                </span>
                <span className="font-bold">
                  {player.name}
                  {player.id === winner?.id && ' 👑'}
                </span>
              </div>

              <div>
                {player.isBankrupt ? (
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[9px] font-bold border border-red-800/80 uppercase">
                    🪣 KANGAL
                  </span>
                ) : (
                  <span className="font-mono font-bold text-green-400">
                    {formatRupee(player.money)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-center gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors"
          >
            🏠 Return Home
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 transition-all"
          >
            🔄 Play Again
          </button>
        </div>

      </div>
    </div>
  );
};
