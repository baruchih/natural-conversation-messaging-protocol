/**
 * NCMP v0.1 reference conformance.
 *   npm test
 *
 * Cases are those required by ../NCMP.md. This file does not define the protocol.
 * Two machines: NCMP.process and the independent referee. They MUST agree
 * after every prefix.
 */
import {
  BASELINE_PROFILE,
  EXAMPLES,
  NCMP,
  actionWidth,
  argumentLength,
  c6,
  completePair,
  headerCost,
  headerWidth,
  isAck,
  isFinish,
  isProbe,
  isStart,
  kSession32,
  parseHeader,
  pSec,
  resourceWidth,
  tAck,
  tProbe,
  tState,
  type Outcome,
  type Profile,
  type ProtocolState,
  type Speaker,
} from './ncmp.ts';
import { refFresh, refProcess, refState } from './ncmp.ref.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const A_SKIP = 'How was dinner last night after you sat down?';
const B_PEER = 'The pasta was decent and the bread came out warm.';
const SYM_0A = 'Yes, the park gate works if we leave early.';
const SYM_0B = 'I packed two bottles and left the extra sweater.';
const SYM_10 = 'Should we grab some fresh bread at the market, or do you think we should just bake it later?';
const SYM_11 = 'What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?';
const SYM_11B = 'Do you think we should bring jackets this time?';
const FINAL_1 = 'Mostly yes and the coffee almost made up for it.';
const CLOCK = "Let's meet around 7:30 before the lot fills up.";
const PRE = 'Saturday still work for you?';
const POST = 'See you at the gate.';
const HINTED_CHAT = "I'll bring an umbrella.";

assert(c6('Want to walk before the shops get busy?') === 16, 'C6 walk = 16');
assert(c6('The tea in the flask is still warm enough.') === 5, 'C6 tea = 5');
assert(c6('Let us close this round here.') === 39, 'C6 close-round = 39');
assert(c6('Hi.') === 17, 'C6 Hi. = 17');
assert(c6(CLOCK) === 14, 'C6 clock = 14');
assert(c6(A_SKIP) === 22, 'C6 dinner skip = 22');
assert(c6(B_PEER) === 15, 'C6 pasta = 15');

assert(actionWidth(BASELINE_PROFILE) === 1 && resourceWidth(BASELINE_PROFILE) === 1, '2×2 widths');
assert(headerWidth(BASELINE_PROFILE) === 2, 'example header is 2');
assert(headerCost(2, 2) === 2 && headerCost(4, 6) === 5, 'header cost');
assert(parseHeader('0010111', BASELINE_PROFILE).action === 'GET', 'first bit ACTION');
assert(parseHeader('0010111', BASELINE_PROFILE).resource === 'CUSTOMER', 'second bit RESOURCE');
assert(parseHeader('0110111', BASELINE_PROFILE).resource === 'ORDER', 'fields compose');

assert(tProbe() === 0x01, 'T_probe is low 6 of seed');
assert(isProbe(EXAMPLES.PROBE), 'demonstrated PROBE');
assert(!isProbe(PRE), 'ordinary pre-session is not PROBE');
assert(pSec(EXAMPLES.ACK) === tAck(EXAMPLES.PROBE), 'ACK residual derived from U_probe');
assert(kSession32(EXAMPLES.PROBE, EXAMPLES.ACK) === 0xdca0b418, 'K_session from the two strings');
assert(tState('START', 0xdca0b418) === 0x25, 'T_START');
assert(tState('FINISH', 0xdca0b418) === 0x08, 'T_FINISH');
assert(completePair(EXAMPLES.PROBE, 0xdca0b418, 'START')[0] === 'saturday', 'START_PAIR from U_probe');
assert(completePair(EXAMPLES.ACK, 0xdca0b418, 'FINISH')[0] === 'sounds', 'FINISH_PAIR from U_ack');
assert(isStart(EXAMPLES.START_5, EXAMPLES.PROBE, 0xdca0b418), 'demonstrated START');
assert(isFinish(EXAMPLES.FINISH, EXAMPLES.ACK, 0xdca0b418), 'demonstrated FINISH');
assert(argumentLength(EXAMPLES.START_5, 0xdca0b418) === 5, 'START_5 declares 5');
assert(argumentLength(EXAMPLES.L0, 0xdca0b418) === 0, 'L is defined for every U');
assert(argumentLength(EXAMPLES.L8, 0xdca0b418) === 8, 'L 8');
assert(argumentLength(EXAMPLES.L128, 0xdca0b418) === 128, 'L 128');
assert(!isStart(EXAMPLES.L0, EXAMPLES.PROBE, 0xdca0b418), 'L0 is not START under the pair');

