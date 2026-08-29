import React, { useState, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '@dhandha/shared';
import type { GameState, Player } from '@dhandha/shared';
import { BoardTile } from './BoardTile';
import { CenterStage } from './CenterStage';
import { playTileHopSound } from '../../utils/sound';
import { useUIStore } from '../../store/uiStore';

interface BoardProps {
  gameState: GameState;
  localPlayerId: string;
  onTileClick?: (tileId: number) => void;
  onRollDice: () => void;
  onBuyBusiness: (tileId: number) => void;
  onPassProperty: () => void;
  onEndTurn: () => void;
  onOpenTrade?: () => void;
  onUpgradeProperty?: (tileId: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  localPlayerId,
  onTileClick,
  onRollDice,
  onBuyBusiness,
  onPassProperty,
  onEndTurn,
  onOpenTrade,
  onUpgradeProperty,
}) => {
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayerId
  );

  // Animated display positions: playerId -> tileId (0-39)
  const [displayPositions, setDisplayPositions] = useState<Record<string, number>>({});
  const [hoppingPlayerIds, setHoppingPlayerIds] = useState<string[]>([]);
  const animTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cleanup all timers on unmount only
  useEffect(() => {
    const timers = animTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    gameState.players.forEach((player) => {
      const currentPos = displayPositions[player.id];
      const targetPos = player.position;

      // First time initialization
      if (currentPos === undefined) {
        setDisplayPositions((prev) => ({ ...prev, [player.id]: targetPos }));
        return;
      }

      // If position changed, animate step-by-step
      if (currentPos !== targetPos && !animTimersRef.current[player.id]) {
        let stepPos = currentPos;

        setHoppingPlayerIds((prev) => Array.from(new Set([...prev, player.id])));

        const timer = setInterval(() => {
          stepPos = (stepPos + 1) % GAME_CONFIG.BOARD_SIZE;

          setDisplayPositions((prev) => ({ ...prev, [player.id]: stepPos }));
          playTileHopSound(soundEnabled);

          if (stepPos === targetPos) {
            clearInterval(timer);
            delete animTimersRef.current[player.id];
            setHoppingPlayerIds((prev) => prev.filter((id) => id !== player.id));
          }
        }, 180);

        animTimersRef.current[player.id] = timer;
      }
    });
  }, [gameState.players]);

  const getDisplayedPlayersOnTile = (tileId: number): Player[] => {
    return gameState.players
      .filter((p) => {
        const displayPos = displayPositions[p.id] ?? p.position;
        return displayPos === tileId;
      })
      .map((p) => ({
        ...p,
        position: displayPositions[p.id] ?? p.position,
      }));
  };

  return (
    <div className="board-grid">
      {/* ═══ 12 × 6 INNER DYNAMIC CENTER STAGE ═══ */}
      <div className="board-center">
        <CenterStage
          gameState={gameState}
          localPlayerId={localPlayerId}
          onRollDice={onRollDice}
          onBuyBusiness={onBuyBusiness}
          onPassProperty={onPassProperty}
          onEndTurn={onEndTurn}
          onOpenTrade={onOpenTrade}
          onUpgradeProperty={onUpgradeProperty}
        />
      </div>

      {/* ═══ 40 TILES AROUND 14 × 8 OUTER PERIMETER ═══ */}
      {GAME_CONFIG.BOARD.map((tileConfig) => {
        const propState = gameState.properties.find(
          (p) => p.tileId === tileConfig.id
        );
        const displayedPlayers = getDisplayedPlayersOnTile(tileConfig.id);
        const isCurrentTile =
          (displayPositions[currentPlayer?.id ?? ''] ?? currentPlayer?.position) === tileConfig.id;

        return (
          <BoardTile
            key={tileConfig.id}
            tile={tileConfig}
            players={displayedPlayers}
            propertyState={propState}
            isCurrentPlayerTile={isCurrentTile}
            hoppingPlayerIds={hoppingPlayerIds}
            onClick={() => onTileClick?.(tileConfig.id)}
          />
        );
      })}
    </div>
  );
};
