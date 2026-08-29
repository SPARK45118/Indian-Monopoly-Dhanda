import Redis from 'ioredis';
import type { GameState, Room } from '@dhandha/shared';
import { GAME_CONFIG } from '@dhandha/shared';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

// In-memory store fallback when Redis is not running
const memoryStore = new Map<string, string>();
let isRedisConnected = false;

export const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  retryStrategy: () => null, // Don't loop endlessly if Redis is down
});

redis.on('error', (err: Error) => {
  if (isRedisConnected) {
    console.warn('[Redis] Connection lost, falling back to in-memory store:', err.message);
  }
  isRedisConnected = false;
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Connected successfully');
});

// ─── Game State ───────────────────────────────────────────────
const GAME_PREFIX = 'game:';
const ROOM_PREFIX = 'room:';
const PLAYER_ROOM_PREFIX = 'player-room:';

export async function getGameState(gameId: string): Promise<GameState | null> {
  const key = `${GAME_PREFIX}${gameId}`;
  if (isRedisConnected) {
    try {
      const raw = await redis.get(key);
      if (raw) return JSON.parse(raw) as GameState;
    } catch {
      // fallback to memory
    }
  }
  const memRaw = memoryStore.get(key);
  return memRaw ? (JSON.parse(memRaw) as GameState) : null;
}

export async function setGameState(gameId: string, state: GameState): Promise<void> {
  const key = `${GAME_PREFIX}${gameId}`;
  const serialized = JSON.stringify(state);
  memoryStore.set(key, serialized);
  if (isRedisConnected) {
    try {
      await redis.setex(key, GAME_CONFIG.GAME_TTL_SECONDS, serialized);
    } catch {
      // fallback to memory
    }
  }
}

export async function deleteGameState(gameId: string): Promise<void> {
  const key = `${GAME_PREFIX}${gameId}`;
  memoryStore.delete(key);
  if (isRedisConnected) {
    try {
      await redis.del(key);
    } catch {
      // fallback
    }
  }
}

// ─── Room State ───────────────────────────────────────────────
export async function getRoom(roomCode: string): Promise<Room | null> {
  const key = `${ROOM_PREFIX}${roomCode}`;
  if (isRedisConnected) {
    try {
      const raw = await redis.get(key);
      if (raw) return JSON.parse(raw) as Room;
    } catch {
      // fallback
    }
  }
  const memRaw = memoryStore.get(key);
  return memRaw ? (JSON.parse(memRaw) as Room) : null;
}

export async function setRoom(room: Room): Promise<void> {
  const key = `${ROOM_PREFIX}${room.code}`;
  const serialized = JSON.stringify(room);
  memoryStore.set(key, serialized);
  if (isRedisConnected) {
    try {
      await redis.setex(key, GAME_CONFIG.ROOM_TTL_SECONDS, serialized);
    } catch {
      // fallback
    }
  }
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const key = `${ROOM_PREFIX}${roomCode}`;
  memoryStore.delete(key);
  if (isRedisConnected) {
    try {
      await redis.del(key);
    } catch {
      // fallback
    }
  }
}

// ─── Player → Room mapping (for reconnection) ─────────────────
export async function setPlayerRoom(playerId: string, roomCode: string): Promise<void> {
  const key = `${PLAYER_ROOM_PREFIX}${playerId}`;
  memoryStore.set(key, roomCode);
  if (isRedisConnected) {
    try {
      await redis.setex(key, GAME_CONFIG.ROOM_TTL_SECONDS, roomCode);
    } catch {
      // fallback
    }
  }
}

export async function getPlayerRoom(playerId: string): Promise<string | null> {
  const key = `${PLAYER_ROOM_PREFIX}${playerId}`;
  if (isRedisConnected) {
    try {
      const room = await redis.get(key);
      if (room) return room;
    } catch {
      // fallback
    }
  }
  return memoryStore.get(key) ?? null;
}

export async function deletePlayerRoom(playerId: string): Promise<void> {
  const key = `${PLAYER_ROOM_PREFIX}${playerId}`;
  memoryStore.delete(key);
  if (isRedisConnected) {
    try {
      await redis.del(key);
    } catch {
      // fallback
    }
  }
}

