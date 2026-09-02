/**
 * NCMP-C2-E. Derived ACK and K_session from the C2-D U_probe.
 * Declared before the ACK search. Not the protocol.
 */
import { CONTROL_SEED, fnv1a32, tAck as tAck24 } from './c1.ts';
import { BOOTSTRAP_HINT, K, LAST, SECONDARY_MASK, hasHint, pSec } from './c2d.ts';

/** Exact C2-D hit. Not regenerated. */
export const U_PROBE =
  'Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!';

export const B_INTENT =
  'Answer the Saturday morning walk plan in the same casual scene. It is fine to mention an umbrella. Do not change the purpose.';

const utf8 = new TextEncoder();

/** 6-bit ACK residual. Derived from seed + exact U_probe. Not a second initiator. */
export function tAck6(uProbe: string = U_PROBE, seed: number = CONTROL_SEED): number {
  return tAck24(uProbe, seed) & SECONDARY_MASK;
}

export function isAckC2E(utterance: string, uProbe: string = U_PROBE): boolean {
  return hasHint(utterance) && pSec(utterance) === tAck6(uProbe);
}

/** Session material. Both peers compute this from the same two strings. */
export function kSession32(uProbe: string, uAck: string, seed: number = CONTROL_SEED): number {
  const seedBytes = Uint8Array.of(
    (seed >>> 24) & 0xff,
    (seed >>> 16) & 0xff,
    (seed >>> 8) & 0xff,
    seed & 0xff,
    0x00,
  );
  const a = utf8.encode(uProbe);
  const b = utf8.encode(uAck);
  const bytes = new Uint8Array(seedBytes.length + a.length + 1 + b.length);
  bytes.set(seedBytes);
  bytes.set(a, seedBytes.length);
  bytes[seedBytes.length + a.length] = 0x01;
  bytes.set(b, seedBytes.length + a.length + 1);
  return fnv1a32(bytes);
}

export { BOOTSTRAP_HINT, CONTROL_SEED, K, LAST, hasHint, pSec };
