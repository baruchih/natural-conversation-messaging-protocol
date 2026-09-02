/**
 * NCMP-V3-K3. A closes the K2 window to a target after uncontrolled B.
 * C6-HY / D1 generate A₂. No camouflage. No D/E on the window.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { d1ForResidue, legalD1Candidates } from '../v1-v2/p7d1.ts';
import { TARGET, U1, mod64, singletonN } from './k1.ts';
import { windowN } from './k2.ts';

export { TARGET, U1, singletonN, windowN };

export const A1 = U1;
export const A2_SEED = 'Did we find the restaurant was good but service was slow last night?';
export const B_SEED = 'Confirm the restaurant was good but service was slow around sunset.';

export function requiredA2(nA1: number, nB1: number, target = TARGET): number {
  return mod64(target + nA1 - nB1);
}

export interface Close {
  b1: string;
  nB1: number;
  need: number;
  a2: string | null;
  nA2: number | null;
  window: number | null;
  hit: boolean;
}

let a2Index: Map<number, string> | null = null;

function firstA2(need: number): string | null {
  if (!a2Index) {
    a2Index = new Map();
    for (const c of legalD1Candidates(A2_SEED)) {
      if (!wellFormed(c.utterance)) continue;
      if (!a2Index.has(c.residue)) a2Index.set(c.residue, c.utterance);
    }
  }
  return a2Index.get(need) ?? null;
}

export function a2Residues(): number {
  firstA2(0);
  return a2Index!.size;
}

export function close(b1: string, a1 = A1, target = TARGET): Close {
  const nA1 = singletonN(a1);
  const nB1 = singletonN(b1);
  const need = requiredA2(nA1, nB1, target);
  const a2 = firstA2(need);
  if (!a2) {
    return { b1, nB1, need, a2: null, nA2: null, window: null, hit: false };
  }
  const nA2 = singletonN(a2);
  const w = windowN(a1, b1, a2);
  return { b1, nB1, need, a2, nA2, window: w, hit: w === target };
}

export function replies(): string[] {
  return [...new Set(legalD1Candidates(B_SEED).map((c) => c.utterance).filter(wellFormed))];
}

export function sweep(target = TARGET): {
  replies: number;
  residues: number;
  hits: number;
  missNeed: number[];
  a2Cover: number;
} {
  const seenB = new Set<number>();
  let hits = 0;
  const missNeed = new Set<number>();
  const all = replies();
  for (const b1 of all) {
    const r = close(b1, A1, target);
    seenB.add(r.nB1);
    if (r.hit) hits += 1;
    else missNeed.add(r.need);
  }
  return {
    replies: all.length,
    residues: seenB.size,
    hits,
    missNeed: [...missNeed].sort((a, b) => a - b),
    a2Cover: a2Residues(),
  };
}

export function closeOne(b1: string): Close {
  return close(b1);
}

/** Sanity: D1 family contains the required residue. */
export function canEncode(need: number): boolean {
  return d1ForResidue(A2_SEED, need).some((c) => wellFormed(c.utterance));
}
