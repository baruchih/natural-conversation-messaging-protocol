/**
 * NCMP-C5. Handshake-derived START/FINISH hints.
 * Eligibility and selectors declared before the selected words were known.
 * Not the protocol. Does not change process.
 */
import { tokenize } from '../ncmp/reference/ncmp.ts';
import { CONTROL_SEED, fnv1a32 } from './c1.ts';
import { BOOTSTRAP_HINT, pSec } from './c2d.ts';
import { U_PROBE } from './c2e.ts';
import { U_ACK } from './c2f.ts';
import { T_FINISH, T_START } from './c2b.ts';

const utf8 = new TextEncoder();

/**
 * Eligible tokens of U, in first-seen order.
 * Keep a–z tokens of length ≥ 5 that are not the bootstrap hint.
 */
export function eligibleTokens(utterance: string, hint: string = BOOTSTRAP_HINT): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokenize(utterance)) {
    if (t.length < 5) continue;
    if (t === hint) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function selectHint(utterance: string, tag: number, seed: number = CONTROL_SEED): string | null {
  const elig = eligibleTokens(utterance);
  if (elig.length === 0) return null;
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
  return elig[fnv1a32(bytes) % elig.length];
}

export function startHint(uProbe: string = U_PROBE): string | null {
  return selectHint(uProbe, 0x04);
}

export function finishHint(uAck: string = U_ACK): string | null {
  return selectHint(uAck, 0x05);
}

export const START_HINT = startHint();
export const FINISH_HINT = finishHint();

export function hasHintWord(utterance: string, hint: string): boolean {
  return tokenize(utterance).includes(hint);
}

export function isStartC5(utterance: string, hint: string | null = START_HINT): boolean {
  return hint !== null && hasHintWord(utterance, hint) && pSec(utterance) === T_START;
}

export function isFinishC5(utterance: string, hint: string | null = FINISH_HINT): boolean {
  return hint !== null && hasHintWord(utterance, hint) && pSec(utterance) === T_FINISH;
}

/** Natural START space using the word a reader sees in U_probe: morning. Not the glued token. */
export const START_BASE = "Let's head out Saturday morning and meet at the park.";
export const START_SLOTS: readonly (readonly string[])[] = [
  ["Let's", 'We can'],
  ['head out', 'set off'],
  ['Saturday morning', 'in the morning'],
  ['and meet', 'and start'],
  ['at the park', 'by the gate'],
  ['.', '!'],
];

/** First steered FINISH under the ACK-derived hint. */
export const U_FINISH_C5 = 'Alright, it sounds good. See you later.';

/** FINISH space carrying the derived ACK token. */
export const FINISH_BASE = 'Alright, that sounds fine. See you later.';
export const FINISH_SLOTS: readonly (readonly string[])[] = [
  ['Alright,', 'Okay,'],
  ['that sounds', 'it sounds'],
  ['fine.', 'good.'],
  ['See you', "I'll be"],
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

export { BOOTSTRAP_HINT, T_FINISH, T_START, U_ACK, U_PROBE, pSec };
