/**
 * V3-W3: W1/W2 observers on frozen H2 harvest. Corpus first.
 *   npm run test:v3-w3
 */
import { decodeD } from '../v1-v2/p7d1.ts';
import { decodeE as decodeHarvest, L0 } from './h1.ts';
import {
  FROZEN_L10,
  buildEvolvedCorpus,
  buildHarvestCorpus,
  buildStaticCorpus,
  harvestLanguages,
  l4Closure,
  longitudinalHarvest,
  scoreHarvest,
  surfaceScores,
} from './w3.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const snaps = harvestLanguages();
const L10 = snaps[snaps.length - 1].language;
assert(L10.customer.join('|') === [...FROZEN_L10].join('|'), 'L10 is the frozen H2 table');

const ab = buildStaticCorpus();
const ac = buildEvolvedCorpus(l4Closure());
const ad = buildHarvestCorpus(L10);
const abS = surfaceScores(ab);
const acS = surfaceScores(ac);
const adS = scoreHarvest(ad);
const long = longitudinalHarvest();

console.log('V3-W3  harvested terminals vs W1/W2  (corpus first, H2 frozen)\n');

function report(name: string, corpus: typeof ab, s: { cheat: number; length: number; bayes: number; top: Array<{ word: string; tilt: number }> }): void {
  console.log(name);
  console.log(`  items ${corpus.items.length}  pairs ${corpus.pairs.length}`);
  console.log(
    `  mean tokens  ordinary ${corpus.meanTokens.ordinary.toFixed(1)}  protocol ${corpus.meanTokens.protocol.toFixed(1)}  max gap ${corpus.maxLengthGap}`,
  );
  console.log(`  cheat δ        ${s.cheat.toFixed(2)}`);
  console.log(`  length only    ${s.length.toFixed(2)}`);
  console.log(`  naive Bayes    ${s.bayes.toFixed(2)}`);
  console.log(`  top NB words   ${s.top.map((t) => `${t.word}(${t.tilt > 0 ? '+' : '−'})`).join(' ')}`);
}

report('A vs B  static P7 (W1)', ab, abS);
console.log('');
report('A vs C  L4 evolved (W2)', ac, acS);
console.log('');
report(`A vs D  H2 L10 { ${L10.customer.join(', ')} }`, ad, adS);

console.log('\nD by language');
console.log('n   |L|  NB    length');
for (const row of long) {
  console.log(
    `${String(row.n).padEnd(4)}${String(row.language.customer.length).padEnd(5)}${row.scores.bayes.toFixed(2)}  ${row.scores.length.toFixed(2)}`,
  );
}

assert(ab.maxLengthGap === 0 && ac.maxLengthGap === 0 && ad.maxLengthGap === 0, 'exact length match');
assert(abS.cheat === 1 && acS.cheat === 1 && adS.cheat === 1, 'cheat δ is 1.0');
assert(abS.length < 0.6 && acS.length < 0.6 && adS.length < 0.6, 'length-only is not a strong detector');
assert(ab.items.filter((x) => x.label === 'ordinary').length === 32, 'A/B balanced');
assert(ad.items.filter((x) => x.label === 'p7').length === 32, 'A/D 32 protocol');

for (const p of ad.items.filter((x) => x.label === 'p7')) {
  assert(decodeD(p.utterance) === 'GET', 'D is GET');
  assert(decodeHarvest(p.utterance, L10) === 'CUSTOMER', 'D is harvest CUSTOMER');
}
for (const o of ad.items.filter((x) => x.label === 'ordinary')) {
  assert(decodeHarvest(o.utterance, L10) === 'NONE', 'A is not harvest CUSTOMER');
}
assert(decodeHarvest('The sunset was beautiful last night after dinner.', L10) === 'NONE', 'appearance still not membership');
assert(snaps[0].language.digest === L0.digest, 'slice starts at L0');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-W3: H2 table frozen; D was not fitted to the observers');
