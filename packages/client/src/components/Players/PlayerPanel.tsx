import React from 'react';
import type { Player } from '@dhandha/shared';
import { GAME_CONFIG } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';
import { CharacterIcon } from '../../utils/characterIcons';

interface PlayerPanelProps {
  player: Player;
  isCurrentTurn: boolean;
  isLocalPlayer: boolean;
  propertyCount: number;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isCurrentTurn,
  isLocalPlayer,
  propertyCount,
}) => {
  const characterConfig = GAME_CONFIG.CHARACTERS.find((c) => c.id === player.character);

  return (
    <div
      className={`p-2.5 rounded-xl border transition-all relative overflow-hidden ${
        isCurrentTurn
          ? 'bg-[#18181b] border-[#dc2626] shadow-md shadow-[#dc2626]/20 ring-1 ring-[#dc2626]/40 scale-[1.01]'
          : 'bg-[#18181b] border-[#27272a]'
      } ${!player.isConnected ? 'opacity-50' : ''}`}
    >
      {/* Turn indicator top bar */}
      {isCurrentTurn && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
      )}

      <div className="flex items-center gap-2.5">
        {/* Character Logo or Avatar */}
        <div className="shrink-0">
          {player.character ? (
            <CharacterIcon id={player.character} className="w-8 h-8" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-md"
              style={{ borderColor: player.color, backgroundColor: `${player.color}22` }}
            >
              {player.avatar}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xs text-[#fafafa] truncate">
              {player.name}
            </span>
            {isLocalPlayer && (
              <span className="text-[8px] bg-[#dc2626]/20 text-[#dc2626] font-black px-1 py-0.2 rounded border border-[#dc2626]/40 uppercase">
                YOU
              </span>
            )}
          </div>
          <div className="text-[10px] text-[#a1a1aa] truncate font-medium">
            {characterConfig?.name ?? 'Entrepreneur'}
          </div>
        </div>

        {/* Status indicator */}
        {player.isBankrupt ? (
          <span className="text-[9px] bg-red-950 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-800/80 uppercase">
            🪣 KANGAL
          </span>
        ) : !player.isConnected ? (
          <span className="text-[9px] bg-rose-950/80 text-rose-400 font-bold px-1 py-0.5 rounded border border-rose-800/40">
            OFFLINE
          </span>
        ) : isCurrentTurn ? (
          <span className="text-[9px] bg-[#dc2626] text-white font-black px-1.5 py-0.5 rounded animate-pulse shadow-sm shadow-[#dc2626]/40">
            TURN
          </span>
        ) : null}
      </div>

      {/* Money & Properties Stats */}
      <div className="mt-2 pt-1.5 border-t border-[#27272a] grid grid-cols-2 gap-1.5 text-center">
        <div className="bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
          <div className="text-[8px] text-[#a1a1aa] uppercase font-bold">Balance</div>
          <div className="font-display font-bold text-[11px] text-[#22c55e]">
            {formatRupee(player.money)}
          </div>
        </div>
        <div className="bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
          <div className="text-[8px] text-[#a1a1aa] uppercase font-bold">Assets</div>
          <div className="font-display font-bold text-[11px] text-[#dc2626]">
            🏢 {propertyCount}
          </div>
        </div>
      </div>

      {/* Special statuses */}
      {player.inLegalTrouble && (
        <div className="mt-1.5 text-[9px] bg-rose-950/60 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/50 flex items-center gap-1">
          <span>⚖️</span>
          <span>Legal Trouble ({player.legalTroubleTurns}t)</span>
        </div>
      )}
    </div>
  );
};
