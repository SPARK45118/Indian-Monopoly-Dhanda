import React from 'react';
import { GAME_CONFIG } from '@dhandha/shared';
import type { CharacterId } from '@dhandha/shared';
import { CharacterIcon } from '../../utils/characterIcons';

interface CharacterSelectProps {
  selectedCharacter: CharacterId | null;
  onSelect: (character: CharacterId) => void;
  disabledCharacters?: CharacterId[];
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedCharacter,
  onSelect,
  disabledCharacters = [],
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {GAME_CONFIG.CHARACTERS.map((char) => {
        const isSelected = selectedCharacter === char.id;
        const isDisabled = disabledCharacters.includes(char.id) && !isSelected;

        return (
          <button
            key={char.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(char.id)}
            className={`group relative flex flex-col p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden ${
              isSelected
                ? 'border-[#dc2626] bg-[#18181b] shadow-lg shadow-[#dc2626]/25 scale-[1.02] ring-2 ring-[#dc2626]/50'
                : isDisabled
                ? 'border-[#27272a]/50 opacity-40 cursor-not-allowed bg-[#09090b]'
                : 'border-[#27272a] bg-[#18181b]/80 hover:border-[#dc2626]/60 hover:bg-[#18181b] hover:scale-[1.01]'
            }`}
          >
            {/* Top Row: Character Logo & Title */}
            <div className="flex items-center gap-3.5 w-full">
              <div className="shrink-0 transition-transform group-hover:scale-105">
                <CharacterIcon id={char.id} className="w-14 h-14" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-[#fafafa] font-display truncate">
                    {char.name}
                  </h4>
                </div>
                <span className="inline-block text-[11px] font-bold text-[#dc2626] tracking-wide mt-0.5">
                  {char.hindiName}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#a1a1aa] mt-3 line-clamp-2 leading-relaxed">
              {char.description}
            </p>
            
            {/* Ability Badge */}
            <div className="mt-3.5 w-full pt-2.5 border-t border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                <span className="text-[11px] font-bold text-[#fafafa]">
                  {char.abilityName}
                </span>
              </div>
              <span className="text-[10px] text-[#a1a1aa] font-medium max-w-[150px] truncate text-right">
                {char.abilityDescription}
              </span>
            </div>

            {/* Selected Status Badge */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-[#dc2626] rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md shadow-[#dc2626]/40">
                ✓
              </div>
            )}

            {/* Disabled / Taken Status Badge */}
            {isDisabled && (
              <div className="absolute top-3 right-3 text-[10px] uppercase font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Taken
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
