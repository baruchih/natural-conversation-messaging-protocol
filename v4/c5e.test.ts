/**
 * C5-E word extractor. Do not retune STOP, MIN_LEN, or slots after the score.
 *   npm run test:v4-c5e
 */
import {
  FINISH_BASE,
  FINISH_HINT,
  FINISH_SLOTS,
  START_BASE,
  START_HINT,
  START_SLOTS,
  U_FINISH_C5E,
  U_PROBE,
  eligibleWords,
  enumerate,
  hasWord,
  isFinishC5E,
  isStartC5E,
  steer,
  words,
} from './c5e.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(words(U_PROBE).includes('morning'), 'word runs split morning');
assert(!words(U_PROBE).includes('morningwhat'), 'glue token is gone');
assert(eligibleWords(U_PROBE).includes('morning'), 'morning is eligible');
assert(!eligibleWords(U_PROBE).includes('could'), 'could is STOP');
assert(START_HINT === 'thinking', 'declared START hint');
assert(FINISH_HINT === 'sounds', 'declared FINISH hint');

const start = steer(START_SLOTS, isStartC5E, (u) => START_HINT !== null && hasWord(u, START_HINT));
assert(enumerate(START_SLOTS)[0] === START_BASE, 'first START is the declared base');
assert(start.n === 64 && start.hinted === 64, 'all START keep thinking');
assert(start.hits === 0 && start.hit === null, 'START residual miss is frozen');
assert(!START_BASE.toLowerCase().includes('umbrella'), 'no bootstrap word');

const finish = steer(FINISH_SLOTS, isFinishC5E, (u) => FINISH_HINT !== null && hasWord(u, FINISH_HINT));
assert(enumerate(FINISH_SLOTS)[0] === FINISH_BASE, 'first FINISH is the declared base');
assert(finish.hits === 1 && finish.hit === U_FINISH_C5E, 'declared FINISH hit');
assert(isFinishC5E(U_FINISH_C5E), 'hit is FINISH');
assert(!U_FINISH_C5E.toLowerCase().includes('umbrella'), 'no bootstrap word');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5-E word extractor ok');
