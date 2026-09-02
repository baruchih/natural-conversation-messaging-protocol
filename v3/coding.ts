/**
 * NCMP-V3-Coding. Published first scheme. Frozen with F4.
 * rₙ = R(Hₙ)
 * πₙ(V) → rₙ-bit symbol
 * accept(U) ⇔ πₙ(V(U)) = next payload bits
 * No LM. No private candidate set. No six-bit target.
 * Do not change R, π, or accept. Do not enlarge k.
 */
import { decode } from '../v1-v2/p7c6.ts';

/** C6 is the carrier alphabet. 42 is not a target. */
export const V_MODULUS = 64;
export const R_OPP_MOD = 3;
export const R_MIN = 1;
export const R_MAX = 3;

/** V(U) = C6(U). Published, model-free. */
export function carrier(utterance: string): number {
  return decode(utterance);
}

/**
 * Hₙ = (last accepted shared string, remaining argument bits).
 * last is START when the body is empty.
 * R(Hₙ) = min(1 + C6(last) mod 3, remaining)
 */
export function rate(last: string, remaining: number): number {
  if (!Number.isInteger(remaining) || remaining <= 0) return 0;
  const opportunity = R_MIN + (carrier(last) % R_OPP_MOD);
  return Math.min(opportunity, remaining);
}

/** πₙ(V) = V mod 2^{rₙ}. An rₙ-bit symbol, not a 6-bit target. */
export function symbol(v: number, r: number): number {
  if (r <= 0) return 0;
  return v & ((1 << r) - 1);
}

export function symbolBits(v: number, r: number): string {
  if (r <= 0) return '';
  return symbol(v, r).toString(2).padStart(r, '0');
}

/** accept(U) ⇔ πₙ(V(U)) = next rₙ payload bits. */
export function accept(utterance: string, r: number, need: number): boolean {
  if (r <= 0) return false;
  return symbol(carrier(utterance), r) === need;
}

export function acceptBits(utterance: string, r: number, needBits: string): boolean {
  if (r <= 0 || needBits.length !== r) return false;
  return symbolBits(carrier(utterance), r) === needBits;
}
