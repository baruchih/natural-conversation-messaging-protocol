/**
 * NCMP-V3-A2. Result #21, PARTIAL, frozen.
 * Given exact A₂, 32 B₂ replies still give ~4.9 bits.
 * Do not enlarge REPLIES. There is no A3.
 */
import { PREFIXES, promptIsBlind, type Prefix } from './m1.ts';
import { FROZEN_DRAWS, parseTurn, turnOk } from './m3.ts';
import { V } from './a1.ts';
import { keyEntropy } from './c1.ts';

export { FROZEN_DRAWS, PREFIXES, V };
export type { Prefix };

/** Independent B₂ draws per frozen A₂. Declared before scoring. log₂(32) = 5. */
export const REPLIES = 32;

export function replyPrompt(prefix: Prefix, a2: string): string {
  return `Conversation so far:
A: ${prefix.a1}
B: ${prefix.b1}
A: ${a2}

Write B's natural next turn. A turn may contain more than one sentence.`;
}

export function promptIsBlindReply(prefix: Prefix, a2: string): boolean {
  const t = replyPrompt(prefix, a2).toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  if (/\b32\b/.test(t) || /\b50\b/.test(t) || t.includes('alternatives')) return false;
  if (t.includes('diverse') || t.includes('paraphrase') || t.includes('synonym')) return false;
  return promptIsBlind(prefix);
}

export function legalTurn(raw: string): string | null {
  const u = parseTurn(raw);
  return u && turnOk(u) ? u : null;
}

export interface Cond {
  hA: number;
  hB: number;
  hAB: number;
  hBgivenA: number;
  iAB: number;
  nPairs: number;
  supportA: number;
  supportB: number;
  supportAB: number;
}

/** One B₂ list per A₂. Pairs are (A₂_i, B₂_{i,j}). */
export function conditional(a2s: readonly string[], b2s: readonly (readonly string[])[]): Cond {
  const pairs: string[] = [];
  const aKeys: string[] = [];
  const bKeys: string[] = [];
  for (let i = 0; i < a2s.length; i++) {
    const a = legalTurn(a2s[i]);
    if (!a) continue;
    const va = V(a);
    for (const raw of b2s[i] ?? []) {
      const b = legalTurn(raw);
      if (!b) continue;
      const vb = V(b);
      aKeys.push(va);
      bKeys.push(vb);
      pairs.push(`${va}|${vb}`);
    }
  }
  const A = keyEntropy(aKeys);
  const B = keyEntropy(bKeys);
  const AB = keyEntropy(pairs);
  return {
    hA: A.entropy,
    hB: B.entropy,
    hAB: AB.entropy,
    hBgivenA: AB.entropy - A.entropy,
    iAB: A.entropy + B.entropy - AB.entropy,
    nPairs: pairs.length,
    supportA: A.support,
    supportB: B.support,
    supportAB: AB.support,
  };
}

/** Mean of H(V(B₂) | this exact A₂). Each cell uses up to REPLIES draws. */
export function meanCellEntropy(a2s: readonly string[], b2s: readonly (readonly string[])[]): number {
  const cells: number[] = [];
  for (let i = 0; i < a2s.length; i++) {
    if (!legalTurn(a2s[i])) continue;
    const keys = (b2s[i] ?? []).map(legalTurn).filter((u): u is string => u !== null).map(V);
    if (keys.length === 0) continue;
    cells.push(keyEntropy(keys).entropy);
  }
  if (cells.length === 0) return 0;
  return cells.reduce((a, b) => a + b, 0) / cells.length;
}

export interface PrefixCond {
  prefix: Prefix;
  cond: Cond;
  meanGivenText: number;
}

export function scorePrefix(prefix: Prefix, b2s: readonly (readonly string[])[]): PrefixCond {
  const a2s = FROZEN_DRAWS[prefix.id] ?? [];
  return {
    prefix,
    cond: conditional(a2s, b2s),
    meanGivenText: meanCellEntropy(a2s, b2s),
  };
}

export function runFrozenCond(table: Readonly<Record<string, readonly (readonly string[])[]>>): PrefixCond[] {
  return PREFIXES.map((p) => scorePrefix(p, table[p.id] ?? []));
}
