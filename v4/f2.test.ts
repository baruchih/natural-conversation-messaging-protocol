/**
 * V4-F2: Result #2, PASS, frozen.
 * K4 observations inside an F1 frame. START/FINISH are not windows.
 *   npm run test:v4-f2
 */
import { TARGETS } from '../v3/k4.ts';
import {
  BODY_LENGTHS,
  FINISH_EXAMPLE,
  K4_TARGETS,
  START_EXAMPLE,
  accumulate,
  expectedObservations,
  k4Body,
  runFramed,
} from './f2.ts';
import { isFinish, isStart } from './f1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(K4_TARGETS.join(',') === TARGETS.join(','), 'K4 targets untouched');
assert(expectedObservations(1) === 0, '1 → 0');
assert(expectedObservations(2) === 0, '2 → 0');
assert(expectedObservations(3) === 1, '3 → 1');
assert(expectedObservations(4) === 2, '4 → 2');
assert(expectedObservations(6) === 4, '6 → 4');
assert(expectedObservations(9) === 7, '9 → 7');

console.log('V4-F2  K4 inside F1 body\n');
console.log('body  obs  accumulator');

for (const n of BODY_LENGTHS) {
  const { body, frameBody, accumulator } = runFramed(n);
  assert(body.length === n, `${n} body built`);
  assert(frameBody.length === n, `${n} frame body`);
  assert(body.every((u) => !isStart(u) && !isFinish(u)), `${n} body has no control`);
  assert(accumulator.length === expectedObservations(n), `${n} observation count`);
  assert(accumulate(frameBody).join(',') === accumulator.join(','), `${n} body-only decode`);

  const withFinish = accumulate([...frameBody, FINISH_EXAMPLE]);
  const withStart = accumulate([START_EXAMPLE, ...frameBody]);
  if (n >= 2) {
    assert(withFinish.length === accumulator.length + 1, `${n} FINISH must not be in the accumulator`);
    assert(withStart.length === accumulator.length + 1, `${n} START must not be in the accumulator`);
  }
  assert(accumulate(frameBody).join(',') !== withFinish.join(',') || n < 2, `${n} FINISH would change payload`);

  if (n === 6) {
    assert(accumulator.join(',') === '42,17,63,5', 'six-turn body is frozen K4');
  }
  console.log(`${String(n).padEnd(5)}${String(accumulator.length).padEnd(5)}${accumulator.join(',') || '—'}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F2: observations = max(0, body − width + 1)');
