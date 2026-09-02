/**
 * NCMP-V3-W4. Conversation-level distinguishability after HK2.
 * Classification unit is the 4-turn interaction, not the sentence.
 * Corpus first. Do not fit E to a detector. No HK3.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import { decodeD, legalD1Candidates } from '../v1-v2/p7d1.ts';
import { decodeE2, legalE2Candidates } from '../v1-v2/p7e2.ts';
import {
  accuracy,
  bayesTopFeatures,
  folds,
  lengthDetect,
  mulberry32,
  predictBayes,
  trainBayes,
  type WireItem,
  type WirePair,
} from '../v1-v2/p7w1.ts';
import { decodeE as decodeHarvest, L0 as H0 } from './h1.ts';
import { A1 as HK2_A1, closeWindow, isGetCustomer42, mentions, singletonFrame, windowE, windowN } from './hk2.ts';
import { A2_SEED, B_SEED, requiredA2 } from './k3.ts';
import { singletonN } from './k2.ts';
import { F1_TARGET, F2_TARGET } from './hk2.ts';
import { decodeE as decodeL1, type Language } from './l1.ts';
import { realizations } from './l2.ts';
import { seedFor } from './l4.ts';
import { harvestSeed } from './w3.ts';
import { l4Closure } from './w3.ts';
import { FROZEN_L10, harvestLanguages } from './w3.ts';

export { FROZEN_L10, l4Closure };

export const PAIR_COUNT = 32;
export const CORPUS_SEED = 20260831;

export type Contrast = 'B' | 'C' | 'D' | 'E';
export type Turns = readonly [string, string, string, string];

export interface ConversationCorpus {
  contrast: Contrast;
  items: WireItem[];
  pairs: WirePair[];
  meanTokens: { ordinary: number; protocol: number };
  maxLengthGap: number;
  language: Language | null;
}

const GET_ORDINARY_SEEDS = [
  'Did we find the restaurant was good but service was slow?',
  'Did we find the restaurant was good but service was slow tonight?',
  'Did we find the restaurant was good but service was slow after dinner last night?',
] as const;
const P7_GET_SEEDS = [
  'Did we find the restaurant was good but service was slow for that party?',
  'Did we find the restaurant was good but service was slow for whoever held it?',
  'Did we find the restaurant was good but service was slow for their account holder?',
  'Did we find the restaurant was good but service was slow for those folks?',
  'Did we find the restaurant was good but service was slow for anyone seated?',
  'Did we find the restaurant was good but service was slow for the account holder?',
] as const;

/** Dinner A1 seeds that can carry L₀’s construction without the H1 find-slot. */
const HK2_A1_SEEDS = [
  HK2_A1,
  'Did that party think the restaurant was good but service was slow last night?',
  'Did that party say the restaurant was good but service was slow after dinner?',
] as const;

export function renderConversation(turns: readonly string[]): string {
  return turns.join('\n');
}

export function parseConversation(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

function unique(xs: string[]): string[] {
  return [...new Set(xs.map((u) => u.trim()))];
}

function family(seed: string, keep: (u: string) => boolean): string[] {
  return unique(legalD1Candidates(seed).map((c) => c.utterance).filter(keep));
}

function ordinaryGet(u: string): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeE2(u) === 'NONE' && decodeHarvest(u, H0) === 'NONE';
}

function ordinaryAllow(u: string): boolean {
  return wellFormed(u) && decodeD(u) === 'ALLOW' && decodeE2(u) === 'NONE' && decodeHarvest(u, H0) === 'NONE';
}

function p7Get(u: string): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeE2(u) !== 'NONE';
}

function evolvedGet(u: string, lang: Language): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeL1(u, lang) === 'CUSTOMER';
}

function harvestGet(u: string, lang: Language): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeHarvest(u, lang) === 'CUSTOMER';
}

export function ordinaryGets(): string[] {
  const out: string[] = [];
  for (const seed of GET_ORDINARY_SEEDS) {
    out.push(...family(seed, ordinaryGet));
  }
  return unique(out);
}

export function ordinaryAllows(): string[] {
  return family(B_SEED, ordinaryAllow);
}

export function staticGets(): string[] {
  const out: string[] = [];
  for (const seed of P7_GET_SEEDS) {
    for (const c of legalE2Candidates(seed)) {
      if (p7Get(c.utterance)) out.push(c.utterance);
    }
  }
  return unique(out);
}

