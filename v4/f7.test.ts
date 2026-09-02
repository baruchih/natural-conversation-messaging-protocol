/**
 * V4-F7: Result #7, PASS, frozen.
 * Next-mode is conversational state. Same U, different payload.
 *   npm run test:v4-f7
 */
import { carrier } from '../v3/coding.ts';
import {
  DINNER_BODY,
  FINISH_EXAMPLE,
  INITIAL_MODE,
  Participant,
  START_EXAMPLE,
  U_NEXT_DATA,
  U_NEXT_SKIP,
  U_SHARED,
  dataBit,
  handshake,
  interpret,
  nextMode,
  runFrame,
  step,
} from './f7.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(INITIAL_MODE === 'SKIP', 'first body turn is SKIP');
assert(carrier(U_NEXT_DATA) < 32 && nextMode(carrier(U_NEXT_DATA)) === 'DATA', 'U_NEXT_DATA');
assert(carrier(U_NEXT_SKIP) >= 32 && nextMode(carrier(U_NEXT_SKIP)) === 'SKIP', 'U_NEXT_SKIP');
assert(step('SKIP', U_SHARED).bits === '', 'same U under SKIP contributes nothing');
assert(step('DATA', U_SHARED).bits === dataBit(carrier(U_SHARED)), 'same U under DATA contributes a bit');
assert(step('SKIP', U_SHARED).bits !== step('DATA', U_SHARED).bits, 'mode, not U, decides payload');

const armed = interpret([U_NEXT_DATA, U_SHARED]);
const quiet = interpret([U_NEXT_SKIP, U_SHARED]);
assert(armed.steps[0].mode === 'SKIP' && armed.steps[0].bits === '', 'arming turn is SKIP');
assert(armed.steps[1].mode === 'DATA' && armed.bits === dataBit(carrier(U_SHARED)), 'armed shared U is DATA');
assert(quiet.steps[1].mode === 'SKIP' && quiet.bits === '', 'quiet shared U is SKIP');
assert(armed.bits !== quiet.bits, 'same second turn, different payload');

const left = new Participant('A');
const right = new Participant('B');
handshake(left, right);
const body = [U_NEXT_DATA, U_SHARED, DINNER_BODY[6], U_NEXT_SKIP, DINNER_BODY[2]];
const frame = runFrame(left, right, body);
const a = interpret(frame.body);
const b = interpret(right.completed[0].body);
assert(a.bits === b.bits, 'A and B recover the same bits');
assert(a.steps.every((s, i) => s.mode === b.steps[i].mode), 'A and B share the mode schedule');
assert(frame.start === START_EXAMPLE && frame.finish === FINISH_EXAMPLE, 'F1 delimiters');
assert(!frame.body.includes(START_EXAMPLE) && !frame.body.includes(FINISH_EXAMPLE), 'delimiters are outside the body');
assert(interpret([START_EXAMPLE, ...body]).steps.length === a.steps.length + 1, 'START would be an extra mode turn');

console.log('V4-F7  next_mode from accepted U\n');
console.log('START → first body is SKIP');
console.log(`U_NEXT_DATA  V=${carrier(U_NEXT_DATA)}  → DATA`);
console.log(`U_NEXT_SKIP  V=${carrier(U_NEXT_SKIP)}  → SKIP`);
console.log(`U_SHARED     V=${carrier(U_SHARED)}  SKIP→""  DATA→${dataBit(carrier(U_SHARED))}`);
console.log(`armed [next DATA, shared]  bits=${armed.bits || '—'}`);
console.log(`quiet [next SKIP, shared]  bits=${quiet.bits || '—'}`);
console.log(`frame bits                 ${a.bits || '—'}`);
console.log('turn  mode  V   bits  next');
for (const [i, s] of a.steps.entries()) {
  console.log(`${String(i + 1).padEnd(5)}${s.mode.padEnd(6)}${String(s.v).padEnd(4)}${(s.bits || '—').padEnd(6)}${s.next}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F7: whether the next turn carries payload is conversational state');
