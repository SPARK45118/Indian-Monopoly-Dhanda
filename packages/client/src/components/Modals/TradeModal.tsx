import React, { useState } from 'react';
import type { GameState, Player, PropertyState } from '@dhandha/shared';
import { GAME_CONFIG, getTileById } from '@dhandha/shared';
import { formatRupee } from '../../utils/format';

interface TradeModalProps {
  gameState: GameState;
  localPlayer: Player;
  onOfferTrade: (
    toPlayerId: string,
    offeringMoney: number,
    offeringPropertyIds: number[],
    requestingMoney: number,
    requestingPropertyIds: number[]
  ) => void;
  onAcceptTrade: (tradeId: string) => void;
  onRejectTrade: (tradeId: string) => void;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  gameState,
  localPlayer,
  onOfferTrade,
  onAcceptTrade,
  onRejectTrade,
  onClose,
}) => {
  const safeGetTile = (id: number) => {
    try {
      return getTileById(id);
    } catch {
      return null;
    }
  };

  const playersList = gameState?.players || [];
  const propertiesList = gameState?.properties || [];
  const otherPlayers = playersList.filter((p) => p.id !== localPlayer?.id && !p.isBankrupt);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  const activeTargetId = selectedTargetId || (otherPlayers[0]?.id ?? '');

  const [offeringMoney, setOfferingMoney] = useState<number>(0);
  const [offeringPropIds, setOfferingPropIds] = useState<number[]>([]);

  const [requestingMoney, setRequestingMoney] = useState<number>(0);
  const [requestingPropIds, setRequestingPropIds] = useState<number[]>([]);

  const myMoney = localPlayer?.money ?? 15000;

  // My properties
  const myProperties = propertiesList
    .filter((p) => p.ownerId === localPlayer?.id)
    .map((p) => safeGetTile(p.tileId))
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Target player properties
  const targetPlayer = playersList.find((p) => p.id === activeTargetId);
  const targetProperties = propertiesList
    .filter((p) => p.ownerId === activeTargetId)
    .map((p) => safeGetTile(p.tileId))
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Incoming trade offers for local player
  const incomingOffers = (gameState?.tradeOffers || []).filter(
    (t) => t.toPlayerId === localPlayer?.id && t.status === 'pending'
  );

  const toggleOfferingProp = (tileId: number) => {
    setOfferingPropIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const toggleRequestingProp = (tileId: number) => {
    setRequestingPropIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const handlePropose = () => {
    const targetId = activeTargetId;
    if (!targetId) return;
    onOfferTrade(
      targetId,
      offeringMoney,
      offeringPropIds,
      requestingMoney,
      requestingPropIds
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0E1628] border-2 border-[#D9A441] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#f1f5f9]">
        {/* Header */}
        <div className="p-4 bg-[#0A101C] border-b border-[#1e3054] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-lg font-black font-display text-[#F5C75A]">TRADING SYSTEM</h2>
              <p className="text-xs text-slate-400">Exchange cities, landmark properties & cash with other players</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#131B2E] hover:bg-[#1e3054] text-slate-400 hover:text-white flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Pending Incoming Trade Offers */}
          {incomingOffers.length > 0 && (
            <div className="p-3 bg-[#131B2E] border border-[#D9A441] rounded-xl space-y-2">
              <h3 className="font-bold text-[#F5C75A] text-xs uppercase flex items-center gap-1.5">
                📬 INCOMING TRADE DEALS ({incomingOffers.length})
              </h3>
              {incomingOffers.map((offer) => {
                const sender = playersList.find((p) => p.id === offer.fromPlayerId);
                const offeredProps = (offer.offering?.propertyIds || [])
                  .map((id) => safeGetTile(id))
                  .filter((t): t is NonNullable<typeof t> => t !== null);
                const requestedProps = (offer.requesting?.propertyIds || [])
                  .map((id) => safeGetTile(id))
                  .filter((t): t is NonNullable<typeof t> => t !== null);

                return (
                  <div
                    key={offer.id}
                    className="p-3 rounded-lg bg-[#0A101C] border border-[#1e3054] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-white text-xs mb-1">
                        <span style={{ color: sender?.color }}>{sender?.name}</span> offers you:
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {(offer.offering?.money || 0) > 0 && <span>Cash: <strong>{formatRupee(offer.offering.money)}</strong> </span>}
                        {offeredProps.length > 0 && (
                          <span>Cities: <strong>{offeredProps.map((p) => p.name).join(', ')}</strong></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        In exchange for your:{' '}
                        {(offer.requesting?.money || 0) > 0 && <span>Cash: <strong>{formatRupee(offer.requesting.money)}</strong> </span>}
                        {requestedProps.length > 0 && (
                          <span>Cities: <strong>{requestedProps.map((p) => p.name).join(', ')}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => onAcceptTrade(offer.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs"
                      >
                        ✓ ACCEPT
                      </button>
                      <button
                        onClick={() => onRejectTrade(offer.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 font-bold text-xs"
                      >
                        ✕ REJECT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Other Players Notice */}
          {otherPlayers.length === 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center">
              👥 Trading requires at least 2 active players in the room. Invite another player to start trading cities & cash!
            </div>
          )}

          {/* Select Target Player */}
          <div className="flex items-center gap-3 bg-[#131B2E] p-3 rounded-xl border border-[#1e3054]">
            <span className="font-bold text-slate-300">Select Trade Partner:</span>
            <div className="flex gap-2">
              {otherPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedTargetId(p.id);
                    setRequestingPropIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTargetId === p.id
                      ? 'bg-[#0E1628] border-[#D9A441] text-[#F5C75A]'
                      : 'bg-[#0A101C] border-[#1e3054] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Trade Exchange Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT: YOUR OFFER */}
            <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#1e3054] flex flex-col gap-3">
              <h3 className="font-bold text-[#F5C75A] text-xs uppercase border-b border-[#1e3054] pb-1.5 flex items-center justify-between">
                <span>🎁 YOU OFFER</span>
                <span className="text-[10px] text-slate-400">Your Cash: {formatRupee(myMoney)}</span>
              </h3>

              {/* Offer Money */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium mb-1 block">Offer Cash (₹):</label>
                <input
                  type="number"
                  min={0}
                  max={myMoney}
                  step={500}
                  value={offeringMoney}
                  onChange={(e) => setOfferingMoney(Math.min(myMoney, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="game-input text-xs py-1.5 px-2 bg-[#0A101C] border-[#1e3054]"
                />
              </div>

              {/* Offer Properties */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Offer Cities/Properties:</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {myProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => toggleOfferingProp(prop.id)}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        offeringPropIds.includes(prop.id)
                          ? 'bg-[#0E1628] border-[#D9A441] text-[#F5C75A]'
                          : 'bg-[#0A101C] border-[#1e3054] text-slate-300 hover:bg-[#131B2E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{prop.icon}</span>
                        <div>
                          <div className="font-bold text-xs">{prop.name}</div>
                          <div className="text-[9px] text-slate-400">{prop.state} • {prop.city}</div>
                        </div>
                      </div>
                      <span className="font-bold text-xs">{formatRupee(prop.price ?? 0)}</span>
                    </div>
                  ))}
                  {myProperties.length === 0 && (
                    <div className="text-slate-500 text-[11px] italic py-2">You don't own any properties yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: YOU REQUEST */}
            <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#1e3054] flex flex-col gap-3">
              <h3 className="font-bold text-[#F5C75A] text-xs uppercase border-b border-[#1e3054] pb-1.5 flex items-center justify-between">
                <span>🎯 YOU REQUEST</span>
                <span className="text-[10px] text-slate-400">{targetPlayer?.name}'s Cash: {formatRupee(targetPlayer?.money ?? 0)}</span>
              </h3>

              {/* Request Money */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium mb-1 block">Request Cash (₹):</label>
                <input
                  type="number"
                  min={0}
                  max={targetPlayer?.money ?? 0}
                  step={500}
                  value={requestingMoney}
                  onChange={(e) => setRequestingMoney(Math.min(targetPlayer?.money ?? 0, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="game-input text-xs py-1.5 px-2 bg-[#0A101C] border-[#1e3054]"
                />
              </div>

              {/* Request Properties */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Request Cities/Properties:</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {targetProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => toggleRequestingProp(prop.id)}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        requestingPropIds.includes(prop.id)
                          ? 'bg-[#0E1628] border-[#D9A441] text-[#F5C75A]'
                          : 'bg-[#0A101C] border-[#1e3054] text-slate-300 hover:bg-[#131B2E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{prop.icon}</span>
                        <div>
                          <div className="font-bold text-xs">{prop.name}</div>
                          <div className="text-[9px] text-slate-400">{prop.state} • {prop.city}</div>
                        </div>
                      </div>
                      <span className="font-bold text-xs">{formatRupee(prop.price ?? 0)}</span>
                    </div>
                  ))}
                  {targetProperties.length === 0 && (
                    <div className="text-slate-500 text-[11px] italic py-2">{targetPlayer?.name} owns no properties yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0A101C] border-t border-[#1e3054] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#131B2E] text-slate-400 hover:text-white font-bold text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handlePropose}
            disabled={!activeTargetId || (offeringMoney === 0 && offeringPropIds.length === 0 && requestingMoney === 0 && requestingPropIds.length === 0)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A441] to-[#F5C75A] text-[#080B14] font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Propose Trade Deal 🤝
          </button>
        </div>
      </div>
    </div>
  );
};
