import { useEffect, useRef, useCallback } from 'react';
import type { GameState } from '@dhandha/shared';

// ─── Desi Sound Lines (Pure Hindi) ────────────────────────────

const KANGAL_LINES = [
  'भाई कंगाल हो गया! दिवाला निकल गया!',
  'अरे! इसका धंधा चौपट हो गया!',
  'वाह भाई वाह, क्या व्यापार किया! शून्य पर आ गए!',
  'यार, अब तो भीख माँगो!',
  'खत्म! भाई एकदम बर्बाद हो गया!',
  'हाय हाय! सब डूब गया!',
];

const TAX_LINES = [
  'तेरा तो कट गया भाई!',
  'आयकर वाले आ गए, पैसे दो!',
  'सरकार ने मार लिया!',
  'अरे यार! जीएसटी ने मार दिया!',
  'ओये होये! टैक्स भरो जल्दी!',
  'भाई पैसे निकालो, सरकार को चाहिए!',
  'खज़ाना खाली हो गया!',
];

const DICE_LINES = [
  'किस्मत आजमाओ भाई!',
  'एकदम मस्त पासा फेंका!',
  'देखो क्या आता है!',
];

const BUY_PROPERTY_LINES = [
  'वाह! क्या शानदार खरीद!',
  'धंधा बढ़ रहा है!',
  'माल खरीदा, अब किराया आएगा!',
  'एक और संपत्ति! व्यापार जमने लगा!',
  'शाबाश! साम्राज्य बड़ा हो रहा है!',
];

const RENT_LINES = [
  'किराया दो भाई! मेरी संपत्ति है!',
  'अरे! उसके घर में घुसे हो, किराया देना पड़ेगा!',
  'पैसे निकालो! मेरा क्षेत्र है यह!',
  'किराया! किराया! किराया!',
];

const REWARD_LINES = [
  'पैसा आ गया! मस्त!',
  'दिवाली आ गई!',
  'वाह! किस्मत ने साथ दिया!',
  'एकदम भाग्यशाली पासा!',
  'खजाना मिल गया भाई!',
];

const JAIL_LINES = [
  'पुलिस थाना! पकड़े गए भाई!',
  'हवालात में बंद! कांड कर दिया!',
  'ओये! कानून के हाथ लंबे होते हैं!',
  'जेल जाओ! सीधे जेल जाओ!',
];

const WINNER_LINES = [
  'व्यापार सम्राट बन गया भाई! सब तेरी नाक के नीचे खा गए!',
  'विजेता विजेता, समोसा डिनर! तू जीत गया!',
  'भारत का सबसे बड़ा व्यापारी बन गया!',
  'शाबाश! तूने सबको हरा दिया!',
];

// ─── Helper ────────────────────────────────────────────────────

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Speech queue — ensures only one voice plays at a time
const speechQueue: Array<{ text: string; rate: number; pitch: number }> = [];
let isPlaying = false;

function getMaleHindiVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Priority 1: Hindi male voice
  const hindiMale = voices.find(
    (v) => v.lang.startsWith('hi') && /male/i.test(v.name)
  );
  if (hindiMale) return hindiMale;
  // Priority 2: Any Hindi voice
  const hindi = voices.find((v) => v.lang.startsWith('hi'));
  if (hindi) return hindi;
  // Priority 3: English male voice
  const engMale = voices.find(
    (v) => v.lang.startsWith('en') && /male/i.test(v.name)
  );
  if (engMale) return engMale;
  // Priority 4: Google male voices (Chrome naming pattern)
  const googleMale = voices.find(
    (v) => /google/i.test(v.name) && !/female/i.test(v.name)
  );
  return googleMale ?? null;
}

function playNext() {
  if (isPlaying || speechQueue.length === 0) return;
  const item = speechQueue.shift()!;
  isPlaying = true;

  const utterance = new SpeechSynthesisUtterance(item.text);
  utterance.lang = 'hi-IN';
  utterance.rate = item.rate;
  utterance.pitch = item.pitch;
  utterance.volume = 1;

  const voice = getMaleHindiVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    isPlaying = false;
    playNext();
  };
  utterance.onerror = () => {
    isPlaying = false;
    playNext();
  };

  window.speechSynthesis.speak(utterance);
}

