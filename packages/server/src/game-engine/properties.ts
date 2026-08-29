import { getTileById } from '@dhandha/shared';
import type { GameState } from '@dhandha/shared';
import { deductMoney, calculateNetWorth } from './economy';

export type PropertyResult =
  | { success: true; newState: GameState }
  | { success: false; error: string };

/**
 * Attempt to purchase a property for a player.
 * Server validates everything — client just requests.
 */
export function buyProperty(
  state: GameState,
  playerId: string,
  tileId: number,
): PropertyResult {
  // --- Validate ---
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: 'Player not found' };
  if (player.isBankrupt) return { success: false, error: 'Bankrupt players cannot buy' };

  let tile: ReturnType<typeof getTileById>;
  try {
    tile = getTileById(tileId);
  } catch {
    return { success: false, error: 'Invalid tile' };
  }

  if (tile.type !== 'property' && tile.type !== 'railway') {
    return { success: false, error: 'This tile is not purchasable' };
  }

  const price = tile.price;
  if (!price) return { success: false, error: 'Tile has no price' };

  // Check not already owned
  const existingProp = state.properties.find(p => p.tileId === tileId);
  if (existingProp?.ownerId) {
    return { success: false, error: 'Property is already owned' };
  }

  // Check player is on this tile
  if (player.position !== tileId) {
    return { success: false, error: 'Player is not on this tile' };
  }

  // Check sufficient funds
  if (player.money < price) {
    return { success: false, error: `Insufficient funds. Need ₹${price.toLocaleString('en-IN')}, have ₹${player.money.toLocaleString('en-IN')}` };
  }

  // --- Execute ---
  // Deduct money
  let newState = deductMoney(state, playerId, price);

  // Update property ownership
  const propIndex = newState.properties.findIndex(p => p.tileId === tileId);
  const updatedProperties = [...newState.properties];

  if (propIndex >= 0) {
    updatedProperties[propIndex] = {
      ...updatedProperties[propIndex],
      ownerId: playerId,
      level: 1,
    };
  } else {
    updatedProperties.push({
      tileId,
      ownerId: playerId,
      level: 1,
      isMortgaged: false,
    });
  }

  // Recalculate net worth
  const playerIdx = newState.players.findIndex(p => p.id === playerId);
  const updatedPlayers = [...newState.players];
  updatedPlayers[playerIdx] = {
    ...updatedPlayers[playerIdx],
    netWorth: calculateNetWorth(updatedPlayers[playerIdx], updatedProperties),
  };

  newState = { ...newState, properties: updatedProperties, players: updatedPlayers };

  return { success: true, newState };
}

/**
 * Get all properties owned by a player.
 */
export function getPlayerProperties(state: GameState, playerId: string) {
  return state.properties
    .filter(p => p.ownerId === playerId)
    .map(p => ({ ...p, tile: getTileById(p.tileId) }));
}

/**
 * Get the owner of a property, or null if unowned.
 */
export function getPropertyOwner(state: GameState, tileId: number): string | null {
  return state.properties.find(p => p.tileId === tileId)?.ownerId ?? null;
}
