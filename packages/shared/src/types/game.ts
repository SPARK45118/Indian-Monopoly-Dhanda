// ============================================================
// DHANDHA — Shared TypeScript Types
// All types shared between client and server
// ============================================================

// ─── Game Phase ──────────────────────────────────────────────
export type GamePhase = 'lobby' | 'playing' | 'finished';
export type TurnPhase = 'roll' | 'post-roll' | 'end-turn';

// ─── Tile Types ──────────────────────────────────────────────
export type TileType =
  | 'start'
  | 'property'
  | 'railway'
  | 'market-event'
  | 'desi-event'
  | 'tax'
  | 'festival'
  | 'luck'
  | 'free-rest'
  | 'legal-trouble'
  | 'chance'
  | 'community-chest'
  | 'treasure';

// ─── Property Groups (Color-coded Indian Regions) ───────────
export type PropertyGroup =
  | 'red'
  | 'orange'
  | 'pink'
  | 'green'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'gold'
  | 'indigo'
  | 'teal'
  | 'railway';


// ─── Characters ──────────────────────────────────────────────
export type CharacterId =
  | 'trader'
  | 'food-king'
  | 'tech-founder'
  | 'builder'
  | 'influencer'
  | 'sports-star';

// ─── Board Tile Config (static, from GAME_CONFIG) ────────────
export interface BoardTileConfig {
  id: number; // 0–39 (position on board)
  type: TileType;
  name: string;
  icon: string; // emoji
  description: string;
  // Indian geography metadata
  state?: string; // Indian state/UT name
  city?: string; // Famous city
  monument?: string; // Famous monument/landmark
  // Property-specific
  group?: PropertyGroup;
  color?: string; // hex color for the group
  price?: number;
  revenue?: number[]; // revenue[level-1] for levels 1–4
  upgradeCosts?: number[]; // cost to upgrade: [1→2, 2→3, 3→4]
  // Tax-specific
  taxAmount?: number;
  // Railway-specific (revenue depends on number of railways owned)
  railwayRevenue?: number[]; // [1 owned, 2 owned, 3 owned, 4 owned]
  // Festival-specific
  festivalBonus?: number;
}

// ─── Character Config ─────────────────────────────────────────
export interface CharacterConfig {
  id: CharacterId;
  name: string;
  hindiName: string;
  emoji: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  color: string; // accent color for character
}

// ─── Property Group Config ────────────────────────────────────
export interface PropertyGroupConfig {
  group: PropertyGroup;
  name: string;
  color: string; // hex
  textColor: string; // hex (contrast)
  bonusPercent: number; // % revenue bonus for owning all
  tileIds: number[]; // tile positions in this group
}

// ─── Dynamic Property State (server-managed) ─────────────────
export interface PropertyState {
  tileId: number;
  ownerId: string | null;
  level: number; // 0=unowned land, 1=shop, 2=store, 3=complex, 4=mega
  isMortgaged: boolean;
}

// ─── Player ───────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  character: CharacterId;
  position: number; // 0–35 board position
  money: number; // in rupees
  netWorth: number; // money + property value
  isConnected: boolean;
  isReady: boolean; // in lobby
  isBankrupt: boolean;
  inLegalTrouble: boolean;
  legalTroubleTurns: number; // turns remaining stuck
  doubleRollCount: number; // consecutive doubles (3 = goes to legal trouble)
  color: string; // hex — assigned by server on join
  avatar: string; // emoji — based on character
  socketId: string;
}

// ─── Dice ─────────────────────────────────────────────────────
export interface DiceResult {
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
}

// ─── Game Events (event log) ──────────────────────────────────
export type GameEventType =
  | 'roll'
  | 'move'
  | 'buy'
  | 'revenue'
  | 'tax'
  | 'market-event'
  | 'desi-event'
  | 'luck'
  | 'upgrade'
  | 'legal-trouble'
  | 'legal-escape'
  | 'festival'
  | 'bankrupt'
  | 'pass-go'
  | 'turn'
  | 'game-start'
  | 'game-end';

export interface GameEvent {
  id: string;
  type: GameEventType;
  playerId?: string;
  playerName?: string;
  playerColor?: string;
  message: string;
  amount?: number;
  timestamp: number;
  icon: string;
}

// ─── Chat ─────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  message: string;
  timestamp: number;
  isTaunt?: boolean;
  isSystem?: boolean;
}

// ─── Trade Offer ──────────────────────────────────────────────
export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offering: {
    money: number;
    propertyIds: number[];
  };
  requesting: {
    money: number;
    propertyIds: number[];
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  expiresAt: number;
}

// ─── Market State ─────────────────────────────────────────────
export interface MarketState {
  activeEventId: string | null;
  activeEventName: string | null;
  activeEventIcon: string | null;
  activeEventDescription: string | null;
  turnsRemaining: number;
  groupMultipliers: Partial<Record<PropertyGroup, number>>; // group → revenue multiplier
}

