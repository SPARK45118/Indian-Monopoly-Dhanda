import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import { useDesiSounds } from '../hooks/useDesiSounds';
import { Board } from '../components/Board/Board';
import { FloatingChatDrawer } from '../components/Chat/FloatingChatDrawer';
import { PropertyModal } from '../components/Modals/PropertyModal';
import { HowToPlayModal } from '../components/Modals/HowToPlayModal';
import { RulesModal } from '../components/Modals/RulesModal';
import { LeaderboardModal } from '../components/Modals/LeaderboardModal';
import { TradeModal } from '../components/Modals/TradeModal';
import { KangalModal } from '../components/Modals/KangalModal';
import { VictoryModal } from '../components/Modals/VictoryModal';
import { getTileById } from '@dhandha/shared';
import { CharacterIcon } from '../utils/characterIcons';
import { formatRupee } from '../utils/format';
import { getSocket } from '../socket/socketClient';

function playDiceRollSound() {
  if (typeof window === 'undefined' || (!window.AudioContext && !(window as any).webkitAudioContext)) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100 + Math.random() * 80, now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(30 + Math.random() * 20, now + i * 0.08 + 0.07);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.075);
    }
    const oscHit = ctx.createOscillator();
    const gainHit = ctx.createGain();
    oscHit.type = 'triangle';
    oscHit.frequency.setValueAtTime(150, now + 0.45);
    oscHit.frequency.exponentialRampToValueAtTime(40, now + 0.6);
    gainHit.gain.setValueAtTime(0.3, now + 0.45);
    gainHit.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    oscHit.connect(gainHit);
    gainHit.connect(ctx.destination);
    oscHit.start(now + 0.45);
    oscHit.stop(now + 0.6);
  } catch (e) {
    console.error('AudioContext sound error:', e);
  }
}

