import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';

export const HomePage: React.FC = () => {
  useSocket();
  const navigate = useNavigate();
  const { localPlayer, createRoom, joinRoom } = useGame();
  const setLocalPlayer = useGameStore((s) => s.setLocalPlayer);

  // Generate default name if empty
  const defaultName = localPlayer?.name || `Tycoon_${Math.floor(1000 + Math.random() * 9000)}`;
  const [name, setName] = useState(defaultName);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (localPlayer) {
      setLocalPlayer({ ...localPlayer, name: val });
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom(name.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !joinCode.trim()) return;
    joinRoom(joinCode.trim().toUpperCase(), name.trim());
  };

  // Redirect to lobby if room is active
  const room = useGameStore((s) => s.room);
  React.useEffect(() => {
    if (room) {
      navigate(`/lobby/${room.code}`);
    }
  }, [room, navigate]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-body">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none filter grayscale contrast-200"
        style={{ backgroundImage: `url('/landing_bg.png?v=2')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b] pointer-events-none" />

      {/* TOP HEADER - NAME ONLY, NO LOGO */}
      <header className="relative z-20 flex items-center justify-between w-full max-w-7xl mx-auto py-3 px-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl md:text-3xl font-black font-display tracking-tight text-[#fafafa]">
            VYAPAR
          </span>
          <span className="text-[11px] font-black tracking-widest text-[#ef4444] px-2 py-0.5 rounded-md bg-[#18181b] border border-[#dc2626]/50 uppercase">
            INDIA
          </span>
        </div>

        {/* Server Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs font-medium text-[#a1a1aa]">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="text-[#fafafa]">Server Online</span>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <main className="relative z-20 w-full max-w-7xl mx-auto flex-1 flex items-center justify-center my-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT HERO TEXT */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-[#dc2626] text-xs font-semibold tracking-wider uppercase">
              <span>🪔</span>
              <span className="text-[#fafafa]">Khelo • Kamao • Kharido • Vyapar Jamao</span>
            </div>

            {/* Crisp Scalable Vector Logo Banner */}
            <div className="w-full max-w-lg">
              <img 
                src="/vyapar_logo.svg" 
                alt="Vyapar India — Board Game of Trade & Strategy" 
                className="w-full h-auto object-contain max-h-[180px] filter drop-shadow-[0_8px_20px_rgba(220,38,38,0.25)]"
              />
            </div>

            <p className="text-sm sm:text-base text-[#a1a1aa] max-w-xl leading-relaxed font-normal">
              Roll the dice, acquire prime Indian landmarks, negotiate high-stakes trades, and outsmart your opponents to build the ultimate business empire.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg pt-4">
              <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a] text-left">
                <div className="text-xs font-bold text-[#dc2626] uppercase tracking-wider mb-1">4 Players</div>
                <div className="text-xs text-[#a1a1aa]">Turn-based strategy</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a] text-left">
                <div className="text-xs font-bold text-[#e11d48] uppercase tracking-wider mb-1">Live Sync</div>
                <div className="text-xs text-[#a1a1aa]">Socket.IO real-time</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a] text-left">
                <div className="text-xs font-bold text-[#22c55e] uppercase tracking-wider mb-1">Fair Engine</div>
                <div className="text-xs text-[#a1a1aa]">Server-validated</div>
              </div>
            </div>
          </div>

          {/* RIGHT PLAY CARD */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="relative p-7 sm:p-8 rounded-3xl bg-[#18181b] border border-[#27272a] shadow-2xl space-y-6">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
                <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-wider">Start Playing</h3>
                <span className="text-xs text-[#dc2626] font-semibold px-2.5 py-1 rounded-full bg-[#09090b] border border-[#27272a]">
                  Multiplayer Lobby
                </span>
              </div>

              {/* Player Name Input */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                  Your Player Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] placeholder-[#a1a1aa] focus:outline-none focus:border-[#dc2626] font-medium text-sm transition-all"
                    maxLength={18}
                  />
                </div>
              </div>

              {/* Action Choices */}
              {!isJoining ? (
                <div className="space-y-4 pt-2">
                  <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="w-full py-4 px-6 rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] text-[#fafafa] font-black text-sm tracking-wider uppercase transition-all flex items-center justify-between disabled:opacity-50 shadow-lg shadow-[#dc2626]/20"
                  >
                    <span>Create New Game Room</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="w-full border-t border-[#27272a]" />
                    <span className="absolute px-3 py-0.5 rounded-full bg-[#18181b] text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest">
                      OR
                    </span>
                  </div>

                  <button
                    onClick={() => setIsJoining(true)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] text-[#fafafa] font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-between"
                  >
                    <span>Join Existing Room</span>
                    <svg className="w-5 h-5 text-[#a1a1aa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="space-y-4 pt-2">
                  <div className="text-left space-y-2">
                    <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE (E.G. ABC123)"
                      className="w-full py-3.5 text-center uppercase tracking-widest text-lg font-mono font-bold rounded-xl bg-[#09090b] border border-[#dc2626] text-[#dc2626] focus:outline-none"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!name.trim() || joinCode.length < 6}
                      className="flex-1 py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#fafafa] font-extrabold text-xs tracking-wider uppercase transition-all disabled:opacity-40"
                    >
                      Join Game
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsJoining(false)}
                      className="px-4 py-3.5 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-bold text-xs transition-all border border-[#3f3f46]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Card Footer */}
              <div className="pt-4 border-t border-[#27272a] flex items-center justify-between text-xs text-[#a1a1aa]">
                <span>Room Capacity: 2-4 Players</span>
                <span className="text-[#22c55e] font-medium">Free to Play</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto py-3 px-4 text-center text-xs text-[#a1a1aa] border-t border-[#27272a]">
        VYAPAR Board Game • Built with React & Socket.io
      </footer>
    </div>
  );
};
