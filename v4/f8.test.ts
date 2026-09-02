/**
 * V4-F8: Result #8, PASS, frozen.
 *   npm run test:v4-f8
 */
import {
  BODY_20,
  FINISH_EXAMPLE,
  Participant,
  START_EXAMPLE,
  countMode,
  formatSchedule,
  handshake,
  interpret,
  runFrame,
  runsOf,
  scheduleOf,
} from './f8.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(BODY_20.length === 20, 'twenty declared turns');

const left = new Participant('A');
const right = new Participant('B');
handshake(left, right);
const frame = runFrame(left, right, BODY_20);
const a = interpret(frame.body);
const b = interpret(right.completed[0].body);

assert(frame.body.length === 20, 'F1 body is the declared 20');
assert(!frame.body.includes(START_EXAMPLE) && !frame.body.includes(FINISH_EXAMPLE), 'delimiters outside');
assert(scheduleOf(a.steps).join(',') === scheduleOf(b.steps).join(','), 'A schedule == B schedule');
assert(a.bits === b.bits, 'A and B recover the same DATA bits');
assert(a.steps[0].mode === 'SKIP', 'first body turn is SKIP');

const modes = scheduleOf(a.steps);
const data = countMode(a.steps, 'DATA');
const skip = countMode(a.steps, 'SKIP');
assert(data + skip === 20, 'every turn is DATA or SKIP');
assert(a.bits.length === data, 'one bit per DATA turn');

const runs = runsOf(modes);
console.log('V4-F8  F7 schedule on 20 frozen turns\n');
console.log(`schedule   ${formatSchedule(modes)}`);
console.log(`DATA       ${data}`);
console.log(`SKIP       ${skip}`);
console.log(`runs       ${runs.map((r) => `${r.mode[0]}${r.length}`).join(' ')}`);
console.log(`bits       ${a.bits || '—'}`);
console.log('turn  mode  V   bits  next');
for (const [i, s] of a.steps.entries()) {
  console.log(`${String(i + 1).padEnd(5)}${s.mode.padEnd(6)}${String(s.v).padEnd(4)}${(s.bits || '—').padEnd(6)}${s.next}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F8: A == B; distribution not optimized');
