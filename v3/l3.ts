/**
 * NCMP-V3-L3. Same L0/L1 as L2. Capacity frontier, not a new carrier.
 * C*(L,P) = max M in the sweep with full residue coverage.
 */
import { CAPACITY_MODULI, decodeMod } from '../v1-v2/p7c6.ts';
import { L0 } from './l1.ts';
import { L1, SEED_L0, SEED_L1_NEW, realizations } from './l2.ts';

export { CAPACITY_MODULI };

export interface FrontierRow {
  modulus: number;
  bits: number;
  L0: number;
  L1: number;
  L0pass: boolean;
  L1pass: boolean;
}

function cover(utterances: readonly string[], modulus: number): number {
  const seen = new Set<number>();
  for (const u of utterances) seen.add(decodeMod(u, modulus));
  return seen.size;
}

export function frontier(): {
  rows: FrontierRow[];
  star0: number | null;
  star1: number | null;
} {
  const f0 = realizations(SEED_L0, L0);
  const f1 = [...new Set([...f0, ...realizations(SEED_L1_NEW, L1)])];
  const rows: FrontierRow[] = CAPACITY_MODULI.map((modulus) => {
    const h0 = cover(f0, modulus);
    const h1 = cover(f1, modulus);
    return {
      modulus,
      bits: Math.log2(modulus),
      L0: h0,
      L1: h1,
      L0pass: h0 === modulus,
      L1pass: h1 === modulus,
    };
  });
  const passed = (which: 'L0pass' | 'L1pass') => {
    const ok = rows.filter((r) => r[which]).map((r) => r.modulus);
    return ok.length ? ok[ok.length - 1] : null;
  };
  return { rows, star0: passed('L0pass'), star1: passed('L1pass') };
}

