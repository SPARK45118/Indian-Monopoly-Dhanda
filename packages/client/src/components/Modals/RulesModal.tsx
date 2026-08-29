import React from 'react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0E1628] border-2 border-[#D9A441] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#f1f5f9]">
        {/* Header */}
        <div className="p-4 bg-[#0A101C] border-b border-[#1e3054] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg font-black font-display text-[#F5C75A]">OFFICIAL GAME RULES</h2>
              <p className="text-xs text-slate-400">Financial limits, jail rules, and group bonuses</p>
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
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* Section: Starting & Movement */}
          <div className="bg-[#131B2E] p-3 rounded-xl border border-[#1e3054]">
            <h3 className="font-bold text-[#F5C75A] text-xs uppercase mb-1 flex items-center gap-1.5">
              💵 Starting Capital & Movement
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Each player starts with <strong className="text-white">₹15,000</strong> in cash.</li>
              <li>Pass or land on <strong className="text-[#F5C75A]">DHANDHA START</strong> to collect <strong className="text-[#10b981]">₹5,000</strong>.</li>
              <li>Roll doubles = roll again! Rolling doubles 3 times in a single turn sends you to Jail ⚖️.</li>
            </ul>
          </div>

          {/* Section: Property & Upgrades */}
          <div className="bg-[#131B2E] p-3 rounded-xl border border-[#1e3054]">
            <h3 className="font-bold text-[#F5C75A] text-xs uppercase mb-1 flex items-center gap-1.5">
              🏘️ Property & Color Group Monopoly
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Properties are organized into 8 color groups (Red, Orange, Cyan, Green, Blue, Purple, Pink, Gold).</li>
              <li>Owning all properties in a color group grants a <strong className="text-[#10b981]">20% to 30% rent multiplier bonus</strong>!</li>
              <li>Properties can be upgraded up to Level 4 (Mega Business) to increase rent up to 20×.</li>
            </ul>
          </div>

          {/* Section: Jail Rules */}
          <div className="bg-[#131B2E] p-3 rounded-xl border border-[#1e3054]">
            <h3 className="font-bold text-[#F5C75A] text-xs uppercase mb-1 flex items-center gap-1.5">
              ⚖️ Jail / Legal Trouble Rules
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Landing on Jail cell directly is just visiting (no penalty).</li>
              <li>Sent to Jail via 3 doubles or event: locked for 3 turns.</li>
              <li>Escape options: Pay <strong className="text-[#f43f5e]">₹1,500 bail</strong> or roll doubles on your turn.</li>
            </ul>
          </div>

          {/* Section: Taxes & Special Cells */}
          <div className="bg-[#131B2E] p-3 rounded-xl border border-[#1e3054]">
            <h3 className="font-bold text-[#F5C75A] text-xs uppercase mb-1 flex items-center gap-1.5">
              👑 Taxes, Events & Victory
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong className="text-white">DAULAT TAX</strong> requires paying ₹1,500 to the central treasury.</li>
              <li><strong className="text-[#F5C75A]">KHAZANA & DESI EVENTS</strong> trigger random gains, losses, or market shifts.</li>
              <li>A player whose cash drops below ₹0 becomes <strong className="text-[#f43f5e]">BANKRUPT</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0A101C] border-t border-[#1e3054] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D9A441] to-[#F5C75A] text-[#080B14] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Close Rules
          </button>
        </div>
      </div>
    </div>
  );
};
