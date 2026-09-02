/**
 * NCMP-V4-Geom. Offline geometry, not a chosen code.
 * Neutral budget 4/4/4. Contiguous vs one declared interleave.
 * Do not fit residues. Do not change the budget after seeing scores.
 */
import { ALPHABET, decode as decodeContiguous, scoreBudget, type Budget } from './code.ts';

/** Unremarkable. Not chosen because it scored well. */
export const NEUTRAL: Budget = { k1: 4, k2: 4, k3: 4 };

/**
 * Declared symbol order. Width 1, then 2, then 3, binary order.
 * 14 symbols × 4 copies = 56. Eight reserved.
 */
export const SYMBOLS = [
  '0',
  '1',
  '00',
  '01',
  '10',
  '11',
  '000',
  '001',
  '010',
  '011',
  '100',
  '101',
  '110',
  '111',
] as const;

export const COPIES = 4;
export const STRIDE = ALPHABET / COPIES;

/** copy_j(s) = (s + j × 16) mod 64. Collision-free: s ∈ 0..13, reserved s ∈ 14..15. */
export function copyOf(symbolIndex: number, j: number): number {
  if (symbolIndex < 0 || symbolIndex >= SYMBOLS.length) throw new Error('symbol');
  if (j < 0 || j >= COPIES) throw new Error('copy');
  return (symbolIndex + j * STRIDE) % ALPHABET;
}

export function decodeInterleaved(v: number): string | null {
  if (!Number.isInteger(v) || v < 0 || v >= ALPHABET) return null;
  const s = v % STRIDE;
  if (s >= SYMBOLS.length) return null;
  return SYMBOLS[s];
}

export function interleavedCopies(bits: string): number[] {
  const s = SYMBOLS.indexOf(bits as (typeof SYMBOLS)[number]);
  if (s < 0) return [];
  return [0, 1, 2, 3].map((j) => copyOf(s, j));
}

export function reservedStates(): number[] {
  const out: number[] = [];
  for (let j = 0; j < COPIES; j++) {
    for (let s = SYMBOLS.length; s < STRIDE; s++) out.push(s + j * STRIDE);
  }
  return out;
}

export function assignmentOk(): boolean {
  const seen = new Set<number>();
  for (let s = 0; s < SYMBOLS.length; s++) {
    for (let j = 0; j < COPIES; j++) {
      const v = copyOf(s, j);
      if (seen.has(v)) return false;
      seen.add(v);
      if (decodeInterleaved(v) !== SYMBOLS[s]) return false;
    }
  }
  return seen.size === SYMBOLS.length * COPIES && reservedStates().every((v) => decodeInterleaved(v) === null);
}

export function scoreInterleaved(sets: readonly (readonly number[])[]) {
  const words = [...SYMBOLS];
  const n = words.length;
  let fullSets = 0;
  let sum = 0;
  let min = n;
  const widthFull = { 1: 0, 2: 0, 3: 0 };
  for (const values of sets) {
    const seen = new Set<string>();
    for (const v of values) {
      const bits = decodeInterleaved(v);
      if (bits !== null) seen.add(bits);
    }
    const c = words.filter((w) => seen.has(w)).length;
    sum += c;
    if (c < min) min = c;
    if (c === n) fullSets += 1;
    if (words.filter((w) => w.length === 1).every((w) => seen.has(w))) widthFull[1] += 1;
    if (words.filter((w) => w.length === 2).every((w) => seen.has(w))) widthFull[2] += 1;
    if (words.filter((w) => w.length === 3).every((w) => seen.has(w))) widthFull[3] += 1;
  }
  return {
    fullSets,
    sets: sets.length,
    meanCovered: sets.length === 0 ? 0 : sum / sets.length,
    minCovered: sets.length === 0 ? 0 : min,
    widthFull,
  };
}

export function scoreContiguousNeutral(sets: readonly (readonly number[])[]) {
  return scoreBudget(NEUTRAL, sets);
}

export { decodeContiguous };
