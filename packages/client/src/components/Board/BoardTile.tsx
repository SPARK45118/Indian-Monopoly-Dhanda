import React from 'react';
import type { BoardTileConfig, Player, PropertyState } from '@dhandha/shared';
import { GAME_CONFIG } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';

interface BoardTileProps {
  tile: BoardTileConfig;
  players: Player[];
  propertyState?: PropertyState;
  onClick?: () => void;
  isCurrentPlayerTile?: boolean;
  hoppingPlayerIds?: string[];
}

export const BoardTile: React.FC<BoardTileProps> = ({
  tile,
  players,
  propertyState,
  onClick,
  isCurrentPlayerTile,
  hoppingPlayerIds = [],
}) => {
  const isCorner = [0, 13, 20, 33].includes(tile.id);
  const STATE_ABBREV: Record<string, string> = {
    'MAHARASHTRA': 'MH',
    'GUJARAT': 'GJ',
    'RAJASTHAN': 'RJ',
    'DELHI': 'DL',
    'UTTAR PRADESH': 'UP',
    'PUNJAB': 'PB',
    'WEST BENGAL': 'WB',
    'TAMIL NADU': 'TN',
    'BIHAR': 'BR',
    'ODISHA': 'OR',
    'ASSAM': 'AS',
    'ANDHRA PRADESH': 'AP',
    'TELANGANA': 'TG',
    'KARNATAKA': 'KA',
    'HIMACHAL PRADESH': 'HP',
    'JHARKHAND': 'JH',
    'MEGHALAYA': 'ML',
    'SIKKIM': 'SK',
    'PUDUCHERRY': 'PY',
    'UTTARAKHAND': 'UK',
    'JAMMU & KASHMIR': 'JK',
    'HARYANA': 'HR',
    'CHHATTISGARH': 'CT',
    'GOA': 'GA',
    'MADHYA PRADESH': 'MP',
    'KERALA': 'KL',
    // Add more as needed
  };
  const stateAbbrev = tile.state ? (STATE_ABBREV[tile.state] ?? tile.state.slice(0, 2).toUpperCase()) : null;
  const playersOnTile = players.filter((p) => p.position === tile.id);

  // Group config for property color
  const groupConfig = tile.group
    ? GAME_CONFIG.PROPERTY_GROUPS.find((g) => g.group === tile.group)
    : null;

  // 14x8 Perimeter Orientation
  const isBottom = tile.id >= 0 && tile.id <= 13;
  const isRight = tile.id > 13 && tile.id < 20;
  const isTop = tile.id >= 20 && tile.id <= 33;
  const isLeft = tile.id > 33 && tile.id < 40;

  const specialStyles = getSpecialTileStyle(tile);

  return (
    <div
      onClick={onClick}
      className={`board-tile relative overflow-hidden transition-all duration-150 cursor-pointer select-none group ${
        isCorner ? 'corner-tile bg-[#121215]' : 'bg-[#18181b] hover:bg-[#27272a]'
      } ${isCurrentPlayerTile ? 'ring-2 ring-[#dc2626] ring-inset z-20' : ''}`}
      style={{
        gridColumn: getGridColumn(tile.id),
        gridRow: getGridRow(tile.id),
        ...specialStyles.containerStyle,
      }}
    >
      {/* ═══ CORNER TILES ═══ */}
      {isCorner && renderCornerTile(tile)}

      {/* ═══ TOP ROW TILES (id 21..32) ═══ */}
      {isTop && !isCorner && (
        <div className="w-full h-full flex flex-col justify-between items-center relative p-1">
          {/* Color Band at TOP edge */}
          {groupConfig && (
            <div
              className="w-full h-2 rounded-t-sm mb-0.5"
              style={{ backgroundColor: groupConfig.color }}
            />
          )}

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] sm:text-xs leading-none mb-0.5">{tile.icon}</span>
            <span className="text-[9px] font-bold text-[#fafafa] tracking-tight leading-tight line-clamp-1">
              {tile.name}{stateAbbrev && <span className="ml-1 text-[8px] text-[#a1a1aa]">({stateAbbrev})</span>}
            </span>
          </div>

          {/* Price / Owner */}
          <div className="w-full text-center mt-auto">
            {renderTileFooter(tile, propertyState)}
          </div>
        </div>
      )}

      {/* ═══ BOTTOM ROW TILES (id 1..12) ═══ */}
      {isBottom && !isCorner && (
        <div className="w-full h-full flex flex-col justify-between items-center relative p-1">
          {/* Price / Owner at top */}
          <div className="w-full text-center">
            {renderTileFooter(tile, propertyState)}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] sm:text-xs leading-none mb-0.5">{tile.icon}</span>
            <span className="text-[9px] font-bold text-[#fafafa] tracking-tight leading-tight line-clamp-1">
              {tile.name}{stateAbbrev && <span className="ml-1 text-[8px] text-[#a1a1aa]">({stateAbbrev})</span>}
            </span>
          </div>

          {/* Color Band at BOTTOM edge */}
          {groupConfig && (
            <div
              className="w-full h-2 rounded-b-sm mt-0.5"
              style={{ backgroundColor: groupConfig.color }}
            />
          )}
        </div>
      )}

      {/* ═══ RIGHT COLUMN TILES (id 14..19) ═══ */}
      {isRight && !isCorner && (
        <div className="w-full h-full flex flex-row items-center justify-between relative p-1">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-0.5">
            <span className="text-[10px] sm:text-xs leading-none mb-0.5">{tile.icon}</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-[#fafafa] tracking-tight leading-tight line-clamp-1">
              {tile.name}{stateAbbrev && <span className="ml-1 text-[7px] text-[#a1a1aa]">({stateAbbrev})</span>}
            </span>
            {renderTileFooter(tile, propertyState)}
          </div>

          {/* Color Band at RIGHT edge */}
          {groupConfig && (
            <div
              className="h-full w-2 rounded-r-sm shrink-0"
              style={{ backgroundColor: groupConfig.color }}
            />
          )}
        </div>
      )}

      {/* ═══ LEFT COLUMN TILES (id 34..39) ═══ */}
      {isLeft && !isCorner && (
        <div className="w-full h-full flex flex-row items-center justify-between relative p-1">
          {/* Color Band at LEFT edge */}
          {groupConfig && (
            <div
              className="h-full w-2 rounded-l-sm shrink-0"
              style={{ backgroundColor: groupConfig.color }}
            />
          )}

          <div className="flex-1 flex flex-col items-center justify-center text-center px-0.5">
            <span className="text-[10px] sm:text-xs leading-none mb-0.5">{tile.icon}</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-[#fafafa] tracking-tight leading-tight line-clamp-1">
              {tile.name}{stateAbbrev && <span className="ml-1 text-[7px] text-[#a1a1aa]">({stateAbbrev})</span>}
            </span>
            {renderTileFooter(tile, propertyState)}
          </div>
        </div>
      )}

      {/* ═══ PLAYER TOKENS OVERLAY ═══ */}
      {playersOnTile.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center gap-1 z-30 pointer-events-none p-0.5">
          {playersOnTile.map((p) => {
            const isHopping = hoppingPlayerIds.includes(p.id);
            return (
              <div
                key={p.id}
                className={`player-token relative ${isHopping ? 'animate-token-hop' : ''} ${p.isBankrupt ? 'opacity-60 grayscale' : ''}`}
                style={{
                  backgroundColor: p.color,
                  boxShadow: p.isBankrupt ? 'none' : `0 0 8px ${p.color}`,
                }}
                title={p.isBankrupt ? `${p.name} (KANGAL)` : p.name}
              >
                {p.avatar}
                {p.isBankrupt && (
                  <span
                    className="absolute -top-2.5 -right-2 text-[10px] animate-bounce filter drop-shadow"
                    title="KANGAL"
                  >
                    🪣
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// ═══ TILE FOOTER HELPER ═══
function renderTileFooter(tile: BoardTileConfig, propertyState?: PropertyState) {
  if (tile.type === 'property' || tile.type === 'railway') {
    if (propertyState?.ownerId) {
      return (
        <div className="flex items-center justify-center gap-0.5 text-[8px] font-bold text-[#22c55e]">
          <span>✓</span>
          <span>LV.{propertyState.level}</span>
        </div>
      );
    }
    return (
      <div className="text-[8px] font-bold text-[#fafafa]">
        {formatRupee(tile.price ?? 0)}
      </div>
    );
  }

  if (tile.type === 'tax') {
    return <div className="text-[8px] font-bold text-[#ef4444]">₹1,500</div>;
  }

  return null;
}


// ═══ CORNER TILE RENDERER ═══
function renderCornerTile(tile: BoardTileConfig) {
  switch (tile.id) {
    case 0: // START (Bottom-Left)
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-br from-[#1f1f23] to-[#121215]">
          <div className="text-[10px] font-black text-[#22c55e] uppercase tracking-wider">START</div>
          <div className="text-xl my-0.5">⭐</div>
          <div className="text-[7px] font-bold text-[#a1a1aa] text-center leading-tight">
            COLLECT ₹5,000
          </div>
        </div>
      );
    case 13: // CHAI BREAK (Bottom-Right)
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-br from-[#1f1f23] to-[#121215]">
          <div className="text-[10px] font-black text-[#dc2626] uppercase tracking-wider">CHAI</div>
          <div className="text-xl my-0.5">☕</div>
          <div className="text-[7px] font-bold text-[#a1a1aa] text-center">BREAK</div>
        </div>
      );
    case 20: // FREE PARKING (Top-Right)
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-br from-[#1f1f23] to-[#121215]">
          <div className="text-[9px] font-black text-[#38bdf8] uppercase tracking-wider">REST</div>
          <div className="text-xl my-0.5">🚗</div>
          <div className="text-[7px] font-bold text-[#a1a1aa] text-center">PARKING</div>
        </div>
      );
    case 33: // JAIL / THANA (Top-Left)
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-br from-[#271515] to-[#121215]">
          <div className="text-[10px] font-black text-[#ef4444] uppercase tracking-wider">JAIL</div>
          <div className="text-xl my-0.5">⚖️</div>
          <div className="text-[7px] font-bold text-[#a1a1aa] text-center">POLICE</div>
        </div>
      );
    default:
      return null;
  }
}


// ═══ SPECIAL TILE STYLES ═══
function getSpecialTileStyle(tile: BoardTileConfig): { containerStyle: React.CSSProperties } {
  switch (tile.type) {
    case 'luck':
      return { containerStyle: { background: 'linear-gradient(135deg, #142217, #18181b)' } };
    case 'treasure':
      return { containerStyle: { background: 'linear-gradient(135deg, #1e1e24, #18181b)' } };
    case 'festival':
      return { containerStyle: { background: 'linear-gradient(135deg, #271818, #18181b)' } };
    default:
      return { containerStyle: {} };
  }
}


// ═══ 14 × 8 LANDSCAPE PERIMETER GRID MAPPING ═══
function getGridColumn(id: number): number {
  if (id >= 0 && id <= 13) return id + 1;    // Bottom row: 0→1, 13→14
  if (id >= 14 && id <= 19) return 14;      // Right col: always col 14
  if (id >= 20 && id <= 33) return 34 - id; // Top row: 20→14, 33→1
  if (id >= 34 && id <= 39) return 1;       // Left col: always col 1
  return 1;
}

function getGridRow(id: number): number {
  if (id >= 0 && id <= 13) return 8;        // Bottom row: always row 8
  if (id >= 14 && id <= 19) return 21 - id; // Right col: 14→7, 19→2
  if (id >= 20 && id <= 33) return 1;        // Top row: always row 1
  if (id >= 34 && id <= 39) return id - 32; // Left col: 34→2, 39→7
  return 1;
}
