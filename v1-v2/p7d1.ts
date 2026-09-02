/**
 * NCMP-P7-D1. One-bit D ∈ {GET, ALLOW} on the same U as C6 N.
 * N-edits may not touch reserved discourse cues or flip terminal punct.
 */
import { decode as decodeN, wellFormed } from './p7c6.ts';
import { tokenList } from './p7c6.lm.ts';
import { legalCandidates, type HybridCandidate } from './p7c6.hy.ts';

export const GET_CUES = ['did', 'whether', 'what'] as const;
export const ALLOW_CUES = ['confirm', 'approved', 'authorized', 'granted'] as const;

export type Discourse = 'GET' | 'ALLOW';
export type DiscourseOrNone = Discourse | 'NONE';

export function terminalPunct(utterance: string): string {
  const t = utterance.trim();
  const last = t.slice(-1);
  return /[.!?]/.test(last) ? last : '';
}

export function decodeD(utterance: string): DiscourseOrNone {
  const tokens = new Set(tokenList(utterance));
  const hasGet = GET_CUES.some((c) => tokens.has(c));
  const hasAllow = ALLOW_CUES.some((c) => tokens.has(c));
  const punct = terminalPunct(utterance);
  if (hasGet && !hasAllow && punct === '?') return 'GET';
  if (hasAllow && !hasGet && (punct === '.' || punct === '!')) return 'ALLOW';
  return 'NONE';
}

export function withTerminal(utterance: string, punct: '.' | '?' | '!'): string {
  const body = utterance.trim().replace(/[.!?]$/, '');
  return `${body}${punct}`;
}

export interface D1Candidate extends HybridCandidate {
  discourse: Discourse;
}

/** C6-HY edits, then lock seed D (cues + terminal). Drop anything that flips D. */
export function legalD1Candidates(seed: string): D1Candidate[] {
  const d0 = decodeD(seed);
  if (d0 === 'NONE') return [];
  const punct = terminalPunct(seed) as '.' | '?' | '!';
  const out: D1Candidate[] = [];
  for (const c of legalCandidates(seed)) {
    const u = withTerminal(c.utterance, punct);
    if (!wellFormed(u)) continue;
    if (decodeD(u) !== d0) continue;
    out.push({ ...c, utterance: u, residue: decodeN(u), discourse: d0 });
  }
  return out;
}

export function d1ForResidue(seed: string, n: number): D1Candidate[] {
  return legalD1Candidates(seed).filter((c) => c.residue === n);
}

export function d1Coverage(seed: string): {
  discourse: DiscourseOrNone;
  familySize: number;
  hit: number;
  flipped: number;
  minSolutions: number;
  ge5: number;
} {
  const d0 = decodeD(seed);
  const family = legalD1Candidates(seed);
  const counts = Array.from({ length: 64 }, () => 0);
  for (const c of family) counts[c.residue] += 1;
  const hit = counts.filter((x) => x > 0).length;
  const positive = counts.filter((x) => x > 0);
  return {
    discourse: d0,
    familySize: family.length,
    hit,
    flipped: 0,
    minSolutions: positive.length ? Math.min(...positive) : 0,
    ge5: counts.filter((x) => x >= 5).length,
  };
}
