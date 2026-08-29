import React, { useState } from 'react';
import type { GameState, Player } from '@dhandha/shared';
import { getTileById } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';

interface KangalModalProps {
  gameState: GameState;
  localPlayer: Player;
  onConfirmSurrender: (transferTargetId?: string) => void;
  onClose: () => void;
}

export const KangalModal: React.FC<KangalModalProps> = ({
  gameState,
  localPlayer,
  onConfirmSurrender,
  onClose,
}) => {
  const [transferChoice, setTransferChoice] = useState<string>('distribute_all');
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const activeOpponents = (gameState?.players || []).filter(
    (p) => p.id !== localPlayer?.id && !p.isBankrupt
  );

  const myProperties = (gameState?.properties || [])
    .filter((p) => p.ownerId === localPlayer?.id)
    .map((p) => {
      try {
        return getTileById(p.tileId);
      } catch {
        return null;
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  const myCash = localPlayer?.money ?? 0;

  const handleSurrender = () => {
    onConfirmSurrender(transferChoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121215] border-2 border-red-600/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-red-950/50 overflow-hidden text-[#fafafa] flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950/80 via-zinc-900 to-red-950/80 border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🪣</span>
            <div>
              <h2 className="text-lg font-black font-display text-red-400 tracking-wide uppercase">
                DECLARE KANGAL
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">
                Diwala Nikal Gaya? Forfeit and transfer your empire.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          
          {/* Desi Quote Banner */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-center">
            <span className="text-sm font-bold italic">
              "Bhai mera dhandha thap ho gaya! Mujhse ab ye vyapar nahi sambhal raha!"
            </span>
          </div>

          {/* Asset Summary */}
          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">
              📦 ASSETS YOU WILL FORFEIT:
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-[#09090b] p-2 rounded-lg border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Remaining Cash</div>
                <div className="font-display font-black text-sm text-green-400">
                  {formatRupee(myCash)}
                </div>
              </div>

              <div className="bg-[#09090b] p-2 rounded-lg border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Cities & Airports</div>
                <div className="font-display font-black text-sm text-amber-400">
                  🏢 {myProperties.length} Properties
                </div>
              </div>
            </div>

            {myProperties.length > 0 && (
              <div className="pt-2">
                <div className="text-[10px] text-zinc-400 mb-1 font-semibold">Properties list:</div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {myProperties.map((prop) => (
                    <span
                      key={prop.id}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-[10px] font-bold border border-zinc-700 flex items-center gap-1"
                    >
                      <span>{prop.icon}</span>
                      <span>{prop.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transfer Target Selection */}
          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <h3 className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
              🎁 CHOOSE HOW TO DISTRIBUTE ASSETS:
            </h3>

            <div className="space-y-1.5 pt-1">
              {/* Option 1: Distribute Equally */}
              <label
                onClick={() => setTransferChoice('distribute_all')}
                className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  transferChoice === 'distribute_all'
                    ? 'bg-red-950/30 border-red-500 text-white shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <input
                  type="radio"
                  name="transferTarget"
                  checked={transferChoice === 'distribute_all'}
                  onChange={() => setTransferChoice('distribute_all')}
                  className="accent-red-500"
                />
                <div>
                  <div className="font-bold text-xs text-zinc-200 flex items-center gap-1">
                    <span>🌍</span>
                    <span>Distribute Equally to All Players</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Split cash and round-robin properties among remaining active players.
                  </div>
                </div>
              </label>

              {/* Option 2: Specific Player Transfer */}
              {activeOpponents.map((opponent) => (
                <label
                  key={opponent.id}
                  onClick={() => setTransferChoice(opponent.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    transferChoice === opponent.id
                      ? 'bg-red-950/30 border-red-500 text-white shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="transferTarget"
                    checked={transferChoice === opponent.id}
                    onChange={() => setTransferChoice(opponent.id)}
                    className="accent-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border"
                      style={{ borderColor: opponent.color, backgroundColor: `${opponent.color}22` }}
                    >
                      {opponent.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-200">
                        Transfer 100% to <span style={{ color: opponent.color }}>{opponent.name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Hand over all your cash & properties as a parting alliance gift.
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Double Confirmation Checkbox */}
          <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="confirmKangal"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-0.5 accent-red-600 rounded cursor-pointer"
            />
            <label htmlFor="confirmKangal" className="text-[11px] text-zinc-300 cursor-pointer select-none font-medium">
              I understand that declaring Kangal will forfeit all my assets, make me bankrupt, and eliminate me from the game.
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
          >
            Cancel (Keep Playing)
          </button>

          <button
            onClick={handleSurrender}
            disabled={!hasConfirmed}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <span>🪣</span>
            <span>DIWALA NIKAL GAYA (SURRENDER)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
