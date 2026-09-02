/**
 * V4-F4: Result #4, PASS, frozen.
 * 8-bit argument in history-derived C6 bins. No K4.
 *   npm run test:v4-f4
 */
import { START_EXAMPLE, DINNER_BODY } from './f1.ts';
import {
  ARGUMENT,
  ARGUMENT_BITS,
  ARGUMENT_BITS_TEXT,
  ARGUMENT_HEX,
  BATCH,
  FINISH_EXAMPLE,
  INTENTS,
  Participant,
  START_8,
  acceptBits,
  carrier,
  declaredBits,
  encodeFromSets,
  handshake,
  isFinish,
  isStart,
  promptIsBlind,
  rate,
  reassemble,
  runDeclaredFrame,
  selectAccepted,
  symbolBits,
  turnOk,
} from './f4.ts';
import { FROZEN } from './f4.frozen.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(BATCH === 50, 'search budget frozen at 50');
assert(INTENTS.length === 8, 'script is 8 intents, declared before the run');
assert(isStart(START_8), 'START_8 is still F1 START');
assert(!isFinish(START_8), 'START_8 is not FINISH');
assert(declaredBits(START_8) === ARGUMENT_BITS, 'tiny → 8');
assert(declaredBits(START_EXAMPLE) === null, 'undeclared F1 START');
assert(declaredBits('Shall we begin this brief round now?') === null, 'F3 brief does not declare 8');
assert(declaredBits(FINISH_EXAMPLE) === null, 'FINISH declares no bits');
assert(ARGUMENT === parseInt(ARGUMENT_BITS_TEXT, 2), '10110110 = 0xB6');

const r1 = rate(START_8, 8);
assert(r1 >= 1 && r1 <= 3, 'first opportunity is 1..3');
assert(rate(START_8, 1) === 1, 'last leftover bit forces r = 1');
assert(rate(START_8, 0) === 0, 'remaining 0 → r 0');

const planted = DINNER_BODY.filter(turnOk);
assert(planted.length >= 3, 'dinner lines are turnOk');
const u0 = planted[0];
const need0 = symbolBits(carrier(u0), r1);
assert(acceptBits(u0, r1, need0), 'bin accept, not residue 42');
assert(!acceptBits(u0, r1, need0 === '0'.repeat(r1) ? '1'.repeat(r1) : '0'.repeat(r1)), 'wrong bin rejected');

const miss = selectAccepted(planted, r1, 'x'.repeat(r1));
assert(miss.chosen === null, 'empty match is NO_CANDIDATE, not a retry');

const hit = selectAccepted(['Hi.', u0], r1, need0);
assert(hit.chosen === u0, 'first turnOk accept wins; illegal turns are skipped');

assert(promptIsBlind([], 'A', INTENTS[0].text), 'first intent prompt is blind');

assert(encodeFromSets(ARGUMENT_BITS_TEXT, START_8, INTENTS.map(() => [])).kind === 'NO_CANDIDATE', 'empty sets → NO_CANDIDATE, no fallback');

const oneTurn = reassemble(START_8, [u0]);
assert(oneTurn.kind === 'INCOMPLETE', 'FINISH after too few bits → INCOMPLETE');

const longBody = [...planted];
const walked = reassemble(START_8, longBody);
if (walked.kind === 'OVERFLOW') {
  assert(walked.have === ARGUMENT_BITS, 'extra turn after 8 bits → OVERFLOW');
} else if (walked.kind === 'ARGUMENT') {
  assert(walked.bitsText.length === ARGUMENT_BITS, 'dinner walk can land exactly');
} else {
  assert(false, `dinner walk unexpected ${walked.kind}`);
}

assert(reassemble(START_EXAMPLE, planted).kind === 'UNDECLARED', 'undeclared START');
assert(reassemble(START_8, [START_8, ...planted.slice(0, 1)]).kind !== 'UNDECLARED', 'START in the stream is a body turn');

