/**
 * NCMP-C2-B. START / FINISH from K_session + state.
 * Slots declared before scoring. Same hint. Same steerer. Not the protocol.
 */
import { fnv1a32 } from './c1.ts';
import { CONTROL_SEED, U_PROBE, kSession32 } from './c2e.ts';
import { BOOTSTRAP_HINT, SECONDARY_MASK, hasHint, pSec } from './c2d.ts';
import { U_ACK } from './c2f.ts';

export const K_SESSION = kSession32(U_PROBE, U_ACK);

const utf8 = new TextEncoder();

export function tState(label: 'START' | 'FINISH', session: number = K_SESSION): number {
  const s = Uint8Array.of(
    (session >>> 24) & 0xff,
    (session >>> 16) & 0xff,
    (session >>> 8) & 0xff,
    session & 0xff,
    0x00,
  );
  const tag = utf8.encode(label);
  const bytes = new Uint8Array(s.length + tag.length);
  bytes.set(s);
  bytes.set(tag, s.length);
  return fnv1a32(bytes) & SECONDARY_MASK;
}

export const T_START = tState('START');
export const T_FINISH = tState('FINISH');

/** First steered START hit. Same act as START_BASE. */
export const U_START = "We can set off Saturday morning. I'll have an umbrella!";

/** First steered FINISH hit. Same act as FINISH_BASE. */
export const U_FINISH = "Alright, that's the plan. I'll keep the umbrella handy!";

export function isStartC2B(utterance: string): boolean {
  return hasHint(utterance) && pSec(utterance) === T_START;
}

export function isFinishC2B(utterance: string): boolean {
  return hasHint(utterance) && pSec(utterance) === T_FINISH;
}

export const START_BASE = "Let's head out Saturday morning. I'll have the umbrella.";
export const START_SLOTS: readonly (readonly string[])[] = [
  ["Let's", 'We can'],
  ['head out', 'set off'],
  ['Saturday morning.', 'in the morning.'],
  ["I'll have", "I'll grab"],
  ['the umbrella', 'an umbrella'],
  ['.', '!'],
];

export const FINISH_BASE = "Alright, that covers it. I'll keep the umbrella handy.";
export const FINISH_SLOTS: readonly (readonly string[])[] = [
  ['Alright,', 'Okay,'],
  ['that covers it.', "that's the plan."],
  ["I'll keep", "I'll hold"],
  ['the umbrella', 'my umbrella'],
  ['handy', 'with me'],
  ['.', '!'],
];

function assemble(slots: readonly (readonly string[])[], choice: readonly number[]): string {
  const [a, b, c, d, e, f] = choice.map((i, s) => slots[s][i]);
  return `${a} ${b} ${c} ${d} ${e}${f}`;
}

export function enumerate(slots: readonly (readonly string[])[]): string[] {
  const out: string[] = [];
  const lim = slots.map((s) => s.length);
  const idx = lim.map(() => 0);
  for (;;) {
    out.push(assemble(slots, idx));
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

export function steer(
  slots: readonly (readonly string[])[],
  target: number,
): {
  target: string;
  n: number;
  hinted: number;
  unique_p: number;
  hits: number;
  hit: string | null;
  first: string;
} {
  const realizations = enumerate(slots);
  const scored = realizations.map((u) => ({
    u,
    hint: hasHint(u),
    p_sec: pSec(u),
    hit: hasHint(u) && pSec(u) === target,
  }));
  const hit = scored.find((s) => s.hit) ?? null;
  return {
    target: `0x${target.toString(16)}`,
    n: realizations.length,
    hinted: scored.filter((s) => s.hint).length,
    unique_p: new Set(scored.map((s) => s.p_sec)).size,
    hits: scored.filter((s) => s.hit).length,
    hit: hit?.u ?? null,
    first: realizations[0],
  };
}

export { BOOTSTRAP_HINT, CONTROL_SEED, U_ACK, U_PROBE, hasHint, pSec };
