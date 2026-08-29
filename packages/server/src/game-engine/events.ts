import { randomInt } from 'crypto';
import { GAME_CONFIG } from '@dhandha/shared';
import type { GameState, BoardTileConfig } from '@dhandha/shared';
import { addMoney, deductMoney, payTax, calculateRevenue, transferMoney } from './economy';
import { addGameEvent } from './state';
import { sendToLegalTrouble } from './turns';
import { movePlayer } from './movement';

/**
 * Resolve the effect of landing on a tile.
 * Called after movement — handles all tile types.
 */
export function resolveTileLanding(
  state: GameState,
  playerId: string,
  tile: BoardTileConfig,
): GameState {
  let newState = state;

  switch (tile.type) {
    case 'start':
      // Landing directly on START (not just passing) — give full pass-GO bonus
      newState = addMoney(newState, playerId, GAME_CONFIG.PASS_GO_AMOUNT);
      newState = addGameEvent(newState, {
        type: 'pass-go',
        playerId,
        playerName: newState.players.find(p => p.id === playerId)?.name,
        playerColor: newState.players.find(p => p.id === playerId)?.color,
        message: `⭐ Landed directly on START! Collect ₹${GAME_CONFIG.PASS_GO_AMOUNT.toLocaleString('en-IN')}!`,
        amount: GAME_CONFIG.PASS_GO_AMOUNT,
        icon: '⭐',
      });
      newState = { ...newState, turnPhase: 'end-turn' };
      break;

    case 'tax': {
      const taxAmount = tile.taxAmount ?? 0;
      const { newState: taxedState, amountPaid } = payTax(newState, playerId, taxAmount);
      newState = taxedState;
      const player = newState.players.find(p => p.id === playerId);
      newState = addGameEvent(newState, {
        type: 'tax',
        playerId,
        playerName: player?.name,
        playerColor: player?.color,
        message: `💸 ${player?.name} paid ${tile.name} of ₹${amountPaid.toLocaleString('en-IN')}. Sarkar ko dena hi padta hai!`,
        amount: -amountPaid,
        icon: '💸',
      });
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'festival': {
      const bonus = tile.festivalBonus ?? 1000;
      newState = addMoney(newState, playerId, bonus);
      const player = newState.players.find(p => p.id === playerId);
      newState = addGameEvent(newState, {
        type: 'festival',
        playerId,
        playerName: player?.name,
        playerColor: player?.color,
        message: `🪔 ${player?.name} landed on Utsav! Festival bonus ₹${bonus.toLocaleString('en-IN')} collected!`,
        amount: bonus,
        icon: '🪔',
      });
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'free-rest':
      newState = { ...newState, turnPhase: 'end-turn' };
      break;

    case 'legal-trouble': {
      const player = newState.players.find(p => p.id === playerId);
      if (player && !player.inLegalTrouble) {
        newState = sendToLegalTrouble(newState, playerId);
      } else {
        // Already in trouble — just a visit
        newState = addGameEvent(newState, {
          type: 'move',
          playerId,
          playerName: player?.name,
          playerColor: player?.color,
          message: `${player?.name} is just visiting Legal Trouble. Phew!`,
          icon: '😅',
        });
      }
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'property':
    case 'railway': {
      // Check who owns it
      const propState = newState.properties.find(p => p.tileId === tile.id);
      const player = newState.players.find(p => p.id === playerId);

      if (!propState || !propState.ownerId) {
        // Unowned — player can buy it (modal triggered on client)
        newState = { ...newState, turnPhase: 'post-roll' };
      } else if (propState.ownerId === playerId) {
        // Own it already
        newState = addGameEvent(newState, {
          type: 'move',
          playerId,
          playerName: player?.name,
          playerColor: player?.color,
          message: `${player?.name} landed on their own ${tile.icon} ${tile.name}. Safe!`,
          icon: '😊',
        });
        newState = { ...newState, turnPhase: 'end-turn' };
      } else {
        // Someone else owns it — pay revenue
        const ownerId = propState.ownerId;
        const revenue = calculateRevenue(newState, tile.id, ownerId);
        const owner = newState.players.find(p => p.id === ownerId);

        if (revenue > 0 && !propState.isMortgaged) {
          newState = transferMoney(newState, playerId, ownerId, revenue);
          newState = addGameEvent(newState, {
            type: 'revenue',
            playerId,
            playerName: player?.name,
            playerColor: player?.color,
            message: `💰 ${player?.name} paid ₹${revenue.toLocaleString('en-IN')} revenue to ${owner?.name} for ${tile.icon} ${tile.name}!`,
            amount: -revenue,
            icon: '💰',
          });
        }
        newState = { ...newState, turnPhase: 'end-turn' };
      }
      break;
    }

    case 'market-event': {
      newState = triggerMarketEvent(newState, playerId);
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'desi-event': {
      newState = triggerDesiEvent(newState, playerId);
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'luck': {
      newState = triggerLuckEvent(newState, playerId);
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'chance': {
      // Chance cards behave like luck events
      newState = triggerLuckEvent(newState, playerId);
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'community-chest': {
      // Community chest behaves like desi events
      newState = triggerDesiEvent(newState, playerId);
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    case 'treasure': {
      // Treasure gives a bonus (uses festivalBonus field)
      const bonus = tile.festivalBonus ?? 1000;
      newState = addMoney(newState, playerId, bonus);
      const tp = newState.players.find(p => p.id === playerId);
      newState = addGameEvent(newState, {
        type: 'festival',
        playerId,
        playerName: tp?.name,
        playerColor: tp?.color,
        message: `💎 ${tp?.name} found KHAZANA! Collected ₹${bonus.toLocaleString('en-IN')} treasure!`,
        amount: bonus,
        icon: '💎',
      });
      newState = { ...newState, turnPhase: 'end-turn' };
      break;
    }

    default:
      newState = { ...newState, turnPhase: 'end-turn' };
  }

  return newState;
}

function triggerMarketEvent(state: GameState, _playerId: string): GameState {
  const events = GAME_CONFIG.MARKET_EVENTS;
  const event = events[randomInt(0, events.length)];

  const groupMultipliers: Record<string, number> = {};
  if (event.groupMultipliers) {
    Object.assign(groupMultipliers, event.groupMultipliers);
  }

  let newState: GameState = {
    ...state,
    marketState: {
      activeEventId: event.id,
      activeEventName: event.name,
      activeEventIcon: event.icon,
      activeEventDescription: event.description,
      turnsRemaining: event.turns,
      groupMultipliers: groupMultipliers as GameState['marketState']['groupMultipliers'],
    },
  };

  // Apply flat bonus/penalty to all players
  if (event.flatBonus !== 0) {
    for (const player of newState.players) {
      if (!player.isBankrupt) {
        if (event.flatBonus > 0) {
          newState = addMoney(newState, player.id, event.flatBonus);
        } else {
          newState = deductMoney(newState, player.id, Math.abs(event.flatBonus));
        }
      }
    }
  }

  newState = addGameEvent(newState, {
    type: 'market-event',
    message: `${event.icon} MARKET EVENT: ${event.name} — ${event.description}`,
    icon: event.icon,
  });

  return newState;
}

function triggerDesiEvent(state: GameState, playerId: string): GameState {
  const events = GAME_CONFIG.DESI_EVENTS;
  const event = events[randomInt(0, events.length)];
  let newState = state;
  const player = state.players.find(p => p.id === playerId);

  if (event.type === 'gain' && event.amount > 0) {
    newState = addMoney(newState, playerId, event.amount);
  } else if (event.type === 'lose' && event.amount < 0) {
    newState = deductMoney(newState, playerId, Math.abs(event.amount));
  } else if (event.type === 'move' && event.amount > 0) {
    // Move the player forward by the specified steps
    try {
      const { newState: moved } = movePlayer(newState, playerId, event.amount);
      newState = moved;
    } catch {
      // If movement fails for any reason, skip gracefully
    }
  }
  // 'skip' type: next turn will be skipped — just log the event, turnPhase already goes to end-turn

  newState = addGameEvent(newState, {
    type: 'desi-event',
    playerId,
    playerName: player?.name,
    playerColor: player?.color,
    message: `${event.icon} DESI EVENT for ${player?.name}: ${event.name} — ${event.description}`,
    amount: event.amount !== 0 ? event.amount : undefined,
    icon: event.icon,
  });

  return newState;
}

function triggerLuckEvent(state: GameState, playerId: string): GameState {
  const events = GAME_CONFIG.LUCK_EVENTS;
  const event = events[randomInt(0, events.length)];
  let newState = state;
  const player = state.players.find(p => p.id === playerId);

  if (event.type === 'gain') {
    newState = addMoney(newState, playerId, event.amount);
  } else {
    newState = deductMoney(newState, playerId, Math.abs(event.amount));
  }

  newState = addGameEvent(newState, {
    type: 'luck',
    playerId,
    playerName: player?.name,
    playerColor: player?.color,
    message: `${event.icon} LUCK for ${player?.name}: ${event.name} — ${event.description}`,
    amount: event.amount,
    icon: event.icon,
  });

  return newState;
}

/**
 * Tick down active market event (called at start of each turn).
 */
export function tickMarketEvent(state: GameState): GameState {
  if (state.marketState.turnsRemaining <= 0) return state;

  const newTurns = state.marketState.turnsRemaining - 1;
  if (newTurns === 0) {
    return {
      ...state,
      marketState: {
        activeEventId: null,
        activeEventName: null,
        activeEventIcon: null,
        activeEventDescription: null,
        turnsRemaining: 0,
        groupMultipliers: {},
      },
    };
  }

  return {
    ...state,
    marketState: { ...state.marketState, turnsRemaining: newTurns },
  };
}