export function evolvedGets(lang: Language): string[] {
  const out: string[] = [];
  for (const c of lang.customer) {
    for (const u of realizations(seedFor(c), lang)) {
      if (evolvedGet(u, lang)) out.push(u);
    }
  }
  return unique(out);
}

export function harvestGets(lang: Language): string[] {
  const out: string[] = [];
  for (const c of lang.customer) {
    for (const cand of legalD1Candidates(harvestSeed(c))) {
      if (harvestGet(cand.utterance, lang)) out.push(cand.utterance);
    }
  }
  return unique(out);
}

function bucketByLen(utterances: string[]): Map<number, string[]> {
  const m = new Map<number, string[]>();
  for (const u of utterances) {
    const n = tokenList(u).length;
    const arr = m.get(n) ?? [];
    arr.push(u);
    m.set(n, arr);
  }
  for (const arr of m.values()) arr.sort((a, b) => a.localeCompare(b));
  return m;
}

function venuePole(u: string): 'restaurant' | 'place' | 'kitchen' | 'none' {
  const t = new Set(tokenList(u));
  if (t.has('restaurant')) return 'restaurant';
  if (t.has('place')) return 'place';
  if (t.has('kitchen')) return 'kitchen';
  return 'none';
}

function takeAt(
  bucket: Map<number, string[]>,
  len: number,
  used: Set<string>,
  prefer?: string,
): string | null {
  const arr = bucket.get(len) ?? [];
  const pole = prefer ? venuePole(prefer) : 'none';
  const u =
    arr.find((x) => !used.has(x) && (pole === 'none' || venuePole(x) === pole)) ??
    arr.find((x) => !used.has(x));
  if (!u) return null;
  used.add(u);
  return u;
}

function assembleDialogues(gets: string[], allows: string[], n: number, allowedGetLens?: Set<number>): Turns[] {
  const g = [...gets]
    .filter((u) => !allowedGetLens || allowedGetLens.has(tokenList(u).length))
    .sort((a, b) => a.localeCompare(b));
  const a = [...allows].sort((a, b) => a.localeCompare(b));
  if (g.length < 2 || a.length < 2) return [];
  const out: Turns[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (out.length < n && i < g.length - 1) {
    const turns: Turns = [g[i], a[i % a.length], g[i + 1], a[(i + 1) % a.length]];
    const key = renderConversation(turns);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(turns);
    }
    i += 2;
  }
  return out;
}

function matchOrdinaryTurns(
  protocol: Turns[],
  oGets: Map<number, string[]>,
  oAllows: Map<number, string[]>,
): Array<{ ordinary: Turns; protocol: Turns }> {
  const used = new Set<string>();
  for (const proto of protocol) {
    for (const u of proto) used.add(u);
  }
  const out: Array<{ ordinary: Turns; protocol: Turns }> = [];
  for (const proto of protocol) {
    const g1 = takeAt(oGets, tokenList(proto[0]).length, used, proto[0]);
    const a1 = takeAt(oAllows, tokenList(proto[1]).length, used, proto[1]);
    const g2 = takeAt(oGets, tokenList(proto[2]).length, used, proto[2]);
    const a2 = takeAt(oAllows, tokenList(proto[3]).length, used, proto[3]);
    if (!g1 || !a1 || !g2 || !a2) continue;
    const ordinary: Turns = [g1, a1, g2, a2];
    if (cheatConversation(renderConversation(ordinary), 'E') !== 'ordinary') {
      used.delete(g1);
      used.delete(a1);
      used.delete(g2);
      used.delete(a2);
      continue;
    }
    out.push({ ordinary, protocol: proto });
  }
  return out;
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
  return mentions(u, 'that party') || decodeHarvest(u, H0) === 'CUSTOMER';
}

function a1Candidates(): string[] {
  const out: string[] = [];
  for (const seed of HK2_A1_SEEDS) {
    if (wellFormed(seed) && mentions(seed, 'that party') && decodeHarvest(seed, H0) === 'NONE') {
      out.push(seed);
    }
    for (const u of family(seed, (x) =>
      wellFormed(x) && decodeD(x) === 'GET' && mentions(x, 'that party') && decodeHarvest(x, H0) === 'NONE',
    )) {
      out.push(u);
    }
  }
  return unique(out);
}

