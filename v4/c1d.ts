/**
 * NCMP-C1-D. Bootstrap distribution of the C1 24-bit P.
 * Seeds frozen in c1d.seeds.json before scoring. Not the protocol.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONTROL_SEED, MASK, p, tProbe } from './c1.ts';

export const SPACE = MASK + 1;

export function loadCorpus(path = resolve(import.meta.dirname, 'c1d.corpus.txt')): string[] {
  return readFileSync(path, 'utf8').split('\n').filter((u) => u.length > 0);
}

export function loadSeeds(path = resolve(import.meta.dirname, 'c1d.seeds.json')): number[] {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as { seeds: string[] };
  return raw.seeds.map((s) => Number.parseInt(s, 16) >>> 0);
}

export function chiSquare(counts: number[], expected: number): number {
  let x = 0;
  for (const c of counts) {
    const d = c - expected;
    x += (d * d) / expected;
  }
  return x;
}

export function analyze(utterances: string[], seeds: number[]) {
  const n = utterances.length;
  const values = new Uint32Array(n);
  const lens = new Uint32Array(n);
  const freq = new Map<number, number>();
  const bits = Array<number>(24).fill(0);
  const bins8 = Array<number>(256).fill(0);
  const bins12 = Array<number>(4096).fill(0);
  const short8 = Array<number>(256).fill(0);
  const long8 = Array<number>(256).fill(0);
  let shortN = 0;
  let longN = 0;

  for (let i = 0; i < n; i++) {
    const u = utterances[i];
    const v = p(u);
    values[i] = v;
    lens[i] = u.length;
    freq.set(v, (freq.get(v) ?? 0) + 1);
    for (let b = 0; b < 24; b++) if ((v >>> b) & 1) bits[b] += 1;
    bins8[v >>> 16] += 1;
    bins12[v >>> 12] += 1;
    if (u.length < 80) {
      short8[v >>> 16] += 1;
      shortN += 1;
    } else if (u.length > 160) {
      long8[v >>> 16] += 1;
      longN += 1;
    }
  }

  let maxFreq = 0;
  let repeats = 0;
  const occ: Record<string, number> = {};
  for (const c of freq.values()) {
    if (c > maxFreq) maxFreq = c;
    if (c > 1) repeats += 1;
    const key = String(c);
    occ[key] = (occ[key] ?? 0) + 1;
  }

  const unique = freq.size;
  const expectedPairs = (n * (n - 1)) / 2 / SPACE;
  const observedPairs = [...freq.values()].reduce((s, c) => s + (c * (c - 1)) / 2, 0);
  const bitFrac = bits.map((c) => c / n);
  const chi8 = chiSquare(bins8, n / 256);
  const chi12 = chiSquare(bins12, n / 4096);

  const targets = seeds.map((seed) => tProbe(seed));
  const hitCounts = targets.map((t) => freq.get(t) ?? 0);
  const constructionHits = freq.get(tProbe(CONTROL_SEED)) ?? 0;
  const totalTargetHits = hitCounts.reduce((s, c) => s + c, 0);
  const expectedPerTarget = n / SPACE;
  const expectedTargetHits = seeds.length * expectedPerTarget;

  return {
    n,
    space: SPACE,
    unique,
    repeat_values: repeats,
    max_freq: maxFreq,
    occupancy: occ,
    expected_pairs: expectedPairs,
    observed_pairs: observedPairs,
    bit_frac_min: Math.min(...bitFrac),
    bit_frac_max: Math.max(...bitFrac),
    chi8,
    chi8_df: 255,
    chi12,
    chi12_df: 4095,
    short_n: shortN,
    long_n: longN,
    short_chi8: shortN > 0 ? chiSquare(short8, shortN / 256) : null,
    long_chi8: longN > 0 ? chiSquare(long8, longN / 256) : null,
    seeds: seeds.length,
    expected_per_target: expectedPerTarget,
    expected_target_hits: expectedTargetHits,
    observed_target_hits: totalTargetHits,
    targets_with_hits: hitCounts.filter((c) => c > 0).length,
    max_target_hits: Math.max(...hitCounts, 0),
    construction_seed_hits: constructionHits,
    slack: SPACE / 0x10000,
  };
}
