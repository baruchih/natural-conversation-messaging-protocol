/**
 * NCMP-V4-Code. Offline budget, not a chosen code.
 * k(b) copies of each bitstring. Σ k(b) ≤ 64.
 * One corpus-independent allocation: contiguous regions,
 * widths 1 then 2 then 3, k copies of each symbol in order.
 * Do not fit residues to the corpus. Do not change F4's R.
 */
import { carrier } from '../v3/coding.ts';
import { turnOk } from '../v3/m2.ts';

export const ALPHABET = 64;

export interface Budget {
  k1: number;
  k2: number;
  k3: number;
}

export function cost(b: Budget): number {
  return 2 * b.k1 + 4 * b.k2 + 8 * b.k3;
}

export function feasible(b: Budget): boolean {
  return b.k1 >= 0 && b.k2 >= 0 && b.k3 >= 0 && Number.isInteger(b.k1 + b.k2 + b.k3) && cost(b) <= ALPHABET;
}

/** Widths 1–3 present. Uniform redundancy inside a width. */
export function enumerateBudgets(): Budget[] {
  const out: Budget[] = [];
  for (let k3 = 1; k3 <= 8; k3++) {
    for (let k2 = 1; k2 <= 16; k2++) {
      for (let k1 = 1; k1 <= 32; k1++) {
        const b = { k1, k2, k3 };
        if (feasible(b)) out.push(b);
      }
    }
  }
  return out;
}

export interface Region {
  width: 1 | 2 | 3;
  start: number;
  k: number;
  symbols: number;
}

/** Contiguous, corpus-independent. Declared before scoring. */
export function regions(b: Budget): Region[] {
  if (!feasible(b)) throw new Error('infeasible budget');
  let start = 0;
  const out: Region[] = [];
  const add = (width: 1 | 2 | 3, k: number, symbols: number) => {
    out.push({ width, start, k, symbols });
    start += k * symbols;
  };
  add(1, b.k1, 2);
  add(2, b.k2, 4);
  add(3, b.k3, 8);
  return out;
}

export function decode(v: number, b: Budget): string | null {
  if (!Number.isInteger(v) || v < 0 || v >= ALPHABET) return null;
  for (const r of regions(b)) {
    const end = r.start + r.k * r.symbols;
    if (v < r.start || v >= end) continue;
    const symbol = Math.floor((v - r.start) / r.k);
    return symbol.toString(2).padStart(r.width, '0');
  }
  return null;
}

export function codewords(b: Budget): string[] {
  const out: string[] = [];
  for (const r of regions(b)) {
    for (let s = 0; s < r.symbols; s++) out.push(s.toString(2).padStart(r.width, '0'));
  }
  return out;
}

export function residuesOfSet(utterances: readonly string[]): number[] {
  return utterances.filter(turnOk).map(carrier);
}

export interface BudgetScore {
  budget: Budget;
  cost: number;
  words: number;
  fullSets: number;
  sets: number;
  meanCovered: number;
  minCovered: number;
  widthFull: { 1: number; 2: number; 3: number };
}

export function coveredIn(values: readonly number[], b: Budget): Set<string> {
  const seen = new Set<string>();
  for (const v of values) {
    const bits = decode(v, b);
    if (bits !== null) seen.add(bits);
  }
  return seen;
}

export function scoreBudget(b: Budget, sets: readonly (readonly number[])[]): BudgetScore {
  const words = codewords(b);
  const n = words.length;
  let fullSets = 0;
  let sum = 0;
  let min = n;
  const widthFull = { 1: 0, 2: 0, 3: 0 };
  const w1 = words.filter((w) => w.length === 1);
  const w2 = words.filter((w) => w.length === 2);
  const w3 = words.filter((w) => w.length === 3);
  for (const values of sets) {
    const seen = coveredIn(values, b);
    const c = words.filter((w) => seen.has(w)).length;
    sum += c;
    if (c < min) min = c;
    if (c === n) fullSets += 1;
    if (w1.every((w) => seen.has(w))) widthFull[1] += 1;
    if (w2.every((w) => seen.has(w))) widthFull[2] += 1;
    if (w3.every((w) => seen.has(w))) widthFull[3] += 1;
  }
  return {
    budget: b,
    cost: cost(b),
    words: n,
    fullSets,
    sets: sets.length,
    meanCovered: sets.length === 0 ? 0 : sum / sets.length,
    minCovered: sets.length === 0 ? 0 : min,
    widthFull,
  };
}
