import { GAME_CONFIG, getTileById } from '@dhandha/shared';
import type { GameState, BoardTileConfig } from '@dhandha/shared';
import { addGameEvent } from './state';

export interface MoveResult {
  newState: GameState;
  passedGo: boolean;
  landedTile: BoardTileConfig;
}

/**
 * Move a player by `steps` positions around the 36-tile board.
 * Awards pass-GO money if the player crosses position 0.
 * Pure function — returns new state, never mutates.
 */
export function movePlayer(
  state: GameState,
  playerId: string,
  steps: number,
): MoveResult {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) throw new Error(`Player ${playerId} not found`);

  const player = state.players[playerIndex];
  const oldPosition = player.position;
  const newPosition = (oldPosition + steps) % GAME_CONFIG.BOARD_SIZE;

  // Did the player cross or land on START (position 0)?
  const passedGo = newPosition < oldPosition || steps >= GAME_CONFIG.BOARD_SIZE;

  // Update player position
  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = { ...player, position: newPosition };

  let newState: GameState = { ...state, players: updatedPlayers };

  // Award pass-GO bonus
  if (passedGo && newPosition !== 0) {
    newState = addGameEvent(newState, {
      type: 'pass-go',
      playerId,
      playerName: player.name,
      playerColor: player.color,
      message: `${player.avatar} ${player.name} passed START! Collect ₹${GAME_CONFIG.PASS_GO_AMOUNT.toLocaleString('en-IN')}.`,
      amount: GAME_CONFIG.PASS_GO_AMOUNT,
      icon: '⭐',
    });
    // Add money
    const pi2 = newState.players.findIndex(p => p.id === playerId);
    const updatedPlayers2 = [...newState.players];
    updatedPlayers2[pi2] = {
      ...updatedPlayers2[pi2],
      money: updatedPlayers2[pi2].money + GAME_CONFIG.PASS_GO_AMOUNT,
    };
    newState = { ...newState, players: updatedPlayers2 };
  }

  // Add move event
  const landedTile = getTileById(newPosition);
  newState = addGameEvent(newState, {
    type: 'move',
    playerId,
    playerName: player.name,
    playerColor: player.color,
    message: `${player.avatar} ${player.name} moved to ${landedTile.icon} ${landedTile.name} (position ${newPosition}).`,
    icon: '🚶',
  });

  return { newState, passedGo, landedTile };
}
