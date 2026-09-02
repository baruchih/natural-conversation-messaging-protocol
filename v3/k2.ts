/**
 * NCMP-V3-K2. N depends on all three turns, including B’s reply.
 * Same dinner family as K1. No camouflage. No capacity.
 */
import { letterSum } from '../v1-v2/p7c6.ts';
import { TARGET, U1, U2, mod64, singletonN, wellFormedWindow, type Window } from './k1.ts';

export { TARGET, U1, U2, singletonN, wellFormedWindow };
export type { Window };

/** A₂ → B. Different from K1’s A₂ so the three-sum hits 42. */
export const U3 =
  'Did we find the kitchen was decent although service was sluggish last night?';

export const WINDOW: Window = [U1, U2, U3];

export const ALT_A1 =
  'Did we find the kitchen was decent although service was delayed during dinner?';
export const ALT_B1 =
  'Confirm the kitchen was decent although service was delayed around sunset during dinner.';
export const ALT_A2 = U1;

/** Irreducible published N. Every turn is in the arithmetic. */
export function windowN(u1: string, u2: string, u3: string): number {
  return mod64(letterSum(u3) - letterSum(u1) + letterSum(u2));
}

export function windowFrame(w: Window): { n: number; singles: [number, number, number] } {
  return {
    n: windowN(w[0], w[1], w[2]),
    singles: [singletonN(w[0]), singletonN(w[1]), singletonN(w[2])],
  };
}
