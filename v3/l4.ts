/**
 * NCMP-V3-L4. Same toy f as L1, applied until it cannot derive.
 * Measure |L|, |F|, unique sums, C* at each language.
 */
import { CAPACITY_MODULI, decodeMod, letterSum } from '../v1-v2/p7c6.ts';
import { DERIVE_HEAD, L0, evolve, type EvolveResult, type Language } from './l1.ts';
import { SEED_L0, realizations } from './l2.ts';

export { CAPACITY_MODULI };

const STEM = 'Did we find the restaurant was good but service was slow for';

/** Frozen L1 utterance. First growth step must reproduce Result #1. */
export const U_L1 =
  'Did we find the restaurant was good but service was slow for that party and the holder?';

export interface Coverage {
  modulus: number;
  hit: number;
  pass: boolean;
}

export interface CurvePoint {
  n: number;
  language: Language;
  evolveU: string | null;
  sizeL: number;
  sizeF: number;
  uniqueSums: number;
  coverage: Coverage[];
  star: number | null;
}

export function seedFor(construction: string): string {
  return `${STEM} ${construction}?`;
}

export function family(lang: Language): string[] {
  const out = new Set<string>();
  for (const c of lang.customer) {
    for (const u of realizations(seedFor(c), lang)) out.add(u);
  }
  return [...out];
}

function cover(utterances: readonly string[], modulus: number): number {
  const seen = new Set<number>();
  for (const u of utterances) seen.add(decodeMod(u, modulus));
  return seen.size;
}

function measure(n: number, lang: Language, evolveU: string | null): CurvePoint {
  const f = family(lang);
  const sums = new Set<number>();
  for (const u of f) sums.add(letterSum(u));
  const coverage = CAPACITY_MODULI.map((modulus) => {
    const hit = cover(f, modulus);
    return { modulus, hit, pass: hit === modulus };
  });
  const passed = coverage.filter((c) => c.pass).map((c) => c.modulus);
  return {
    n,
    language: lang,
    evolveU,
    sizeL: lang.customer.length,
    sizeF: f.length,
    uniqueSums: sums.size,
    coverage,
    star: passed.length ? passed[passed.length - 1] : null,
  };
}

export interface GrowStep {
  utterance: string;
  evolve: EvolveResult;
}

/**
 * Next derived language. Prefer the frozen L1 utterance, then
 * the same template with extra DET `the` and remaining HEADs.
 */
export function nextGrow(lang: Language): GrowStep | null {
  const frozen = evolve(lang, U_L1);
  if (frozen.kind === 'derived') return { utterance: U_L1, evolve: frozen };

  for (const matched of lang.customer) {
    for (const head of DERIVE_HEAD) {
      const u = `${STEM} ${matched} and the ${head}?`;
      const ev = evolve(lang, u);
      if (ev.kind === 'derived') return { utterance: u, evolve: ev };
    }
  }
  return null;
}

export function curve(): CurvePoint[] {
  const points: CurvePoint[] = [measure(0, L0, null)];
  let lang = L0;
  while (true) {
    const step = nextGrow(lang);
    if (!step) break;
    lang = step.evolve.language;
    points.push(measure(points.length, lang, step.utterance));
  }
  return points;
}
