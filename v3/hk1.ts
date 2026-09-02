/**
 * NCMP-V3-HK1. Frozen H2 sunset + frozen K4 window. One window.
 * No find-sunset shell. No harvest in this window.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { decodeD, legalD1Candidates, type DiscourseOrNone } from '../v1-v2/p7d1.ts';
import { decodeE, L0, language, tokens, type EntityOrNone, type Language } from './h1.ts';
import { TARGET, singletonN } from './k1.ts';
import { windowN } from './k2.ts';
import { A2_SEED, B_SEED, requiredA2 } from './k3.ts';
import { WINDOW_PROFILE } from './k4.ts';

export { L0, TARGET, WINDOW_PROFILE, singletonN, windowN };

/** Frozen earlier harvest. Not mutated here. */
export const LN = language(['that party', 'sunset']);

/** A₁ contains sunset. No `find sunset`. */
export const A1 =
  'Did sunset arrive late at the restaurant after dinner last night?';

export type Window = readonly [string, string, string];

export interface Frame {
  d: DiscourseOrNone;
  e: EntityOrNone;
  n: number;
}

function hasSeq(toks: string[], pat: readonly string[]): boolean {
  outer: for (let i = 0; i <= toks.length - pat.length; i++) {
    for (let j = 0; j < pat.length; j++) {
      if (toks[i + j] !== pat[j]) continue outer;
    }
    return true;
  }
  return false;
}

function mentions(utterance: string, construction: string): boolean {
  return hasSeq(tokens(utterance), construction.split(/\s+/));
}

/** Window E: harvested construction appears in the window. Not the H1 find-slot. */
export function windowE(w: Window, lang: Language): EntityOrNone {
  for (const u of w) {
    for (const c of lang.customer) {
      if (mentions(u, c)) return 'CUSTOMER';
    }
  }
  return 'NONE';
}

/** Window D: closer is interrogative. */
export function windowD(w: Window): DiscourseOrNone {
  return decodeD(w[2]);
}

export function windowFrame(w: Window, lang: Language): Frame {
  return { d: windowD(w), e: windowE(w, lang), n: windowN(w[0], w[1], w[2]) };
}

export function singletonFrame(u: string, lang: Language): Frame {
  return { d: decodeD(u), e: decodeE(u, lang), n: singletonN(u) };
}

export function isGetCustomer42(f: Frame): boolean {
  return f.d === 'GET' && f.e === 'CUSTOMER' && f.n === TARGET;
}

let a2ByN: Map<number, string[]> | null = null;

function firstA2(need: number, avoid: (u: string) => boolean): string | null {
  if (!a2ByN) {
    a2ByN = new Map();
    for (const c of legalD1Candidates(A2_SEED)) {
      if (!wellFormed(c.utterance)) continue;
      const arr = a2ByN.get(c.residue) ?? [];
      arr.push(c.utterance);
      a2ByN.set(c.residue, arr);
    }
  }
  for (const u of a2ByN.get(need) ?? []) {
    if (!avoid(u)) return u;
  }
  return null;
}

function forbidden(u: string): boolean {
  if (mentions(u, 'that party')) return true;
  if (decodeE(u, LN) === 'CUSTOMER') return true;
  return false;
}

export function compose(b1: string, a1 = A1): Window | null {
  if (!wellFormed(a1) || !wellFormed(b1)) return null;
  if (forbidden(a1) || mentions(b1, 'that party')) return null;
  const need = requiredA2(singletonN(a1), singletonN(b1), TARGET);
  const a2 = firstA2(need, (u) => forbidden(u) || mentions(u, 'that party'));
  if (!a2) return null;
  return [a1, b1, a2];
}

export function findWindow(): Window {
  for (const c of legalD1Candidates(B_SEED)) {
    if (!wellFormed(c.utterance)) continue;
    const w = compose(c.utterance);
    if (!w) continue;
    const f = windowFrame(w, LN);
    if (!isGetCustomer42(f)) continue;
    if (w.some((u) => isGetCustomer42(singletonFrame(u, LN)))) continue;
    if (windowE(w, L0) === 'CUSTOMER') continue;
    return w;
  }
  throw new Error('no HK1 window');
}

export const WINDOW: Window = findWindow();
export const ALT_B1 =
  legalD1Candidates(B_SEED)
    .map((c) => c.utterance)
    .find((u) => {
      if (!wellFormed(u) || u === WINDOW[1]) return false;
      return windowN(WINDOW[0], u, WINDOW[2]) !== TARGET;
    }) ?? WINDOW[1];
