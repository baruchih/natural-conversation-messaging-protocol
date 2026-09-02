/**
 * C5-P ordered-pair hints. Do not retune pairs or slots after the score.
 *   npm run test:v4-c5p
 */
import {
  FINISH_BASE,
  FINISH_PAIR,
  FINISH_SLOTS,
  START_BASE,
  START_PAIR,
  START_SLOTS,
  U_FINISH_C5P,
  U_START_C5P,
  eligiblePairs,
  enumerate,
  hasOrderedPair,
  isFinishC5P,
  isStartC5P,
  steer,
} from './c5p.ts';
import { U_PROBE } from './c2e.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(JSON.stringify(eligiblePairs(U_PROBE)) === JSON.stringify([
  ['thinking', 'saturday'],
  ['thinking', 'morning'],
  ['saturday', 'morning'],
]), 'probe pairs are first-seen combinations');
assert(START_PAIR !== null && START_PAIR[0] === 'saturday' && START_PAIR[1] === 'morning', 'declared START pair');
assert(FINISH_PAIR !== null && FINISH_PAIR[0] === 'sounds' && FINISH_PAIR[1] === 'bring', 'declared FINISH pair');

assert(hasOrderedPair('Saturday works for a morning walk.', START_PAIR), 'order anywhere');
assert(!hasOrderedPair('Morning on Saturday works.', START_PAIR), 'reverse is not the pair');
assert(hasOrderedPair('Saturday morning.', START_PAIR), 'adjacency is allowed');

const start = steer(START_SLOTS, isStartC5P, (u) => hasOrderedPair(u, START_PAIR));
assert(enumerate(START_SLOTS)[0] === START_BASE, 'first START is the declared base');
assert(start.n === 64 && start.hinted === 64, 'all START keep saturday before morning');
assert(start.hits === 1 && start.hit === U_START_C5P, 'declared START hit');
assert(isStartC5P(U_START_C5P), 'hit is START');
assert(!U_START_C5P.toLowerCase().includes('umbrella'), 'no bootstrap word');

const finish = steer(FINISH_SLOTS, isFinishC5P, (u) => hasOrderedPair(u, FINISH_PAIR));
assert(enumerate(FINISH_SLOTS)[0] === FINISH_BASE, 'first FINISH is the declared base');
assert(finish.hits === 1 && finish.hit === U_FINISH_C5P, 'declared FINISH hit');
assert(isFinishC5P(U_FINISH_C5P), 'hit is FINISH');
assert(!U_FINISH_C5P.toLowerCase().includes('umbrella'), 'no bootstrap word');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5-P ordered-pair hints ok');