// ─── Full Game State (server-authoritative) ───────────────────
export interface GameState {
  gameId: string;
  roomCode: string;
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentPlayerId: string;
  turnNumber: number;
  players: Player[];
  properties: PropertyState[];
  events: GameEvent[]; // last 50 events
  chatMessages: ChatMessage[]; // last 100 messages
  tradeOffers: TradeOffer[];
  marketState: MarketState;
  lastDice: DiceResult | null;
  hasRolled: boolean;
  winner: string | null;
  startedAt: number | null;
  endedAt: number | null;
  turnExpiresAt: number | null;
}

// ─── Room (pre-game lobby) ────────────────────────────────────
export interface RoomPlayer {
  id: string;
  name: string;
  character: CharacterId | null;
  isReady: boolean;
  socketId: string;
  color: string;
  avatar: string;
}

export interface Room {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  gameId: string | null;
  createdAt: number;
}

// ─── Socket Events ────────────────────────────────────────────
export const SocketEvent = {
  // Room management
  CREATE_ROOM: 'create_room',
  ROOM_CREATED: 'room_created',
  JOIN_ROOM: 'join_room',
  ROOM_JOINED: 'room_joined',
  ROOM_UPDATED: 'room_updated',
  ROOM_ERROR: 'room_error',
  PLAYER_LEFT: 'player_left',

  // Lobby
  SELECT_CHARACTER: 'select_character',
  PLAYER_READY: 'player_ready',
  START_GAME: 'start_game',
  GAME_START: 'game_start',

  // Game actions
  ROLL_DICE: 'roll_dice',
  DICE_RESULT: 'dice_result',
  BUY_BUSINESS: 'buy_business',
  PASS_PROPERTY: 'pass_property',
  END_TURN: 'end_turn',

  // Game state
  GAME_STATE_UPDATE: 'game_state_update',

  // Chat & social
  CHAT_MESSAGE: 'chat_message',
  TAUNT: 'taunt',

  // Trading
  OFFER_TRADE: 'offer_trade',
  ACCEPT_TRADE: 'accept_trade',
  REJECT_TRADE: 'reject_trade',

  // Surrender / Bankruptcy
  SURRENDER_KANGAL: 'surrender_kangal',

  // Errors
  ACTION_ERROR: 'action_error',

  // Connection
  RECONNECT_PLAYER: 'reconnect_player',
  RECONNECT_SUCCESS: 'reconnect_success',
  PLAYER_DISCONNECTED: 'player_disconnected',
  PLAYER_RECONNECTED: 'player_reconnected',

  // Game end
  GAME_END: 'game_end',

  // Property upgrading
  UPGRADE_PROPERTY: 'upgrade_property',
} as const;

// ─── Socket Payload Types ─────────────────────────────────────
export interface CreateRoomPayload {
  playerId: string;
  playerName: string;
}

export interface JoinRoomPayload {
  playerId: string;
  playerName: string;
  roomCode: string;
}

export interface SelectCharacterPayload {
  playerId: string;
  roomCode: string;
  character: CharacterId;
}

export interface PlayerReadyPayload {
  playerId: string;
  roomCode: string;
}

export interface StartGamePayload {
  playerId: string; // must be host
  roomCode: string;
}

export interface RollDicePayload {
  playerId: string;
  gameId: string;
}

export interface BuyBusinessPayload {
  playerId: string;
  gameId: string;
  tileId: number;
}

export interface PassPropertyPayload {
  playerId: string;
  gameId: string;
}

export interface EndTurnPayload {
  playerId: string;
  gameId: string;
}

export interface ChatMessagePayload {
  playerId: string;
  gameId: string;
  message: string;
}

export interface TauntPayload {
  playerId: string;
  gameId: string;
  taunt: string;
}

export interface ReconnectPayload {
  playerId: string;
  roomCode: string;
}

export interface OfferTradePayload {
  playerId: string;
  gameId: string;
  toPlayerId: string;
  offeringMoney: number;
  offeringPropertyIds: number[];
  requestingMoney: number;
  requestingPropertyIds: number[];
}

export interface AcceptTradePayload {
  playerId: string;
  gameId: string;
  tradeId: string;
}

export interface RejectTradePayload {
  playerId: string;
  gameId: string;
  tradeId: string;
}

export interface SurrenderKangalPayload {
  playerId: string;
  gameId: string;
  transferTargetId?: string | 'distribute_all';
}

export interface UpgradePropertyPayload {
  playerId: string;
  gameId: string;
  tileId: number;
}

// ─── Taunt presets ───────────────────────────────────────────
export const TAUNTS = [
  { id: 'lol', emoji: '😂', text: 'LOL!' },
  { id: 'rip', emoji: '💀', text: 'RIP bhai...' },
  { id: 'nice', emoji: '🔥', text: 'Nice move!' },
  { id: 'deal', emoji: '🤝', text: 'Deal karte hain?' },
  { id: 'please', emoji: '😭', text: 'Please yaar!' },
  { id: 'easy', emoji: '😎', text: 'Too easy!' },
  { id: 'paisa', emoji: '🤑', text: 'Paisa aa raha hai!' },
  { id: 'clown', emoji: '🤡', text: 'Ye kya tha bhai?' },
] as const;

export type TauntId = typeof TAUNTS[number]['id'];
