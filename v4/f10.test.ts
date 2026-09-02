/**
 * V4-F10: Result #10, PASS, frozen.
 *   npm run test:v4-f10
 */
import { START_EXAMPLE } from './f1.ts';
import { FROZEN as F9 } from './f9.frozen.ts';
import { FROZEN } from './f10.frozen.ts';
import {
  ARGUMENT,
  ARGUMENT_BITS,
  ARGUMENT_BITS_TEXT,
  ARGUMENT_HEX,
  BATCH,
  EXPECTED_SYMBOLS,
  FINISH_EXAMPLE,
  INTENTS,
  Participant,
  START_8,
  encodeFromSets,
  handshake,
  interpret,
  parseSymbols,
  reassemble,
  runDeclaredFrame,
  scheduleOf,
} from './f10.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(BATCH === 50, 'k = 50 stays frozen');
assert(ARGUMENT_BITS === 8, 'tiny argument');
assert(parseSymbols(ARGUMENT_BITS_TEXT)?.join('|') === EXPECTED_SYMBOLS.join('|'), 'greedy 10|11|0|11|0');
assert(INTENTS.length === 16, 'sixteen declared intents');

assert(reassemble(START_EXAMPLE, []).kind === 'UNDECLARED', 'START without tiny is undeclared');
assert(reassemble(START_8, []).kind === 'INCOMPLETE', 'empty body is incomplete');

const u = F9.turns.map((t) => t.utterance);
const composed = [u[0], u[1], u[2], u[3], u[4], u[0], u[3], u[4]];
const composedRead = interpret(composed);
const composedDone = reassemble(START_8, composed);
assert(composedDone.kind === 'ARGUMENT' && composedDone.bitsText === ARGUMENT_BITS_TEXT, 'composed F9 turns ARGUMENT');
assert(composedDone.kind === 'ARGUMENT' && composedDone.value === ARGUMENT && composedDone.hex === ARGUMENT_HEX, '0xb6');

const encoded = encodeFromSets(ARGUMENT_BITS_TEXT, FROZEN.candidates);
assert(encoded.kind === 'ENCODED', 'live sets replay');
const body = FROZEN.turns.map((t) => t.utterance);
const left = new Participant('A');
const right = new Participant('B');
handshake(left, right);
const frames = runDeclaredFrame(left, right, START_8, body);
const a = reassemble(frames.left.start, frames.left.body);
const b = reassemble(frames.right.start, frames.right.body);
assert(a.kind === 'ARGUMENT' && b.kind === 'ARGUMENT', 'A and B ARGUMENT');
assert(a.kind === 'ARGUMENT' && a.bitsText === ARGUMENT_BITS_TEXT, 'recovered 10110110');
assert(!frames.left.body.includes(START_8) && !frames.left.body.includes(FINISH_EXAMPLE), 'delimiters outside');
const trace = interpret(frames.left.body);
assert(trace.steps.filter((s) => s.mode === 'DATA').length === EXPECTED_SYMBOLS.length, 'five DATA turns');

console.log('V4-F10  sparse argument, half3 unchanged\n');
console.log(`argument         ${ARGUMENT_BITS_TEXT}`);
console.log(`symbols          ${EXPECTED_SYMBOLS.join(' | ')}`);
console.log(`composed F9      ${scheduleOf(composedRead.steps)}`);
console.log(`\nlive              ${FROZEN.result}`);
console.log(`schedule          ${scheduleOf(trace.steps)}`);
console.log(`DATA / body       ${trace.steps.filter((s) => s.mode === 'DATA').length} / ${trace.steps.length}`);
console.log(`unused intents    ${INTENTS.length - trace.steps.length}`);
console.log(`bits              ${trace.bits}`);
console.log('turn  mode  V   bits  next');
for (const [i, s] of trace.steps.entries()) {
  console.log(`${String(i + 1).padEnd(5)}${s.mode.padEnd(6)}${String(s.v).padEnd(4)}${(s.bits || '—').padEnd(6)}${s.next}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F10: DATA consumes a prefix; SKIP does not');
