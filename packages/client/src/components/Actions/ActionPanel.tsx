import React from 'react';
import type { GameState } from '@dhandha/shared';
import { getTileById } from '@dhandha/shared';
import { DiceRoller } from '../Dice/DiceRoller';
import { formatRupee } from '../../utils/format';
import { playDiceRollSound, playBuyPropertySound } from '../../utils/sound';
import { useUIStore } from '../../store/uiStore';

interface ActionPanelProps {
  gameState: GameState;
  localPlayerId: string;
  onRollDice: () => void;
  onBuyBusiness: (tileId: number) => void;
  onPassProperty: () => void;
  onEndTurn: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  gameState,
  localPlayerId,
  onRollDice,
  onBuyBusiness,
  onPassProperty,
  onEndTurn,
}) => {
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const isMyTurn = gameState.currentPlayerId === localPlayerId;
  const localPlayer = gameState.players.find((p) => p.id === localPlayerId);
  const currentTile = localPlayer ? getTileById(localPlayer.position) : null;
  const propState = currentTile
    ? gameState.properties.find((p) => p.tileId === currentTile.id)
    : null;

  const canBuy =
    isMyTurn &&
    gameState.turnPhase === 'post-roll' &&
    currentTile &&
    (currentTile.type === 'property' || currentTile.type === 'railway') &&
    !propState?.ownerId &&
    (localPlayer?.money ?? 0) >= (currentTile.price ?? 0);

  const handleRollClick = () => {
    playDiceRollSound(soundEnabled);
    onRollDice();
  };

  const handleBuyClick = (tileId: number) => {
    playBuyPropertySound(soundEnabled);
    onBuyBusiness(tileId);
  };


  return (
    <div className="glass-panel-gold p-4 flex flex-col items-center justify-between gap-3 h-full">
      {/* Turn status header */}
      <div className="text-center">
        {isMyTurn ? (
          <div className="text-gold font-display font-extrabold text-sm uppercase tracking-wider animate-pulse">
            ⚡ YOUR TURN! MAKE YOUR MOVE
          </div>
        ) : (
          <div className="text-slate-400 text-xs font-medium">
            Waiting for{' '}
            <span
              className="font-bold text-white"
              style={{
                color: gameState.players.find((p) => p.id === gameState.currentPlayerId)?.color,
              }}
            >
              {gameState.players.find((p) => p.id === gameState.currentPlayerId)?.name}
            </span>
            ...
          </div>
        )}
      </div>

      {/* Dice Display */}
      <DiceRoller dice={gameState.lastDice} />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        {/* Roll Dice Button */}
        {gameState.turnPhase === 'roll' && (
          <button
            onClick={onRollDice}
            disabled={!isMyTurn || gameState.hasRolled}
            className="btn-primary flex items-center justify-center gap-2 w-full py-3 text-lg"
          >
            <span>🎲</span>
            <span>ROLL DICE</span>
          </button>
        )}

        {/* Buy Business Options */}
        {gameState.turnPhase === 'post-roll' && currentTile && !propState?.ownerId && (
          <div className="flex flex-col items-center gap-2 w-full animate-bounce-in">
            <div className="text-xs text-slate-300 text-center">
              Land on <span className="font-bold text-gold">{currentTile.name}</span> for{' '}
              <span className="font-bold text-emerald-400">
                {formatRupee(currentTile.price ?? 0)}
              </span>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => onBuyBusiness(currentTile.id)}
                disabled={!canBuy}
                className="btn-success flex-1 py-2 text-xs flex items-center justify-center gap-1"
              >
                <span>💰</span>
                <span>BUY BUSINESS</span>
              </button>
              <button
                onClick={onPassProperty}
                disabled={!isMyTurn}
                className="btn-secondary py-2 text-xs"
              >
                PASS
              </button>
            </div>
          </div>
        )}

        {/* End Turn Button */}
        {(gameState.turnPhase === 'end-turn' ||
          (gameState.turnPhase === 'post-roll' && propState?.ownerId)) && (
          <button
            onClick={onEndTurn}
            disabled={!isMyTurn}
            className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <span>⏩</span>
            <span>END TURN</span>
          </button>
        )}
      </div>
    </div>
  );
};
