/**
 * V3-W4: conversation-level distinguishability after HK2.
 *   npm run test:v3-w4
 */
import { parseConversation } from './w4.ts';
import {
  buildContrast,
  cheatConversation,
  isHk2Conversation,
  surfaceScores,
  type Contrast,
} from './w4.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-W4  conversation-level distinguishability  (corpus first)\n');

function report(name: string, contrast: Contrast): ReturnType<typeof surfaceScores> {
  const corpus = buildContrast(contrast);
  const s = surfaceScores(corpus);
  console.log(name);
  console.log(`  items ${corpus.items.length}  pairs ${corpus.pairs.length}`);
  console.log(
    `  mean tokens  ordinary ${corpus.meanTokens.ordinary.toFixed(1)}  protocol ${corpus.meanTokens.protocol.toFixed(1)}  max gap ${corpus.maxLengthGap}`,
  );
  console.log(`  cheat δ        ${s.cheat.toFixed(2)}`);
  console.log(`  length only    ${s.length.toFixed(2)}`);
  console.log(`  naive Bayes    ${s.bayes.toFixed(2)}`);
  console.log(`  top NB words   ${s.top.map((t) => `${t.word}(${t.tilt > 0 ? '+' : '−'})`).join(' ')}`);

  assert(corpus.pairs.length === 32, `${contrast} has 32 pairs`);
  assert(corpus.maxLengthGap === 0, `${contrast} exact conversation length match`);
  assert(s.cheat === 1, `${contrast} cheat δ is 1.0`);
  assert(s.length < 0.6, `${contrast} length-only is not a strong detector`);

  for (const item of corpus.items) {
    const turns = parseConversation(item.utterance);
    assert(turns.length === 4, `${contrast} ${item.id} is four turns`);
    const pred = cheatConversation(item.utterance, contrast, corpus.language ?? undefined);
    assert(pred === item.label, `${contrast} ${item.id} cheat agrees with label`);
  }
  return s;
}

const b = report('A vs B  static P7 conversation', 'B');
console.log('');
const c = report('A vs C  L4 evolved conversation', 'C');
console.log('');
const d = report('A vs D  H2/W3 harvest conversation', 'D');
console.log('');
const e = report('A vs E  HK2 rolling conversation', 'E');

const eCorpus = buildContrast('E');
for (const item of eCorpus.items.filter((x) => x.label === 'p7')) {
  assert(isHk2Conversation(parseConversation(item.utterance)), 'E protocol is HK2');
  assert(!item.utterance.toLowerCase().includes('find sunset'), 'E is not find-sunset');
}
for (const item of eCorpus.items.filter((x) => x.label === 'ordinary')) {
  assert(!isHk2Conversation(parseConversation(item.utterance)), 'A is not HK2');
}

assert(b.bayes === 1 && c.bayes === 1 && d.bayes === 1, 'B/C/D reproduce unigram separation');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-W4: unit is the conversation; E was not fitted to the observers');
