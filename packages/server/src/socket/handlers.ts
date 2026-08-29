import { v4 as uuidv4 } from 'uuid';
import type { Server, Socket } from 'socket.io';
import { SocketEvent, GAME_CONFIG, getTileById } from '@dhandha/shared';
import type {
  RollDicePayload,
  BuyBusinessPayload,
  EndTurnPayload,
  ChatMessagePayload,
  TauntPayload,
  PassPropertyPayload,
  OfferTradePayload,
  AcceptTradePayload,
  RejectTradePayload,
  SurrenderKangalPayload,
  UpgradePropertyPayload,
  GameState,
} from '@dhandha/shared';
import { getGameState, setGameState } from '../redis/client';
import { rollDice } from '../game-engine/dice';
import { movePlayer } from '../game-engine/movement';
import { resolveTileLanding, tickMarketEvent } from '../game-engine/events';
import { advanceTurn, validateTurn, decrementLegalTroubleTurns, tryEscapeLegalTrouble } from '../game-engine/turns';
import { buyProperty } from '../game-engine/properties';
import { addGameEvent } from '../game-engine/state';

// Rate limiting: playerId → last action timestamp
const chatRateLimiter = new Map<string, number>();
const tauntRateLimiter = new Map<string, number>();

// Turn timer references: gameId -> NodeJS.Timeout
const turnTimers = new Map<string, NodeJS.Timeout>();

export function clearTurnTimer(gameId: string) {
  const existing = turnTimers.get(gameId);
  if (existing) {
    clearTimeout(existing);
    turnTimers.delete(gameId);
  }
}

export function resetTurnTimer(gameId: string, io: Server) {
  clearTurnTimer(gameId);

  const timeout = setTimeout(async () => {
    try {
      let state = await getGameState(gameId);
      if (!state || state.phase !== 'playing') return;

      const activePlayerId = state.currentPlayerId;
      const activePlayer = state.players.find(p => p.id === activePlayerId);
      if (!activePlayer || activePlayer.isBankrupt) {
        state = advanceTurn(state);
        await saveAndBroadcastState(gameId, state, io, true);
        return;
      }

      state = addGameEvent(state, {
        type: 'turn',
        playerId: activePlayerId,
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
        message: `⏰ ${activePlayer.name}'s turn timed out! Auto-playing turn.`,
        icon: '⏰',
      });

      if (!state.hasRolled && state.turnPhase === 'roll') {
        const dice = rollDice();
        state = { ...state, lastDice: dice, hasRolled: true };
        state = addGameEvent(state, {
          type: 'roll',
          playerId: activePlayerId,
          playerName: activePlayer.name,
          playerColor: activePlayer.color,
          message: `🎲 Dice rolled automatically: ${dice.die1} and ${dice.die2} (Total: ${dice.total})`,
          amount: dice.total,
          icon: '🎲',
        });

        if (activePlayer.inLegalTrouble) {
          if (dice.isDouble) {
            const { newState: escaped } = tryEscapeLegalTrouble(state, activePlayerId, 'doubles');
            state = escaped;
            const { newState: moved, landedTile } = movePlayer(state, activePlayerId, dice.total);
            state = moved;
            state = resolveTileLanding(state, activePlayerId, landedTile);
          } else {
            state = decrementLegalTroubleTurns(state, activePlayerId);
            const turnsLeft = state.players.find(p => p.id === activePlayerId)?.legalTroubleTurns ?? 0;
            state = addGameEvent(state, {
              type: 'legal-trouble',
              playerId: activePlayerId,
              playerName: activePlayer.name,
              playerColor: activePlayer.color,
              message: `⚖️ ${activePlayer.name} didn't roll doubles. ${turnsLeft} turns left in Legal Trouble.`,
              icon: '⚖️',
            });
            state = { ...state, turnPhase: 'end-turn' };
          }
        } else {
          const { newState: moved, landedTile } = movePlayer(state, activePlayerId, dice.total);
          state = moved;
          state = resolveTileLanding(state, activePlayerId, landedTile);
        }
      }

      if (state.turnPhase === 'post-roll') {
        state = addGameEvent(state, {
          type: 'move',
          playerId: activePlayerId,
          playerName: activePlayer.name,
          playerColor: activePlayer.color,
          message: `⏱️ ${activePlayer.name} timed out deciding to buy. Skipping purchase.`,
          icon: '⏱️',
        });
        state = { ...state, turnPhase: 'end-turn' };
      }

      state = advanceTurn(state);
      await saveAndBroadcastState(gameId, state, io, true);
    } catch (err) {
      console.error('[Game Timer] Auto-play timeout error:', err);
    }
  }, 60000);

  turnTimers.set(gameId, timeout);
}

