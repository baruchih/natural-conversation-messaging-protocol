/**
 * NCMP-V3-W2. W1 methodology on static P7 vs the L4 closure.
 * Corpus first. Detectors do not receive the grammar.
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import { decodeD, legalD1Candidates } from '../v1-v2/p7d1.ts';
import { decodeE2 } from '../v1-v2/p7e2.ts';
import {
  accuracy,
  bayesTopFeatures,
  buildCorpus,
  cheatDetect,
  folds,
  lengthDetect,
  mulberry32,
  predictBayes,
  trainBayes,
  type WireItem,
  type WirePair,
} from '../v1-v2/p7w1.ts';
import { decodeE, L0, type Language } from './l1.ts';
import { realizations } from './l2.ts';
import { nextGrow, seedFor } from './l4.ts';

export { accuracy, bayesTopFeatures, folds, lengthDetect, predictBayes, trainBayes };

const A_SEED = 'Did we find the restaurant was good but service was slow?';
const PAIR_COUNT = 32;
const CORPUS_SEED = 20260831;

export type Contrast = 'p7' | 'v3';

export interface ContrastCorpus {
  contrast: Contrast;
  items: WireItem[];
  pairs: WirePair[];
  meanTokens: { ordinary: number; protocol: number };
  maxLengthGap: number;
  language: Language | null;
}

function unique(utterances: string[]): string[] {
  return [...new Set(utterances.map((u) => u.trim()))];
}

function isOrdinaryGet(u: string): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeE2(u) === 'NONE';
}

function isEvolvedGet(u: string, lang: Language): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeE(u, lang) === 'CUSTOMER';
}

function ordinaryGetPool(): string[] {
  return unique(
    legalD1Candidates(A_SEED)
      .map((c) => c.utterance)
      .filter(isOrdinaryGet),
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

function toW1Items(
  matched: Array<{ ordinary: string; protocol: string }>,
  seed: number,
): { items: WireItem[]; pairs: WirePair[]; meanTokens: { ordinary: number; protocol: number }; maxLengthGap: number } {
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

export function languages(): Language[] {
  const out: Language[] = [L0];
  let lang = L0;
  while (true) {
    const step = nextGrow(lang);
    if (!step) break;
    lang = step.evolve.language;
    out.push(lang);
  }
  return out;
}

function evolvedRows(lang: Language): Array<{ utterance: string; group: string }> {
  const rows: Array<{ utterance: string; group: string }> = [];
  const seen = new Set<string>();
  for (const c of lang.customer) {
    for (const u of realizations(seedFor(c), lang)) {
      if (!isEvolvedGet(u, lang) || seen.has(u)) continue;
      seen.add(u);
      rows.push({ utterance: u, group: c });
    }
  }
  return rows;
}

export function buildEvolvedCorpus(lang: Language, seed = CORPUS_SEED): ContrastCorpus {
  const matched = exactLengthPairs(ordinaryGetPool(), evolvedRows(lang), PAIR_COUNT);
  if (matched.length < PAIR_COUNT) {
    throw new Error(`need ${PAIR_COUNT} exact-length A/C pairs, got ${matched.length}`);
  }
  return { contrast: 'v3', language: lang, ...toW1Items(matched, seed) };
}

export function buildStaticCorpus(seed = CORPUS_SEED): ContrastCorpus {
  const w1 = buildCorpus(seed);
  return {
    contrast: 'p7',
    language: null,
    items: w1.items,
    pairs: w1.pairs,
    meanTokens: { ordinary: w1.meanTokens.ordinary, protocol: w1.meanTokens.p7 },
    maxLengthGap: w1.maxLengthGap,
  };
}

export function cheatV3(utterance: string, lang: Language): 'ordinary' | 'p7' {
  return isEvolvedGet(utterance, lang) ? 'p7' : 'ordinary';
}

export function surfaceScores(corpus: ContrastCorpus): {
  cheat: number;
  length: number;
  bayes: number;
  top: Array<{ word: string; tilt: number }>;
} {
  const cheatFn =
    corpus.contrast === 'p7'
      ? cheatDetect
      : (u: string) => cheatV3(u, corpus.language ?? L0);
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

export function longitudinal(): Array<{ n: number; language: Language; corpus: ContrastCorpus; scores: ReturnType<typeof surfaceScores> }> {
  return languages().map((language, n) => {
    const corpus = buildEvolvedCorpus(language, CORPUS_SEED + n);
    return { n, language, corpus, scores: surfaceScores(corpus) };
  });
}

