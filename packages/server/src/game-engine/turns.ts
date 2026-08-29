import type { GameState } from '@dhandha/shared';
import { GAME_CONFIG } from '@dhandha/shared';
import { addGameEvent } from './state';

/**
 * Validate that it's the given player's turn and they can perform a turn action.
 */
export function validateTurn(state: GameState, playerId: string): boolean {
  return (
    state.phase === 'playing' &&
    state.currentPlayerId === playerId
  );
}

/**
 * Advance to the next player's turn.
 * Skips bankrupt and disconnected players.
 */
export function advanceTurn(state: GameState): GameState {
  const activePlayers = state.players.filter(p => !p.isBankrupt);
  if (activePlayers.length === 0) return state;

  const currentIndex = activePlayers.findIndex(p => p.id === state.currentPlayerId);
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  const nextPlayer = activePlayers[nextIndex];

  let newState: GameState = {
    ...state,
    currentPlayerId: nextPlayer.id,
    turnPhase: 'roll',
    turnNumber: state.turnNumber + 1,
    lastDice: null,
    hasRolled: false,
    turnExpiresAt: Date.now() + 60000,
  };

  newState = addGameEvent(newState, {
    type: 'turn',
    playerId: nextPlayer.id,
    playerName: nextPlayer.name,
    playerColor: nextPlayer.color,
    message: `${nextPlayer.avatar} ${nextPlayer.name}'s turn — roll the dice!`,
    icon: '🎲',
  });

  return newState;
}

/**
 * Mark player as in legal trouble.
 */
export function sendToLegalTrouble(state: GameState, playerId: string): GameState {
  const idx = state.players.findIndex(p => p.id === playerId);
  if (idx === -1) return state;

  const player = state.players[idx];
  const updated = [...state.players];
  updated[idx] = {
    ...player,
    position: GAME_CONFIG.LEGAL_TROUBLE_POSITION, // Legal Trouble / Jail tile
    inLegalTrouble: true,
    legalTroubleTurns: 3,
    doubleRollCount: 0,
  };

  let newState = { ...state, players: updated };
  newState = addGameEvent(newState, {
    type: 'legal-trouble',
    playerId,
    playerName: player.name,
    playerColor: player.color,
    message: `⚖️ ${player.name} is in LEGAL TROUBLE! Stuck for 3 turns or pay ₹1,500 bail.`,
    icon: '⚖️',
  });

  return newState;
}

/**
 * Attempt to escape legal trouble (by paying bail or rolling doubles).
 * Returns the new state and whether they escaped.
 */
export function tryEscapeLegalTrouble(
  state: GameState,
  playerId: string,
  method: 'bail' | 'doubles',
): { newState: GameState; escaped: boolean } {
  const idx = state.players.findIndex(p => p.id === playerId);
  if (idx === -1) return { newState: state, escaped: false };

  const player = state.players[idx];
  if (!player.inLegalTrouble) return { newState: state, escaped: false };

  let escaped = false;
  let newState = state;

  if (method === 'bail') {
    if (player.money >= 1500) {
      const updated = [...newState.players];
      updated[idx] = {
        ...player,
        money: player.money - 1500,
        inLegalTrouble: false,
        legalTroubleTurns: 0,
      };
      newState = { ...newState, players: updated };
      newState = addGameEvent(newState, {
        type: 'legal-escape',
        playerId,
        playerName: player.name,
        playerColor: player.color,
        message: `${player.name} paid ₹1,500 bail and is FREE!`,
        amount: 1500,
        icon: '🆓',
      });
      escaped = true;
    }
  } else if (method === 'doubles') {
    // Doubles are checked in the dice handler — this just updates state
    const updated = [...newState.players];
    updated[idx] = {
      ...player,
      inLegalTrouble: false,
      legalTroubleTurns: 0,
    };
    newState = { ...newState, players: updated };
    newState = addGameEvent(newState, {
      type: 'legal-escape',
      playerId,
      playerName: player.name,
      playerColor: player.color,
      message: `${player.name} rolled doubles and escaped Legal Trouble! 🎉`,
      icon: '🎉',
    });
    escaped = true;
  }

  return { newState, escaped };
}

/**
 * Decrement legal trouble turns for a player.
 */
export function decrementLegalTroubleTurns(state: GameState, playerId: string): GameState {
  const idx = state.players.findIndex(p => p.id === playerId);
  if (idx === -1) return state;

  const player = state.players[idx];
  const updated = [...state.players];
  const newTurns = player.legalTroubleTurns - 1;

  updated[idx] = {
    ...player,
    legalTroubleTurns: newTurns,
    inLegalTrouble: newTurns > 0,
  };

  return { ...state, players: updated };
}
