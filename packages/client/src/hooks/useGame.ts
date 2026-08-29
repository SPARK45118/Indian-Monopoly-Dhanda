import { getSocket } from '../socket/socketClient';
import { useGameStore } from '../store/gameStore';
import { SocketEvent } from '@dhandha/shared';
import type { CharacterId } from '@dhandha/shared';

export function useGame() {
  const localPlayer = useGameStore((s) => s.localPlayer);
  const room = useGameStore((s) => s.room);
  const gameState = useGameStore((s) => s.gameState);

  const socket = getSocket();

  const createRoom = (playerName: string) => {
    if (!localPlayer) return;
    socket.emit(SocketEvent.CREATE_ROOM, {
      playerId: localPlayer.id,
      playerName,
    });
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    if (!localPlayer) return;
    socket.emit(SocketEvent.JOIN_ROOM, {
      playerId: localPlayer.id,
      playerName,
      roomCode: roomCode.toUpperCase(),
    });
  };

  const selectCharacter = (character: CharacterId) => {
    if (!localPlayer || !room) return;
    socket.emit(SocketEvent.SELECT_CHARACTER, {
      playerId: localPlayer.id,
      roomCode: room.code,
      character,
    });
  };

  const toggleReady = () => {
    if (!localPlayer || !room) return;
    socket.emit(SocketEvent.PLAYER_READY, {
      playerId: localPlayer.id,
      roomCode: room.code,
    });
  };

  const startGame = () => {
    if (!localPlayer || !room) return;
    socket.emit(SocketEvent.START_GAME, {
      playerId: localPlayer.id,
      roomCode: room.code,
    });
  };

  const rollDice = () => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.ROLL_DICE, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
    });
  };

  const buyBusiness = (tileId: number) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.BUY_BUSINESS, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      tileId,
    });
  };

  const passProperty = () => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.PASS_PROPERTY, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
    });
  };

  const endTurn = () => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.END_TURN, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
    });
  };

  const sendMessage = (message: string) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.CHAT_MESSAGE, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      message,
    });
  };

  const sendTaunt = (taunt: string) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.TAUNT, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      taunt,
    });
  };

  const offerTrade = (
    toPlayerId: string,
    offeringMoney: number,
    offeringPropertyIds: number[],
    requestingMoney: number,
    requestingPropertyIds: number[]
  ) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.OFFER_TRADE, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      toPlayerId,
      offeringMoney,
      offeringPropertyIds,
      requestingMoney,
      requestingPropertyIds,
    });
  };

  const acceptTrade = (tradeId: string) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.ACCEPT_TRADE, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      tradeId,
    });
  };

  const rejectTrade = (tradeId: string) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.REJECT_TRADE, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      tradeId,
    });
  };

  const surrenderKangal = (transferTargetId?: string) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.SURRENDER_KANGAL, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      transferTargetId,
    });
  };

  const upgradeProperty = (tileId: number) => {
    if (!localPlayer || !gameState) return;
    socket.emit(SocketEvent.UPGRADE_PROPERTY, {
      playerId: localPlayer.id,
      gameId: gameState.gameId,
      tileId,
    });
  };

  const isCurrentTurn = Boolean(
    localPlayer && gameState && gameState.currentPlayerId === localPlayer.id
  );

  return {
    localPlayer,
    room,
    gameState,
    isCurrentTurn,
    createRoom,
    joinRoom,
    selectCharacter,
    toggleReady,
    startGame,
    rollDice,
    buyBusiness,
    passProperty,
    endTurn,
    sendMessage,
    sendTaunt,
    offerTrade,
    acceptTrade,
    rejectTrade,
    surrenderKangal,
    upgradeProperty,
  };
}
