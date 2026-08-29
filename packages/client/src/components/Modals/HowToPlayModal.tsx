import React from 'react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0E1628] border-2 border-[#D9A441] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#f1f5f9]">
        {/* Header */}
        <div className="p-4 bg-[#0A101C] border-b border-[#1e3054] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">❓</span>
            <div>
              <h2 className="text-lg font-black font-display text-[#F5C75A]">HOW TO PLAY DHANDHA IN</h2>
              <p className="text-xs text-slate-400">Master Indian commerce & rule the board!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#131B2E] hover:bg-[#1e3054] text-slate-400 hover:text-white flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* Step 1 */}
          <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#1e3054] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#D9A441] text-[#080B14] font-black text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F5C75A] mb-1">🎲 Roll the Dice & Move</h3>
              <p className="text-slate-300">
                On your turn, click <strong className="text-[#F5C75A]">ROLL DICE</strong> to move around the 40-tile Indian board.
                Rolling doubles gives you an extra turn! (Warning: 3 consecutive doubles sends you straight to Jail ⚖️).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#1e3054] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#D9A441] text-[#080B14] font-black text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F5C75A] mb-1">🏢 Buy & Upgrade Landmark Businesses</h3>
              <p className="text-slate-300">
                Land on unowned properties like <strong className="text-white">Taj Mahal, Gateway of India, or Hawa Mahal</strong> and buy them using your starting cash (₹15,000).
                Upgrade owned properties to Shops, Stores, Complexes, and Megabusinesses to drastically boost your rent revenue!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#1e3054] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#D9A441] text-[#080B14] font-black text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F5C75A] mb-1">💰 Collect Rent & Pass START</h3>
              <p className="text-slate-300">
                When opponents land on your properties, they pay you rent.
                Every time you complete a circuit around the board and pass <strong className="text-[#F5C75A]">DHANDHA START</strong>, you collect <strong className="text-[#10b981]">₹5,000</strong> salary!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#1e3054] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#D9A441] text-[#080B14] font-black text-sm flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F5C75A] mb-1">👑 Win by Bankruptcy or Highest Net Worth</h3>
              <p className="text-slate-300">
                Force opponents into bankruptcy through high rents and taxes. The last player standing (or player with highest net worth when timer ends) wins the title of <strong className="text-[#F5C75A]">DHANDHA SAMRAT!</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0A101C] border-t border-[#1e3054] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D9A441] to-[#F5C75A] text-[#080B14] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Got It! Khelo
          </button>
        </div>
      </div>
    </div>
  );
};
