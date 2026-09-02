/**
 * P7-W1: blinded corpus + grammar-free detectors.
 *   npm run test:w1
 */
import { decodeD } from './p7d1.ts';
import { decodeE2 } from './p7e2.ts';
import {
  accuracy,
  bayesTopFeatures,
  buildCorpus,
  cheatDetect,
  folds,
  lengthDetect,
  predictBayes,
  trainBayes,
} from './p7w1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const corpus = buildCorpus();
const ordinary = corpus.items.filter((x) => x.label === 'ordinary');
const p7 = corpus.items.filter((x) => x.label === 'p7');

console.log('P7-W1  surface distinguishability  (corpus first, no grammar in detectors)\n');
console.log(`items ${corpus.items.length}  pairs ${corpus.pairs.length}`);
console.log(
  `mean tokens  ordinary ${corpus.meanTokens.ordinary.toFixed(1)}  p7 ${corpus.meanTokens.p7.toFixed(1)}  max gap ${corpus.maxLengthGap}`,
);

assert(ordinary.length === 32 && p7.length === 32, 'balanced 32/32');
assert(corpus.pairs.length === 32, '32 pairs');
assert(corpus.blindItems.length === 64, 'blind list');
assert(corpus.blindItems.every((b) => !('label' in b)), 'blind items have no label field');
assert(Math.abs(corpus.meanTokens.ordinary - corpus.meanTokens.p7) < 0.01, 'exact length match');
assert(corpus.maxLengthGap === 0, 'every pair has the same token count');

for (const o of ordinary) {
  assert(decodeD(o.utterance) === 'GET', `ordinary D ${o.utterance}`);
  assert(decodeE2(o.utterance) === 'NONE', `ordinary E ${o.utterance}`);
}
for (const p of p7) {
  assert(decodeD(p.utterance) === 'GET', `p7 D ${p.utterance}`);
  assert(decodeE2(p.utterance) !== 'NONE', `p7 E ${p.utterance}`);
}

const cheat = corpus.items.map((x) => cheatDetect(x.utterance));
const cheatAcc = accuracy(
  corpus.items.map((x) => x.label),
  cheat,
);
assert(cheatAcc === 1, 'cheat δ is 1.0 by construction');

const mid = (corpus.meanTokens.ordinary + corpus.meanTokens.p7) / 2;
const lenPred = corpus.items.map((x) => lengthDetect(x.utterance, mid));
const lenAcc = accuracy(
  corpus.items.map((x) => x.label),
  lenPred,
);

let bayesOk = 0;
let bayesN = 0;
const featureVotes = new Map<string, number>();
for (const fold of folds(corpus.items, 4)) {
  const model = trainBayes(fold.train);
  const pred = fold.test.map((x) => predictBayes(model, x.utterance));
  const truth = fold.test.map((x) => x.label);
  bayesOk += pred.filter((p, i) => p === truth[i]).length;
  bayesN += truth.length;
  for (const f of bayesTopFeatures(model, 6)) {
    featureVotes.set(f.word, (featureVotes.get(f.word) ?? 0) + f.tilt);
  }
}
const bayesAcc = bayesOk / bayesN;
const top = [...featureVotes.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8);

console.log(`cheat δ        ${cheatAcc.toFixed(2)}  (sanity: corpus labels ≡ P7 GET+E)`);
console.log(`length only    ${lenAcc.toFixed(2)}  (control)`);
console.log(`naive Bayes    ${bayesAcc.toFixed(2)}  (4-fold, unigrams, no grammar)`);
console.log(`top NB words   ${top.map(([w, t]) => `${w}(${t > 0 ? '+' : '−'})`).join(' ')}`);
console.log('\nblind sample (no labels):');
for (const b of corpus.blindItems.slice(0, 6)) {
  console.log(`  ${b.id}  ${b.utterance}`);
}

assert(lenAcc < 0.6, 'length-only should not be a strong detector');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-W1: corpus is blinded and length-matched; δ is not given to the surface detectors');
