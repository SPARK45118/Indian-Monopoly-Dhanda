import React, { useState, useEffect } from 'react';
import type { DiceResult } from '@dhandha/shared';

interface DiceRollerProps {
  dice: DiceResult | null;
  isRolling?: boolean;
}

const DOT_LAYOUTS: Record<number, string[]> = {
  1: ['d'],
  2: ['a', 'g'],
  3: ['a', 'd', 'g'],
  4: ['a', 'b', 'f', 'g'],
  5: ['a', 'b', 'd', 'f', 'g'],
  6: ['a', 'b', 'c', 'e', 'f', 'g'],
};

export const DiceRoller: React.FC<DiceRollerProps> = ({ dice, isRolling }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (dice || isRolling) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [dice, isRolling]);

  const renderDiceFace = (value: number) => {
    const dots = DOT_LAYOUTS[value] || [];
    return (
      <div className={`dice-face ${animating ? 'dice-rolling' : ''}`}>
        {dots.map((area) => (
          <div key={area} className="dice-dot" style={{ gridArea: area }} />
        ))}
      </div>
    );
  };

  if (!dice && !isRolling) {
    return (
      <div className="flex gap-3 opacity-40">
        {renderDiceFace(1)}
        {renderDiceFace(1)}
      </div>
    );
  }

  const d1 = dice?.die1 ?? 1;
  const d2 = dice?.die2 ?? 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        {renderDiceFace(d1)}
        {renderDiceFace(d2)}
      </div>
      {dice && !animating && (
        <div className="text-center font-display font-bold text-gold text-sm animate-fade-in">
          Total: <span className="text-lg text-white">{dice.total}</span>
          {dice.isDouble && <span className="ml-2 text-saffron font-extrabold animate-bounce">🔥 DOUBLE!</span>}
        </div>
      )}
    </div>
  );
};