export function isHk2Conversation(turns: readonly string[]): boolean {
  if (turns.length !== 4) return false;
  const w1 = [turns[0], turns[1], turns[2]] as const;
  const w2 = [turns[1], turns[2], turns[3]] as const;
  const t1 = closeWindow(w1, H0, [turns[0], turns[1]]);
  if (!isGetCustomer42(t1.frame) || t1.harvest.kind !== 'harvested') return false;
  if (w1.some((u) => isGetCustomer42(singletonFrame(u, H0)))) return false;
  if (windowE(w2, H0) !== 'NONE') return false;
  if (windowE(w2, t1.language) !== 'CUSTOMER') return false;
  if (windowN(turns[1], turns[2], turns[3]) !== F2_TARGET) return false;
  return true;
}

function searchFromA1(
  a1: string,
  a2s: Map<number, string[]>,
  bs: Map<number, string[]>,
  seen: Set<string>,
  limit: number,
): Turns[] {
  const out: Turns[] = [];
  const nA1 = singletonN(a1);
  for (const bList of bs.values()) {
    for (const b1 of bList) {
      if (leaksL0(b1)) continue;
      const needA2 = requiredA2(nA1, singletonN(b1), F1_TARGET);
      for (const a2 of a2s.get(needA2) ?? []) {
        if (leaksL0(a2)) continue;
        const w1 = [a1, b1, a2] as const;
        const t1 = closeWindow(w1, H0, [a1, b1]);
        if (!isGetCustomer42(t1.frame)) continue;
        if (t1.harvest.kind !== 'harvested') continue;
        if (w1.some((u) => isGetCustomer42(singletonFrame(u, H0)))) continue;
        const needB2 = requiredA2(singletonN(b1), singletonN(a2), F2_TARGET);
        for (const b2 of bs.get(needB2) ?? []) {
          if (leaksL0(b2)) continue;
          const w2 = [b1, a2, b2] as const;
          if (windowE(w2, H0) !== 'NONE') continue;
          if (windowE(w2, t1.language) !== 'CUSTOMER') continue;
          if (windowN(b1, a2, b2) !== F2_TARGET) continue;
          const turns: Turns = [a1, b1, a2, b2];
          const key = renderConversation(turns);
          if (seen.has(key)) continue;
          seen.add(key);
          out.push(turns);
          if (out.length >= limit) return out;
          break;
        }
      }
    }
  }
  return out;
}

export function hk2Streams(limit: number): Turns[] {
  const a1s = a1Candidates();
  const a2s = familyByN(A2_SEED);
  const bs = familyByN(B_SEED);
  const out: Turns[] = [];
  const seen = new Set<string>();
  const per = Math.max(1, Math.ceil(limit / Math.max(1, a1s.length)));
  for (const a1 of a1s) {
    out.push(...searchFromA1(a1, a2s, bs, seen, Math.min(per, limit - out.length)));
    if (out.length >= limit) return out;
  }
  for (const a1 of a1s) {
    out.push(...searchFromA1(a1, a2s, bs, seen, limit - out.length));
    if (out.length >= limit) return out;
  }
  return out;
}

function bothGets(
  turns: readonly string[],
  pred: (u: string) => boolean,
): boolean {
  return pred(turns[0]) && pred(turns[2]) && ordinaryAllow(turns[1]) && ordinaryAllow(turns[3]);
}

export function cheatConversation(text: string, contrast: Contrast, lang?: Language): 'ordinary' | 'p7' {
  const turns = parseConversation(text);
  if (turns.length !== 4) return 'ordinary';
  if (contrast === 'B') return bothGets(turns, p7Get) ? 'p7' : 'ordinary';
  if (contrast === 'C') return bothGets(turns, (u) => evolvedGet(u, lang!)) ? 'p7' : 'ordinary';
  if (contrast === 'D') return bothGets(turns, (u) => harvestGet(u, lang!)) ? 'p7' : 'ordinary';
  return isHk2Conversation(turns) ? 'p7' : 'ordinary';
}