export const GamePage: React.FC = () => {
  useSocket();
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const {
    localPlayer,
    gameState,
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
  } = useGame();

  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showKangalModal, setShowKangalModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Desi voice commentary — only plays for events belonging to THIS player
  useDesiSounds(isMuted ? null : gameState, localPlayer?.id);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const [timeLeft, setTimeLeft] = useState<number>(60);

  // Time remaining calculator
  React.useEffect(() => {
    if (!gameState || !gameState.turnExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((gameState.turnExpiresAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 200);

    return () => clearInterval(interval);
  }, [gameState?.turnExpiresAt]);

  const handleRollDiceWithSound = () => {
    playDiceRollSound();
    rollDice();
  };

  // Attempt to auto-reconnect/join if gameState is null but we have roomCode in URL
  React.useEffect(() => {
    if (!gameState && roomCode && localPlayer) {
      const socket = getSocket();
      socket.emit('join_room', {
        playerId: localPlayer.id,
        playerName: localPlayer.name,
        roomCode: roomCode.toUpperCase(),
      });

      // Redirect to home if join fails after 5 seconds
      const timeout = setTimeout(() => {
        if (!gameState) {
          navigate('/');
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [gameState, roomCode, localPlayer, navigate]);

  if (!gameState || !localPlayer) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc2626] mb-4"></div>
        <h2 className="text-xl font-bold font-display">Reconnecting to Game...</h2>
        <p className="text-sm text-[#a1a1aa] mt-2">Restoring game state for room {roomCode}</p>
      </div>
    );
  }

  const selectedTileConfig = selectedTileId !== null ? getTileById(selectedTileId) : null;
  const selectedTilePropState =
    selectedTileId !== null
      ? gameState.properties.find((p) => p.tileId === selectedTileId)
      : undefined;
  const selectedTileOwner = selectedTilePropState?.ownerId
    ? gameState.players.find((p) => p.id === selectedTilePropState.ownerId)
    : null;

  return (
    <div className="game-page-container bg-[#09090b] text-[#fafafa] p-2 md:p-3 relative font-body select-none">
      
      {/* ═══ TOP COMPACT HEADER / HUD ═══ */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-2xl mb-2 shadow-xl shrink-0 z-20">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-black font-display text-[#fafafa] tracking-wide">
            VYAPAR
          </span>
          <span className="text-[10px] font-black tracking-widest text-[#dc2626] px-1.5 py-0.5 rounded bg-[#09090b] border border-[#dc2626]/40 uppercase">
            INDIA
          </span>
          <div className="text-[11px] text-[#a1a1aa] border-l border-[#27272a] pl-3 hidden lg:block">
            Khelo. Kamao. Kharido. Vyapar Jamao.
          </div>
        </div>

        {/* Center: Live Player Heads HUD */}
        <div className="hidden md:flex items-center gap-2">
          {gameState.players.map((p) => {
            const isTurn = p.id === gameState.currentPlayerId;
            const isMe = p.id === localPlayer.id;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all ${
                  p.isBankrupt
                    ? 'bg-zinc-950/80 border-red-950/70 opacity-70'
                    : isTurn
                    ? 'bg-[#09090b] border-[#dc2626] shadow-sm shadow-[#dc2626]/30'
                    : 'bg-[#09090b]/50 border-[#27272a]'
                }`}
              >
                <div className="shrink-0 relative">
                  {p.character ? (
                    <CharacterIcon id={p.character} className={`w-5 h-5 ${p.isBankrupt ? 'grayscale' : ''}`} />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ borderColor: p.color, backgroundColor: `${p.color}22` }}
                    />
                  )}
                  {p.isBankrupt && (
                    <span className="absolute -top-1.5 -right-1.5 text-[10px] animate-bounce" title="KANGAL">
                      🪣
                    </span>
                  )}
                </div>
                <span className={`font-bold truncate max-w-[80px] ${p.isBankrupt ? 'line-through text-zinc-500' : 'text-[#fafafa]'}`}>
                  {p.name}
                  {isMe && ' (You)'}
                </span>
                {p.isBankrupt ? (
                  <span className="text-[9px] font-black text-red-400 bg-red-950/80 px-1 py-0.2 rounded border border-red-800/40 uppercase">
                    KANGAL
                  </span>
                ) : (
                  <span className="font-mono text-[11px] font-black text-[#22c55e]">
                    {formatRupee(p.money)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Room Code */}
          <div className="bg-[#09090b] px-3 py-1.5 rounded-xl border border-[#27272a] flex items-center gap-1.5">
            <span className="text-[#a1a1aa] text-[10px] font-bold">ROOM:</span>
            <span className="font-mono font-black text-[#dc2626] tracking-wider">{roomCode}</span>
          </div>

          {/* Visual Turn Timer Badge */}
          {gameState.phase === 'playing' && gameState.turnExpiresAt && (
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all shadow-inner ${
              timeLeft <= 15
                ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                : 'bg-[#09090b] border-[#27272a] text-[#fafafa]'
            }`}>
              <span className="text-[10px] text-[#a1a1aa] uppercase font-bold tracking-wider">⏱️</span>
              <span className="font-mono text-xs tracking-tight">{timeLeft}s</span>
            </div>
          )}

          {/* Trade System Button */}
          <button
            onClick={() => setShowTradeModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#09090b] hover:bg-[#27272a] text-[#dc2626] border border-[#27272a] transition-colors flex items-center gap-1 font-bold text-xs"
            title="Open Trade System"
          >
            <span>🤝</span>
            <span className="hidden md:inline">TRADE</span>
            {(gameState.tradeOffers || []).some(
              (t) => t.toPlayerId === localPlayer.id && t.status === 'pending'
            ) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Declare Kangal (Surrender) Button */}
          {!gameState.players.find((p) => p.id === localPlayer.id)?.isBankrupt && gameState.phase === 'playing' && (
            <button
              onClick={() => setShowKangalModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 transition-colors flex items-center gap-1 font-bold text-xs shadow-sm hover:text-red-200"
              title="Declare Kangal (Surrender & Transfer Assets)"
            >
              <span>🪣</span>
              <span className="hidden lg:inline">KANGAL</span>
            </button>
          )}

          {/* Leaderboard Button */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-2 rounded-xl bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] transition-colors"
            title="Leaderboard"
          >
            🏆
          </button>

          {/* Rules Button */}
          <button
            onClick={() => setShowRules(true)}
            className="p-2 rounded-xl bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] transition-colors"
            title="Game Rules"
          >
            📖
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? '📉' : '⛶'}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              if (isMuted) {
                setIsMuted(false);
              } else {
                window.speechSynthesis?.cancel();
                setIsMuted(true);
              }
            }}
            className={`p-2 rounded-xl border transition-colors ${isMuted ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] border-[#27272a]'}`}
            title={isMuted ? 'Unmute Desi Commentary' : 'Mute Desi Commentary'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Leave Button */}
          <button
            onClick={() => navigate('/')}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-[#fafafa] px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 text-xs border border-[#b91c1c]"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">LEAVE</span>
          </button>
        </div>
      </header>

      {/* ═══ MAIN LANDSCAPE TABLETOP BOARD (FITS IN 100vh) ═══ */}
      <main className="flex-1 min-h-0 flex items-center justify-center relative">
        <div className="game-board-wrapper">
          <Board
            gameState={gameState}
            localPlayerId={localPlayer.id}
            onTileClick={(tileId) => setSelectedTileId(tileId)}
            onRollDice={handleRollDiceWithSound}
            onBuyBusiness={buyBusiness}
            onPassProperty={passProperty}
            onEndTurn={endTurn}
            onOpenTrade={() => setShowTradeModal(true)}
            onUpgradeProperty={upgradeProperty}
          />
        </div>
      </main>

      {/* ═══ FLOATING CHAT & EVENT FEED DRAWER (OVERLAY) ═══ */}
      <FloatingChatDrawer
        messages={gameState.chatMessages}
        events={gameState.events}
        onSendMessage={sendMessage}
        onSendTaunt={sendTaunt}
      />

      {/* ═══ POPUP MODALS ═══ */}
      {/* Tile Detail Modal */}
      <PropertyModal
        tile={selectedTileConfig}
        propertyState={selectedTilePropState}
        ownerPlayer={selectedTileOwner}
        onClose={() => setSelectedTileId(null)}
      />

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Rules Modal */}
      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}

      {/* Live Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal gameState={gameState} onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Trade System Modal */}
      {(showTradeModal ||
        (gameState.tradeOffers || []).some(
          (t) => t.toPlayerId === localPlayer.id && t.status === 'pending'
        )) && (
        <TradeModal
          gameState={gameState}
          localPlayer={
            gameState.players.find((p) => p.id === localPlayer.id) ||
            ({
              id: localPlayer.id,
              name: localPlayer.name,
              money: 15000,
              position: 0,
              color: '#f59e0b',
              avatar: '🔴',
              isBankrupt: false,
              isConnected: true,
              inLegalTrouble: false,
              legalTroubleTurns: 0,
              doublesCount: 0,
              netWorth: 15000,
            } as any)
          }
          onOfferTrade={offerTrade}
          onAcceptTrade={acceptTrade}
          onRejectTrade={rejectTrade}
          onClose={() => setShowTradeModal(false)}
        />
      )}

      {/* Kangal (Surrender & Asset Transfer) Modal */}
      {showKangalModal && (
        <KangalModal
          gameState={gameState}
          localPlayer={
            gameState.players.find((p) => p.id === localPlayer.id) ||
            ({
              id: localPlayer.id,
              name: localPlayer.name,
              money: 15000,
              position: 0,
              color: '#f59e0b',
              avatar: '🔴',
              isBankrupt: false,
              isConnected: true,
              inLegalTrouble: false,
              legalTroubleTurns: 0,
              doublesCount: 0,
              netWorth: 15000,
            } as any)
          }
          onConfirmSurrender={(transferTargetId) => {
            surrenderKangal(transferTargetId);
            setShowKangalModal(false);
          }}
          onClose={() => setShowKangalModal(false)}
        />
      )}

      {/* Match Victory / Game Over Modal */}
      {(gameState.phase === 'finished' || gameState.winner !== null) && (
        <VictoryModal
          gameState={gameState}
          onPlayAgain={() => navigate('/')}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  );
};
