import { describe, it, expect } from 'vitest';
import { rollDice } from '../game-engine/dice';
import { movePlayer } from '../game-engine/movement';
import { buyProperty } from '../game-engine/properties';
import { advanceTurn, validateTurn } from '../game-engine/turns';
import { addMoney, deductMoney, transferMoney, calculateNetWorth } from '../game-engine/economy';
import { createInitialGameState } from '../game-engine/state';
import { GAME_CONFIG } from '@dhandha/shared';
import type { RoomPlayer } from '@dhandha/shared';

// ─── Test helpers ─────────────────────────────────────────────
const mockRoomPlayers: RoomPlayer[] = [
  { id: 'p1', name: 'Arjun',   character: 'trader',       isReady: true, socketId: 's1', color: '#f59e0b', avatar: '🔴' },
  { id: 'p2', name: 'Priya',   character: 'food-king',    isReady: true, socketId: 's2', color: '#3b82f6', avatar: '🔵' },
  { id: 'p3', name: 'Rahul',   character: 'tech-founder', isReady: true, socketId: 's3', color: '#10b981', avatar: '🟢' },
  { id: 'p4', name: 'Sneha',   character: 'builder',      isReady: true, socketId: 's4', color: '#f43f5e', avatar: '🟡' },
];

function makeState() {
  return createInitialGameState('game-test', 'ABCD12', mockRoomPlayers);
}

// ─── Dice Tests ───────────────────────────────────────────────
describe('rollDice()', () => {
  it('returns two dice values between 1 and 6', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDice();
      expect(result.die1).toBeGreaterThanOrEqual(1);
      expect(result.die1).toBeLessThanOrEqual(6);
      expect(result.die2).toBeGreaterThanOrEqual(1);
      expect(result.die2).toBeLessThanOrEqual(6);
    }
  });

  it('total equals die1 + die2', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollDice();
      expect(result.total).toBe(result.die1 + result.die2);
    }
  });

  it('correctly identifies doubles', () => {
    let foundDouble = false;
    let foundNonDouble = false;
    for (let i = 0; i < 1000; i++) {
      const result = rollDice();
      if (result.isDouble) foundDouble = true;
      else foundNonDouble = true;
      expect(result.isDouble).toBe(result.die1 === result.die2);
    }
    expect(foundDouble).toBe(true);
    expect(foundNonDouble).toBe(true);
  });

  it('total range is always 2–12', () => {
    for (let i = 0; i < 500; i++) {
      const result = rollDice();
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeLessThanOrEqual(12);
    }
  });
});

// ─── Movement Tests ───────────────────────────────────────────
describe('movePlayer()', () => {
  it('moves player forward by dice total', () => {
    const state = makeState();
    const { newState } = movePlayer(state, 'p1', 5);
    const player = newState.players.find(p => p.id === 'p1');
    expect(player?.position).toBe(5);
  });

  it('wraps around the board at position 40', () => {
    const state = makeState();
    // Move to position 39 first
    const { newState: s1 } = movePlayer(state, 'p1', 39);
    // Then move 2 more (39 + 2 = 41 → 1)
    const { newState: s2, passedGo } = movePlayer(s1, 'p1', 2);
    const player = s2.players.find(p => p.id === 'p1');
    expect(player?.position).toBe(1);
    expect(passedGo).toBe(true);
  });


  it('awards pass-GO money when wrapping', () => {
    const state = makeState();
    const { newState: s1 } = movePlayer(state, 'p1', 39);
    const moneyBefore = s1.players.find(p => p.id === 'p1')!.money;
    const { newState: s2, passedGo } = movePlayer(s1, 'p1', 2);
    const moneyAfter = s2.players.find(p => p.id === 'p1')!.money;
    expect(passedGo).toBe(true);
    expect(moneyAfter).toBe(moneyBefore + GAME_CONFIG.PASS_GO_AMOUNT);
  });


  it('does not award pass-GO when not wrapping', () => {
    const state = makeState();
    const moneyBefore = state.players[0].money;
    const { newState, passedGo } = movePlayer(state, 'p1', 10);
    const moneyAfter = newState.players[0].money;
    expect(passedGo).toBe(false);
    expect(moneyAfter).toBe(moneyBefore);
  });
});

// ─── Economy Tests ────────────────────────────────────────────
describe('economy', () => {
  it('addMoney increases player balance', () => {
    const state = makeState();
    const newState = addMoney(state, 'p1', 5000);
    const player = newState.players.find(p => p.id === 'p1');
    expect(player?.money).toBe(GAME_CONFIG.STARTING_MONEY + 5000);
  });

  it('deductMoney decreases player balance', () => {
    const state = makeState();
    const newState = deductMoney(state, 'p1', 3000);
    const player = newState.players.find(p => p.id === 'p1');
    expect(player?.money).toBe(GAME_CONFIG.STARTING_MONEY - 3000);
  });

  it('deductMoney does not go below 0', () => {
    const state = makeState();
    const newState = deductMoney(state, 'p1', 999999);
    const player = newState.players.find(p => p.id === 'p1');
    expect(player?.money).toBe(0);
  });

  it('transferMoney moves money between players', () => {
    const state = makeState();
    const p1Before = state.players.find(p => p.id === 'p1')!.money;
    const p2Before = state.players.find(p => p.id === 'p2')!.money;
    const newState = transferMoney(state, 'p1', 'p2', 2000);
    const p1After = newState.players.find(p => p.id === 'p1')!.money;
    const p2After = newState.players.find(p => p.id === 'p2')!.money;
    expect(p1After).toBe(p1Before - 2000);
    expect(p2After).toBe(p2Before + 2000);
  });

  it('calculateNetWorth = money + property values', () => {
    const state = makeState();
    // Buy Chandni Bazaar (tileId 1, price ₹600)
    const { newState: bought } = buyProperty(
      { ...state, players: state.players.map(p => p.id === 'p1' ? { ...p, position: 1 } : p) },
      'p1',
      1,
    ) as { newState: typeof state };
    const player = bought.players.find(p => p.id === 'p1')!;
    expect(player.netWorth).toBeGreaterThan(GAME_CONFIG.STARTING_MONEY - 600); // still owns property worth 600
  });
});

