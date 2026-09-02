/**
 * NCMP-P7-E2. Loosen E only. Published grammar of constructions,
 * not an LM classifier. S1, D1, C6, E1, X1 stay frozen.
 */
import { decode as decodeN, wellFormed } from './p7c6.ts';
import { tokenList } from './p7c6.lm.ts';
import { decodeD, legalD1Candidates, type Discourse, type D1Candidate } from './p7d1.ts';
import { E_DET, E_EVENT, E_PARTY, usesMagicEntityNoun, type EntityClass, type EntityOrNone } from './p7e1.ts';

export type Slot = readonly string[];

export interface Construction {
  id: string;
  entity: EntityClass;
  /** Contiguous token template. Each slot is a published lexicon. */
  slots: readonly Slot[];
}

export const E2_POSS = ['their', 'our'] as const;

/**
 * Structurally distinct published forms. C1/T1 are the E1 pairs.
 * The rest must include forms E1 maps to NONE.
 */
export const E2_CONSTRUCTIONS: readonly Construction[] = [
  { id: 'det_party', entity: 'CUSTOMER', slots: [E_DET, E_PARTY] },
  { id: 'person_involved', entity: 'CUSTOMER', slots: [E_DET, ['person'], ['involved']] },
  { id: 'whoever_held_it', entity: 'CUSTOMER', slots: [['whoever'], ['held'], ['it']] },
  { id: 'one_we_discussed', entity: 'CUSTOMER', slots: [E_DET, ['one'], ['we'], ['discussed']] },
  { id: 'poss_account_holder', entity: 'CUSTOMER', slots: [E2_POSS, ['account'], ['holder']] },
  { id: 'det_account_holder', entity: 'CUSTOMER', slots: [E_DET, ['account'], ['holder']] },
  { id: 'those_folks', entity: 'CUSTOMER', slots: [['those'], ['folks']] },
  { id: 'anyone_seated', entity: 'CUSTOMER', slots: [['anyone'], ['seated']] },

  { id: 'det_event', entity: 'TRANSACTION', slots: [E_DET, E_EVENT] },
  { id: 'action_taken', entity: 'TRANSACTION', slots: [E_DET, ['action'], ['taken']] },
  { id: 'whatever_went_through', entity: 'TRANSACTION', slots: [['whatever'], ['went'], ['through']] },
  { id: 'step_we_took', entity: 'TRANSACTION', slots: [E_DET, ['step'], ['we'], ['took']] },
  { id: 'poss_latest_charge', entity: 'TRANSACTION', slots: [E2_POSS, ['latest'], ['charge']] },
  { id: 'those_charges', entity: 'TRANSACTION', slots: [['those'], ['charges']] },
  { id: 'anything_processed', entity: 'TRANSACTION', slots: [['anything'], ['processed']] },
];

function expand(slots: readonly Slot[]): string[][] {
  return slots.reduce<string[][]>((acc, slot) => {
    if (acc.length === 0) return slot.map((w) => [w]);
    const next: string[][] = [];
    for (const prefix of acc) {
      for (const w of slot) next.push([...prefix, w]);
    }
    return next;
  }, []);
}

function hasSeq(tokens: string[], pat: readonly string[]): boolean {
  outer: for (let i = 0; i <= tokens.length - pat.length; i++) {
    for (let j = 0; j < pat.length; j++) {
      if (tokens[i + j] !== pat[j]) continue outer;
    }
    return true;
  }
  return false;
}

export function matchingConstructions(utterance: string): Construction[] {
  const tokens = tokenList(utterance);
  return E2_CONSTRUCTIONS.filter((c) => expand(c.slots).some((pat) => hasSeq(tokens, pat)));
}

/** Finite published matcher. Must not call a model. */
export function decodeE2(utterance: string): EntityOrNone {
  const hits = matchingConstructions(utterance);
  const customer = hits.some((c) => c.entity === 'CUSTOMER');
  const transaction = hits.some((c) => c.entity === 'TRANSACTION');
  if (customer && !transaction) return 'CUSTOMER';
  if (transaction && !customer) return 'TRANSACTION';
  return 'NONE';
}

export interface E2Candidate extends D1Candidate {
  entity: EntityClass;
}

export function legalE2Candidates(seed: string): E2Candidate[] {
  const d0 = decodeD(seed);
  const e0 = decodeE2(seed);
  if (d0 === 'NONE' || e0 === 'NONE') return [];
  const out: E2Candidate[] = [];
  for (const c of legalD1Candidates(seed)) {
    if (decodeD(c.utterance) !== d0) continue;
    if (decodeE2(c.utterance) !== e0) continue;
    if (usesMagicEntityNoun(c.utterance)) continue;
    if (!wellFormed(c.utterance)) continue;
    out.push({ ...c, residue: decodeN(c.utterance), entity: e0 });
  }
  return out;
}

export function e2For(seed: string, n: number): E2Candidate[] {
  return legalE2Candidates(seed).filter((c) => c.residue === n);
}

export function e2Coverage(seed: string): {
  discourse: Discourse | 'NONE';
  entity: EntityOrNone;
  familySize: number;
  hit: number;
  ge5: number;
} {
  const family = legalE2Candidates(seed);
  const counts = Array.from({ length: 64 }, () => 0);
  for (const c of family) counts[c.residue] += 1;
  return {
    discourse: decodeD(seed),
    entity: decodeE2(seed),
    familySize: family.length,
    hit: counts.filter((x) => x > 0).length,
    ge5: counts.filter((x) => x >= 5).length,
  };
}
