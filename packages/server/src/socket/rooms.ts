import { v4 as uuidv4 } from 'uuid';
import type { Server, Socket } from 'socket.io';
import { GAME_CONFIG, SocketEvent } from '@dhandha/shared';
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  Room,
  RoomPlayer,
} from '@dhandha/shared';
import { getRoom, setRoom, setPlayerRoom, getPlayerRoom } from '../redis/client';
import { createInitialGameState } from '../game-engine/state';
import { setGameState, getGameState } from '../redis/client';

const PLAYER_COLORS = GAME_CONFIG.PLAYER_COLORS;
const PLAYER_AVATARS = GAME_CONFIG.PLAYER_AVATARS;

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/1/0 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  // ─── CREATE ROOM ──────────────────────────────────────────────
  socket.on(SocketEvent.CREATE_ROOM, async (payload: CreateRoomPayload) => {
    try {
      const { playerId, playerName } = payload;
      if (!playerId || !playerName) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: 'Invalid player data' });
        return;
      }

      // Generate unique room code
      let roomCode = generateRoomCode();
      let attempts = 0;
      while (await getRoom(roomCode) && attempts < 10) {
        roomCode = generateRoomCode();
        attempts++;
      }

      const roomPlayer: RoomPlayer = {
        id: playerId,
        name: playerName.slice(0, 20),
        character: null,
        isReady: false,
        socketId: socket.id,
        color: PLAYER_COLORS[0],
        avatar: PLAYER_AVATARS[0],
      };

      const room: Room = {
        code: roomCode,
        hostId: playerId,
        players: [roomPlayer],
        status: 'waiting',
        gameId: null,
        createdAt: Date.now(),
      };

      await setRoom(room);
      await setPlayerRoom(playerId, roomCode);

      socket.join(roomCode);
      socket.emit(SocketEvent.ROOM_CREATED, { room });

      console.log(`[Room] Created ${roomCode} by ${playerName}`);
    } catch (err) {
      console.error('[Room] Create error:', err);
      socket.emit(SocketEvent.ROOM_ERROR, { message: 'Failed to create room' });
    }
  });

  // ─── JOIN ROOM ────────────────────────────────────────────────
  socket.on(SocketEvent.JOIN_ROOM, async (payload: JoinRoomPayload) => {
    try {
      const { playerId, playerName, roomCode } = payload;

      if (!playerId || !playerName || !roomCode) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: 'Invalid join data' });
        return;
      }

      const room = await getRoom(roomCode.toUpperCase());
      if (!room) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: 'Room not found. Check the code and try again.' });
        return;
      }

      if (room.status !== 'waiting') {
        // Allow reconnection if player was in this room
        const existing = room.players.find(p => p.id === playerId);
        if (!existing) {
          socket.emit(SocketEvent.ROOM_ERROR, { message: 'Game already in progress' });
          return;
        }
        // Reconnect
        await handleReconnect(io, socket, room, playerId);
        return;
      }

      if (room.players.length >= GAME_CONFIG.MAX_PLAYERS) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: 'Room is full (4 players max)' });
        return;
      }

      // Check if player is already in room
      const existingIdx = room.players.findIndex(p => p.id === playerId);
      if (existingIdx >= 0) {
        // Update their socket
        const updatedPlayers = [...room.players];
        updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], socketId: socket.id };
        const updatedRoom = { ...room, players: updatedPlayers };
        await setRoom(updatedRoom);
        socket.join(roomCode);
        socket.emit(SocketEvent.ROOM_JOINED, { room: updatedRoom });
        io.to(roomCode).emit(SocketEvent.ROOM_UPDATED, { room: updatedRoom });
        return;
      }

      const colorIdx = room.players.length;
      const roomPlayer: RoomPlayer = {
        id: playerId,
        name: playerName.slice(0, 20),
        character: null,
        isReady: false,
        socketId: socket.id,
        color: PLAYER_COLORS[colorIdx] ?? '#ffffff',
        avatar: PLAYER_AVATARS[colorIdx] ?? '⚪',
      };

      const updatedRoom: Room = {
        ...room,
        players: [...room.players, roomPlayer],
      };

      await setRoom(updatedRoom);
      await setPlayerRoom(playerId, roomCode);

      socket.join(roomCode);
      socket.emit(SocketEvent.ROOM_JOINED, { room: updatedRoom });
      io.to(roomCode).emit(SocketEvent.ROOM_UPDATED, { room: updatedRoom });

      console.log(`[Room] ${playerName} joined ${roomCode} (${updatedRoom.players.length}/4)`);
    } catch (err) {
      console.error('[Room] Join error:', err);
      socket.emit(SocketEvent.ROOM_ERROR, { message: 'Failed to join room' });
    }
  });

  // ─── SELECT CHARACTER ─────────────────────────────────────────
  socket.on(SocketEvent.SELECT_CHARACTER, async (payload: import('@dhandha/shared').SelectCharacterPayload) => {
    try {
      const { playerId, roomCode, character } = payload;
      const room = await getRoom(roomCode);
      if (!room) return;

      const idx = room.players.findIndex(p => p.id === playerId);
      if (idx === -1) return;

      const updatedPlayers = [...room.players];
      updatedPlayers[idx] = { ...updatedPlayers[idx], character };
      const updatedRoom = { ...room, players: updatedPlayers };
      await setRoom(updatedRoom);

      io.to(roomCode).emit(SocketEvent.ROOM_UPDATED, { room: updatedRoom });
    } catch (err) {
      console.error('[Room] Character select error:', err);
    }
  });

  // ─── PLAYER READY ──────────────────────────────────────────────
  socket.on(SocketEvent.PLAYER_READY, async (payload: import('@dhandha/shared').PlayerReadyPayload) => {
    try {
      const { playerId, roomCode } = payload;
      const room = await getRoom(roomCode);
      if (!room) return;

      const idx = room.players.findIndex(p => p.id === playerId);
      if (idx === -1) return;

      const updatedPlayers = [...room.players];
      updatedPlayers[idx] = { ...updatedPlayers[idx], isReady: !updatedPlayers[idx].isReady };
      const updatedRoom = { ...room, players: updatedPlayers };
      await setRoom(updatedRoom);

      io.to(roomCode).emit(SocketEvent.ROOM_UPDATED, { room: updatedRoom });
    } catch (err) {
      console.error('[Room] Ready error:', err);
    }
  });

  // ─── START GAME ──────────────────────────────────────────────
  socket.on(SocketEvent.START_GAME, async (payload: import('@dhandha/shared').StartGamePayload) => {
    try {
      const { playerId, roomCode } = payload;
      const room = await getRoom(roomCode);

      if (!room) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: 'Room not found' });
        return;
      }
      if (room.hostId !== playerId) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: 'Only the host can start the game' });
        return;
      }
      if (room.players.length < GAME_CONFIG.MIN_PLAYERS) {
        socket.emit(SocketEvent.ROOM_ERROR, { message: `Need at least ${GAME_CONFIG.MIN_PLAYERS} players` });
        return;
      }

      const gameId = uuidv4();
      const gameState = createInitialGameState(gameId, roomCode, room.players);
      await setGameState(gameId, gameState);

      const updatedRoom: Room = { ...room, status: 'playing', gameId };
      await setRoom(updatedRoom);

      io.to(roomCode).emit(SocketEvent.GAME_START, { gameState });

      try {
        const { resetTurnTimer } = require('./handlers');
        resetTurnTimer(gameId, io);
      } catch (e) {
        console.error('Error starting turn timer:', e);
      }

      console.log(`[Game] Started ${gameId} in room ${roomCode}`);
    } catch (err) {
      console.error('[Room] Start game error:', err);
      socket.emit(SocketEvent.ROOM_ERROR, { message: 'Failed to start game' });
    }
  });

  // ─── DISCONNECT handling ─────────────────────────────────────
  socket.on('disconnect', async () => {
    try {
      // Find which room this socket was in
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      for (const roomCode of rooms) {
        const room = await getRoom(roomCode);
        if (!room) continue;

        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) continue;

        if (room.status === 'waiting') {
          // Remove from room if still in lobby
          const updatedPlayers = room.players.filter(p => p.socketId !== socket.id);
          if (updatedPlayers.length === 0) {
            await setRoom({ ...room, players: [] }); // Keep room for a bit
          } else {
            const newHost = updatedPlayers[0].id;
            const updatedRoom: Room = {
              ...room,
              players: updatedPlayers,
              hostId: room.hostId === player.id ? newHost : room.hostId,
            };
            await setRoom(updatedRoom);
            io.to(roomCode).emit(SocketEvent.ROOM_UPDATED, { room: updatedRoom });
          }
        } else if (room.status === 'playing' && room.gameId) {
          // Mark player as disconnected in game state
          const gameState = await getGameState(room.gameId);
          if (gameState) {
            const pidx = gameState.players.findIndex(p => p.id === player.id);
            if (pidx >= 0) {
              const updatedPlayers = [...gameState.players];
              updatedPlayers[pidx] = { ...updatedPlayers[pidx], isConnected: false };
              const updatedState = { ...gameState, players: updatedPlayers };
              await setGameState(room.gameId, updatedState);
              io.to(roomCode).emit(SocketEvent.PLAYER_DISCONNECTED, {
                playerId: player.id,
                playerName: player.name,
                gameState: updatedState,
              });
            }
          }
        }

        console.log(`[Room] ${player.name} disconnected from ${roomCode}`);
      }
    } catch (err) {
      console.error('[Room] Disconnect error:', err);
    }
  });
}

