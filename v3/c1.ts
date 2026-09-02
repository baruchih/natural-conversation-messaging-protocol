/**
 * NCMP-V3-C1. Result #19, PARTIAL, frozen.
 * Letter-sum discards some surface information. Token count
 * recovers a fraction of a bit. Do not retune. Do not fold R in.
 */
import { letterSum, letterValue, selectedLetters } from '../v1-v2/p7c6.ts';
import { FROZEN_DRAWS, PREFIXES, entropyBits, parseTurn, turnOk, type Prefix } from './m3.ts';

export { FROZEN_DRAWS, PREFIXES };
export type { Prefix };

/** Declared extra dimensions. Not chosen against p5. */
export const TOKEN_MOD = 8;
export const INTERNAL_CAP = 3;

export interface Surface {
  c6: number;
  tokens: number;
  letters: number;
  P: number;
  I: number;
  A: number;
  Z: number;
  R: number;
  T8: number;
}

export function terminalClass(utterance: string): number {
  const t = utterance.trim().slice(-1);
  if (t === '?') return 1;
  if (t === '!') return 2;
  return 0;
}

export function internalCount(utterance: string): number {
  const body = utterance.trim().slice(0, -1);
  return (body.match(/[.!?]/g) ?? []).length;
}

/** Length-parity of the first six tokens, as a 6-bit mask. Diagnostic only. */
export function lengthParityMask(utterance: string): number {
  const tokens = utterance.trim().split(/\s+/).filter(Boolean);
  let mask = 0;
  for (let i = 0; i < 6; i++) {
    const n = selectedLetters(tokens[i] ?? '').length;
    if (n % 2 === 1) mask |= 1 << i;
  }
  return mask;
}

export function surface(utterance: string): Surface {
  const tokens = utterance.trim().split(/\s+/).filter(Boolean);
  const letters = selectedLetters(utterance);
  const I = Math.min(internalCount(utterance), INTERNAL_CAP);
  return {
    c6: letterSum(utterance) % 64,
    tokens: tokens.length,
    letters: letters.length,
    P: terminalClass(utterance),
    I,
    A: letterValue(letters[0] ?? ''),
    Z: letterValue(letters[letters.length - 1] ?? ''),
    R: lengthParityMask(utterance),
    T8: tokens.length % TOKEN_MOD,
  };
}

export const CARRIERS = ['c6', 'c6p', 'c6t', 'c6i', 'vec'] as const;
export type CarrierId = (typeof CARRIERS)[number];

/** Declared before scoring. vec is (C6, P, T8, I). A, Z, R are diagnostics. */
export function encode(s: Surface, id: CarrierId): string {
  if (id === 'c6') return String(s.c6);
  if (id === 'c6p') return `${s.c6}:${s.P}`;
  if (id === 'c6t') return `${s.c6}:${s.T8}`;
  if (id === 'c6i') return `${s.c6}:${s.I}`;
  return `${s.c6}:${s.P}:${s.T8}:${s.I}`;
}

export interface Split {
  classes: number;
  split: number;
}

export function collisionSplit(rows: readonly Surface[], extra: (s: Surface) => number): Split {
  const bins = new Map<number, number[]>();
  for (const s of rows) {
    const list = bins.get(s.c6) ?? [];
    list.push(extra(s));
    bins.set(s.c6, list);
  }
  let classes = 0;
  let split = 0;
  for (const extras of bins.values()) {
    if (extras.length < 2) continue;
    classes += 1;
    if (new Set(extras).size > 1) split += 1;
  }
  return { classes, split };
}

export function keyEntropy(keys: readonly string[]): { support: number; entropy: number } {
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  const histogram = [...counts.values()];
  return { support: counts.size, entropy: entropyBits(histogram) };
}

export interface CarrierScore {
  id: CarrierId;
  support: number;
  entropy: number;
}

export interface PrefixScore {
  prefix: Prefix;
  n: number;
  uniqueTexts: number;
  carriers: Record<CarrierId, CarrierScore>;
  splits: Record<'P' | 'T8' | 'I' | 'A' | 'Z' | 'R', Split>;
}

export function scoreTurns(prefix: Prefix, raw: readonly string[]): PrefixScore {
  const legal = raw.map(parseTurn).filter((u) => u && turnOk(u));
  const rows = legal.map(surface);
  const carriers = {} as Record<CarrierId, CarrierScore>;
  for (const id of CARRIERS) {
    const { support, entropy } = keyEntropy(rows.map((s) => encode(s, id)));
    carriers[id] = { id, support, entropy };
  }
  return {
    prefix,
    n: legal.length,
    uniqueTexts: new Set(legal.map((u) => u.toLowerCase())).size,
    carriers,
    splits: {
      P: collisionSplit(rows, (s) => s.P),
      T8: collisionSplit(rows, (s) => s.T8),
      I: collisionSplit(rows, (s) => s.I),
      A: collisionSplit(rows, (s) => s.A),
      Z: collisionSplit(rows, (s) => s.Z),
      R: collisionSplit(rows, (s) => s.R),
    },
  };
}

export function runFrozenCarrier(): PrefixScore[] {
  return PREFIXES.map((p) => scoreTurns(p, FROZEN_DRAWS[p.id] ?? []));
}