function speak(text: string, rate = 0.9, pitch = 0.85) {
  if (!window.speechSynthesis) return;
  // Clear the queue — only queue the most recent sound per event burst
  speechQueue.length = 0;
  // If already speaking, cancel and play this immediately
  if (isPlaying) {
    window.speechSynthesis.cancel();
    isPlaying = false;
  }
  speechQueue.push({ text, rate, pitch });
  playNext();
}

// ─── Hook ──────────────────────────────────────────────────────

export function useDesiSounds(
  gameState: GameState | null | undefined,
  localPlayerId: string | null | undefined
) {
  const prevEventsRef = useRef<string[]>([]);
  const prevBankruptIdsRef = useRef<Set<string>>(new Set());
  const prevPhaseRef = useRef<string>('');
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueSpeak = useCallback((text: string, rate?: number, pitch?: number) => {
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => speak(text, rate, pitch), 250);
  }, []);

  const playKangal  = useCallback(() => queueSpeak(randomPick(KANGAL_LINES), 0.85, 0.8), [queueSpeak]);
  const playTax     = useCallback(() => queueSpeak(randomPick(TAX_LINES), 0.9, 0.85), [queueSpeak]);
  const playBuy     = useCallback(() => queueSpeak(randomPick(BUY_PROPERTY_LINES), 1.0, 0.9), [queueSpeak]);
  const playRent    = useCallback(() => queueSpeak(randomPick(RENT_LINES), 0.9, 0.85), [queueSpeak]);
  const playReward  = useCallback(() => queueSpeak(randomPick(REWARD_LINES), 1.0, 0.9), [queueSpeak]);
  const playJail    = useCallback(() => queueSpeak(randomPick(JAIL_LINES), 0.85, 0.8), [queueSpeak]);
  const playWinner  = useCallback(() => queueSpeak(randomPick(WINNER_LINES), 0.9, 0.8), [queueSpeak]);

  useEffect(() => {
    if (!gameState || !localPlayerId) return;

    // ── 1. Kangal: only play for the LOCAL player going bankrupt ──
    gameState.players.forEach((p) => {
      if (p.isBankrupt && !prevBankruptIdsRef.current.has(p.id)) {
        prevBankruptIdsRef.current.add(p.id);
        if (p.id === localPlayerId) {
          setTimeout(() => playKangal(), 500);
        }
      }
    });

    // ── 2. Winner: play only for the local player who won ────────
    if (gameState.phase === 'finished' && prevPhaseRef.current !== 'finished') {
      if (gameState.winner === localPlayerId) {
        setTimeout(() => playWinner(), 900);
      }
    }
    prevPhaseRef.current = gameState.phase;

    // ── 3. Game events: only play for LOCAL player's events ──────
    const currentEventIds = gameState.events.map((e) => e.id);
    const newEvents = gameState.events.filter(
      (e) => !prevEventsRef.current.includes(e.id)
    );
    prevEventsRef.current = currentEventIds;

    if (newEvents.length === 0) return;

    // Filter to events that belong to the local player only
    // (events with no playerId are global — skip them for audio)
    const myEvents = newEvents.filter((e) => e.playerId === localPlayerId);
    if (myEvents.length === 0) return;

    // Priority order: tax > legal > buy > rent > reward > market
    const priority = ['tax', 'legal-trouble', 'buy', 'revenue', 'luck', 'festival', 'market-event'];
    const sorted = [...myEvents].sort(
      (a, b) => priority.indexOf(a.type) - priority.indexOf(b.type)
    );
    const top = sorted[0];
    if (!top) return;

    if (top.type === 'tax') {
      playTax();
    } else if (top.type === 'buy') {
      playBuy();
    } else if (top.type === 'revenue') {
      playRent();
    } else if (top.type === 'luck' || top.type === 'festival') {
      playReward();
    } else if (top.type === 'legal-trouble') {
      playJail();
    } else if (top.type === 'market-event') {
      queueSpeak('भाई! बाज़ार में तूफान आ गया!', 0.9, 0.85);
    }
  }, [gameState, localPlayerId, playKangal, playTax, playBuy, playRent, playReward, playJail, playWinner, queueSpeak]);
}
