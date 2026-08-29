import { useEffect } from 'react';
import { getSocket } from '../socket/socketClient';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { SocketEvent } from '@dhandha/shared';
import type { GameState, Room } from '@dhandha/shared';

export function useSocket() {
  const setRoom = useGameStore((s) => s.setRoom);
  const setGameState = useGameStore((s) => s.setGameState);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    const socket = getSocket();

    socket.on(SocketEvent.ROOM_CREATED, ({ room }: { room: Room }) => {
      setRoom(room);
      addToast({ type: 'success', message: `Room ${room.code} created!` });
    });

    socket.on(SocketEvent.ROOM_JOINED, ({ room }: { room: Room }) => {
      setRoom(room);
      addToast({ type: 'success', message: `Joined room ${room.code}` });
    });

    socket.on(SocketEvent.ROOM_UPDATED, ({ room }: { room: Room }) => {
      setRoom(room);
    });

    socket.on(SocketEvent.ROOM_ERROR, ({ message }: { message: string }) => {
      addToast({ type: 'error', message });
    });

    socket.on(SocketEvent.GAME_START, ({ gameState }: { gameState: GameState }) => {
      setGameState(gameState);
      addToast({ type: 'info', message: '🎲 Game has started! All the best!' });
    });

    socket.on(SocketEvent.GAME_STATE_UPDATE, ({ gameState }: { gameState: GameState }) => {
      setGameState(gameState);
    });

    socket.on(SocketEvent.ACTION_ERROR, ({ message }: { message: string }) => {
      addToast({ type: 'warning', message });
    });

    socket.on(SocketEvent.PLAYER_DISCONNECTED, ({ playerName }: { playerName: string }) => {
      addToast({ type: 'warning', message: `${playerName} disconnected` });
    });

    socket.on(SocketEvent.PLAYER_RECONNECTED, ({ playerName, gameState }: { playerName: string; gameState: GameState }) => {
      setGameState(gameState);
      addToast({ type: 'info', message: `${playerName} reconnected` });
    });

    socket.on(SocketEvent.RECONNECT_SUCCESS, ({ gameState, room }: { gameState: GameState; room: Room }) => {
      setGameState(gameState);
      setRoom(room);
      addToast({ type: 'success', message: 'Reconnected to game!' });
    });

    return () => {
      socket.off(SocketEvent.ROOM_CREATED);
      socket.off(SocketEvent.ROOM_JOINED);
      socket.off(SocketEvent.ROOM_UPDATED);
      socket.off(SocketEvent.ROOM_ERROR);
      socket.off(SocketEvent.GAME_START);
      socket.off(SocketEvent.GAME_STATE_UPDATE);
      socket.off(SocketEvent.ACTION_ERROR);
      socket.off(SocketEvent.PLAYER_DISCONNECTED);
      socket.off(SocketEvent.PLAYER_RECONNECTED);
      socket.off(SocketEvent.RECONNECT_SUCCESS);
    };
  }, [setRoom, setGameState, addToast]);
}
