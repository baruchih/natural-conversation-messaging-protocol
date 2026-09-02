/**
 * NCMP-V3-A1. Result #20, PARTIAL, frozen.
 * Independent realizations accumulate; recorded windows
 * have one free turn. Do not treat 2H as dialogue.
 */
import { PREFIXES, type Prefix } from './m1.ts';
import { FROZEN_DRAWS, parseTurn, turnOk } from './m3.ts';
import { encode, keyEntropy, surface } from './c1.ts';

export { FROZEN_DRAWS, PREFIXES };
export type { Prefix };

/** Frozen C1 working carrier. Not vec. Not R. */
export function V(utterance: string): string {
  return encode(surface(utterance), 'c6t');
}

export interface Dist {
  n: number;
  support: number;
  entropy: number;
  collision: number;
}

export function distOf(keys: readonly string[]): Dist {
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  const n = keys.length;
  let collision = 0;
  for (const c of counts.values()) collision += (c / n) ** 2;
  const { support, entropy } = keyEntropy(keys);
  return { n, support, entropy, collision };
}

/** Independent pair under the empirical product. H(V,V') = 2 H(V). */
export function productPair(single: Dist): Dist {
  return {
    n: single.n * single.n,
    support: single.support * single.support,
    entropy: 2 * single.entropy,
    collision: single.collision,
  };
}

export interface PrefixAccum {
  prefix: Prefix;
  closer: Dist;
  pair: Dist;
  a1: string;
  b1: string;
  window: Dist;
}

export function legalClosers(prefix: Prefix): string[] {
  return (FROZEN_DRAWS[prefix.id] ?? []).map(parseTurn).filter((u) => u && turnOk(u));
}

export function scorePrefix(prefix: Prefix): PrefixAccum {
  const closers = legalClosers(prefix);
  const closer = distOf(closers.map(V));
  const windows = closers.map((u) => `${V(prefix.a1)}|${V(prefix.b1)}|${V(u)}`);
  return {
    prefix,
    closer,
    pair: productPair(closer),
    a1: V(prefix.a1),
    b1: V(prefix.b1),
    window: distOf(windows),
  };
}

export interface PooledAccum {
  closer: Dist;
  prefixPair: Dist;
  aThenU: Dist;
  bThenU: Dist;
  window: Dist;
}

export function scorePooled(): PooledAccum {
  const closer: string[] = [];
  const prefixPair: string[] = [];
  const aThenU: string[] = [];
  const bThenU: string[] = [];
  const window: string[] = [];
  for (const p of PREFIXES) {
    const a = V(p.a1);
    const b = V(p.b1);
    for (const u of legalClosers(p)) {
      const v = V(u);
      closer.push(v);
      prefixPair.push(`${a}|${b}`);
      aThenU.push(`${a}|${v}`);
      bThenU.push(`${b}|${v}`);
      window.push(`${a}|${b}|${v}`);
    }
  }
  return {
    closer: distOf(closer),
    prefixPair: distOf(prefixPair),
    aThenU: distOf(aThenU),
    bThenU: distOf(bThenU),
    window: distOf(window),
  };
}

export function runFrozenAccum(): { prefixes: PrefixAccum[]; pooled: PooledAccum } {
  return {
    prefixes: PREFIXES.map(scorePrefix),
    pooled: scorePooled(),
  };
}
