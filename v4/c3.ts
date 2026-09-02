/**
 * NCMP-C3. START length as a second function of (K_session, U).
 * Slots declared before scoring. Same START discriminator. Not the protocol.
 */
import { fnv1a32 } from './c1.ts';
import { hasHint, pSec } from './c2d.ts';
import { K_SESSION, T_START, isStartC2B } from './c2b.ts';

/** Baseline Profile argument lengths. Index is the only wire value. */
export const LENGTHS = [0, 5, 8, 24, 128] as const;
export const LENGTH_NAMES = ['empty', 'short', 'tiny', 'brief', 'wide'] as const;

const utf8 = new TextEncoder();

function sessionPrefixed(session: number, tag: number, u: string): Uint8Array {
  const prefix = Uint8Array.of(
    (session >>> 24) & 0xff,
    (session >>> 16) & 0xff,
    (session >>> 8) & 0xff,
    session & 0xff,
    tag,
  );
  const body = utf8.encode(u);
  const bytes = new Uint8Array(prefix.length + body.length);
  bytes.set(prefix);
  bytes.set(body, prefix.length);
  return bytes;
}

/** Length class. Different input from P_sec. Not consulted for START identity. */
export function lenIndex(u: string, session: number = K_SESSION): number {
  return fnv1a32(sessionPrefixed(session, 0x02, u)) % LENGTHS.length;
}

export function argLen(u: string, session: number = K_SESSION): number {
  return LENGTHS[lenIndex(u, session)];
}

export function isStartC3(utterance: string): boolean {
  return isStartC2B(utterance);
}

export function startLength(utterance: string): number | null {
  return isStartC3(utterance) ? argLen(utterance) : null;
}

export const C3_BASE =
  "Yeah, I think we can head out Saturday morning. I'll have the umbrella too.";

/**
 * Independently replaceable meaning-preserving spans.
 * Declared before any P_sec or lenIndex of a combination was computed.
 * Not length names. Not begin/round/now.
 */
export const C3_SLOTS: readonly (readonly string[])[] = [
  ['Yeah,', 'Well,'],
  ['I think', 'I guess'],
  ['we can', "let's"],
  ['head out', 'set off'],
  ['Saturday morning.', 'in the morning.'],
  ["I'll have", "I'll grab"],
  ['the umbrella', 'an umbrella'],
  ['too', 'as well'],
  ['.', '!'],
];

function assemble(choice: readonly number[]): string {
  const [a, b, c, d, e, f, g, h, i] = choice.map((n, s) => C3_SLOTS[s][n]);
  return `${a} ${b} ${c} ${d} ${e} ${f} ${g} ${h}${i}`;
}

export function enumerate(): string[] {
  const out: string[] = [];
  const lim = C3_SLOTS.map((s) => s.length);
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

/** First steered START that declares tiny (8). Same act as C3_BASE. */
export const U_START_TINY =
  "Yeah, I guess let's head out in the morning. I'll have an umbrella as well!";

export function steer(want: number): {
  want: number;
  n: number;
  hinted: number;
  starts: number;
  unique_p: number;
  unique_len: number;
  hits: number;
  hit: string | null;
  first: string;
  by_length: Record<string, number>;
  first_by_length: Record<string, string | null>;
} {
  const realizations = enumerate();
  const scored = realizations.map((u) => ({
    u,
    hint: hasHint(u),
    start: isStartC3(u),
    p_sec: pSec(u),
    len: argLen(u),
  }));
  const starts = scored.filter((s) => s.start);
  const hits = starts.filter((s) => s.len === want);
  const by_length: Record<string, number> = {};
  const first_by_length: Record<string, string | null> = {};
  for (const name of LENGTH_NAMES) {
    by_length[name] = 0;
    first_by_length[name] = null;
  }
  for (const s of starts) {
    const name = LENGTH_NAMES[lenIndex(s.u)];
    by_length[name] += 1;
    if (first_by_length[name] === null) first_by_length[name] = s.u;
  }
  return {
    want,
    n: realizations.length,
    hinted: scored.filter((s) => s.hint).length,
    starts: starts.length,
    unique_p: new Set(scored.map((s) => s.p_sec)).size,
    unique_len: new Set(starts.map((s) => s.len)).size,
    hits: hits.length,
    hit: hits[0]?.u ?? null,
    first: realizations[0],
    by_length,
    first_by_length,
  };
}

export { K_SESSION, T_START, hasHint, pSec };
