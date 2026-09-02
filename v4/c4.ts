/**
 * NCMP-C4. Session control after K_session.
 * Word list and derivation declared before the selected hint was known.
 * Not the protocol. Does not change process.
 */
import { tokenize } from '../ncmp/reference/ncmp.ts';
import { fnv1a32 } from './c1.ts';
import { SECONDARY_MASK, pSec } from './c2d.ts';
import { K_SESSION, T_FINISH, T_START } from './c2b.ts';
import { BOOTSTRAP_HINT } from './c2d.ts';

/**
 * Pre-agreed session vocabulary. 32 ordinary content words.
 * Written before sessionHint() was evaluated for this K_session.
 * Not umbrella. Not length names. Not begin/round/now.
 */
export const SESSION_WORDS = [
  'along',
  'around',
  'bench',
  'bottle',
  'bread',
  'bridge',
  'coffee',
  'corner',
  'early',
  'enough',
  'extra',
  'flask',
  'gate',
  'jacket',
  'later',
  'market',
  'maybe',
  'mostly',
  'packed',
  'park',
  'pasta',
  'path',
  'ridge',
  'shops',
  'simple',
  'sweater',
  'trail',
  'turn',
  'view',
  'walk',
  'weather',
  'window',
] as const;

const utf8 = new TextEncoder();

export function sessionHint(session: number = K_SESSION): string {
  const prefix = Uint8Array.of(
    (session >>> 24) & 0xff,
    (session >>> 16) & 0xff,
    (session >>> 8) & 0xff,
    session & 0xff,
    0x03,
  );
  const i = fnv1a32(prefix) % SESSION_WORDS.length;
  return SESSION_WORDS[i];
}

export const SESSION_HINT = sessionHint();

export function hasSessionHint(utterance: string, hint: string = SESSION_HINT): boolean {
  return tokenize(utterance).includes(hint);
}

export function isStartA(utterance: string): boolean {
  return tokenize(utterance).includes(BOOTSTRAP_HINT) && pSec(utterance) === T_START;
}

export function isStartB(utterance: string): boolean {
  return pSec(utterance) === T_START;
}

export function isStartC(utterance: string): boolean {
  return hasSessionHint(utterance) && pSec(utterance) === T_START;
}

export function isFinishC(utterance: string): boolean {
  return hasSessionHint(utterance) && pSec(utterance) === T_FINISH;
}

/** First steered START under the session hint. No umbrella. */
export const U_START_C = 'We can set off in the morning and meet at the bench!';

/** First steered FINISH under the session hint. No umbrella. */
export const U_FINISH_C = 'Alright, that covers it. See you by the bench later.';

export const START_BASE = "Let's head out Saturday morning and meet at the bench.";
export const START_SLOTS: readonly (readonly string[])[] = [
  ["Let's", 'We can'],
  ['head out', 'set off'],
  ['Saturday morning', 'in the morning'],
  ['and meet', 'and start'],
  ['at the bench', 'by the bench'],
  ['.', '!'],
];

export const FINISH_BASE = 'Alright, that covers it. See you at the bench later.';
export const FINISH_SLOTS: readonly (readonly string[])[] = [
  ['Alright,', 'Okay,'],
  ['that covers it.', "that's the plan."],
  ['See you', "I'll be"],
  ['at the bench', 'by the bench'],
  ['later', 'shortly'],
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
    hint: hasSessionHint(u),
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

export { BOOTSTRAP_HINT, K_SESSION, T_FINISH, T_START, pSec, SECONDARY_MASK };
