import { v4 as uuidv4 } from 'uuid';
import { GAME_CONFIG } from '@dhandha/shared';
import type {
  GameState,
  Player,
  PropertyState,
  MarketState,
  RoomPlayer,
} from '@dhandha/shared';

const EMPTY_MARKET_STATE: MarketState = {
  activeEventId: null,
  activeEventName: null,
  activeEventIcon: null,
  activeEventDescription: null,
  turnsRemaining: 0,
  groupMultipliers: {},
};

/**
 * Create a fresh GameState for a new game.
 * Called when the host starts the game from the lobby.
 */
export function createInitialGameState(
  gameId: string,
  roomCode: string,
  roomPlayers: RoomPlayer[],
): GameState {
  // Build players from room players (already have color/avatar assigned)
  const players: Player[] = roomPlayers.map((rp, index) => ({
    id: rp.id,
    name: rp.name,
    character: rp.character ?? 'trader',
    position: 0,
    money: GAME_CONFIG.STARTING_MONEY,
    netWorth: GAME_CONFIG.STARTING_MONEY,
    isConnected: true,
    isReady: true,
    isBankrupt: false,
    inLegalTrouble: false,
    legalTroubleTurns: 0,
    doubleRollCount: 0,
    color: rp.color,
    avatar: rp.avatar,
    socketId: rp.socketId,
  }));

  // Initialize all purchasable properties as unowned
  const properties: PropertyState[] = GAME_CONFIG.BOARD
    .filter(tile => tile.type === 'property' || tile.type === 'railway')
    .map(tile => ({
      tileId: tile.id,
      ownerId: null,
      level: 0,
      isMortgaged: false,
    }));

  const firstPlayer = players[0];

  return {
    gameId,
    roomCode,
    phase: 'playing',
    turnPhase: 'roll',
    currentPlayerId: firstPlayer.id,
    turnNumber: 1,
    players,
    properties,
    events: [
      {
        id: uuidv4(),
        type: 'game-start',
        message: '🎉 Dhandha shuru! Game has started. Good luck to all players!',
        timestamp: Date.now(),
        icon: '🎉',
      },
      {
        id: uuidv4(),
        type: 'turn',
        playerId: firstPlayer.id,
        playerName: firstPlayer.name,
        playerColor: firstPlayer.color,
        message: `${firstPlayer.avatar} ${firstPlayer.name} goes first! Roll the dice.`,
        timestamp: Date.now(),
        icon: '🎲',
      },
    ],
    chatMessages: [],
    tradeOffers: [],
    marketState: { ...EMPTY_MARKET_STATE },
    lastDice: null,
    hasRolled: false,
    winner: null,
    startedAt: Date.now(),
    endedAt: null,
    turnExpiresAt: Date.now() + 60000,
  };
}

/**
 * Add an event to the event log (capped at MAX_EVENTS_LOG).
 */
export function addGameEvent(
  state: GameState,
  event: Omit<import('@dhandha/shared').GameEvent, 'id' | 'timestamp'>,
): GameState {
  const newEvent = {
    ...event,
    id: uuidv4(),
    timestamp: Date.now(),
  };
  const events = [newEvent, ...state.events].slice(0, GAME_CONFIG.MAX_EVENTS_LOG);
  return { ...state, events };
}
