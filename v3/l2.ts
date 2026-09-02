/**
 * NCMP-V3-L2. Language held fixed. Did L1's evolution buy capacity?
 * C is distinguishable δ_N states, not |F|.
 */
import { decode as decodeN, letterSum, MODULUS, wellFormed } from '../v1-v2/p7c6.ts';
import { legalD1Candidates } from '../v1-v2/p7d1.ts';
import { decodeE, L0, language, type Language } from './l1.ts';

export const L2_P = 'The restaurant was good, but service was slow.';

export const SEED_L0 = 'Did we find the restaurant was good but service was slow for that party?';
export const SEED_L1_NEW = 'Did we find the restaurant was good but service was slow for that holder?';

/** L1 from the frozen L1 result. Not re-evolved here. */
export const L1 = language(['that party', 'that holder']);

export interface FamilyStats {
  size: number;
  residues: number;
  uniqueSums: number;
  ge5: number;
}

export function realizations(seed: string, lang: Language): string[] {
  const out: string[] = [];
  for (const c of legalD1Candidates(seed)) {
    if (!wellFormed(c.utterance)) continue;
    if (decodeE(c.utterance, lang) !== 'CUSTOMER') continue;
    out.push(c.utterance);
  }
  return out;
}

export function measure(utterances: readonly string[]): FamilyStats {
  const unique = [...new Set(utterances)];
  const counts = Array.from({ length: MODULUS }, () => 0);
  const sums = new Set<number>();
  for (const u of unique) {
    counts[decodeN(u)] += 1;
    sums.add(letterSum(u));
  }
  return {
    size: unique.length,
    residues: counts.filter((n) => n > 0).length,
    uniqueSums: sums.size,
    ge5: counts.filter((n) => n >= 5).length,
  };
}

export function compareCapacity(): {
  L0: FamilyStats;
  L1: FamilyStats;
  fGrew: boolean;
  cGrew: boolean;
  sumsGrew: boolean;
} {
  const f0 = realizations(SEED_L0, L0);
  const f1 = [...new Set([...f0, ...realizations(SEED_L1_NEW, L1)])];
  const s0 = measure(f0);
  const s1 = measure(f1);
  return {
    L0: s0,
    L1: s1,
    fGrew: s1.size > s0.size,
    cGrew: s1.residues > s0.residues,
    sumsGrew: s1.uniqueSums > s0.uniqueSums,
  };
}
