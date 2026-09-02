/**
 * NCMP-V4-F3. Result #3, PASS, frozen.
 * START declares argument_bits. FINISH reconstructs those
 * bits from the F2 accumulator. Forced K4 stream, not
 * natural encoding. F1 START/FINISH tokens are unchanged.
 */
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import {
  DINNER_BODY,
  FINISH_EXAMPLE,
  Participant,
  deliver,
  handshake,
  isFinish,
  isStart,
} from './f1.ts';
import { accumulate, k4Body } from './f2.ts';

export {
  DINNER_BODY,
  FINISH_EXAMPLE,
  Participant,
  accumulate,
  handshake,
  isFinish,
  isStart,
  k4Body,
};

/** Published bit-count marker on an isStart utterance. Not N. */
export const BIT_MARKERS = { brief: 24 } as const;

export const ARGUMENT_BITS = 24;
export const ARGUMENT = 0xa91fc5;
export const ARGUMENT_HEX = 'a91fc5';
export const ARGUMENT_BITS_TEXT = '101010010001111111000101';
export const ARGUMENT_CHUNKS = [42, 17, 63, 5] as const;

export const START_24 = 'Shall we begin this brief round now?';

export function argumentBits(start: string): number | null {
  if (!isStart(start)) return null;
  const tokens = new Set(tokenList(start));
  for (const [mark, n] of Object.entries(BIT_MARKERS)) {
    if (tokens.has(mark)) return n;
  }
  return null;
}

export function neededObservations(bits: number): number {
  return Math.ceil(bits / 6);
}

export function bitsFromObservations(observations: readonly number[]): string {
  return observations.map((n) => (n & 63).toString(2).padStart(6, '0')).join('');
}

export function decode6(observations: readonly number[]): number {
  let x = 0;
  for (const n of observations) {
    x = (x << 6) | (n & 63);
  }
  return x;
}

export function hexFromValue(value: number, bits: number): string {
  return value.toString(16).padStart(Math.ceil(bits / 4), '0');
}

export type Reassembly =
  | { kind: 'UNDECLARED' }
  | { kind: 'INCOMPLETE'; have: number; need: number }
  | { kind: 'OVERFLOW'; have: number; need: number }
  | { kind: 'ARGUMENT'; bits: number; value: number; hex: string; bitsText: string };

/** FINISH reconstructs from body observations only. */
export function reassemble(start: string, body: readonly string[]): Reassembly {
  const bits = argumentBits(start);
  if (bits === null) return { kind: 'UNDECLARED' };
  const observations = accumulate(body);
  const need = neededObservations(bits);
  if (observations.length < need) {
    return { kind: 'INCOMPLETE', have: observations.length, need };
  }
  if (observations.length > need) {
    return { kind: 'OVERFLOW', have: observations.length, need };
  }
  const value = decode6(observations);
  return {
    kind: 'ARGUMENT',
    bits,
    value,
    hex: hexFromValue(value, bits),
    bitsText: bitsFromObservations(observations),
  };
}

export function runDeclaredFrame(
  initiator: Participant,
  responder: Participant,
  start: string,
  body: readonly string[],
) {
  const opened = deliver(initiator, responder, start);
  if (opened.left.kind !== 'START' || opened.right.kind !== 'START') {
    throw new Error('START failed');
  }
  for (const u of body) {
    const t = deliver(initiator, responder, u);
    if (t.left.kind !== 'BODY' || t.right.kind !== 'BODY') {
      throw new Error(`BODY failed: ${u}`);
    }
  }
  const closed = deliver(initiator, responder, FINISH_EXAMPLE);
  if (closed.left.kind !== 'FINISH' || closed.right.kind !== 'FINISH') {
    throw new Error('FINISH failed');
  }
  if (closed.left.kind !== 'FINISH') throw new Error('unreachable');
  if (closed.right.kind !== 'FINISH') throw new Error('unreachable');
  return { left: closed.left.frame, right: closed.right.frame };
}
