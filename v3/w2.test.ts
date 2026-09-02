/**
 * V3-W2: W1 observers on static P7 vs the L4 closure.
 *   npm run test:v3-w2
 */
import { decodeD } from '../v1-v2/p7d1.ts';
import { decodeE2 } from '../v1-v2/p7e2.ts';
import { decodeE } from './l1.ts';
import {
  buildEvolvedCorpus,
  buildStaticCorpus,
  languages,
  longitudinal,
  surfaceScores,
} from './w2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const langs = languages();
const L3 = langs[langs.length - 1];
const ab = buildStaticCorpus();
const ac = buildEvolvedCorpus(L3);
const abS = surfaceScores(ab);
const acS = surfaceScores(ac);
const byLang = longitudinal();

console.log('V3-W2  surface distinguishability  (corpus first, W1 observers)\n');

function report(name: string, corpus: typeof ab, s: typeof abS): void {
  console.log(name);
  console.log(`  items ${corpus.items.length}  pairs ${corpus.pairs.length}`);
  console.log(
    `  mean tokens  ordinary ${corpus.meanTokens.ordinary.toFixed(1)}  protocol ${corpus.meanTokens.protocol.toFixed(1)}  max gap ${corpus.maxLengthGap}`,
  );
  console.log(`  cheat δ        ${s.cheat.toFixed(2)}`);
  console.log(`  length only    ${s.length.toFixed(2)}`);
  console.log(`  naive Bayes    ${s.bayes.toFixed(2)}  (4-fold, unigrams, no grammar)`);
  console.log(`  top NB words   ${s.top.map((t) => `${t.word}(${t.tilt > 0 ? '+' : '−'})`).join(' ')}`);
}

report('A vs B  static P7 (W1)', ab, abS);
console.log('');
report(`A vs C  evolved L${langs.length - 1} { ${L3.customer.join(', ')} }`, ac, acS);

console.log('\nby language (same pairing, growing L)');
console.log('n   L                                         NB    length');
for (const row of byLang) {
  const lex = `{ ${row.language.customer.join(', ')} }`;
  console.log(
    `${String(row.n).padEnd(4)}${lex.padEnd(42)} ${row.scores.bayes.toFixed(2)}  ${row.scores.length.toFixed(2)}`,
  );
}

const ordinaryC = ac.items.filter((x) => x.label === 'ordinary');
const evolved = ac.items.filter((x) => x.label === 'p7');

assert(ab.items.filter((x) => x.label === 'ordinary').length === 32, 'A/B 32 ordinary');
assert(ab.items.filter((x) => x.label === 'p7').length === 32, 'A/B 32 P7');
assert(ordinaryC.length === 32 && evolved.length === 32, 'A/C 32/32');
assert(ab.maxLengthGap === 0 && ac.maxLengthGap === 0, 'exact length match');
assert(abS.cheat === 1 && acS.cheat === 1, 'cheat δ is 1.0 on both contrasts');
assert(abS.length < 0.6 && acS.length < 0.6, 'length-only is not a strong detector');

for (const o of ordinaryC) {
  assert(decodeD(o.utterance) === 'GET', 'ordinary D');
  assert(decodeE2(o.utterance) === 'NONE', 'ordinary not E2');
  assert(decodeE(o.utterance, L3) === 'NONE', 'ordinary not L3');
}
for (const p of evolved) {
  assert(decodeD(p.utterance) === 'GET', 'C D');
  assert(decodeE(p.utterance, L3) === 'CUSTOMER', 'C is CUSTOMER under L3');
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-W2: C is the L4 closure; detectors are W1’s; C was not fitted to them');
