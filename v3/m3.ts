/**
 * NCMP-V3-M3. Result #18, PARTIAL, frozen.
 * Independent next-turn samples. Entropy is the result, not 5/6.
 * Do not regenerate. Do not enlarge DRAWS.
 */
import { decode } from '../v1-v2/p7c6.ts';
import { PREFIXES, TARGET, promptIsBlind, type Prefix } from './m1.ts';
import { coverage, needOf, turnOk, windowN } from './m2.ts';
import { FROZEN_DRAWS } from './m3.frozen.ts';

export { FROZEN_DRAWS };

export { PREFIXES, TARGET, coverage, needOf, turnOk, windowN };
export type { Prefix };

export const DRAWS = 50;

export function samplePrompt(prefix: Prefix): string {
  return `Conversation so far:
A: ${prefix.a1}
B: ${prefix.b1}

A's next conversational intent:
${prefix.intent}.

Write A's natural next turn. A turn may contain more than one sentence.`;
}

export function promptIsBlindSample(prefix: Prefix): boolean {
  return isBlind(samplePrompt(prefix)) && promptIsBlind(prefix);
}

function isBlind(p: string): boolean {
  const t = p.toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  if (/\b50\b/.test(t) || t.includes('alternatives') || t.includes('paraphrase')) return false;
  if (t.includes('diverse') || t.includes('synonym')) return false;
  return true;
}

/** One independent draw. Do not split a response into a list. */
export function parseTurn(text: string): string {
  let u = text.trim().replace(/^["'`]+|["'`]+$/g, '');
  u = u.replace(/^(A|B)\s*:\s*/i, '');
  u = u.replace(/\s+/g, ' ').trim();
  if (!u) return '';
  if (!/[.!?]$/.test(u)) u = `${u}.`;
  return u;
}

export interface Occupied {
  r: number;
  n: number;
}

export function occupied(histogram: readonly number[]): Occupied[] {
  return histogram
    .map((n, r) => ({ r, n }))
    .filter((bin) => bin.n > 0)
    .sort((a, b) => b.n - a.n || a.r - b.r);
}

export function entropyBits(histogram: readonly number[]): number {
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let h = 0;
  for (const n of histogram) {
    if (n === 0) continue;
    const p = n / total;
    h -= p * Math.log2(p);
  }
  return h;
}

export function formatHist(histogram: readonly number[]): string {
  return occupied(histogram)
    .map((bin) => `${bin.r}×${bin.n}`)
    .join('  ');
}

export interface SampleReport {
  prefix: Prefix;
  need: number;
  draws: string[];
  legal: string[];
  uniqueTexts: number;
  residues: number[];
  uniqueResidues: number;
  histogram: number[];
  entropy: number;
  chosen: string | null;
  window: number | null;
}

/** Keep duplicate draws. Distribution is over samples, not unique text. */
export function measureDraws(prefix: Prefix, raw: readonly string[], target = TARGET): SampleReport {
  const draws = raw.map(parseTurn).filter(Boolean);
  const legal = draws.filter(turnOk);
  const residues = legal.map((u) => decode(u));
  const histogram = coverage(residues);
  const need = needOf(prefix, target);
  const hitAt = legal.findIndex((_, i) => residues[i] === need);
  const chosen = hitAt >= 0 ? legal[hitAt] : null;
  return {
    prefix,
    need,
    draws,
    legal,
    uniqueTexts: new Set(draws.map((u) => u.toLowerCase())).size,
    residues,
    uniqueResidues: new Set(residues).size,
    histogram,
    entropy: entropyBits(histogram),
    chosen,
    window: chosen ? windowN(prefix.a1, prefix.b1, chosen) : null,
  };
}

export function runFrozenDraws(table: Readonly<Record<string, readonly string[]>> = FROZEN_DRAWS): SampleReport[] {
  return PREFIXES.map((p) => measureDraws(p, table[p.id] ?? []));
}
