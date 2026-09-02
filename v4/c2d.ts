/**
 * NCMP-C2-D. Held-out composed bootstrap.
 * Declared before the held-out corpus or search. Not the protocol.
 */
import { tokenize } from '../ncmp/reference/ncmp.ts';
import { CONTROL_SEED, fnv1a32 } from './c1.ts';

/** Ordinary word. Declared without inspecting C1-D or the held-out freeze. */
export const BOOTSTRAP_HINT = 'umbrella';

/** 6-bit secondary. Declared with the hint, before scoring. */
export const SECONDARY_WIDTH = 6;
export const SECONDARY_MASK = 0x3f;

export const K = 50;
export const LAST = 'Fine by me.';
export const A_INTENT =
  'Propose walking Saturday morning, and mention bringing an umbrella. Stay in this casual scene. Do not change the purpose.';

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

export function isProbeC2D(utterance: string, seed: number = CONTROL_SEED): boolean {
  return hasHint(utterance) && pSec(utterance) === tSec(seed);
}

export { CONTROL_SEED };
