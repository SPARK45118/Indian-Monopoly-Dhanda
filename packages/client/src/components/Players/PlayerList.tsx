import React from 'react';
import type { Player, PropertyState } from '@dhandha/shared';
import { PlayerPanel } from './PlayerPanel';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  localPlayerId: string;
  properties: PropertyState[];
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  localPlayerId,
  properties,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {players.map((player) => {
        const propCount = properties.filter((p) => p.ownerId === player.id).length;
        return (
          <PlayerPanel
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentPlayerId}
            isLocalPlayer={player.id === localPlayerId}
            propertyCount={propCount}
          />
        );
      })}
    </div>
  );
};


