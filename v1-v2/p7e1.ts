/**
 * NCMP-P7-E1. E ∈ {CUSTOMER, TRANSACTION} from reference construction,
 * not the words customer / transaction.
 */
import { decode as decodeN, wellFormed } from './p7c6.ts';
import { tokenList } from './p7c6.lm.ts';
import { decodeD, legalD1Candidates, type Discourse, type D1Candidate } from './p7d1.ts';

export const E_DET = ['that', 'this', 'the'] as const;
export const E_PARTY = ['one', 'party', 'person', 'holder'] as const;
export const E_EVENT = ['move', 'act', 'step', 'action'] as const;

export type EntityClass = 'CUSTOMER' | 'TRANSACTION';
export type EntityOrNone = EntityClass | 'NONE';

function hasPair(tokens: string[], dets: readonly string[], nouns: readonly string[]): boolean {
  for (let i = 0; i < tokens.length - 1; i++) {
    if (dets.includes(tokens[i]) && nouns.includes(tokens[i + 1])) return true;
  }
  return false;
}

export function decodeE(utterance: string): EntityOrNone {
  const tokens = tokenList(utterance);
  const customer = hasPair(tokens, E_DET, E_PARTY);
  const transaction = hasPair(tokens, E_DET, E_EVENT);
  if (customer && !transaction) return 'CUSTOMER';
  if (transaction && !customer) return 'TRANSACTION';
  return 'NONE';
}

export function usesMagicEntityNoun(utterance: string): boolean {
  const tokens = new Set(tokenList(utterance));
  return tokens.has('customer') || tokens.has('transaction');
}

export interface E1Candidate extends D1Candidate {
  entity: EntityClass;
}

export function legalE1Candidates(seed: string): E1Candidate[] {
  const d0 = decodeD(seed);
  const e0 = decodeE(seed);
  if (d0 === 'NONE' || e0 === 'NONE') return [];
  const out: E1Candidate[] = [];
  for (const c of legalD1Candidates(seed)) {
    if (decodeD(c.utterance) !== d0) continue;
    if (decodeE(c.utterance) !== e0) continue;
    if (usesMagicEntityNoun(c.utterance)) continue;
    if (!wellFormed(c.utterance)) continue;
    out.push({ ...c, residue: decodeN(c.utterance), entity: e0 });
  }
  return out;
}

export function e1For(seed: string, n: number): E1Candidate[] {
  return legalE1Candidates(seed).filter((c) => c.residue === n);
}

export function e1Coverage(seed: string): {
  discourse: Discourse | 'NONE';
  entity: EntityOrNone;
  familySize: number;
  hit: number;
  ge5: number;
} {
  const family = legalE1Candidates(seed);
  const counts = Array.from({ length: 64 }, () => 0);
  for (const c of family) counts[c.residue] += 1;
  return {
    discourse: decodeD(seed),
    entity: decodeE(seed),
    familySize: family.length,
    hit: counts.filter((x) => x > 0).length,
    ge5: counts.filter((x) => x >= 5).length,
  };
}