// ─── Property Tests ───────────────────────────────────────────
describe('buyProperty()', () => {
  it('allows buying an unowned property', () => {
    const state = makeState();
    const stateWithPosition = {
      ...state,
      players: state.players.map(p => p.id === 'p1' ? { ...p, position: 1 } : p),
    };
    const result = buyProperty(stateWithPosition, 'p1', 1);
    expect(result.success).toBe(true);
    if (result.success) {
      const prop = result.newState.properties.find(p => p.tileId === 1);
      expect(prop?.ownerId).toBe('p1');
      expect(prop?.level).toBe(1);
    }
  });

  it('deducts the correct price', () => {
    const state = makeState();
    const stateWithPosition = {
      ...state,
      players: state.players.map(p => p.id === 'p1' ? { ...p, position: 1 } : p),
    };
    const result = buyProperty(stateWithPosition, 'p1', 1); // Chandni Bazaar = ₹600
    expect(result.success).toBe(true);
    if (result.success) {
      const player = result.newState.players.find(p => p.id === 'p1');
      expect(player?.money).toBe(GAME_CONFIG.STARTING_MONEY - 600);
    }
  });

  it('rejects purchase with insufficient funds', () => {
    const state = makeState();
    const poorState = {
      ...state,
      players: state.players.map(p => p.id === 'p1' ? { ...p, money: 100, position: 35 } : p),
    };
    const result = buyProperty(poorState, 'p1', 35); // Beach Resort = ₹4500
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Insufficient');
    }
  });

  it('rejects buying an already-owned property', () => {
    const state = makeState();
    const stateWithPosition = {
      ...state,
      players: state.players.map(p => p.id === 'p1' ? { ...p, position: 1 } : p),
    };
    const result1 = buyProperty(stateWithPosition, 'p1', 1);
    expect(result1.success).toBe(true);
    if (result1.success) {
      const stateWithPosition2 = {
        ...result1.newState,
        players: result1.newState.players.map(p => p.id === 'p2' ? { ...p, position: 1 } : p),
      };
      const result2 = buyProperty(stateWithPosition2, 'p2', 1);
      expect(result2.success).toBe(false);
    }
  });

  it('rejects buying when player is not on the tile', () => {
    const state = makeState(); // All players start at position 0
    const result = buyProperty(state, 'p1', 1); // Player is at 0, not 1
    expect(result.success).toBe(false);
  });
});

// ─── Turn Tests ───────────────────────────────────────────────
describe('turn management', () => {
  it('advanceTurn cycles through all players', () => {
    let state = makeState();
    expect(state.currentPlayerId).toBe('p1');
    state = advanceTurn(state);
    expect(state.currentPlayerId).toBe('p2');
    state = advanceTurn(state);
    expect(state.currentPlayerId).toBe('p3');
    state = advanceTurn(state);
    expect(state.currentPlayerId).toBe('p4');
    state = advanceTurn(state);
    expect(state.currentPlayerId).toBe('p1');
  });

  it('validateTurn returns true for current player', () => {
    const state = makeState();
    expect(validateTurn(state, 'p1')).toBe(true);
    expect(validateTurn(state, 'p2')).toBe(false);
  });

  it('advanceTurn increments turnNumber', () => {
    let state = makeState();
    expect(state.turnNumber).toBe(1);
    state = advanceTurn(state);
    expect(state.turnNumber).toBe(2);
  });

  it('advanceTurn resets turnPhase to roll', () => {
    let state = makeState();
    state = { ...state, turnPhase: 'end-turn', hasRolled: true };
    state = advanceTurn(state);
    expect(state.turnPhase).toBe('roll');
    expect(state.hasRolled).toBe(false);
  });

  it('skips bankrupt players', () => {
    let state = makeState();
    // Mark p2 as bankrupt
    state = {
      ...state,
      players: state.players.map(p => p.id === 'p2' ? { ...p, isBankrupt: true } : p),
    };
    state = advanceTurn(state); // p1 → should skip p2, go to p3
    expect(state.currentPlayerId).toBe('p3');
  });
});

// ─── Game State Factory Tests ──────────────────────────────────
describe('createInitialGameState()', () => {
  it('creates state with correct number of players', () => {
    const state = makeState();
    expect(state.players).toHaveLength(4);
  });

  it('starts all players at position 0', () => {
    const state = makeState();
    state.players.forEach(p => expect(p.position).toBe(0));
  });

  it('gives all players starting money', () => {
    const state = makeState();
    state.players.forEach(p => expect(p.money).toBe(GAME_CONFIG.STARTING_MONEY));
  });

  it('initializes 27 purchasable properties', () => {
    const state = makeState();
    // 23 city properties + 4 railways = 27
    expect(state.properties).toHaveLength(27);
  });


  it('all properties start unowned', () => {
    const state = makeState();
    state.properties.forEach(p => expect(p.ownerId).toBeNull());
  });

  it('first player gets the turn', () => {
    const state = makeState();
    expect(state.currentPlayerId).toBe('p1');
  });
});