export async function runAutoKangalChecks(state: GameState, io: Server): Promise<GameState> {
  let tempState = state;
  let changed = false;

  for (const player of tempState.players) {
    if (player.isBankrupt) continue;

    const playerProps = tempState.properties.filter(p => p.ownerId === player.id);
    if (player.money === 0 && playerProps.length === 0) {
      changed = true;
      const playerId = player.id;
      const activeOpponents = tempState.players.filter(p => p.id !== playerId && !p.isBankrupt);

      let updatedPlayers = [...tempState.players];
      let updatedProps = [...tempState.properties];

      if (activeOpponents.length > 0) {
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === playerId) return { ...p, money: 0, isBankrupt: true };
          return p;
        });
        updatedProps = updatedProps.map(prop => {
          if (prop.ownerId === playerId) {
            return { ...prop, ownerId: null, level: 0 };
          }
          return prop;
        });

        tempState = addGameEvent(tempState, {
          type: 'bankrupt',
          playerId,
          playerName: player.name,
          playerColor: player.color,
          message: `🪣 ${player.name} went automatically KANGAL! (₹0 Cash & 0 properties left)`,
          icon: '🪣',
        });
      } else {
        updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, money: 0, isBankrupt: true } : p);
      }

      tempState = {
        ...tempState,
        players: updatedPlayers,
        properties: updatedProps,
      };

      const remainingAlive = tempState.players.filter(p => !p.isBankrupt);
      if (remainingAlive.length === 1) {
        const winner = remainingAlive[0];
        tempState = {
          ...tempState,
          phase: 'finished',
          winner: winner.id,
          endedAt: Date.now(),
        };
        tempState = addGameEvent(tempState, {
          type: 'game-end',
          playerId: winner.id,
          playerName: winner.name,
          playerColor: winner.color,
          message: `🏆 ${winner.name} is the last entrepreneur standing! VYAPAR SAMRAT (WINNER)! 🎉`,
          icon: '👑',
        });
      } else if (tempState.currentPlayerId === playerId) {
        tempState = advanceTurn(tempState);
      }
    }
  }

  return tempState;
}

export async function saveAndBroadcastState(
  gameId: string,
  state: GameState,
  io: Server,
  shouldResetTimer: boolean
): Promise<GameState> {
  let updatedState = await runAutoKangalChecks(state, io);
  await setGameState(gameId, updatedState);
  io.to(updatedState.roomCode).emit(SocketEvent.GAME_STATE_UPDATE, { gameState: updatedState });

  if (updatedState.phase === 'playing') {
    if (shouldResetTimer) {
      resetTurnTimer(gameId, io);
    }
  } else {
    clearTurnTimer(gameId);
  }

  return updatedState;
}

