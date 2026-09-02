/**
 * V4-F9: Result #9, PASS, frozen.
 *   npm run test:v4-f9
 */
import { FROZEN as F6 } from './f6.frozen.ts';
import { FROZEN } from './f9.frozen.ts';
import {
  BATCH,
  EXPECTED_BITS,
  EXPECTED_SCHEDULE,
  FINISH_EXAMPLE,
  INITIAL_MODE,
  INTENTS,
  MAP,
  MAP_NAME,
  Participant,
  START_EXAMPLE,
  TARGETS,
  encodeFromSets,
  handshake,
  interpret,
  runFrame,
  scoreSet,
  summarizeOffline,
  targetsOk,
} from './f9.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(MAP_NAME === 'half3', 'experimental map is half3');
assert(BATCH === 50, 'k = 50 stays frozen');
assert(targetsOk(), 'declared targets concatenate to 10110');
assert(TARGETS[0].mode === INITIAL_MODE, 'first body is SKIP');
assert(INTENTS.length === TARGETS.length, 'one intent per target');

for (let v = 0; v < 64; v++) {
  assert(MAP(v).next === (v < 32 ? 'DATA' : 'SKIP'), `F7 next_mode at V=${v}`);
}

const sets = F6.candidates;
assert(sets.length === 18, '18 frozen F6 sets');
const rows = sets.map(scoreSet);
const sum = summarizeOffline(sets);
assert(rows.every((r) => r.legal > 0), 'each set has legal turns');

console.log('V4-F9  half3 on frozen F6 sets\n');
console.log(`map              ${MAP_NAME}`);
console.log('reason           minimal lift from F7');
console.log('corpus           frozen F6, not used to build half3');
console.log(`k                ${BATCH}`);
console.log(`DATA 6/6         ${sum.dataFull}/${sum.n}`);
console.log(`DATA mean / 6    ${sum.dataMean.toFixed(2)}`);
console.log(`DATA min         ${sum.dataMin}`);
console.log(`SKIP 2/2         ${sum.skipFull}/${sum.n}`);

const encoded = encodeFromSets(FROZEN.candidates);
assert(FROZEN.result === 'JOINT', 'live result is JOINT');
assert(encoded.kind === 'ENCODED', 'frozen sets replay');
assert(encoded.kind === 'ENCODED' && encoded.bits === EXPECTED_BITS, 'replay bits 10110');

const body = FROZEN.turns.map((t) => t.utterance);
const left = new Participant('A');
const right = new Participant('B');
handshake(left, right);
const frame = runFrame(left, right, body);
assert(!frame.body.includes(START_EXAMPLE) && !frame.body.includes(FINISH_EXAMPLE), 'delimiters outside');
const a = interpret(frame.body);
const b = interpret(right.completed[0].body);
assert(a.bits === b.bits && a.bits === EXPECTED_BITS, 'A == B bits 10110');
assert(
  a.steps.map((s) => s.mode).join(',') === EXPECTED_SCHEDULE.join(','),
  'schedule S D S D D',
);

console.log(`\nlive              ${FROZEN.result}`);
console.log(`schedule          ${a.steps.map((s) => s.mode[0]).join(' ')}`);
console.log(`bits              ${a.bits}`);
console.log('turn  mode  V   bits  next');
for (const [i, s] of a.steps.entries()) {
  console.log(`${String(i + 1).padEnd(5)}${s.mode.padEnd(6)}${String(s.v).padEnd(4)}${(s.bits || '—').padEnd(6)}${s.next}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F9: schedule and bits from accepted turns plus initial state');
