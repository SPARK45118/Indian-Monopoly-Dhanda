import { create } from 'zustand';
import type { GameState, Room, CharacterId } from '@dhandha/shared';

export interface LocalPlayer {
  id: string;
  name: string;
  character: CharacterId | null;
}

interface GameStoreState {
  localPlayer: LocalPlayer | null;
  room: Room | null;
  gameState: GameState | null;
  selectedTileId: number | null;
  
  // Actions
  setLocalPlayer: (player: LocalPlayer) => void;
  setRoom: (room: Room | null) => void;
  setGameState: (state: GameState | null) => void;
  setSelectedTileId: (tileId: number | null) => void;
  resetGameStore: () => void;
}

// Get or create persistent guest player ID
export function getOrCreateGuestPlayer(): LocalPlayer {
  const storedId = localStorage.getItem('dhandha_player_id');
  const storedName = localStorage.getItem('dhandha_player_name');
  
  const id = storedId || 'p_' + Math.random().toString(36).substring(2, 11);
  const name = storedName || 'Tycoon_' + Math.floor(1000 + Math.random() * 9000);
  
  if (!storedId) localStorage.setItem('dhandha_player_id', id);
  if (!storedName) localStorage.setItem('dhandha_player_name', name);
  
  return { id, name, character: null };
}

export const useGameStore = create<GameStoreState>((set) => ({
  localPlayer: getOrCreateGuestPlayer(),
  room: null,
  gameState: null,
  selectedTileId: null,

  setLocalPlayer: (localPlayer) => {
    localStorage.setItem('dhandha_player_name', localPlayer.name);
    set({ localPlayer });
  },
  setRoom: (room) => set({ room }),
  setGameState: (gameState) => set({ gameState }),
  setSelectedTileId: (selectedTileId) => set({ selectedTileId }),
  resetGameStore: () => set({ room: null, gameState: null, selectedTileId: null }),
}));
