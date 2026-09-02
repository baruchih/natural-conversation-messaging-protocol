/**
 * NCMP-V3-K4. Rolling K2 windows. Conversation is the clock.
 * Each new turn closes one frame and seeds the next.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { legalD1Candidates } from '../v1-v2/p7d1.ts';
import { A1, A2_SEED, B_SEED, requiredA2, singletonN } from './k3.ts';
import { windowN } from './k2.ts';

export { A1, windowN };

/** Agreed after handshake. Offset is width − 1. Not payload. Not L. */
export const WINDOW_PROFILE = {
  width: 3,
  stride: 1,
  relation: 'K2',
  speakerPattern: 'alternating',
} as const;

export const FRAME_DELAY = WINDOW_PROFILE.width - 1;

export const A_SEED = A2_SEED;
export const B_TURN_SEED = B_SEED;

/** Independent targets for F1…F4. */
export const TARGETS = [42, 17, 63, 5] as const;

export const B1 =
  'Confirm the kitchen was decent although service was delayed around sunset after we sat.';

export function needCloser(oldest: string, middle: string, target: number): number {
  return requiredA2(singletonN(oldest), singletonN(middle), target);
}

const indexes = new Map<string, Map<number, string>>();

function firstFor(seed: string, residue: number): string | null {
  let idx = indexes.get(seed);
  if (!idx) {
    idx = new Map();
    for (const c of legalD1Candidates(seed)) {
      if (!wellFormed(c.utterance)) continue;
      if (!idx.has(c.residue)) idx.set(c.residue, c.utterance);
    }
    indexes.set(seed, idx);
  }
  return idx.get(residue) ?? null;
}

export function encodeTurn(oldest: string, middle: string, target: number, seed: string): string {
  const need = needCloser(oldest, middle, target);
  const u = firstFor(seed, need);
  if (!u) throw new Error(`no realization for residue ${need}`);
  return u;
}

export function decodeFrames(turns: readonly string[]): number[] {
  const out: number[] = [];
  for (let i = FRAME_DELAY; i < turns.length; i++) {
    out.push(windowN(turns[i - 2], turns[i - 1], turns[i]));
  }
  return out;
}

export interface Stream {
  turns: string[];
  frames: number[];
}

/** Prime A1, B1. Then each target is closed by A, B, A, B. */
export function run(targets: readonly number[] = TARGETS): Stream {
  const turns = [A1, B1];
  for (let i = 0; i < targets.length; i++) {
    const seed = i % 2 === 0 ? A_SEED : B_TURN_SEED;
    const u = encodeTurn(turns[turns.length - 2], turns[turns.length - 1], targets[i], seed);
    turns.push(u);
  }
  return { turns, frames: decodeFrames(turns) };
}

export class Peer {
  turns: string[];

  constructor(start: readonly string[] = [A1, B1]) {
    this.turns = [...start];
  }

  decodeIncoming(u: string): number | null {
    this.turns.push(u);
    if (this.turns.length < WINDOW_PROFILE.width) return null;
    const n = this.turns.length;
    return windowN(this.turns[n - 3], this.turns[n - 2], this.turns[n - 1]);
  }

  close(target: number, seed: string): { utterance: string; frame: number } {
    const oldest = this.turns[this.turns.length - 2];
    const middle = this.turns[this.turns.length - 1];
    const utterance = encodeTurn(oldest, middle, target, seed);
    const frame = windowN(oldest, middle, utterance);
    this.turns.push(utterance);
    return { utterance, frame };
  }
}
