import { GAME_CONFIG, getTileById } from '@dhandha/shared';
import type { GameState, Player } from '@dhandha/shared';

/**
 * Calculate a player's net worth (money + value of owned properties).
 */
export function calculateNetWorth(
  player: Player,
  properties: GameState['properties'],
): number {
  const propertyValue = properties
    .filter(p => p.ownerId === player.id && !p.isMortgaged)
    .reduce((sum, p) => {
      try {
        const tile = getTileById(p.tileId);
        const baseValue = tile.price ?? 0;
        const upgradeValue = p.level > 1
          ? (tile.upgradeCosts ?? []).slice(0, p.level - 1).reduce((a, b) => a + b, 0)
          : 0;
        return sum + baseValue + upgradeValue;
      } catch {
        return sum;
      }
    }, 0);

  return player.money + propertyValue;
}

/**
 * Add money to a player's balance.
 */
export function addMoney(
  state: GameState,
  playerId: string,
  amount: number,
): GameState {
  const idx = state.players.findIndex(p => p.id === playerId);
  if (idx === -1) return state;

  const updated = [...state.players];
  const player = updated[idx];
  const newMoney = player.money + amount;
  updated[idx] = {
    ...player,
    money: newMoney,
    netWorth: calculateNetWorth({ ...player, money: newMoney }, state.properties),
  };
  return { ...state, players: updated };
}

/**
 * Deduct money from a player's balance (clamps to 0 — no negative balance in Phase 1).
 */
export function deductMoney(
  state: GameState,
  playerId: string,
  amount: number,
): GameState {
  const idx = state.players.findIndex(p => p.id === playerId);
  if (idx === -1) return state;

  const updated = [...state.players];
  const player = updated[idx];
  const newMoney = Math.max(0, player.money - amount);
  updated[idx] = {
    ...player,
    money: newMoney,
    netWorth: calculateNetWorth({ ...player, money: newMoney }, state.properties),
  };
  return { ...state, players: updated };
}

/**
 * Transfer money from one player to another.
 * If fromPlayer doesn't have enough, transfers what they have.
 */
export function transferMoney(
  state: GameState,
  fromPlayerId: string,
  toPlayerId: string,
  amount: number,
): GameState {
  const fromIdx = state.players.findIndex(p => p.id === fromPlayerId);
  if (fromIdx === -1) return state;

  const fromPlayer = state.players[fromIdx];
  const actualAmount = Math.min(fromPlayer.money, amount);

  let newState = deductMoney(state, fromPlayerId, actualAmount);
  newState = addMoney(newState, toPlayerId, actualAmount);
  return newState;
}

/**
 * Pay tax from a player.
 * Returns { newState, amountPaid }.
 */
export function payTax(
  state: GameState,
  playerId: string,
  taxAmount: number,
): { newState: GameState; amountPaid: number } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { newState: state, amountPaid: 0 };

  const amountPaid = Math.min(player.money, taxAmount);
  const newState = deductMoney(state, playerId, amountPaid);
  return { newState, amountPaid };
}

/**
 * Calculate revenue owed when a player lands on an opponent's property.
 * Accounts for market state multipliers and group bonus.
 */
export function calculateRevenue(
  state: GameState,
  tileId: number,
  ownerId: string,
): number {
  try {
    const tile = getTileById(tileId);
    const propState = state.properties.find(p => p.tileId === tileId);

    if (!propState || propState.isMortgaged || propState.level === 0) return 0;

    let revenue = 0;

    if (tile.type === 'railway') {
      // Railway revenue depends on how many railways the owner has
      const ownedRailways = state.properties.filter(
        p => p.ownerId === ownerId && getTileById(p.tileId).type === 'railway',
      ).length;
      revenue = tile.railwayRevenue?.[ownedRailways - 1] ?? 0;
    } else if (tile.type === 'property' && tile.revenue) {
      revenue = tile.revenue[propState.level - 1] ?? 0;
    }

    if (revenue === 0) return 0;

    // Apply market event multipliers
    const multiplier = tile.group
      ? (state.marketState.groupMultipliers[tile.group] ?? 1)
      : 1;

    // Apply group ownership bonus
    let groupBonus = 1;
    if (tile.group) {
      const groupConfig = GAME_CONFIG.PROPERTY_GROUPS.find(g => g.group === tile.group);
      if (groupConfig) {
        const groupTiles = groupConfig.tileIds;
        const ownsAll = groupTiles.every(tId => {
          const prop = state.properties.find(p => p.tileId === tId);
          return prop?.ownerId === ownerId;
        });
        if (ownsAll) {
          groupBonus = 1 + groupConfig.bonusPercent / 100;
        }
      }
    }

    return Math.floor(revenue * multiplier * groupBonus);
  } catch {
    return 0;
  }
}