const left = new Participant('A');
const right = new Participant('B');
handshake(left, right);
const { left: frameA, right: frameB } = runDeclaredFrame(left, right, START_8, [u0]);
const decA = reassemble(frameA.start, frameA.body);
const decB = reassemble(frameB.start, frameB.body);
assert(decA.kind === decB.kind, 'A and B same verdict');
if (decA.kind === 'INCOMPLETE' && decB.kind === 'INCOMPLETE') {
  assert(decA.have === decB.have, 'A and B recover the same prefix');
}

console.log('V4-F4  8-bit bins, no K4\n');
console.log(`START_8         ${START_8}`);
console.log(`argument        ${ARGUMENT_BITS_TEXT}  (0x${ARGUMENT_HEX.toUpperCase()})`);
console.log(`R(START, 8)     ${r1}`);
console.log(`BATCH           ${BATCH}`);
console.log('NO_CANDIDATE    no enlarge / mutate / M1 / change r / regenerate');

if (FROZEN) {
  const encoded = encodeFromSets(ARGUMENT_BITS_TEXT, FROZEN.start, FROZEN.candidates);
  console.log('\nturn  r  wanted  C6(U)  π(U)  recovered');
  if (encoded.kind === 'ENCODED') {
    for (const [i, t] of encoded.turns.entries()) {
      assert(t.utterance === FROZEN.turns[i]?.utterance, `frozen U${i + 1} unchanged`);
      assert(t.r === FROZEN.turns[i]?.r, `frozen r${i + 1} agreed`);
      assert(t.wanted === t.recovered, `turn ${i + 1} recovered its bits`);
      assert(t.wanted === t.pi, `turn ${i + 1} π is the wanted bin`);
      console.log(
        `${String(i + 1).padEnd(5)}${String(t.r).padEnd(3)}${t.wanted.padEnd(8)}${String(t.c6).padEnd(7)}${t.pi.padEnd(6)}${t.recovered}`,
      );
    }
    assert(encoded.bits === ARGUMENT_BITS_TEXT, 'sender bits');
    const a = new Participant('A');
    const b = new Participant('B');
    handshake(a, b);
    const body = encoded.turns.map((t) => t.utterance);
    assert(body.every((u) => !isStart(u) && !isFinish(u)), 'body has no control');
    const framed = runDeclaredFrame(a, b, START_8, body);
    const recA = reassemble(framed.left.start, framed.left.body);
    const recB = reassemble(framed.right.start, framed.right.body);
    assert(recA.kind === 'ARGUMENT' && recB.kind === 'ARGUMENT', 'FINISH → argument');
    if (recA.kind === 'ARGUMENT' && recB.kind === 'ARGUMENT') {
      assert(recA.bitsText === ARGUMENT_BITS_TEXT, 'receiver bits');
      assert(recB.bitsText === recA.bitsText, 'argument_A = argument_B');
      assert(recA.value === ARGUMENT && recA.hex === ARGUMENT_HEX, '0xB6');
    }
    assert(FROZEN.result === 'ARGUMENT', 'frozen result is ARGUMENT');
    console.log(`                         ${'-'.repeat(25)}`);
    console.log(`                         ${encoded.bits}`);
    console.log('\nF4 live: ARGUMENT  no NO_CANDIDATE');
  } else {
    assert(FROZEN.result === 'NO_CANDIDATE', 'frozen miss is NO_CANDIDATE');
    assert(encoded.kind === 'NO_CANDIDATE', 'replay is NO_CANDIDATE');
    console.log(`NO_CANDIDATE at intent ${encoded.intentIndex + 1}  r=${encoded.r}  wanted=${encoded.wanted}  legal=${encoded.legal}/${encoded.considered}`);
    console.log('\nF4 live: NO_CANDIDATE  (do not enlarge k)');
  }
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F4: payload chunk → bin of acceptable C6 values');
