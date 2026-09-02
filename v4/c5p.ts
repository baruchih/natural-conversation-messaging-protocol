/**
 * NCMP-C5-P. Handshake-donated ordered-pair hints.
 * Pair rule declared before the selected pairs were known. Not the protocol.
 */
import { CONTROL_SEED, fnv1a32 } from './c1.ts';
import { pSec } from './c2d.ts';
import { U_PROBE } from './c2e.ts';
import { U_ACK } from './c2f.ts';
import { T_FINISH, T_START } from './c2b.ts';
import { eligibleWords, words } from './c5e.ts';

const utf8 = new TextEncoder();

export type Pair = readonly [string, string];

/**
 * First-seen-order combinations of two distinct eligible words.
 * Pair order is handshake order. Not all permutations.
 */
export function eligiblePairs(utterance: string): Pair[] {
  const elig = eligibleWords(utterance);
  const out: Pair[] = [];
  for (let i = 0; i < elig.length; i += 1) {
    for (let j = i + 1; j < elig.length; j += 1) {
      out.push([elig[i], elig[j]]);
    }
  }
  return out;
}

function selectPair(utterance: string, tag: number, seed: number = CONTROL_SEED): Pair | null {
  const pairs = eligiblePairs(utterance);
  if (pairs.length === 0) return null;
  const prefix = Uint8Array.of(
    (seed >>> 24) & 0xff,
    (seed >>> 16) & 0xff,
    (seed >>> 8) & 0xff,
    seed & 0xff,
    tag,
  );
  const body = utf8.encode(utterance);
  const bytes = new Uint8Array(prefix.length + body.length);
  bytes.set(prefix);
  bytes.set(body, prefix.length);
  return pairs[fnv1a32(bytes) % pairs.length];
}

export function startPair(uProbe: string = U_PROBE): Pair | null {
  return selectPair(uProbe, 0x06);
}

export function finishPair(uAck: string = U_ACK): Pair | null {
  return selectPair(uAck, 0x07);
}

export const START_PAIR = startPair();
export const FINISH_PAIR = finishPair();

/** Both words occur as word-runs, first word before second. Not adjacency. */
export function hasOrderedPair(utterance: string, pair: Pair | null): boolean {
  if (pair === null) return false;
  const [a, b] = pair;
  const ws = words(utterance);
  const ia = ws.indexOf(a);
  const ib = ws.indexOf(b);
  return ia >= 0 && ib >= 0 && ia < ib;
}

export function isStartC5P(utterance: string, pair: Pair | null = START_PAIR): boolean {
  return hasOrderedPair(utterance, pair) && pSec(utterance) === T_START;
}

export function isFinishC5P(utterance: string, pair: Pair | null = FINISH_PAIR): boolean {
  return hasOrderedPair(utterance, pair) && pSec(utterance) === T_FINISH;
}

/** First steered START under the PROBE-derived ordered pair. */
export const U_START_C5P = 'We can set off Saturday in the morning. The park works!';

/** First steered FINISH under the ACK-derived ordered pair. */
export const U_FINISH_C5P = "Alright, that sounds good. I'll bring the notes.";

export const START_BASE = 'We can head out Saturday morning. The park works.';
export const START_SLOTS: readonly (readonly string[])[] = [
  ['We can', "Let's"],
  ['head out', 'set off'],
  ['Saturday morning.', 'Saturday in the morning.'],
  ['The park', 'The gate'],
  ['works', 'is fine'],
  ['.', '!'],
];

export const FINISH_BASE = "Alright, it sounds settled. I'll bring the notes.";
export const FINISH_SLOTS: readonly (readonly string[])[] = [
  ['Alright,', 'Okay,'],
  ['it sounds', 'that sounds'],
  ['settled.', 'good.'],
  ["I'll bring", 'I can bring'],
  ['the notes', 'the plan'],
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
  hit: (u: string) => boolean,
  hinted: (u: string) => boolean,
): {
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
    hint: hinted(u),
    p_sec: pSec(u),
    hit: hit(u),
  }));
  const firstHit = scored.find((s) => s.hit) ?? null;
  return {
    n: realizations.length,
    hinted: scored.filter((s) => s.hint).length,
    unique_p: new Set(scored.map((s) => s.p_sec)).size,
    hits: scored.filter((s) => s.hit).length,
    hit: firstHit?.u ?? null,
    first: realizations[0],
  };
}

export { T_FINISH, T_START, U_ACK, U_PROBE, eligibleWords, pSec, words };
