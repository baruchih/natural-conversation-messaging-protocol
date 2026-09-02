/**
 * NCMP-P7-D6. Expand D from 2 to 6. E1 and C6 stay frozen.
 * Cue sets are published constructions, not the opcode names.
 */
import { decode as decodeN, wellFormed } from './p7c6.ts';
import { tokenList } from './p7c6.lm.ts';
import { legalCandidates, type HybridCandidate } from './p7c6.hy.ts';
import { ALLOW_CUES, GET_CUES, terminalPunct, withTerminal } from './p7d1.ts';
import { decodeE, usesMagicEntityNoun, type EntityClass, type EntityOrNone } from './p7e1.ts';

export const D6_OPCODES = ['GET', 'ALLOW', 'DENY', 'CONSTRAINT', 'REPLACE', 'DELEGATE'] as const;
export type Discourse6 = (typeof D6_OPCODES)[number];
export type Discourse6OrNone = Discourse6 | 'NONE';

export const D6_CUES: Record<Discourse6, readonly string[]> = {
  GET: GET_CUES,
  ALLOW: ALLOW_CUES,
  DENY: ['refuse', 'declined', 'rejected', 'withheld'],
  CONSTRAINT: ['unless', 'provided', 'assuming', 'insofar'],
  REPLACE: ['instead', 'rather', 'supersedes', 'newly'],
  DELEGATE: ['forwarded', 'handed', 'referred', 'routed'],
};

export const D6_PUNCT: Record<Discourse6, readonly string[]> = {
  GET: ['?'],
  ALLOW: ['.', '!'],
  DENY: ['.', '!'],
  CONSTRAINT: ['.', '!'],
  REPLACE: ['.', '!'],
  DELEGATE: ['.', '!'],
};

export function grammarFootprint(): Record<Discourse6, number> {
  const out = {} as Record<Discourse6, number>;
  for (const op of D6_OPCODES) out[op] = D6_CUES[op].length;
  return out;
}

export function decodeD6(utterance: string): Discourse6OrNone {
  const tokens = new Set(tokenList(utterance));
  const punct = terminalPunct(utterance);
  const hits = D6_OPCODES.filter(
    (op) => D6_CUES[op].some((c) => tokens.has(c)) && D6_PUNCT[op].includes(punct),
  );
  return hits.length === 1 ? hits[0] : 'NONE';
}

export interface D6Candidate extends HybridCandidate {
  discourse: Discourse6;
  entity: EntityClass;
}

export function legalD6Candidates(seed: string): D6Candidate[] {
  const d0 = decodeD6(seed);
  const e0 = decodeE(seed);
  if (d0 === 'NONE' || e0 === 'NONE') return [];
  const punct = terminalPunct(seed) as '.' | '?' | '!';
  const out: D6Candidate[] = [];
  for (const c of legalCandidates(seed)) {
    const u = withTerminal(c.utterance, punct);
    if (!wellFormed(u)) continue;
    if (decodeD6(u) !== d0) continue;
    if (decodeE(u) !== e0) continue;
    if (usesMagicEntityNoun(u)) continue;
    out.push({ ...c, utterance: u, residue: decodeN(u), discourse: d0, entity: e0 });
  }
  return out;
}

export function d6For(seed: string, n: number): D6Candidate[] {
  return legalD6Candidates(seed).filter((c) => c.residue === n);
}

export function d6Coverage(seed: string): {
  discourse: Discourse6OrNone;
  entity: EntityOrNone;
  familySize: number;
  hit: number;
  ge5: number;
  footprint: number;
} {
  const family = legalD6Candidates(seed);
  const counts = Array.from({ length: 64 }, () => 0);
  for (const c of family) counts[c.residue] += 1;
  const d0 = decodeD6(seed);
  return {
    discourse: d0,
    entity: decodeE(seed),
    familySize: family.length,
    hit: counts.filter((x) => x > 0).length,
    ge5: counts.filter((x) => x >= 5).length,
    footprint: d0 === 'NONE' ? 0 : D6_CUES[d0].length,
  };
}
