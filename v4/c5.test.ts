/**
 * C5 handshake-derived hints. Do not retune eligibility after the score.
 *   npm run test:v4-c5
 */
import {
  FINISH_BASE,
  FINISH_HINT,
  FINISH_SLOTS,
  START_BASE,
  START_HINT,
  START_SLOTS,
  U_FINISH_C5,
  eligibleTokens,
  enumerate,
  hasHintWord,
  isFinishC5,
  isStartC5,
  steer,
} from './c5.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const probeEl = eligibleTokens(
  'Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!',
);
assert(probeEl.includes('morningwhat'), 'em-dash glues morningwhat under tokenize');
assert(!probeEl.includes('morning'), 'morning is not a separate eligible token');
assert(START_HINT === 'morningwhat', 'declared START hint');
assert(FINISH_HINT === 'sounds', 'declared FINISH hint');

const start = steer(START_SLOTS, isStartC5, (u) => START_HINT !== null && hasHintWord(u, START_HINT));
assert(enumerate(START_SLOTS)[0] === START_BASE, 'first START is the declared base');
assert(start.n === 64 && start.hinted === 0 && start.hits === 0, 'natural morning is not morningwhat');
assert(!isStartC5(START_BASE), 'ordinary morning START is not C5 START');

const finish = steer(FINISH_SLOTS, isFinishC5, (u) => FINISH_HINT !== null && hasHintWord(u, FINISH_HINT));
assert(enumerate(FINISH_SLOTS)[0] === FINISH_BASE, 'first FINISH is the declared base');
assert(finish.n === 64 && finish.hinted === 64, 'all FINISH keep sounds');
assert(finish.hits === 1, 'one FINISH residual hit');
assert(finish.hit === U_FINISH_C5, 'declared FINISH hit');
assert(isFinishC5(U_FINISH_C5), 'hit is FINISH');
assert(!U_FINISH_C5.toLowerCase().includes('umbrella'), 'no bootstrap word');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5 handshake hints ok');
