/**
 * NCMP-C0. Exceptional-turn primitive.
 * Architectural witness. Not the protocol. Does not change process.
 */

export type C0State = 'INACTIVE' | 'FRAME_ACTIVE';
export type Class = 'ORDINARY' | 'EXCEPTIONAL';

/** Baseline START tiny, owner A, initial SKIP. */
export const FRAME_ACTIVE_REMAINING = { header: 2, argument: 8 } as const;

export function letters(utterance: string): number[] {
  const nfc = utterance.normalize('NFC').toLowerCase();
  const out: number[] = [];
  for (const ch of nfc) {
    const code = ch.codePointAt(0);
    if (code !== undefined && code >= 97 && code <= 122) out.push(code - 96);
  }
  return out;
}

/** BODY carrier. X never consults this. */
export function c6(utterance: string): number {
  return letters(utterance).reduce((sum, value) => sum + value, 0) % 64;
}

/** Position-weighted letter sum. Same letters as C6. Not C6. */
export function p(utterance: string): number {
  const seq = letters(utterance);
  let sum = 0;
  for (let i = 0; i < seq.length; i++) sum += (i + 1) * seq[i];
  return sum % 64;
}

export function t(state: C0State): number {
  if (state === 'INACTIVE') return 0;
  return (FRAME_ACTIVE_REMAINING.header + FRAME_ACTIVE_REMAINING.argument) % 64;
}

export function x(state: C0State, utterance: string): Class {
  return p(utterance) === t(state) ? 'EXCEPTIONAL' : 'ORDINARY';
}

/** Same U. INACTIVE ordinary, FRAME_ACTIVE exceptional. */
export const U_FLIP_TO_EXCEPTIONAL = 'Let me know.';

/** Same U. INACTIVE exceptional, FRAME_ACTIVE ordinary. */
export const U_FLIP_TO_ORDINARY = 'That works for Saturday.';
