import { randomInt } from 'crypto';
import type { DiceResult } from '@dhandha/shared';

/**
 * Server-side dice roll using Node.js crypto.randomInt.
 * NEVER called from the client — all dice results are server-generated.
 */
export function rollDice(): DiceResult {
  const die1 = randomInt(1, 7); // 1–6 inclusive
  const die2 = randomInt(1, 7);
  return {
    die1,
    die2,
    total: die1 + die2,
    isDouble: die1 === die2,
  };
}