function sameState(a: ProtocolState, b: ProtocolState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pair(profile: Profile = BASELINE_PROFILE) {
  const impl = new NCMP(profile);
  const ref = refFresh(profile);
  return {
    process(speaker: Speaker, utterance: string): Outcome {
      const oa = impl.process(speaker, utterance);
      const ob = refProcess(ref, speaker, utterance);
      assert(oa === ob, `machines ${speaker}: ${oa} vs referee ${ob} @ ${utterance.slice(0, 48)}`);
      assert(impl.bits === ref.bits, `machines bits ${impl.bits} vs ${ref.bits}`);
      assert(sameState(impl.state, refState(ref)), `machines state diverge after ${utterance.slice(0, 48)}`);
      return oa;
    },
    get state() {
      return impl.state;
    },
    get bits() {
      return impl.bits;
    },
  };
}

function handshake(ncmp = pair()) {
  assert(ncmp.process('A', EXAMPLES.PROBE) === 'PROBE', 'PROBE');
  assert(ncmp.process('B', EXAMPLES.ACK) === 'ACK', 'ACK');
  assert(ncmp.state.k_session === 0xdca0b418, 'ACK stores K_session');
  assert(ncmp.state.u_ack === EXAMPLES.ACK, 'ACK stores U_ack');
  return ncmp;
}

assert(pair().process('A', PRE) === 'NOT_NCMP', 'ordinary before PROBE');

const chat = handshake();
assert(chat.process('A', 'Hi.') === 'CHAT', 'handshake then session CHAT');
assert(chat.state.session === 'active' && chat.state.frame === null, 'CHAT does not open a frame');
assert(chat.process('A', HINTED_CHAT) === 'CHAT', 'umbrella without the pair is CHAT');
assert(
  !isStart(HINTED_CHAT, EXAMPLES.PROBE, 0xdca0b418) && !isFinish(HINTED_CHAT, EXAMPLES.ACK, 0xdca0b418),
  'umbrella without the pair is not START or FINISH',
);

const start = handshake();
assert(start.process('A', EXAMPLES.START_5) === 'START', 'START of a 5-bit frame');
assert(start.state.frame?.argument_bits === 5, 'START declares argument 5');
assert(start.state.frame?.header_remaining === 2, 'header remaining is profile width');
assert(start.state.frame?.mode === 'SKIP', 'initial mode SKIP');
assert(parseHeader('', BASELINE_PROFILE).action === null, 'ACTION not assigned at START');

assert(start.process('A', A_SKIP) === 'BODY_SKIP', 'owner SKIP');
assert(start.state.frame?.mode === 'DATA', 'skip schedules DATA');
assert(start.process('B', B_PEER) === 'BODY_SKIP', 'peer BODY contributes no bits');
assert(start.bits === '', 'peer emits no bits');

assert(start.process('A', SYM_0A) === 'BODY_DATA' && start.bits === '0', 'header ACTION 0');
assert(start.process('A', SYM_0B) === 'BODY_DATA' && start.bits === '0', 'header RESOURCE 0');
assert(start.process('A', SYM_10) === 'BODY_DATA' && start.bits === '10', 'owner DATA 10');
assert(start.process('B', SYM_11B) === 'BODY_SKIP', 'peer during DATA is BODY_SKIP');
assert(start.process('A', SYM_11) === 'BODY_DATA' && start.bits === '11', 'owner DATA 11');
assert(start.process('A', FINAL_1) === 'BODY_DATA' && start.bits === '1', 'final bit');
assert(start.state.frame?.accumulator === '0010111', 'wire 00 10111');
assert(start.process('A', EXAMPLES.FINISH) === 'FINISH_ARGUMENT', 'FINISH_ARGUMENT');
assert(
  start.state.last_object?.action === 'GET' &&
    start.state.last_object?.resource === 'CUSTOMER' &&
    start.state.last_object?.argument === '10111',
  'GET CUSTOMER 10111',
);
assert(start.process('B', POST) === 'CHAT', 'ordinary after FINISH');

const order = handshake();
order.process('A', EXAMPLES.START_5);
order.process('A', A_SKIP);
order.process('B', B_PEER);
order.process('A', SYM_0A);
order.process('A', SYM_11);
order.process('A', SYM_0B);
order.process('A', SYM_11B);
order.process('A', FINAL_1);
assert(order.process('A', EXAMPLES.FINISH) === 'FINISH_ARGUMENT', 'GET ORDER finish');
assert(
  order.state.last_object?.action === 'GET' &&
    order.state.last_object?.resource === 'ORDER' &&
    order.state.last_object?.argument === '10111',
  'flipped RESOURCE → GET ORDER 10111',
);

const leftover = handshake();
leftover.process('A', EXAMPLES.START_5);
leftover.process('A', A_SKIP);
assert(leftover.process('A', EXAMPLES.FINISH) === 'INCOMPLETE', 'owner FINISH with remaining > 0');

const nest = handshake();
nest.process('A', EXAMPLES.START_5);
assert(nest.process('A', EXAMPLES.START_5) === 'NEST', 'START while a frame is open');
assert(nest.state.frame !== null, 'NEST does not close the frame');

const notOwner = handshake();
notOwner.process('A', EXAMPLES.START_5);
assert(notOwner.process('B', EXAMPLES.FINISH) === 'NOT_OWNER', 'peer FINISH');
assert(notOwner.state.frame !== null, 'NOT_OWNER does not close the frame');

const full = handshake();
full.process('A', EXAMPLES.START_5);
full.process('A', A_SKIP);
full.process('B', B_PEER);
for (const u of [SYM_0A, SYM_0B, SYM_10, SYM_11, FINAL_1]) full.process('A', u);
assert(full.state.frame?.header_remaining === 0 && full.state.frame?.argument_remaining === 0, 'accumulator full');
assert(full.process('A', SYM_0A) === 'PAYLOAD_COMPLETE', 'owner DATA after accumulator is full');
assert(full.state.frame?.accumulator === '0010111', 'PAYLOAD_COMPLETE does not change accumulator');

const clock = handshake();
clock.process('A', EXAMPLES.START_5);
assert(clock.state.frame?.mode === 'SKIP', 'clock setup mode SKIP');
assert(clock.process('B', CLOCK) === 'BODY_SKIP', 'clock-time peer is BODY');
assert(c6(CLOCK) === 14 && clock.bits === '' && clock.state.frame?.mode === 'DATA', 'clock-time V=14 → DATA');

const openHi = handshake();
openHi.process('A', EXAMPLES.START_5);
assert(openHi.process('A', 'Hi.') === 'BODY_SKIP', 'Hi. while a frame is open is BODY');
assert(c6('Hi.') === 17 && openHi.state.frame?.mode === 'DATA', 'Hi. V=17 → DATA');

assert(handshake().process('A', EXAMPLES.FINISH) === 'NO_FRAME', 'FINISH with no frame');

const reservedProfile: Profile = { actions: ['GET', 'SET', 'DELETE'], resources: ['CUSTOMER', 'ORDER'] };
assert(headerWidth(reservedProfile) === 3, '3 actions pay 2 action bits');
assert(parseHeader('110', reservedProfile).reserved, 'unused codebook pattern is reserved');

const other: Profile = { actions: ['READ', 'WRITE'], resources: ['FILE', 'DATABASE', 'EMAIL', 'CALENDAR'] };
assert(headerWidth(other) === 3, 'Profile Y header');
assert(parseHeader('110', other).action === 'WRITE' && parseHeader('110', other).resource === 'EMAIL', 'agreed tables');

const reference: Array<[Speaker, string, Outcome]> = [
  ['A', PRE, 'NOT_NCMP'],
  ['A', EXAMPLES.PROBE, 'PROBE'],
  ['B', EXAMPLES.ACK, 'ACK'],
  ['A', 'Hi.', 'CHAT'],
  ['A', EXAMPLES.START_5, 'START'],
  ['A', A_SKIP, 'BODY_SKIP'],
  ['B', B_PEER, 'BODY_SKIP'],
  ['A', SYM_0A, 'BODY_DATA'],
  ['A', SYM_0B, 'BODY_DATA'],
  ['A', SYM_10, 'BODY_DATA'],
  ['B', SYM_11B, 'BODY_SKIP'],
  ['A', SYM_11, 'BODY_DATA'],
  ['A', FINAL_1, 'BODY_DATA'],
  ['A', EXAMPLES.FINISH, 'FINISH_ARGUMENT'],
  ['A', POST, 'CHAT'],
];

const ncmp = pair();
for (const [speaker, utterance, expected] of reference) {
  const outcome = ncmp.process(speaker, utterance);
  assert(outcome === expected, `reference ${speaker}: ${expected} (got ${outcome})`);
  if (expected === 'FINISH_ARGUMENT' && speaker === 'A') {
    assert(
      ncmp.state.last_object?.action === 'GET' &&
        ncmp.state.last_object?.resource === 'CUSTOMER' &&
        ncmp.state.last_object?.argument === '10111',
      'reference first object GET CUSTOMER 10111',
    );
  }
}
assert(
  ncmp.state.last_object?.action === 'GET' &&
    ncmp.state.last_object?.resource === 'CUSTOMER' &&
    ncmp.state.last_object?.argument === '10111',
  'reference object GET CUSTOMER 10111',
);
assert(ncmp.state.session === 'active' && ncmp.state.frame === null, 'session stays active after FINISH');

console.log('NCMP v0.1 reference decoder\n');
console.log('authority  ncmp/NCMP.md');
console.log('control    bootstrap hint + residual; frame pairs + residual');
console.log('example    GET|SET × CUSTOMER|ORDER');
console.log('object     GET CUSTOMER 10111 from BODY bits 00+10111');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nreference demonstrates the machine; it does not define it');
console.log('two machines agreed after every prefix');
