/**
 * NCMP-P7-W1. Surface distinguishability, not secrecy of N.
 * Corpus first. Detectors do not receive the P7 grammar.
 */
import { wellFormed } from './p7c6.ts';
import { tokenList } from './p7c6.lm.ts';
import { decodeD, legalD1Candidates } from './p7d1.ts';
import { decodeE2, legalE2Candidates, matchingConstructions } from './p7e2.ts';

export type WireLabel = 'ordinary' | 'p7';

export interface WireItem {
  id: string;
  utterance: string;
  label: WireLabel;
  tokens: number;
}

export interface BlindItem {
  id: string;
  utterance: string;
}

export interface WirePair {
  id: string;
  a: string;
  b: string;
  p7On: 'a' | 'b';
}

const A_SEED = 'Did we find the restaurant was good but service was slow?';

const B_SEEDS = [
  'Did we find the restaurant was good but service was slow for that party?',
  'Did we find the restaurant was good but service was slow for whoever held it?',
  'Did we find the restaurant was good but service was slow for their account holder?',
  'Did we find the restaurant was good but service was slow for those folks?',
  'Did we find the restaurant was good but service was slow for anyone seated?',
  'Did we find the restaurant was good but service was slow for the account holder?',
];

const PAIR_COUNT = 32;

function isOrdinaryGet(u: string): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeE2(u) === 'NONE';
}

function isP7Get(u: string): boolean {
  return wellFormed(u) && decodeD(u) === 'GET' && decodeE2(u) !== 'NONE';
}

function unique(utterances: string[]): string[] {
  return [...new Set(utterances.map((u) => u.trim()))];
}

function ordinaryPool(): string[] {
  return unique(
    legalD1Candidates(A_SEED)
      .map((c) => c.utterance)
      .filter(isOrdinaryGet),
  );
}