function toItems(
  matched: Array<{ ordinary: string; protocol: string }>,
  seed: number,
): Omit<ConversationCorpus, 'contrast'> {
  const rand = mulberry32(seed);
  const items: WireItem[] = [];
  const pairs: WirePair[] = [];
  matched.forEach((m, i) => {
    items.push({
      id: `O${i}`,
      utterance: m.ordinary,
      label: 'ordinary',
      tokens: tokenList(m.ordinary).length,
    });
    items.push({
      id: `P${i}`,
      utterance: m.protocol,
      label: 'p7',
      tokens: tokenList(m.protocol).length,
    });
    const p7On = rand() < 0.5 ? 'a' : 'b';
    pairs.push({
      id: `pair-${i}`,
      a: p7On === 'a' ? m.protocol : m.ordinary,
      b: p7On === 'a' ? m.ordinary : m.protocol,
      p7On,
    });
  });
  const ordinary = items.filter((x) => x.label === 'ordinary');
  const protocol = items.filter((x) => x.label === 'p7');
  const mean = (xs: WireItem[]) => xs.reduce((s, x) => s + x.tokens, 0) / xs.length;
  return {
    items,
    pairs,
    meanTokens: { ordinary: mean(ordinary), protocol: mean(protocol) },
    maxLengthGap: Math.max(
      ...matched.map((m) => Math.abs(tokenList(m.ordinary).length - tokenList(m.protocol).length)),
    ),
    language: null,
  };
}

export function buildContrast(contrast: Contrast, seed = CORPUS_SEED): ConversationCorpus {
  const want = PAIR_COUNT * 4;
  const oGets = ordinaryGets();
  const oAllows = ordinaryAllows();
  const getLens = new Set(oGets.map((u) => tokenList(u).length));
  let protocol: Turns[];
  let language: Language | null = null;
  if (contrast === 'B') {
    protocol = assembleDialogues(staticGets(), oAllows, want, getLens);
  } else if (contrast === 'C') {
    language = l4Closure();
    protocol = assembleDialogues(evolvedGets(language), oAllows, want, getLens);
  } else if (contrast === 'D') {
    language = h2Language();
    protocol = assembleDialogues(harvestGets(language), oAllows, want, getLens);
  } else {
    protocol = hk2Streams(want).filter((t) =>
      getLens.has(tokenList(t[0]).length) &&
      getLens.has(tokenList(t[2]).length) &&
      oAllows.some((u) => tokenList(u).length === tokenList(t[1]).length) &&
      oAllows.some((u) => tokenList(u).length === tokenList(t[3]).length),
    );
  }
  const matchedTurns = matchOrdinaryTurns(protocol, bucketByLen(oGets), bucketByLen(oAllows));
  const matched = matchedTurns.slice(0, PAIR_COUNT).map((m) => ({
    ordinary: renderConversation(m.ordinary),
    protocol: renderConversation(m.protocol),
  }));
  if (matched.length < PAIR_COUNT) {
    throw new Error(
      `${contrast}: need ${PAIR_COUNT} exact-length conversation pairs, got ${matched.length} (P=${protocol.length})`,
    );
  }
  return { contrast, ...toItems(matched, seed), language };
}

export function surfaceScores(corpus: ConversationCorpus): {
  cheat: number;
  length: number;
  bayes: number;
  top: Array<{ word: string; tilt: number }>;
} {
  const cheat = accuracy(
    corpus.items.map((x) => x.label),
    corpus.items.map((x) => cheatConversation(x.utterance, corpus.contrast, corpus.language ?? undefined)),
  );
  const mid = (corpus.meanTokens.ordinary + corpus.meanTokens.protocol) / 2;
  const length = accuracy(
    corpus.items.map((x) => x.label),
    corpus.items.map((x) => lengthDetect(x.utterance, mid)),
  );
  let ok = 0;
  let n = 0;
  const votes = new Map<string, number>();
  for (const fold of folds(corpus.items, 4)) {
    const model = trainBayes(fold.train);
    const pred = fold.test.map((x) => predictBayes(model, x.utterance));
    const truth = fold.test.map((x) => x.label);
    ok += pred.filter((p, i) => p === truth[i]).length;
    n += truth.length;
    for (const f of bayesTopFeatures(model, 6)) {
      votes.set(f.word, (votes.get(f.word) ?? 0) + f.tilt);
    }
  }
  const top = [...votes.entries()]
    .map(([word, tilt]) => ({ word, tilt }))
    .sort((a, b) => Math.abs(b.tilt) - Math.abs(a.tilt))
    .slice(0, 8);
  return { cheat, length, bayes: n ? ok / n : 0, top };
}

export function h2Language(): Language {
  const snaps = harvestLanguages();
  return snaps[snaps.length - 1].language;
}
