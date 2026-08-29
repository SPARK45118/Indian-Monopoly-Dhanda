import React from 'react';
import type { GameState } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';

interface LeaderboardModalProps {
  gameState: GameState;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ gameState, onClose }) => {
  // Sort players by Net Worth descending
  const sortedPlayers = [...gameState.players].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0E1628] border-2 border-[#D9A441] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#f1f5f9]">
        {/* Header */}
        <div className="p-4 bg-[#0A101C] border-b border-[#1e3054] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-lg font-black font-display text-[#F5C75A]">LIVE LEADERBOARD</h2>
              <p className="text-xs text-slate-400">Current standings by Net Worth (Cash + Assets)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#131B2E] hover:bg-[#1e3054] text-slate-400 hover:text-white flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-2.5">
          {sortedPlayers.map((player, index) => {
            const ownedProperties = gameState.properties.filter(p => p.ownerId === player.id);
            const rankBadge = index === 0 ? '👑 1ST' : index === 1 ? '🥈 2ND' : index === 2 ? '🥉 3RD' : `${index + 1}TH`;

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-[#1a150e] to-[#131B2E] border-[#D9A441] shadow-lg'
                    : 'bg-[#131B2E] border-[#1e3054]'
                }`}
              >
                {/* Rank & Avatar */}
                <div className="flex items-center gap-3">
                  <div
                    className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                      index === 0 ? 'bg-[#D9A441] text-[#080B14]' : 'bg-[#1e3054] text-slate-300'
                    }`}
                  >
                    {rankBadge}
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/80 text-sm shadow"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {player.name}
                      {player.isBankrupt && (
                        <span className="text-[10px] bg-red-900/80 text-red-300 px-1.5 py-0.5 rounded font-mono">
                          BANKRUPT
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Properties: <strong className="text-white">{ownedProperties.length}</strong></span>
                      <span>•</span>
                      <span>Cash: <strong className="text-[#10b981]">{formatRupee(player.money)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Net Worth */}
                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Net Worth</div>
                  <div className="text-base font-black font-display text-[#F5C75A]">
                    {formatRupee(player.netWorth)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0A101C] border-t border-[#1e3054] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D9A441] to-[#F5C75A] text-[#080B14] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Close Standing
          </button>
        </div>
      </div>
    </div>
  );
};