async function handleReconnect(
  io: Server,
  socket: Socket,
  room: Room,
  playerId: string,
) {
  try {
    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    // Update socket ID
    const updatedPlayers = room.players.map(p =>
      p.id === playerId ? { ...p, socketId: socket.id } : p,
    );
    const updatedRoom = { ...room, players: updatedPlayers };
    await setRoom(updatedRoom);

    socket.join(room.code);

    if (room.gameId) {
      const gameState = await getGameState(room.gameId);
      if (gameState) {
        const pidx = gameState.players.findIndex(p => p.id === playerId);
        if (pidx >= 0) {
          const updatedGamePlayers = [...gameState.players];
          updatedGamePlayers[pidx] = {
            ...updatedGamePlayers[pidx],
            isConnected: true,
            socketId: socket.id,
          };
          const updatedGameState = { ...gameState, players: updatedGamePlayers };
          await setGameState(room.gameId, updatedGameState);

          socket.emit(SocketEvent.RECONNECT_SUCCESS, { gameState: updatedGameState, room: updatedRoom });
          io.to(room.code).emit(SocketEvent.PLAYER_RECONNECTED, {
            playerId,
            playerName: player.name,
            gameState: updatedGameState,
          });
        }
      }
    } else {
      socket.emit(SocketEvent.ROOM_JOINED, { room: updatedRoom });
    }

    console.log(`[Room] ${player.name} reconnected to ${room.code}`);
  } catch (err) {
    console.error('[Room] Reconnect error:', err);
  }
}
