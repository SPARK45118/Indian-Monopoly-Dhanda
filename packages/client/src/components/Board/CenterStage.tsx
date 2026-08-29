import React from 'react';
import type { GameState } from '@dhandha/shared';
import { getTileById, GAME_CONFIG } from '@dhandha/shared';
import { DiceRoller } from '../Dice/DiceRoller';
import { formatRupee } from '../../utils/format';
import { playDiceRollSound, playBuyPropertySound } from '../../utils/sound';
import { useUIStore } from '../../store/uiStore';
import { CharacterIcon } from '../../utils/characterIcons';
import { LandmarkGraphic } from '../../utils/landmarkImages';

interface CenterStageProps {
  gameState: GameState;
  localPlayerId: string;
  onRollDice: () => void;
  onBuyBusiness: (tileId: number) => void;
  onPassProperty: () => void;
  onEndTurn: () => void;
  onOpenTrade?: () => void;
  onUpgradeProperty?: (tileId: number) => void;
}

export const CenterStage: React.FC<CenterStageProps> = ({
  gameState,
  localPlayerId,
  onRollDice,
  onBuyBusiness,
  onPassProperty,
  onEndTurn,
  onOpenTrade,
  onUpgradeProperty,
}) => {
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const isMyTurn = gameState.currentPlayerId === localPlayerId;
  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);
  const localPlayer = gameState.players.find((p) => p.id === localPlayerId);

  const currentTileId = currentPlayer?.position ?? 0;
  const currentTile = getTileById(currentTileId);
  const propState = currentTile
    ? gameState.properties.find((p) => p.tileId === currentTile.id)
    : null;

  const currentTileGroup = currentTile?.group
    ? GAME_CONFIG.PROPERTY_GROUPS.find((g) => g.group === currentTile.group)
    : null;

  const ownedPropertiesCount = gameState.properties.filter(
    (p) => p.ownerId === (currentPlayer?.id ?? '')
  ).length;

  const canBuy =
    isMyTurn &&
    gameState.turnPhase === 'post-roll' &&
    currentTile &&
    (currentTile.type === 'property' || currentTile.type === 'railway') &&
    !propState?.ownerId &&
    (localPlayer?.money ?? 0) >= (currentTile.price ?? 0);

  const handleRollClick = () => {
    playDiceRollSound(soundEnabled);
    onRollDice();
  };

  const handleBuyClick = () => {
    if (!currentTile) return;
    playBuyPropertySound(soundEnabled);
    onBuyBusiness(currentTile.id);
  };

  // ── Upgrade eligibility ────────────────────────────────────────
  // Find all my owned properties that are upgradeable (complete group, level 1-3)
  const localPlayerObj = gameState.players.find((p) => p.id === localPlayerId);
  const upgradeableProps = GAME_CONFIG.PROPERTY_GROUPS.flatMap((grp) => {
    const ownsAll = grp.tileIds.every((tId) => {
      const ps = gameState.properties.find((p) => p.tileId === tId);
      return ps?.ownerId === localPlayerId;
    });
    if (!ownsAll) return [];
    return grp.tileIds
      .map((tId) => {
        const ps = gameState.properties.find((p) => p.tileId === tId);
        const tile = getTileById(tId);
        if (!ps || ps.level >= 4 || ps.isMortgaged || tile.type !== 'property') return null;
        const cost = tile.upgradeCosts?.[ps.level - 1];
        if (!cost || (localPlayerObj?.money ?? 0) < cost) return null;
        return { tileId: tId, tile, ps, cost };
      })
      .filter(Boolean);
  }) as { tileId: number; tile: ReturnType<typeof getTileById>; ps: { level: number }; cost: number }[];

  const showUpgradePanel = isMyTurn && (gameState.turnPhase === 'end-turn') && upgradeableProps.length > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 relative z-10 select-none">
      
      {/* ═══ TOP: CURRENT PLAYER & TURN STATUS HUD ═══ */}
      <div className="overlay-panel top-panel">
        {/* Active Player Info */}
        <div className="flex items-center gap-2">
          {currentPlayer?.character ? (
            <CharacterIcon id={currentPlayer.character} className="w-8 h-8 shrink-0" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border"
              style={{ borderColor: currentPlayer?.color, backgroundColor: `${currentPlayer?.color}22` }}
            >
              {currentPlayer?.avatar ?? '👤'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs sm:text-sm text-[#fafafa]">
                {currentPlayer?.name}
              </span>
              {isMyTurn && (
                <span className="text-[9px] bg-[#dc2626] text-white font-black px-1.5 py-0.2 rounded uppercase">
                  YOU
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#a1a1aa] font-medium">
              Tile: <span className="text-[#fafafa] font-semibold">{currentTile.name}</span>
            </span>
          </div>
        </div>

        {/* Turn Status Banner */}
        <div className="text-center">
          {isMyTurn ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dc2626]/20 border border-[#dc2626]/50 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              <span className="text-xs font-black text-[#fafafa] uppercase tracking-wider">
                YOUR TURN
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a]">
              <span className="w-2 h-2 rounded-full bg-[#a1a1aa]" />
              <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                WAITING...
              </span>
            </div>
          )}
        </div>

        {/* Financial HUD */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[9px] text-[#a1a1aa] uppercase font-bold">Balance</div>
            <div className="font-display font-black text-xs sm:text-sm text-[#22c55e]">
              {formatRupee(currentPlayer?.money ?? 0)}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[9px] text-[#a1a1aa] uppercase font-bold">Assets</div>
            <div className="font-display font-black text-xs sm:text-sm text-[#dc2626]">
              🏢 {ownedPropertiesCount}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MIDDLE: DYNAMIC INTERACTIVE GAMEPLAY STAGE ═══ */}
      <div className="my-auto flex flex-col items-center justify-center w-full max-w-lg">
        {/* Spectator Mode Banner for Kangal Player */}
        {localPlayer?.isBankrupt && (
          <div className="w-full bg-red-950/60 border border-red-800/60 rounded-2xl p-3 mb-3 text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
            <span className="text-xl">👀</span>
            <span className="text-xs font-bold text-red-200">
              <strong className="text-red-400">SPECTATING:</strong> You declared Kangal. Relax and watch the battle!
            </span>
            <span className="text-lg">🪣</span>
          </div>
        )}
        
        {/* PHASE 1: ROLL PHASE (Ready to Roll) */}
        {gameState.turnPhase === 'roll' && (
          <div className="flex flex-col items-center gap-3 text-center animate-fade-in">
            {/* 3D Dice Display */}
            <div className="scale-95 sm:scale-105 my-1">
              <DiceRoller dice={gameState.lastDice} isRolling={false} />
            </div>

            {gameState.lastDice && (
              <div className="text-xs font-bold text-[#a1a1aa]">
                Last Roll: <span className="text-[#fafafa] font-black text-sm">{gameState.lastDice.total}</span>
              </div>
            )}

            {isMyTurn ? (
              <button
                onClick={handleRollClick}
                disabled={gameState.hasRolled}
                className="btn-primary flex items-center justify-center gap-2.5 px-8 py-3.5 text-base sm:text-lg w-64 shadow-xl shadow-red-600/30 active:scale-95"
              >
                <span>🎲</span>
                <span>ROLL DICE</span>
              </button>
            ) : (
              <div className="text-xs text-[#a1a1aa] font-medium">
                Waiting for <span className="text-[#fafafa] font-bold">{currentPlayer?.name}</span> to roll...
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: POST-ROLL / UNOWNED PROPERTY PURCHASE STAGE */}
        {gameState.turnPhase === 'post-roll' && currentTile && (currentTile.type === 'property' || currentTile.type === 'railway') && !propState?.ownerId && (
          <div className="w-full max-w-sm rounded-2xl bg-[#18181b] border-2 border-[#27272a] shadow-2xl p-4 flex flex-col items-center text-center animate-bounce-in">
            {/* Property Header Strip */}
            {currentTileGroup && (
              <div
                className="w-full py-1 rounded-lg text-white font-black text-xs uppercase tracking-widest mb-2.5"
                style={{ backgroundColor: currentTileGroup.color }}
              >
                {currentTileGroup.name}
              </div>
            )}

            {/* Landmark Image Graphic Preview */}
            <div className="w-20 h-14 rounded-xl overflow-hidden mb-2 bg-[#09090b] border border-[#27272a] flex items-center justify-center">
              <LandmarkGraphic tileId={currentTile.id} />
            </div>

            <h3 className="font-display font-black text-base sm:text-lg text-[#fafafa] leading-tight">
              {currentTile.name}
            </h3>

            <div className="text-xs text-[#a1a1aa] my-1.5">
              Acquisition Price:{' '}
              <span className="font-black text-[#22c55e] text-sm">
                {formatRupee(currentTile.price ?? 0)}
              </span>
            </div>

            {/* Action Buttons: Buy vs Pass */}
            {isMyTurn ? (
              <div className="flex items-center gap-2.5 w-full mt-3">
                <button
                  onClick={handleBuyClick}
                  disabled={!canBuy}
                  className="btn-success flex-1 py-3 text-xs sm:text-sm font-black tracking-wider uppercase disabled:opacity-40"
                >
                  BUY PROPERTY
                </button>
                <button
                  onClick={onPassProperty}
                  className="btn-secondary py-3 px-4 text-xs font-bold uppercase hover:bg-zinc-800"
                >
                  PASS
                </button>
              </div>
            ) : (
              <div className="text-xs text-[#a1a1aa] font-medium mt-2">
                Waiting for decision...
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: RENT PAID / OWNED BY SOMEONE ELSE */}
        {gameState.turnPhase === 'post-roll' && propState?.ownerId && propState.ownerId !== currentPlayer?.id && (
          <div className="w-full max-w-sm rounded-2xl bg-[#18181b] border border-[#27272a] p-4 text-center animate-fade-in space-y-2">
            <div className="text-2xl">💸</div>
            <h3 className="font-display font-black text-base text-[#fafafa]">
              Rent Transaction
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Landed on <span className="text-[#fafafa] font-bold">{currentTile?.name}</span> owned by{' '}
              <span className="text-[#dc2626] font-bold">
                {gameState.players.find((p) => p.id === propState.ownerId)?.name}
              </span>
            </p>
            {isMyTurn && (
              <button
                onClick={onEndTurn}
                className="btn-primary w-full py-2.5 text-xs font-black uppercase mt-3"
              >
                END TURN
              </button>
            )}
          </div>
        )}

        {/* PHASE 4: SPECIAL EVENTS / TAX / CHAI BREAK / END OF TURN */}
        {gameState.turnPhase === 'post-roll' && (currentTile?.type === 'festival' || currentTile?.type === 'treasure' || currentTile?.type === 'luck' || currentTile?.type === 'free-rest' || currentTile?.type === 'legal-trouble' || currentTile?.type === 'start') && (
          <div className="w-full max-w-sm rounded-2xl bg-[#18181b] border border-[#27272a] p-4 text-center animate-fade-in space-y-2">
            <div className="text-2xl">{currentTile.icon}</div>
            <h3 className="font-display font-black text-base text-[#fafafa]">
              {currentTile.name}
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              {currentTile.description || 'Special event resolved.'}
            </p>
            {isMyTurn && (
              <button
                onClick={onEndTurn}
                className="btn-primary w-full py-2.5 text-xs font-black uppercase mt-3"
              >
                END TURN
              </button>
            )}
          </div>
        )}

        {/* PHASE 5: COMPLETED TURN / MANUAL END TURN */}
        {gameState.turnPhase === 'end-turn' && (
          <div className="flex flex-col items-center gap-2 text-center animate-fade-in w-full max-w-sm">
            {/* ── UPGRADE PANEL ── */}
            {showUpgradePanel && onUpgradeProperty && (
              <div className="w-full rounded-2xl bg-[#18181b] border border-amber-500/40 p-3 text-left mb-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-2">🏗️ Upgrade a Business</div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {upgradeableProps.map(({ tileId, tile, ps, cost }) => {
                    const levelNames = ['Shop', 'Store', 'Complex', 'Mega Complex'];
                    return (
                      <button
                        key={tileId}
                        onClick={() => onUpgradeProperty(tileId)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-600/30 transition-all active:scale-95 text-xs"
                      >
                        <span className="font-bold text-amber-200">
                          {tile.icon} {tile.name}
                        </span>
                        <span className="font-mono text-amber-400 text-[11px]">
                          LV{ps.level}→{ps.level + 1} ({levelNames[ps.level]}) · {formatRupee(cost)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-xs font-bold text-[#a1a1aa]">Turn Complete</div>
            {isMyTurn ? (
              <button
                onClick={onEndTurn}
                className="btn-primary px-8 py-3 text-sm font-black uppercase w-56"
              >
                END TURN ➔
              </button>
            ) : (
              <div className="text-xs text-[#a1a1aa]">Passing turn...</div>
            )}
          </div>
        )}

      </div>

      {/* ═══ BOTTOM: ACTIVE MARKET BANNER & QUICK ACTIONS ═══ */}
      <div className="overlay-panel bottom-panel">
        {/* Active Market Event */}
        {gameState.marketState.activeEventName ? (
          <div className="px-3 py-1 rounded-full bg-[#dc2626]/20 border border-[#dc2626]/40 flex items-center gap-1.5 animate-pulse">
            <span>{gameState.marketState.activeEventIcon}</span>
            <span className="text-[10px] font-bold text-[#fafafa]">
              {gameState.marketState.activeEventName}
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-[#a1a1aa] font-medium">
            Market Stable • Round {gameState.turnNumber}
          </div>
        )}

        {/* Quick Trade Deal Trigger */}
        {onOpenTrade && (
          <button
            onClick={onOpenTrade}
            className="px-3 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#dc2626] border border-[#27272a] text-[11px] font-bold flex items-center gap-1 transition-all"
          >
            <span>🤝</span>
            <span>Trade Deal</span>
          </button>
        )}
      </div>

    </div>
  );
};
