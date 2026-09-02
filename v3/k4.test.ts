/**
 * V3-K4: overlapping windows, alternating closers, shared clock.
 *   npm run test:v3-k4
 */
import { singletonN } from './k1.ts';
import { windowN } from './k2.ts';
import {
  A1,
  A_SEED,
  B1,
  B_TURN_SEED,
  FRAME_DELAY,
  Peer,
  TARGETS,
  WINDOW_PROFILE,
  decodeFrames,
  run,
} from './k4.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-K4  rolling windows  (conversation is the clock)\n');

assert(WINDOW_PROFILE.width === 3 && WINDOW_PROFILE.stride === 1, 'profile 3/1');
assert(FRAME_DELAY === 2, 'first frame after two primes');

const { turns, frames } = run();
assert(turns.length === 6, 'A1 B1 A2 B2 A3 B3');
assert(frames.length === 4, 'F1…F4');
assert(frames.every((f, i) => f === TARGETS[i]), `frames ${frames.join(',')} = ${TARGETS.join(',')}`);

console.log('turn  speaker  N     role');
const names = ['A1', 'B1', 'A2', 'B2', 'A3', 'B3'];
for (let i = 0; i < turns.length; i++) {
  const role = i < FRAME_DELAY ? 'prime' : `closes F${i - 1} = ${frames[i - FRAME_DELAY]}`;
  console.log(`${String(i + 1).padEnd(6)}${names[i].padEnd(9)}${String(singletonN(turns[i])).padEnd(6)}${role}`);
}

const A = new Peer();
const B = new Peer();
const seenA: number[] = [];
const seenB: number[] = [];

const a2 = A.close(TARGETS[0], A_SEED);
assert(a2.frame === TARGETS[0], 'A closes W1');
const f1b = B.decodeIncoming(a2.utterance);
assert(f1b === TARGETS[0], 'B decodes F1');
seenA.push(a2.frame);
seenB.push(f1b!);

const b2 = B.close(TARGETS[1], B_TURN_SEED);
assert(b2.frame === TARGETS[1], 'B closes W2');
const f2a = A.decodeIncoming(b2.utterance);
assert(f2a === TARGETS[1], 'A decodes F2');
seenA.push(f2a!);
seenB.push(b2.frame);

const a3 = A.close(TARGETS[2], A_SEED);
assert(a3.frame === TARGETS[2], 'A closes W3');
const f3b = B.decodeIncoming(a3.utterance);
assert(f3b === TARGETS[2], 'B decodes F3');

const b3 = B.close(TARGETS[3], B_TURN_SEED);
assert(b3.frame === TARGETS[3], 'B closes W4');
const f4a = A.decodeIncoming(b3.utterance);
assert(f4a === TARGETS[3], 'A decodes F4');

assert(A.turns.join('\n') === B.turns.join('\n'), 'shared transcript');
assert(decodeFrames(A.turns).join(',') === TARGETS.join(','), 'decoder is the accepted sequence');

const w2 = windowN(turns[1], turns[2], turns[3]);
const w3 = windowN(turns[2], turns[3], turns[4]);
assert(w2 === TARGETS[1] && w3 === TARGETS[2], 'B2 closes W2 and seeds W3');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log(`\nA1=${A1.slice(0, 40)}…`);
console.log(`B1=${B1.slice(0, 40)}…`);
console.log('\nV3-K4: one frame per turn after warm-up; closer alternates');
