/**
 * V4-F3: Result #3, PASS, frozen.
 * START declares argument bits; FINISH reconstructs them.
 * Forced K4 stream. Not natural encoding.
 *   npm run test:v4-f3
 */
import { START_EXAMPLE } from './f1.ts';
import {
  ARGUMENT,
  ARGUMENT_BITS,
  ARGUMENT_BITS_TEXT,
  ARGUMENT_CHUNKS,
  ARGUMENT_HEX,
  DINNER_BODY,
  FINISH_EXAMPLE,
  Participant,
  START_24,
  accumulate,
  argumentBits,
  bitsFromObservations,
  decode6,
  handshake,
  isFinish,
  isStart,
  k4Body,
  neededObservations,
  reassemble,
  runDeclaredFrame,
} from './f3.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(isStart(START_24), 'START_24 is still F1 START');
assert(!isFinish(START_24), 'START_24 is not FINISH');
assert(argumentBits(START_24) === ARGUMENT_BITS, 'brief → 24');
assert(argumentBits(START_EXAMPLE) === null, 'F1 START declares nothing');
assert(argumentBits(FINISH_EXAMPLE) === null, 'FINISH declares no bits');
assert(neededObservations(24) === 4, '24 bits → 4 observations');
assert(decode6([...ARGUMENT_CHUNKS]) === ARGUMENT, 'decode6([42,17,63,5]) → 0xA91FC5');
assert(bitsFromObservations([...ARGUMENT_CHUNKS]) === ARGUMENT_BITS_TEXT, '6-bit concatenation');

const complete = k4Body(6);
assert(complete.every((u) => !isStart(u) && !isFinish(u)), 'body has no control');
assert(accumulate(complete).join(',') === ARGUMENT_CHUNKS.join(','), 'six-turn body is F2 K4');

const left = new Participant('A');
const right = new Participant('B');
handshake(left, right);
const { left: frameA, right: frameB } = runDeclaredFrame(left, right, START_24, complete);

assert(frameA.start === START_24, 'A recorded declared START');
assert(frameB.start === START_24, 'B recorded declared START');
assert(frameA.finish === FINISH_EXAMPLE, 'A recorded F1 FINISH');
assert(frameB.finish === FINISH_EXAMPLE, 'B recorded F1 FINISH');

const decodedA = reassemble(frameA.start, frameA.body);
const decodedB = reassemble(frameB.start, frameB.body);
assert(decodedA.kind === 'ARGUMENT', 'A reconstructed an argument');
assert(decodedB.kind === 'ARGUMENT', 'B reconstructed an argument');
if (decodedA.kind === 'ARGUMENT' && decodedB.kind === 'ARGUMENT') {
  assert(decodedA.value === ARGUMENT && decodedA.hex === ARGUMENT_HEX, 'A → 0xA91FC5');
  assert(decodedA.bitsText === ARGUMENT_BITS_TEXT, 'A bitstream');
  assert(decodedB.value === decodedA.value, 'A and B reconstruct the same argument');
  assert(decodedB.hex === decodedA.hex, 'A and B hex match');
}

assert(reassemble(START_24, k4Body(5)).kind === 'INCOMPLETE', 'FINISH after [42,17,63] → INCOMPLETE');
assert(reassemble(START_24, k4Body(7)).kind === 'OVERFLOW', 'extra observation → OVERFLOW');
assert(reassemble(START_EXAMPLE, complete).kind === 'UNDECLARED', 'undeclared START');

const mutated = [...complete];
mutated[2] = DINNER_BODY[0];
const changed = reassemble(START_24, mutated);
assert(changed.kind === 'ARGUMENT', 'mutated body still has 4 observations');
if (changed.kind === 'ARGUMENT') {
  assert(changed.value !== ARGUMENT, 'one body turn changes the argument');
}

const withStart = accumulate([START_24, ...complete]);
const withFinish = accumulate([...complete, FINISH_EXAMPLE]);
assert(withStart.length === ARGUMENT_CHUNKS.length + 1, 'START is not a payload symbol');
assert(withFinish.length === ARGUMENT_CHUNKS.length + 1, 'FINISH is not a payload symbol');
assert(reassemble(START_24, [START_24, ...complete]).kind === 'OVERFLOW', 'START in the stream overflows');
assert(reassemble(START_24, [...complete, FINISH_EXAMPLE]).kind === 'OVERFLOW', 'FINISH in the stream overflows');
assert(decode6(withStart) !== ARGUMENT, 'START would change the bitstream');
assert(decode6(withFinish) !== ARGUMENT, 'FINISH would change the bitstream');

console.log('V4-F3  declared bits → reconstructed argument\n');
console.log(`START_24        ${START_24}`);
console.log(`argument_bits   ${ARGUMENT_BITS}`);
console.log(`accumulator     [${ARGUMENT_CHUNKS.join(',')}]`);
console.log(`decode6         ${ARGUMENT_BITS_TEXT}`);
console.log(`argument        0x${ARGUMENT_HEX.toUpperCase()}`);
console.log('FINISH [42,17,63]     INCOMPLETE');
console.log('FINISH + extra obs    OVERFLOW');
console.log('one body turn changed argument changes');
console.log('A and B               identical argument');
console.log('START/FINISH          no bits');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F3: START declares bits; FINISH reconstructs them');
