/**
 * NCMP-C2-F first steerer. Slots declared before scoring.
 * Not the protocol. Does not change process.
 */
import { U_PROBE, isAckC2E, kSession32, tAck6 } from './c2e.ts';
import { hasHint, pSec } from './c2d.ts';

/** One natural on-job ACK. Not chosen by residual. */
export const BASE =
  "Sounds good. I'll bring an umbrella too, just in case.";

/** First steered hit. Same act as BASE. */
export const U_ACK = "Sounds good. I'll bring my umbrella too, just in case.";

/**
 * Independently replaceable meaning-preserving spans.
 * Declared before any P_sec of a combination was computed.
 */
export const SLOTS: readonly (readonly string[])[] = [
  ['Sounds good.', 'That sounds good.'],
  ["I'll", 'I will'],
  ['bring', 'take'],
  ['an umbrella', 'my umbrella'],
  ['too', 'as well'],
  [', just in case.', ', to be safe.'],
];

export function assemble(choice: readonly number[]): string {
  const [open, will, verb, noun, also, tail] = choice.map((i, s) => SLOTS[s][i]);
  return `${open} ${will} ${verb} ${noun} ${also}${tail}`;
}

export function enumerate(): string[] {
  const out: string[] = [];
  const lim = SLOTS.map((s) => s.length);
  const idx = lim.map(() => 0);
  for (;;) {
    out.push(assemble(idx));
    let k = idx.length - 1;
    while (k >= 0 && idx[k] + 1 === lim[k]) {
      idx[k] = 0;
      k -= 1;
    }
    if (k < 0) break;
    idx[k] += 1;
  }
  return out;
}

export function steer(target: number = tAck6()) {
  const realizations = enumerate();
  const scored = realizations.map((u) => ({
    u,
    hint: hasHint(u),
    p_sec: pSec(u),
    hit: isAckC2E(u),
  }));
  const hit = scored.find((s) => s.hit) ?? null;
  return {
    target: `0x${target.toString(16)}`,
    n: realizations.length,
    hinted: scored.filter((s) => s.hint).length,
    unique_p: new Set(scored.map((s) => s.p_sec)).size,
    hits: scored.filter((s) => s.hit).length,
    hit: hit?.u ?? null,
    k_session: hit === null ? null : `0x${kSession32(U_PROBE, hit.u).toString(16)}`,
    realizations: scored,
  };
}

export { U_PROBE, tAck6 };