export function registerGameHandlers(io: Server, socket: Socket) {
  // ─── ROLL DICE ────────────────────────────────────────────────
  socket.on(SocketEvent.ROLL_DICE, async (payload: RollDicePayload) => {
    try {
      const { playerId, gameId } = payload;
      let state = await getGameState(gameId);

      if (!state) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Game not found' });
        return;
      }

      // Validate turn
      if (!validateTurn(state, playerId)) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Not your turn' });
        return;
      }
      if (state.hasRolled) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Already rolled this turn' });
        return;
      }
      if (state.turnPhase !== 'roll') {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Cannot roll now' });
        return;
      }

      const player = state.players.find(p => p.id === playerId)!;

      // Handle Legal Trouble
      if (player.inLegalTrouble) {
        const dice = rollDice();
        state = { ...state, lastDice: dice, hasRolled: true };

        if (dice.isDouble) {
          // Escaped!
          const { newState: escaped } = tryEscapeLegalTrouble(state, playerId, 'doubles');
          state = escaped;
          const { newState: moved, landedTile } = movePlayer(state, playerId, dice.total);
          state = moved;
          state = resolveTileLanding(state, playerId, landedTile);
        } else {
          // Stuck, decrement turns
          state = decrementLegalTroubleTurns(state, playerId);
          const turnsLeft = state.players.find(p => p.id === playerId)?.legalTroubleTurns ?? 0;
          state = addGameEvent(state, {
            type: 'legal-trouble',
            playerId,
            playerName: player.name,
            playerColor: player.color,
            message: `⚖️ ${player.name} didn't roll doubles. ${turnsLeft} turns left in Legal Trouble.`,
            icon: '⚖️',
          });
          state = { ...state, turnPhase: 'end-turn' };
        }

        await saveAndBroadcastState(gameId, state, io, true);
        return;
      }

      // Normal roll
      const dice = rollDice();

      // Handle consecutive doubles → Legal Trouble
      let doubleCount = player.doubleRollCount;
      if (dice.isDouble) {
        doubleCount++;
        if (doubleCount >= GAME_CONFIG.CONSECUTIVE_DOUBLES_LIMIT) {
          // Three doubles in a row → Legal Trouble
          const updatedPlayers = [...state.players];
          const pidx = updatedPlayers.findIndex(p => p.id === playerId);
          updatedPlayers[pidx] = { ...updatedPlayers[pidx], doubleRollCount: 0 };
          state = { ...state, players: updatedPlayers };

          const { newState: withLegal } = {
            newState: sendToLegalTrouble(state, playerId),
          };
          state = withLegal;
          state = { ...state, lastDice: dice, hasRolled: true, turnPhase: 'end-turn' };

          await saveAndBroadcastState(gameId, state, io, true);
          return;
        }
      } else {
        doubleCount = 0;
      }

      // Update double roll count
      const updatedPlayers = [...state.players];
      const pidx = updatedPlayers.findIndex(p => p.id === playerId);
      updatedPlayers[pidx] = { ...updatedPlayers[pidx], doubleRollCount: doubleCount };
      state = { ...state, players: updatedPlayers };

      // Move player
      state = { ...state, lastDice: dice, hasRolled: true };
      const { newState: movedState, landedTile } = movePlayer(state, playerId, dice.total);
      state = movedState;

      // Resolve tile
      state = resolveTileLanding(state, playerId, landedTile);

      // Add dice event
      state = addGameEvent(state, {
        type: 'roll',
        playerId,
        playerName: player.name,
        playerColor: player.color,
        message: `🎲 ${player.name} rolled ${dice.die1} + ${dice.die2} = ${dice.total}${dice.isDouble ? ' (DOUBLE! Roll again!)' : ''}`,
        icon: '🎲',
      });

      await saveAndBroadcastState(gameId, state, io, true);

    } catch (err) {
      console.error('[Game] Roll dice error:', err);
      socket.emit(SocketEvent.ACTION_ERROR, { message: 'Server error during dice roll' });
    }
  });

  // ─── BUY BUSINESS ─────────────────────────────────────────────
  socket.on(SocketEvent.BUY_BUSINESS, async (payload: BuyBusinessPayload) => {
    try {
      const { playerId, gameId, tileId } = payload;
      let state = await getGameState(gameId);

      if (!state) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Game not found' });
        return;
      }

      if (!validateTurn(state, playerId)) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Not your turn' });
        return;
      }
      if (state.turnPhase !== 'post-roll') {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Cannot buy now' });
        return;
      }

      const result = buyProperty(state, playerId, tileId);
      if (!result.success) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: result.error });
        return;
      }

      state = result.newState;
      const tile = (await import('@dhandha/shared')).getTileById(tileId);
      const player = state.players.find(p => p.id === playerId);

      state = addGameEvent(state, {
        type: 'buy',
        playerId,
        playerName: player?.name,
        playerColor: player?.color,
        message: `🏪 ${player?.name} bought ${tile.icon} ${tile.name} for ₹${tile.price?.toLocaleString('en-IN')}!`,
        amount: -(tile.price ?? 0),
        icon: '🏪',
      });

      state = { ...state, turnPhase: 'end-turn' };

      await saveAndBroadcastState(gameId, state, io, true);

    } catch (err) {
      console.error('[Game] Buy business error:', err);
      socket.emit(SocketEvent.ACTION_ERROR, { message: 'Failed to buy property' });
    }
  });

  // ─── PASS PROPERTY (decline to buy) ──────────────────────────
  socket.on(SocketEvent.PASS_PROPERTY, async (payload: PassPropertyPayload) => {
    try {
      const { playerId, gameId } = payload;
      let state = await getGameState(gameId);

      if (!state || !validateTurn(state, playerId)) return;
      if (state.turnPhase !== 'post-roll') return;

      state = { ...state, turnPhase: 'end-turn' };
      await saveAndBroadcastState(gameId, state, io, true);
    } catch (err) {
      console.error('[Game] Pass property error:', err);
    }
  });

  // ─── END TURN ─────────────────────────────────────────────────
  socket.on(SocketEvent.END_TURN, async (payload: EndTurnPayload) => {
    try {
      const { playerId, gameId } = payload;
      let state = await getGameState(gameId);

      if (!state) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Game not found' });
        return;
      }
      if (!validateTurn(state, playerId)) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Not your turn' });
        return;
      }
      if (state.turnPhase !== 'end-turn' && state.turnPhase !== 'post-roll') {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Cannot end turn now — complete your action first' });
        return;
      }

      // Tick market events
      state = tickMarketEvent(state);

      // Check if doubles — allow another roll
      const player = state.players.find(p => p.id === playerId);
      if (state.lastDice?.isDouble && !player?.inLegalTrouble) {
        // Same player rolls again
        state = { ...state, hasRolled: false, turnPhase: 'roll', lastDice: null };
        state = addGameEvent(state, {
          type: 'turn',
          playerId,
          playerName: player?.name,
          playerColor: player?.color,
          message: `🎲 ${player?.name} rolled doubles! Roll again!`,
          icon: '🎲',
        });
      } else {
        // Advance to next player
        state = advanceTurn(state);
      }

      await saveAndBroadcastState(gameId, state, io, true);

    } catch (err) {
      console.error('[Game] End turn error:', err);
      socket.emit(SocketEvent.ACTION_ERROR, { message: 'Failed to end turn' });
    }
  });

  // ─── CHAT ─────────────────────────────────────────────────────
  socket.on(SocketEvent.CHAT_MESSAGE, async (payload: ChatMessagePayload) => {
    try {
      const { playerId, gameId, message } = payload;

      // Rate limit
      const lastChat = chatRateLimiter.get(playerId) ?? 0;
      if (Date.now() - lastChat < GAME_CONFIG.CHAT_RATE_LIMIT_MS) return;
      chatRateLimiter.set(playerId, Date.now());

      const state = await getGameState(gameId);
      if (!state) return;

      const player = state.players.find(p => p.id === playerId);
      if (!player) return;

      // Basic profanity filter (expand in Phase 4)
      const filtered = message.slice(0, 200).replace(/\b(fuck|shit|bitch|asshole)\b/gi, '***');

      const chatMsg = {
        id: uuidv4(),
        playerId,
        playerName: player.name,
        playerColor: player.color,
        message: filtered,
        timestamp: Date.now(),
      };

      const updatedMessages = [chatMsg, ...state.chatMessages].slice(0, GAME_CONFIG.MAX_CHAT_MESSAGES);
      const updatedState = { ...state, chatMessages: updatedMessages };

      await setGameState(gameId, updatedState);
      io.to(state.roomCode).emit(SocketEvent.GAME_STATE_UPDATE, { gameState: updatedState });
    } catch (err) {
      console.error('[Game] Chat error:', err);
    }
  });

  // ─── TAUNT ────────────────────────────────────────────────────
  socket.on(SocketEvent.TAUNT, async (payload: TauntPayload) => {
    try {
      const { playerId, gameId, taunt } = payload;

      // Rate limit
      const lastTaunt = tauntRateLimiter.get(playerId) ?? 0;
      if (Date.now() - lastTaunt < GAME_CONFIG.TAUNT_RATE_LIMIT_MS) return;
      tauntRateLimiter.set(playerId, Date.now());

      const state = await getGameState(gameId);
      if (!state) return;

      const player = state.players.find(p => p.id === playerId);
      if (!player) return;

      const chatMsg = {
        id: uuidv4(),
        playerId,
        playerName: player.name,
        playerColor: player.color,
        message: taunt,
        timestamp: Date.now(),
        isTaunt: true,
      };

      const updatedMessages = [chatMsg, ...state.chatMessages].slice(0, GAME_CONFIG.MAX_CHAT_MESSAGES);
      const updatedState = { ...state, chatMessages: updatedMessages };

      await saveAndBroadcastState(gameId, updatedState, io, false);
    } catch (err) {
      console.error('[Game] Taunt error:', err);
    }
  });

  // ─── OFFER TRADE ──────────────────────────────────────────────
  socket.on(SocketEvent.OFFER_TRADE, async (payload: OfferTradePayload) => {
    try {
      const { playerId, gameId, toPlayerId, offeringMoney, offeringPropertyIds, requestingMoney, requestingPropertyIds } = payload;
      let state = await getGameState(gameId);
      if (!state) return;

      const fromPlayer = state.players.find(p => p.id === playerId);
      const toPlayer = state.players.find(p => p.id === toPlayerId);
      if (!fromPlayer || !toPlayer || fromPlayer.money < offeringMoney) return;

      const tradeOffer = {
        id: uuidv4(),
        fromPlayerId: playerId,
        toPlayerId,
        offering: { money: offeringMoney, propertyIds: offeringPropertyIds },
        requesting: { money: requestingMoney, propertyIds: requestingPropertyIds },
        status: 'pending' as const,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
      };

      const updatedOffers = [tradeOffer, ...(state.tradeOffers || [])];
      state = { ...state, tradeOffers: updatedOffers };

      state = addGameEvent(state, {
        type: 'market-event',
        playerId,
        playerName: fromPlayer.name,
        playerColor: fromPlayer.color,
        message: `🤝 ${fromPlayer.name} proposed a trade deal to ${toPlayer.name}!`,
        icon: '🤝',
      });

      await saveAndBroadcastState(gameId, state, io, false);
    } catch (err) {
      console.error('[Game] Offer trade error:', err);
    }
  });

  // ─── ACCEPT TRADE ─────────────────────────────────────────────
  socket.on(SocketEvent.ACCEPT_TRADE, async (payload: AcceptTradePayload) => {
    try {
      const { playerId, gameId, tradeId } = payload;
      let state = await getGameState(gameId);
      if (!state) return;

      const trade = state.tradeOffers?.find(t => t.id === tradeId && t.toPlayerId === playerId && t.status === 'pending');
      if (!trade) return;

      const fromPlayer = state.players.find(p => p.id === trade.fromPlayerId);
      const toPlayer = state.players.find(p => p.id === trade.toPlayerId);
      if (!fromPlayer || !toPlayer) return;

      // Validate balances
      if (fromPlayer.money < trade.offering.money || toPlayer.money < trade.requesting.money) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Insufficient funds to complete trade' });
        return;
      }

      // Execute money transfer
      const updatedPlayers = state.players.map(p => {
        if (p.id === fromPlayer.id) {
          return { ...p, money: p.money - trade.offering.money + trade.requesting.money };
        }
        if (p.id === toPlayer.id) {
          return { ...p, money: p.money - trade.requesting.money + trade.offering.money };
        }
        return p;
      });

      // Execute property swap
      const updatedProperties = state.properties.map(prop => {
        if (trade.offering.propertyIds.includes(prop.tileId)) {
          return { ...prop, ownerId: toPlayer.id };
        }
        if (trade.requesting.propertyIds.includes(prop.tileId)) {
          return { ...prop, ownerId: fromPlayer.id };
        }
        return prop;
      });

      // Mark trade accepted
      const updatedOffers = state.tradeOffers.map(t => t.id === tradeId ? { ...t, status: 'accepted' as const } : t);

      state = {
        ...state,
        players: updatedPlayers,
        properties: updatedProperties,
        tradeOffers: updatedOffers,
      };

      state = addGameEvent(state, {
        type: 'market-event',
        playerId,
        playerName: toPlayer.name,
        playerColor: toPlayer.color,
        message: `🎉 ${toPlayer.name} ACCEPTED trade deal from ${fromPlayer.name}! Assets exchanged.`,
        icon: '🤝',
      });

      await saveAndBroadcastState(gameId, state, io, false);
    } catch (err) {
      console.error('[Game] Accept trade error:', err);
    }
  });

  // ─── REJECT TRADE ─────────────────────────────────────────────
  socket.on(SocketEvent.REJECT_TRADE, async (payload: RejectTradePayload) => {
    try {
      const { playerId, gameId, tradeId } = payload;
      let state = await getGameState(gameId);
      if (!state) return;

      const trade = state.tradeOffers?.find(t => t.id === tradeId);
      if (!trade) return;

      const updatedOffers = state.tradeOffers.map(t => t.id === tradeId ? { ...t, status: 'rejected' as const } : t);
      state = { ...state, tradeOffers: updatedOffers };

      await saveAndBroadcastState(gameId, state, io, false);
    } catch (err) {
      console.error('[Game] Reject trade error:', err);
    }
  });

  // ─── SURRENDER KANGAL (DECLARE BANKRUPTCY & TRANSFER ASSETS) ──
  socket.on(SocketEvent.SURRENDER_KANGAL, async (payload: SurrenderKangalPayload) => {
    try {
      const { playerId, gameId, transferTargetId } = payload;
      let state = await getGameState(gameId);
      if (!state || state.phase !== 'playing') return;

      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return;

      const player = state.players[playerIndex];
      if (player.isBankrupt) return;

      const activeOpponents = state.players.filter(p => p.id !== playerId && !p.isBankrupt);
      const playerMoney = Math.max(0, player.money);
      const playerProps = state.properties.filter(p => p.ownerId === playerId);

      let updatedPlayers = [...state.players];
      let updatedProps = [...state.properties];

      if (activeOpponents.length > 0) {
        if (transferTargetId && transferTargetId !== 'distribute_all') {
          // Transfer everything directly to the selected target player
          const target = activeOpponents.find(p => p.id === transferTargetId);
          if (target) {
            updatedPlayers = updatedPlayers.map(p => {
              if (p.id === playerId) return { ...p, money: 0, isBankrupt: true };
              if (p.id === target.id) return { ...p, money: p.money + playerMoney };
              return p;
            });
            updatedProps = updatedProps.map(prop => {
              if (prop.ownerId === playerId) return { ...prop, ownerId: target.id };
              return prop;
            });
            state = addGameEvent(state, {
              type: 'bankrupt',
              playerId,
              playerName: player.name,
              playerColor: player.color,
              message: `🪣 ${player.name} declared KANGAL! (Diwala nikal gaya!) Transferred ₹${playerMoney.toLocaleString('en-IN')} & ${playerProps.length} properties to ${target.name}!`,
              icon: '🪣',
            });
          }
        } else {
          // Distribute equally to all active opponents
          const splitMoney = Math.floor(playerMoney / activeOpponents.length);
          updatedPlayers = updatedPlayers.map(p => {
            if (p.id === playerId) return { ...p, money: 0, isBankrupt: true };
            if (!p.isBankrupt) return { ...p, money: p.money + splitMoney };
            return p;
          });
          // Distribute properties round-robin among active opponents
          let opponentIndex = 0;
          updatedProps = updatedProps.map(prop => {
            if (prop.ownerId === playerId) {
              const recipient = activeOpponents[opponentIndex % activeOpponents.length];
              opponentIndex++;
              return { ...prop, ownerId: recipient.id };
            }
            return prop;
          });
          state = addGameEvent(state, {
            type: 'bankrupt',
            playerId,
            playerName: player.name,
            playerColor: player.color,
            message: `🪣 ${player.name} declared KANGAL! (Diwala nikal gaya!) Distributed ₹${playerMoney.toLocaleString('en-IN')} & ${playerProps.length} properties among all remaining players!`,
            icon: '🪣',
          });
        }
      } else {
        // No opponents left
        updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, money: 0, isBankrupt: true } : p);
        updatedProps = updatedProps.map(prop => prop.ownerId === playerId ? { ...prop, ownerId: null, level: 0 } : prop);
      }

      state = {
        ...state,
        players: updatedPlayers,
        properties: updatedProps,
      };

      // Check if only 1 player remains -> Winner!
      const remainingAlive = state.players.filter(p => !p.isBankrupt);
      if (remainingAlive.length === 1) {
        const winner = remainingAlive[0];
        state = {
          ...state,
          phase: 'finished',
          winner: winner.id,
          endedAt: Date.now(),
        };
        state = addGameEvent(state, {
          type: 'game-end',
          playerId: winner.id,
          playerName: winner.name,
          playerColor: winner.color,
          message: `🏆 ${winner.name} is the last entrepreneur standing! VYAPAR SAMRAT (WINNER)! 🎉`,
          icon: '👑',
        });
      } else if (state.currentPlayerId === playerId) {
        // If surrendering player was current turn, advance turn
        state = advanceTurn(state);
      }

      await saveAndBroadcastState(gameId, state, io, true);
    } catch (err) {
      console.error('[Game] Surrender Kangal error:', err);
    }
  });

  // ─── UPGRADE PROPERTY (Buy Shop -> Store -> Complex -> Mega Upgrade) ──
  socket.on(SocketEvent.UPGRADE_PROPERTY, async (payload: UpgradePropertyPayload) => {
    try {
      const { playerId, gameId, tileId } = payload;
      let state = await getGameState(gameId);

      if (!state || state.phase !== 'playing') return;

      if (!validateTurn(state, playerId)) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Not your turn' });
        return;
      }

      const player = state.players.find(p => p.id === playerId);
      if (!player) return;

      const propStateIndex = state.properties.findIndex(p => p.tileId === tileId);
      if (propStateIndex === -1) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Property not found' });
        return;
      }

      const propState = state.properties[propStateIndex];
      if (propState.ownerId !== playerId) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'You do not own this property' });
        return;
      }

      if (propState.isMortgaged) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Cannot upgrade a mortgaged property' });
        return;
      }

      const tile = getTileById(tileId);
      if (tile.type !== 'property') {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Only standard properties can be upgraded' });
        return;
      }

      if (tile.group) {
        const groupConfig = GAME_CONFIG.PROPERTY_GROUPS.find(g => g.group === tile.group);
        if (groupConfig) {
          const ownsAll = groupConfig.tileIds.every(tId => {
            const p = state.properties.find(prop => prop.tileId === tId);
            return p?.ownerId === playerId;
          });
          if (!ownsAll) {
            socket.emit(SocketEvent.ACTION_ERROR, { message: `You must own all properties of the ${groupConfig.name} color group to upgrade!` });
            return;
          }
        }
      }

      const currentLevel = propState.level;
      if (currentLevel >= 4) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: 'Property is already at maximum upgrade (Mega Complex level 4)' });
        return;
      }

      const upgradeCosts = tile.upgradeCosts ?? [];
      const cost = upgradeCosts[currentLevel];
      if (!cost || player.money < cost) {
        socket.emit(SocketEvent.ACTION_ERROR, { message: `Insufficient funds. Upgrade costs ₹${cost?.toLocaleString('en-IN')}` });
        return;
      }

      const updatedPlayers = state.players.map(p => {
        if (p.id === playerId) {
          return { ...p, money: p.money - cost };
        }
        return p;
      });

      const updatedProperties = state.properties.map(p => {
        if (p.tileId === tileId) {
          return { ...p, level: p.level + 1 };
        }
        return p;
      });

      const levelNames = ['Shop', 'Store', 'Complex', 'Mega Complex'];
      const newLevelName = levelNames[currentLevel] ?? 'Upgraded';

      state = {
        ...state,
        players: updatedPlayers,
        properties: updatedProperties,
      };

      state.players = state.players.map(p => {
        const economy = require('../game-engine/economy');
        return {
          ...p,
          netWorth: economy.calculateNetWorth(p, state.properties)
        };
      });

      state = addGameEvent(state, {
        type: 'upgrade',
        playerId,
        playerName: player.name,
        playerColor: player.color,
        message: `🏢 ${player.name} upgraded ${tile.icon} ${tile.name} to a ${newLevelName} (LV.${currentLevel + 1}) for ₹${cost.toLocaleString('en-IN')}!`,
        amount: -cost,
        icon: '🏢',
      });

      await saveAndBroadcastState(gameId, state, io, false);
    } catch (err) {
      console.error('[Game] Property upgrade error:', err);
      socket.emit(SocketEvent.ACTION_ERROR, { message: 'Failed to upgrade property' });
    }
  });
}
