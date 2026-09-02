/**
 * NCMP-V3-W3. W1/W2 observers on frozen H2 L. Corpus first.
 * Do not change H2. Do not fit D to a detector.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import { decodeD, legalD1Candidates } from '../v1-v2/p7d1.ts';
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
import { L0, decodeE as decodeHarvest, type Language } from './h1.ts';
import { run } from './h2.ts';
import {
  buildEvolvedCorpus,
  buildStaticCorpus,
  languages as l4Languages,
  surfaceScores,
  type ContrastCorpus,
} from './w2.ts';

export { buildEvolvedCorpus, buildStaticCorpus, surfaceScores };
export type { ContrastCorpus };

const PAIR_COUNT = 32;
const CORPUS_SEED = 20260831;
const LONG_N = [0, 2, 4, 6, 8, 10] as const;

/** Frozen H2 L₁₀. W3 must not drift. */
export const FROZEN_L10 = [
  'after',
  'cash',
  'during',
  'night',
  'seated',
  'that party',
  'town',
  'traffic',
  'weather',
  'wine',
] as const;

export function harvestLanguages(): Array<{ n: number; language: Language }> {
  const log = run();
  return LONG_N.map((n) => ({
    n,
    language: n === 0 ? L0 : log[n - 1].language,
  }));
}

/** Same dinner stem as A. E is the H2 slot: immediately after `find`. */
export function harvestSeed(term: string): string {
  return `Did we find ${term} the restaurant was good but service was slow?`;
}

function harvestRows(lang: Language): Array<{ utterance: string; group: string }> {
  const rows: Array<{ utterance: string; group: string }> = [];
  const seen = new Set<string>();
  for (const c of lang.customer) {
    for (const cand of legalD1Candidates(harvestSeed(c))) {
      const u = cand.utterance;
      if (!wellFormed(u) || decodeD(u) !== 'GET') continue;
      if (decodeHarvest(u, lang) !== 'CUSTOMER') continue;
      if (seen.has(u)) continue;
      seen.add(u);
      rows.push({ utterance: u, group: c });
    }
  }
  return rows;
}

function unique(utterances: string[]): string[] {
  return [...new Set(utterances.map((u) => u.trim()))];
}

function ordinaryGetPool(): string[] {
  const A_SEED = 'Did we find the restaurant was good but service was slow?';
  return unique(
    legalD1Candidates(A_SEED)
      .map((c) => c.utterance)
      .filter((u) => wellFormed(u) && decodeD(u) === 'GET' && decodeHarvest(u, L0) === 'NONE'),
  );
}

function byTokenLength(utterances: string[]): Map<number, string[]> {
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

function exactLengthPairs(
  ordinary: string[],
  protocol: Array<{ utterance: string; group: string }>,
  n: number,
): Array<{ ordinary: string; protocol: string }> {
  const o = byTokenLength(ordinary);
  const groups = new Map<string, string[]>();
  for (const row of protocol) {
    const arr = groups.get(row.group) ?? [];
    arr.push(row.utterance);
    groups.set(row.group, arr);
  }
  for (const arr of groups.values()) {
    arr.sort((a, b) => {
      const d = tokenList(a).length - tokenList(b).length;
      return d !== 0 ? d : a.localeCompare(b);
    });
  }
  const keys = [...groups.keys()].sort();
  const picked: Array<{ ordinary: string; protocol: string }> = [];
  const usedO = new Set<string>();
  const usedP = new Set<string>();
  let i = 0;
  while (picked.length < n && keys.some((k) => (groups.get(k)?.length ?? 0) > 0)) {
    const arr = groups.get(keys[i % keys.length]) ?? [];
    const next = arr.shift();
    i += 1;
    if (!next || usedP.has(next)) continue;
    const len = tokenList(next).length;
    const mate = (o.get(len) ?? []).find((u) => !usedO.has(u));
    if (!mate) continue;
    usedO.add(mate);
    usedP.add(next);
    picked.push({ ordinary: mate, protocol: next });
  }
  return picked;
}

function toItems(
  matched: Array<{ ordinary: string; protocol: string }>,
  seed: number,
): Pick<ContrastCorpus, 'items' | 'pairs' | 'meanTokens' | 'maxLengthGap'> {
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
  };
}

export function buildHarvestCorpus(lang: Language, seed = CORPUS_SEED): ContrastCorpus {
  const matched = exactLengthPairs(ordinaryGetPool(), harvestRows(lang), PAIR_COUNT);
  if (matched.length < PAIR_COUNT) {
    throw new Error(`need ${PAIR_COUNT} exact-length A/D pairs, got ${matched.length}`);
  }
  return { contrast: 'v3', language: lang, ...toItems(matched, seed) };
}

export function scoreHarvest(corpus: ContrastCorpus): ReturnType<typeof surfaceScores> {
  const lang = corpus.language ?? L0;
  const cheatFn = (u: string) => (decodeHarvest(u, lang) === 'CUSTOMER' ? 'p7' as const : 'ordinary' as const);
  const cheat = accuracy(
    corpus.items.map((x) => x.label),
    corpus.items.map((x) => cheatFn(x.utterance)),
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

export function l4Closure(): Language {
  const all = l4Languages();
  return all[all.length - 1];
}

export function longitudinalHarvest(): Array<{
  n: number;
  language: Language;
  corpus: ContrastCorpus;
  scores: ReturnType<typeof surfaceScores>;
}> {
  return harvestLanguages().map(({ n, language }, i) => {
    const corpus = buildHarvestCorpus(language, CORPUS_SEED + 100 + i);
    return { n, language, corpus, scores: scoreHarvest(corpus) };
  });
}
