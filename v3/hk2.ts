/**
 * NCMP-V3-HK2. W1 harvests X under Lₙ; W2 consumes X under Lₙ₊₁.
 * Overlapping K4 windows. H2 g and H1 eligibility unchanged.
 * No find-sunset shell. No camouflage.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { legalD1Candidates } from '../v1-v2/p7d1.ts';
import {
  L0,
  decodeE,
  eligible,
  language,
  tokens,
  type HarvestResult,
  type Language,
} from './h1.ts';
import { selectG } from './h2.ts';
import {
  TARGET,
  WINDOW_PROFILE,
  isGetCustomer42,
  singletonFrame,
  windowE,
  windowFrame,
  type Frame,
  type Window,
} from './hk1.ts';
import { TARGETS } from './k4.ts';
import { A2_SEED, B_SEED, requiredA2 } from './k3.ts';
import { singletonN, windowN } from './k2.ts';

export {
  L0,
  TARGET,
  WINDOW_PROFILE,
  isGetCustomer42,
  selectG,
  singletonFrame,
  singletonN,
  windowE,
  windowFrame,
  windowN,
};
export type { Frame, Language, Window };

/** F1 under Lₙ. F2 under Lₙ₊₁. */
export const F1_TARGET = TARGET;
export const F2_TARGET = TARGETS[1];

/** A₁ carries L₀’s construction. Not in W2. No find-slot. */
export const A1 =
  'Did that party arrive late at the restaurant after dinner last night?';

function hasSeq(toks: string[], pat: readonly string[]): boolean {
  outer: for (let i = 0; i <= toks.length - pat.length; i++) {
    for (let j = 0; j < pat.length; j++) {
      if (toks[i + j] !== pat[j]) continue outer;
    }
    return true;
  }
  return false;
}

export function mentions(utterance: string, construction: string): boolean {
  return hasSeq(tokens(utterance), construction.split(/\s+/));
}

/** Destination is the window frame. Eligibility is H1. Not the utterance find-slot. */
export function windowPromote(lang: Language, frame: Frame, token: string): HarvestResult {
  if (frame.e !== 'CUSTOMER') {
    return { language: lang, token: null, kind: 'none' };
  }
  if (!eligible(token, lang)) {
    return { language: lang, token, kind: 'none' };
  }
  return { language: language([...lang.customer, token]), token, kind: 'harvested' };
}

export interface Transition {
  frame: Frame;
  token: string;
  harvest: HarvestResult;
  language: Language;
}

/** Decode W under current L, then g/promote. Language version does not belong to both windows. */
export function closeWindow(
  w: Window,
  lang: Language,
  acceptedBeforeCloser: readonly string[],
): Transition {
  const frame = windowFrame(w, lang);
  const closer = w[2];
  const g = selectG(lang, acceptedBeforeCloser, closer);
  const harvest = windowPromote(lang, frame, g.token);
  return {
    frame,
    token: g.token,
    harvest,
    language: harvest.kind === 'harvested' ? harvest.language : lang,
  };
}

const indexes = new Map<string, Map<number, string[]>>();

function familyByN(seed: string): Map<number, string[]> {
  let idx = indexes.get(seed);
  if (!idx) {
    idx = new Map();
    for (const c of legalD1Candidates(seed)) {
      if (!wellFormed(c.utterance)) continue;
      const arr = idx.get(c.residue) ?? [];
      arr.push(c.utterance);
      idx.set(c.residue, arr);
    }
    indexes.set(seed, idx);
  }
  return idx;
}

function leaksL0(u: string): boolean {
  return mentions(u, 'that party') || decodeE(u, L0) === 'CUSTOMER';
}

export interface Stream {
  turns: [string, string, string, string];
  x: string;
  l1: Language;
  f1: Frame;
  f2: Frame;
}

export function findStream(): Stream {
  if (!wellFormed(A1) || mentions(A1, 'that party') === false) {
    throw new Error('A1 must be well-formed and mention that party');
  }
  const a2s = familyByN(A2_SEED);
  const bs = familyByN(B_SEED);
  const nA1 = singletonN(A1);

  for (const bList of bs.values()) {
    for (const b1 of bList) {
      if (leaksL0(b1)) continue;
      const needA2 = requiredA2(nA1, singletonN(b1), F1_TARGET);
      for (const a2 of a2s.get(needA2) ?? []) {
        if (leaksL0(a2)) continue;
        const w1: Window = [A1, b1, a2];
        const t1 = closeWindow(w1, L0, [A1, b1]);
        if (!isGetCustomer42(t1.frame)) continue;
        if (t1.harvest.kind !== 'harvested' || t1.harvest.token === null) continue;
        if (w1.some((u) => isGetCustomer42(singletonFrame(u, L0)))) continue;
        if (w1.some((u) => isGetCustomer42(singletonFrame(u, t1.language)))) continue;

        const needB2 = requiredA2(singletonN(b1), singletonN(a2), F2_TARGET);
        for (const b2 of bs.get(needB2) ?? []) {
          if (leaksL0(b2)) continue;
          const w2: Window = [b1, a2, b2];
          if (windowE(w2, L0) !== 'NONE') continue;
          if (windowE(w2, t1.language) !== 'CUSTOMER') continue;
          if (windowN(b1, a2, b2) !== F2_TARGET) continue;
          const t2 = closeWindow(w2, t1.language, [A1, b1, a2]);
          if (t2.frame.e !== 'CUSTOMER') continue;
          if (t2.frame.n !== F2_TARGET) continue;
          return {
            turns: [A1, b1, a2, b2],
            x: t1.harvest.token,
            l1: t1.language,
            f1: t1.frame,
            f2: t2.frame,
          };
        }
      }
    }
  }
  throw new Error('no HK2 stream');
}

export const STREAM = findStream();
export const TURNS = STREAM.turns;
export const W1: Window = [TURNS[0], TURNS[1], TURNS[2]];
export const W2: Window = [TURNS[1], TURNS[2], TURNS[3]];
export const X = STREAM.x;
export const L1 = STREAM.l1;

export class Peer {
  language: Language;
  turns: string[] = [];
  frames: Frame[] = [];
  harvests: HarvestResult[] = [];

  constructor(start: Language = L0) {
    this.language = start;
  }

  accept(u: string): Frame | null {
    this.turns.push(u);
    if (this.turns.length < WINDOW_PROFILE.width) return null;
    const n = this.turns.length;
    const w: Window = [this.turns[n - 3], this.turns[n - 2], this.turns[n - 1]];
    const prior = this.turns.slice(0, -1);
    const t = closeWindow(w, this.language, prior);
    this.frames.push(t.frame);
    this.harvests.push(t.harvest);
    this.language = t.language;
    return t.frame;
  }
}
