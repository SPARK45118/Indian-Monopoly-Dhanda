import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import { CharacterSelect } from '../components/Characters/CharacterSelect';
import { CharacterIcon } from '../utils/characterIcons';
import { GAME_CONFIG } from '@dhandha/shared';
import type { CharacterId } from '@dhandha/shared';
import { getSocket } from '../socket/socketClient';
import { useUIStore } from '../store/uiStore';

export const LobbyPage: React.FC = () => {
  useSocket();
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const {
    localPlayer,
    room,
    gameState,
    selectCharacter,
    toggleReady,
    startGame,
  } = useGame();

  const addToast = useUIStore((s) => s.addToast);

  // If game has started, navigate to game view
  useEffect(() => {
    if (gameState && gameState.phase === 'playing') {
      navigate(`/game/${roomCode}`);
    }
  }, [gameState, roomCode, navigate]);

  // Attempt to auto-reconnect/join if room is null but we have roomCode in URL
  useEffect(() => {
    if (!room && roomCode && localPlayer) {
      const socket = getSocket();
      socket.emit('join_room', {
        playerId: localPlayer.id,
        playerName: localPlayer.name,
        roomCode: roomCode.toUpperCase(),
      });

      // Redirect to home if join fails after 5 seconds
      const timeout = setTimeout(() => {
        if (!room) {
          navigate('/');
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [room, roomCode, localPlayer, navigate]);

  if (!room || !localPlayer) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc2626] mb-4"></div>
        <h2 className="text-xl font-bold font-display">Reconnecting to Room...</h2>
        <p className="text-sm text-[#a1a1aa] mt-2">Connecting you back to room {roomCode}</p>
      </div>
    );
  }

  const isHost = room.hostId === localPlayer.id;
  const meInRoom = room.players.find((p) => p.id === localPlayer.id);

  // Taken characters by other players
  const takenCharacters = room.players
    .filter((p) => p.id !== localPlayer.id && p.character)
    .map((p) => p.character as CharacterId);

  const canStartGame =
    isHost &&
    room.players.length >= GAME_CONFIG.MIN_PLAYERS &&
    room.players.every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden font-body">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none filter grayscale contrast-200"
        style={{ backgroundImage: `url('/landing_bg.png?v=2')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b] pointer-events-none" />

      <div className="max-w-5xl w-full p-6 md:p-8 rounded-3xl bg-[#18181b] border border-[#27272a] shadow-2xl relative z-10 space-y-7">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl md:text-3xl font-black font-display tracking-tight text-[#fafafa]">
                GAME LOBBY
              </span>
              <span className="text-[11px] font-black tracking-widest text-[#dc2626] px-2 py-0.5 rounded-md bg-[#09090b] border border-[#dc2626]/40 uppercase">
                VYAPAR
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa]">
              Select your business persona & ready up to conquer the market!
            </p>
          </div>

          {/* Room Code Badge & Copy Invite Link */}
          <div className="flex items-center gap-3">
            <div className="bg-[#09090b] px-5 py-2.5 rounded-2xl border border-[#27272a] text-center shadow-inner">
              <div className="text-[10px] text-[#a1a1aa] uppercase font-bold tracking-wider">Room Code</div>
              <div className="text-2xl font-mono font-black text-[#dc2626] tracking-widest">
                {room.code}
              </div>
            </div>
            <button
              onClick={() => {
                const inviteUrl = `${window.location.origin}/lobby/${room.code}`;
                navigator.clipboard.writeText(inviteUrl);
                addToast({ type: 'success', message: '🔗 Invite link copied to clipboard!' });
              }}
              className="px-4 py-3 rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] text-[#fafafa] font-bold text-sm tracking-wide transition-all shadow-md shadow-red-950/20 active:scale-95 flex items-center gap-2 border border-red-500/30"
              title="Copy Invite Link"
            >
              <span>🔗</span> Copy Link
            </button>
          </div>
        </div>

        {/* Player Slots (4 slots) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
              Tycoons in Room ({room.players.length}/4)
            </h3>
            <span className="text-xs font-semibold text-[#22c55e]">
              {room.players.filter(p => p.isReady).length} / {room.players.length} Ready
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[0, 1, 2, 3].map((slotIdx) => {
              const player = room.players[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center h-32 relative transition-all ${
                    player
                      ? 'bg-[#09090b] border-[#27272a] shadow-md'
                      : 'bg-[#09090b]/40 border-dashed border-[#27272a]/60 text-zinc-600'
                  }`}
                >
                  {player ? (
                    <>
                      <div className="mb-1.5">
                        {player.character ? (
                          <CharacterIcon id={player.character} className="w-10 h-10" />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                            style={{ borderColor: player.color, backgroundColor: `${player.color}22` }}
                          >
                            {player.avatar}
                          </div>
                        )}
                      </div>
                      
                      <div className="font-black text-xs text-[#fafafa] truncate max-w-[130px]">
                        {player.name}
                        {player.id === room.hostId && ' 👑'}
                      </div>
                      
                      <div className="text-[10px] text-[#dc2626] font-semibold mt-0.5 truncate max-w-[130px]">
                        {player.character
                          ? GAME_CONFIG.CHARACTERS.find((c) => c.id === player.character)?.name
                          : 'Selecting...'}
                      </div>

                      {player.isReady ? (
                        <div className="absolute top-2.5 right-2.5 text-[9px] bg-[#22c55e]/20 text-[#22c55e] font-black px-1.5 py-0.5 rounded border border-[#22c55e]/40 uppercase tracking-wider">
                          Ready
                        </div>
                      ) : (
                        <div className="absolute top-2.5 right-2.5 text-[9px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded border border-zinc-700 uppercase">
                          Wait
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs font-medium text-zinc-500">
                      Waiting for player...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Selection Grid with Custom Logos */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3.5">
            Choose Your Business Persona
          </h3>
          <CharacterSelect
            selectedCharacter={meInRoom?.character ?? null}
            onSelect={(charId) => selectCharacter(charId)}
            disabledCharacters={takenCharacters}
          />
        </div>

        {/* Controls Footer */}
        <div className="pt-5 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => toggleReady()}
            disabled={!meInRoom?.character}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all shadow-md ${
              meInRoom?.isReady
                ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/25'
                : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-[#dc2626]/25 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {meInRoom?.isReady ? '✓ READY TO PLAY' : 'READY UP'}
          </button>

          {isHost && (
            <button
              onClick={() => startGame()}
              disabled={!canStartGame}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wider uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-600/30"
            >
              🚀 START GAME ({room.players.length}/4)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
