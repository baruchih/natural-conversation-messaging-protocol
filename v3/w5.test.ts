/**
 * V3-W5: paired LM conversation vs M1-modulated closer.
 *   npm run test:v3-w5
 */
import {
  FROZEN_PAIRS,
  PAIR_COUNT,
  buildCorpus,
  cheatConversation,
  contextsAreBlind,
  modulatedTurns,
  ordinaryTurns,
  renderConversation,
  surfaceScores,
} from './w5.ts';
import { ADJUNCTS } from './m1.ts';
import { TARGET, windowN } from './k2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(contextsAreBlind(), 'prompts have no protocol');
assert(FROZEN_PAIRS.length >= PAIR_COUNT, `at least ${PAIR_COUNT} frozen pairs`);
assert(ADJUNCTS.includes('for now') && ADJUNCTS.includes('in a quiet way'), 'M1 neighborhood is the frozen one');

const corpus = buildCorpus();
const s = surfaceScores(corpus);

console.log('V3-W5  paired LM vs M1 modulation  (corpus first)\n');
console.log(`  pairs ${corpus.pairs.length}  close-pairs ${corpus.closePairs.length}`);
console.log(
  `  mean tokens  ordinary ${corpus.meanTokens.ordinary.toFixed(1)}  protocol ${corpus.meanTokens.protocol.toFixed(1)}  max gap ${corpus.maxLengthGap}`,
);
console.log(`  cheat δ        ${s.cheat.toFixed(2)}`);
console.log(`  length only    ${s.length.toFixed(2)}`);
console.log(`  naive Bayes    ${s.bayes.toFixed(2)}`);
console.log(`  top NB words   ${s.top.map((t) => `${t.word}(${t.tilt > 0 ? '+' : '−'})`).join(' ')}`);

const depths = corpus.rows.map((r) => r.depth);
const jacs = corpus.rows.map((r) => r.jaccard);
console.log(
  `  mean depth ${(depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(2)}  mean jaccard ${(jacs.reduce((a, b) => a + b, 0) / jacs.length).toFixed(2)}`,
);

assert(corpus.pairs.length === PAIR_COUNT, '32 conversation pairs');
assert(s.cheat === 1, 'cheat δ is 1.0');
assert(corpus.rows.every((r) => r.u !== r.uPrime), 'every pair is a real modulation');
assert(
  corpus.rows.every((r) => windowN(...ordinaryTurns(r)) !== TARGET),
  'raw closer is not the window target',
);
assert(
  corpus.rows.every((r) => windowN(...modulatedTurns(r)) === TARGET),
  'modulated closer hits the window target',
);
for (const item of corpus.items) {
  assert(cheatConversation(item.utterance, corpus.rows) === item.label, `${item.id} cheat`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-W5: only the closer changed; the neighborhood is M1’s');
console.log(renderConversation(ordinaryTurns(corpus.rows[0])));
console.log('---');
console.log(renderConversation(modulatedTurns(corpus.rows[0])));