function p7Pool(): string[] {
  const out: string[] = [];
  for (const seed of B_SEEDS) {
    for (const c of legalE2Candidates(seed)) {
      if (isP7Get(c.utterance)) out.push(c.utterance);
    }
  }
  return unique(out);
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

function exactLengthPairs(ordinary: string[], p7: string[], n: number): Array<{ ordinary: string; p7: string }> {
  const o = byTokenLength(ordinary);
  const p = byTokenLength(p7);
  const buckets: Array<{ ordinary: string; p7: string; e: string }> = [];
  for (const len of [...o.keys()].sort((a, b) => a - b)) {
    const as = o.get(len) ?? [];
    const bs = p.get(len) ?? [];
    const take = Math.min(as.length, bs.length);
    for (let i = 0; i < take; i++) {
      buckets.push({
        ordinary: as[i],
        p7: bs[i],
        e: matchingConstructions(bs[i])
          .map((c) => c.id)
          .sort()
          .join('+'),
      });
    }
  }
  const groups = new Map<string, Array<{ ordinary: string; p7: string }>>();
  for (const row of buckets) {
    const arr = groups.get(row.e) ?? [];
    arr.push({ ordinary: row.ordinary, p7: row.p7 });
    groups.set(row.e, arr);
  }
  const keys = [...groups.keys()].sort();
  const picked: Array<{ ordinary: string; p7: string }> = [];
  let i = 0;
  while (picked.length < n && keys.some((k) => (groups.get(k)?.length ?? 0) > 0)) {
    const arr = groups.get(keys[i % keys.length]) ?? [];
    const next = arr.shift();
    if (next) picked.push(next);
    i += 1;
  }
  return picked;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildCorpus(seed = 20260831): {
  items: WireItem[];
  pairs: WirePair[];
  blindItems: BlindItem[];
  meanTokens: { ordinary: number; p7: number };
  maxLengthGap: number;
} {
  const matched = exactLengthPairs(ordinaryPool(), p7Pool(), PAIR_COUNT);
  if (matched.length < PAIR_COUNT) {
    throw new Error(`need ${PAIR_COUNT} exact-length pairs, got ${matched.length}`);
  }
  const rand = mulberry32(seed);
  const items: WireItem[] = [];
  const pairs: WirePair[] = [];
  matched.forEach((m, i) => {
    items.push({ id: `O${i}`, utterance: m.ordinary, label: 'ordinary', tokens: tokenList(m.ordinary).length });
    items.push({ id: `P${i}`, utterance: m.p7, label: 'p7', tokens: tokenList(m.p7).length });
    const p7On = rand() < 0.5 ? 'a' : 'b';
    pairs.push({
      id: `pair-${i}`,
      a: p7On === 'a' ? m.p7 : m.ordinary,
      b: p7On === 'a' ? m.ordinary : m.p7,
      p7On,
    });
  });
  const ordinary = items.filter((x) => x.label === 'ordinary');
  const p7 = items.filter((x) => x.label === 'p7');
  const mean = (xs: WireItem[]) => xs.reduce((s, x) => s + x.tokens, 0) / xs.length;
  const gaps = matched.map((m) => Math.abs(tokenList(m.ordinary).length - tokenList(m.p7).length));
  return {
    items,
    pairs,
    blindItems: shuffle(
      items.map(({ id, utterance }) => ({ id, utterance })),
      rand,
    ),
    meanTokens: { ordinary: mean(ordinary), p7: mean(p7) },
    maxLengthGap: Math.max(...gaps),
  };
}

export function cheatDetect(utterance: string): WireLabel {
  return isP7Get(utterance) ? 'p7' : 'ordinary';
}

export function lengthDetect(utterance: string, threshold: number): WireLabel {
  return tokenList(utterance).length > threshold ? 'p7' : 'ordinary';
}

export interface BayesModel {
  logPrior: Record<WireLabel, number>;
  logLik: Record<WireLabel, Map<string, number>>;
  vocab: string[];
}

export function trainBayes(train: WireItem[]): BayesModel {
  const labels: WireLabel[] = ['ordinary', 'p7'];
  const counts: Record<WireLabel, Map<string, number>> = {
    ordinary: new Map(),
    p7: new Map(),
  };
  const docs: Record<WireLabel, number> = { ordinary: 0, p7: 0 };
  const vocab = new Set<string>();
  for (const item of train) {
    docs[item.label] += 1;
    for (const t of tokenList(item.utterance)) {
      vocab.add(t);
      counts[item.label].set(t, (counts[item.label].get(t) ?? 0) + 1);
    }
  }
  const V = vocab.size;
  const logPrior = {
    ordinary: Math.log(docs.ordinary / train.length),
    p7: Math.log(docs.p7 / train.length),
  };
  const logLik: BayesModel['logLik'] = { ordinary: new Map(), p7: new Map() };
  for (const lab of labels) {
    let total = 0;
    for (const n of counts[lab].values()) total += n;
    for (const w of vocab) {
      logLik[lab].set(w, Math.log(((counts[lab].get(w) ?? 0) + 1) / (total + V)));
    }
  }
  return { logPrior, logLik, vocab: [...vocab] };
}

export function predictBayes(model: BayesModel, utterance: string): WireLabel {
  const tokens = tokenList(utterance);
  let best: WireLabel = 'ordinary';
  let bestScore = -Infinity;
  for (const lab of ['ordinary', 'p7'] as WireLabel[]) {
    let s = model.logPrior[lab];
    for (const t of tokens) {
      const lik = model.logLik[lab].get(t);
      if (lik !== undefined) s += lik;
    }
    if (s > bestScore) {
      bestScore = s;
      best = lab;
    }
  }
  return best;
}

export function bayesTopFeatures(model: BayesModel, take = 8): Array<{ word: string; tilt: number }> {
  return model.vocab
    .map((word) => ({
      word,
      tilt: (model.logLik.p7.get(word) ?? 0) - (model.logLik.ordinary.get(word) ?? 0),
    }))
    .sort((a, b) => Math.abs(b.tilt) - Math.abs(a.tilt))
    .slice(0, take);
}

export function folds<T>(items: T[], k = 4): Array<{ train: T[]; test: T[] }> {
  return Array.from({ length: k }, (_, i) => ({
    train: items.filter((_, j) => j % k !== i),
    test: items.filter((_, j) => j % k === i),
  }));
}

export function accuracy(truth: WireLabel[], pred: WireLabel[]): number {
  if (truth.length === 0) return 0;
  let ok = 0;
  for (let i = 0; i < truth.length; i++) if (truth[i] === pred[i]) ok += 1;
  return ok / truth.length;
}
