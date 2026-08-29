import React from 'react';
import type { BoardTileConfig, Player, PropertyState } from '@dhandha/shared';
import { GAME_CONFIG } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';
import { LandmarkGraphic } from '../../utils/landmarkImages';

interface PropertyModalProps {
  tile: BoardTileConfig | null;
  propertyState?: PropertyState;
  ownerPlayer?: Player | null;
  onClose: () => void;
  onBuy?: () => void;
  canBuy?: boolean;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  tile,
  propertyState,
  ownerPlayer,
  onClose,
  onBuy,
  canBuy,
}) => {
  if (!tile) return null;

  const groupConfig = tile.group
    ? GAME_CONFIG.PROPERTY_GROUPS.find((g) => g.group === tile.group)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-gold max-w-sm w-full p-6 relative overflow-hidden animate-bounce-in">
        {/* Color bar */}
        {groupConfig && (
          <div
            className="absolute top-0 left-0 right-0 h-3"
            style={{ backgroundColor: groupConfig.color }}
          />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        {/* Tile Header & Landmark Image */}
        <div className="text-center mt-2 mb-4 flex flex-col items-center">
          {/* Landmark Graphic Card Banner */}
          <div className="w-full h-36 rounded-xl overflow-hidden border border-[#d4af37]/40 mb-3 bg-[#120c09] shadow-lg relative flex items-center justify-center">
            <LandmarkGraphic tileId={tile.id} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-lg border border-white/20">
              {tile.icon}
            </div>
          </div>

          <h3 className="font-display font-extrabold text-xl text-white">{tile.name}</h3>
          {groupConfig && (
            <div
              className="text-xs font-bold uppercase mt-1 inline-block px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${groupConfig.color}33`, color: groupConfig.color }}
            >
              {groupConfig.name}
            </div>
          )}
          <p className="text-xs text-slate-300 mt-2">{tile.description}</p>
        </div>

        {/* Financial Info */}
        <div className="bg-app-bg/60 rounded-xl p-3 border border-app-border/50 space-y-2 mb-5 text-xs">
          {tile.price && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Price</span>
              <span className="font-bold text-emerald-400 text-sm">
                {formatRupee(tile.price)}
              </span>
            </div>
          )}

          {tile.revenue && (
            <div className="space-y-1 pt-2 border-t border-app-border/40">
              <div className="text-slate-400 text-[10px] font-semibold uppercase">Revenue by Level:</div>
              {tile.revenue.map((rev, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">
                    {GAME_CONFIG.LEVEL_LABELS[idx + 1]}
                  </span>
                  <span className="font-semibold text-amber-300">{formatRupee(rev)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Owner info if owned */}
          {ownerPlayer && (
            <div className="pt-2 border-t border-app-border/40 flex justify-between items-center">
              <span className="text-slate-400">Owner</span>
              <span className="font-bold" style={{ color: ownerPlayer.color }}>
                {ownerPlayer.name} ({ownerPlayer.avatar})
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex gap-2">
          {canBuy && onBuy && (
            <button onClick={onBuy} className="btn-success flex-1 py-2.5">
              💰 BUY FOR {formatRupee(tile.price ?? 0)}
            </button>
          )}
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
