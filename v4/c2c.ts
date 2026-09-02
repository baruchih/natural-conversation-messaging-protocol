/**
 * NCMP-C2-C first witness. Declared before scoring.
 * Not the protocol. Does not change process.
 */
import { tokenize } from '../ncmp/reference/ncmp.ts';
import { CONTROL_SEED, fnv1a32, p as p24 } from './c1.ts';

/** One ordinary word. Declared without inspecting the C1-D corpus. */
export const BOOTSTRAP_HINT = 'bakery';

/** 8-bit secondary. Declared with the hint, before scoring. */
export const SECONDARY_WIDTH = 8;
export const SECONDARY_MASK = 0xff;

export const K = 50;
export const LAST = 'Fine by me.';
export const A_INTENT =
  'Propose walking Saturday morning, and mention stopping by the bakery. Stay in this casual scene. Do not change the purpose.';

const utf8 = new TextEncoder();

export function hasHint(utterance: string, hint: string = BOOTSTRAP_HINT): boolean {
  return tokenize(utterance).includes(hint);
}

export function pSec(utterance: string): number {
  return fnv1a32(utf8.encode(utterance)) & SECONDARY_MASK;
}

export function tSec(seed: number = CONTROL_SEED): number {
  return seed & SECONDARY_MASK;
}

export function isProbeC2C(utterance: string, seed: number = CONTROL_SEED): boolean {
  return hasHint(utterance) && pSec(utterance) === tSec(seed);
}

export { CONTROL_SEED, p24 };
