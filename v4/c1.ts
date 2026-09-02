/**
 * NCMP-C1 first construction.
 * control_seed chosen before the corpus. Not the protocol.
 * Does not change process.
 */

/** Arbitrary 32-bit value. Frozen before scoring. */
export const CONTROL_SEED = 0x9ca2c1c1;

/** Wider than the 2^-16 bar. BODY stays C6 / 64. */
export const WIDTH = 24;
export const MASK = 0x00ffffff;

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

/** FNV-1a 32 of exact UTF-8. Total. Not C6. Not lexical. */
export function fnv1a32(bytes: Uint8Array): number {
  let h = FNV_OFFSET;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

const utf8 = new TextEncoder();

export function p(utterance: string): number {
  return fnv1a32(utf8.encode(utterance)) & MASK;
}

export function tProbe(seed: number = CONTROL_SEED): number {
  return seed & MASK;
}

export function isProbe(utterance: string, seed: number = CONTROL_SEED): boolean {
  return p(utterance) === tProbe(seed);
}

/** ACK target from seed + exact U_probe. Not pre-agreed. */
export function tAck(uProbe: string, seed: number = CONTROL_SEED): number {
  const seedBytes = Uint8Array.of(
    (seed >>> 24) & 0xff,
    (seed >>> 16) & 0xff,
    (seed >>> 8) & 0xff,
    seed & 0xff,
    0x00,
  );
  const u = utf8.encode(uProbe);
  const bytes = new Uint8Array(seedBytes.length + u.length);
  bytes.set(seedBytes);
  bytes.set(u, seedBytes.length);
  return fnv1a32(bytes) & MASK;
}

/** C2 material. Defined, not scored. */
export function kSession(
  uProbe: string,
  uAck: string,
  seed: number = CONTROL_SEED,
): number {
  return tAck(`${uProbe}\n${uAck}`, seed);
}
