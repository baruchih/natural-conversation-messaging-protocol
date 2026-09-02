/**
 * NCMP-V3-K1. N lives in a three-turn relation. No single U carries it.
 * U2 is in the window. This profile’s N is Σ(A2) − Σ(A1).
 */
import { decode as decodeN, letterSum, wellFormed } from '../v1-v2/p7c6.ts';

export const TARGET = 42;

/** A₁ → B. */
export const U1 =
  'Did we find the kitchen was decent although service was delayed after we sat?';

/** B₁ → A. In the window. Not used in this profile’s arithmetic. */
export const U2 =
  'Confirm the kitchen was decent although service was delayed around sunset after we sat.';

/** A₂ → B. */
export const U3 =
  'Did we find the kitchen was decent although wait was sluggish once we arrived?';

export type Window = readonly [string, string, string];

export const WINDOW: Window = [U1, U2, U3];

export function mod64(n: number): number {
  return ((n % 64) + 64) % 64;
}

/** Published relational N. Difference of letter-sums, not of residues as a rule. */
export function windowN(u1: string, u2: string, u3: string): number {
  if (!u2) throw new Error('window requires the inbound turn');
  return mod64(letterSum(u3) - letterSum(u1));
}

export function singletonN(u: string): number {
  return decodeN(u);
}

export function windowFrame(w: Window): { n: number; singles: [number, number, number] } {
  return {
    n: windowN(w[0], w[1], w[2]),
    singles: [singletonN(w[0]), singletonN(w[1]), singletonN(w[2])],
  };
}

export function wellFormedWindow(w: Window): boolean {
  return w.every((u) => wellFormed(u));
}
