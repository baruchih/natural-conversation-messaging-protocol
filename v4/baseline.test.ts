/**
 * V4 Profile 0 prefix conformance.
 *   npm run test:v4-baseline
 */
import {
  ACK_EXAMPLE,
  FINISH,
  PROBE_EXAMPLE,
  START_0,
  START_5,
  carrier,
  declaredBits,
  finalBit,
  nextMode,
  run,
  type Snapshot,
  type Turn,
} from './baseline.ts';
import { refBits, refNext } from './baseline.ref.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

function expect(s: Snapshot, extra: Partial<Snapshot> & { outcome: Snapshot['outcome'] }, label: string): void {
  for (const [k, v] of Object.entries(extra)) {
    assert((s as Record<string, unknown>)[k] === v, `${label}.${k} got ${String((s as Record<string, unknown>)[k])} want ${String(v)}`);
  }
}

function last(turns: Turn[]): Snapshot {
  const out = run(turns);
  return out[out.length - 1];
}

const HS: Turn[] = [
  { speaker: 'A', utterance: PROBE_EXAMPLE },
  { speaker: 'B', utterance: ACK_EXAMPLE },
];

const A_SKIP = 'How was dinner last night after you sat down?';
const B_PEER = 'The pasta was decent and the bread came out warm.';
const A_10 = 'Should we grab some fresh bread at the market, or do you think we should just bake it later?';
const SESSION_CHAT = 'Hi.';
const CLOCK = "Let's meet around 7:30 before the lot fills up.";
const B_DATA = 'Do you think we should bring jackets this time?';
const A_11 = 'What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?';
const A_FINAL = 'Mostly yes and the coffee almost made up for it.';
const A_EXTRA = 'We left before dessert because the room got loud.';

assert(declaredBits(START_5) === 5, 'START_5 declares 5');
assert(declaredBits(START_0) === 0, 'START_0 declares 0');
assert(declaredBits('Shall we begin this wide round now?') === 128, 'wide declares 128');
assert(declaredBits('Shall we begin this short wide round now?') === null, 'two markers declare nothing');
assert(declaredBits('Shall we begin this round now?') === null, 'no marker is undeclared');
assert(carrier(A_SKIP) === 22 && nextMode(22) === 'DATA', 'A_SKIP V=22 → DATA');
assert(carrier(A_10) === 19 && carrier(A_10) % 3 === 1, 'A_10 is 10');
assert(carrier(A_11) === 11 && carrier(A_11) % 3 === 2, 'A_11 is 11');
assert(finalBit(carrier(A_FINAL)) === '1', 'A_FINAL is 1');
assert(carrier(CLOCK) === 14, 'CLOCK V=14');
assert(nextMode(14) === 'DATA', 'CLOCK next_mode DATA');
assert(carrier(SESSION_CHAT) === 17, 'Hi. V=17');

const canonical: Turn[] = [
  ...HS,
  { speaker: 'A', utterance: SESSION_CHAT },
  { speaker: 'A', utterance: START_5 },
  { speaker: 'A', utterance: A_SKIP },
  { speaker: 'B', utterance: B_PEER },
  { speaker: 'A', utterance: A_10 },
  { speaker: 'B', utterance: B_DATA },
  { speaker: 'A', utterance: A_11 },
  { speaker: 'A', utterance: A_FINAL },
  { speaker: 'A', utterance: FINISH },
  { speaker: 'B', utterance: START_0 },
  { speaker: 'B', utterance: FINISH },
];

const snaps = run(canonical);
assert(snaps.length === canonical.length, 'canonical length');

expect(snaps[0], { outcome: 'PROBE', session: 'handshake', open: false }, 'probe');
expect(snaps[1], { outcome: 'ACK', session: 'active', open: false }, 'ack');
expect(snaps[2], { outcome: 'CHAT', session: 'active', open: false }, 'session chat');
expect(snaps[3], { outcome: 'START', open: true, owner: 'A', argument_bits: 5, remaining: 5, mode: 'SKIP', accumulator: '' }, 'start5');
expect(snaps[4], { outcome: 'BODY_SKIP', bits: '', mode: 'DATA', remaining: 5, accumulator: '' }, 'A skip');
expect(snaps[5], { outcome: 'BODY_SKIP', bits: '', mode: 'DATA', remaining: 5, accumulator: '' }, 'B peer');
expect(snaps[6], { outcome: 'BODY_DATA', bits: '10', remaining: 3, accumulator: '10' }, 'A 10');
expect(snaps[7], { outcome: 'BODY_SKIP', bits: '', remaining: 3, accumulator: '10' }, 'B in DATA');
expect(snaps[8], { outcome: 'BODY_DATA', bits: '11', remaining: 1, accumulator: '1011' }, 'A 11');
expect(snaps[9], { outcome: 'BODY_DATA', bits: '1', remaining: 0, accumulator: '10111' }, 'A final 1');
expect(snaps[10], { outcome: 'FINISH_ARGUMENT', open: false, argument: '10111' }, 'A finish');
expect(snaps[11], { outcome: 'START', owner: 'B', argument_bits: 0, remaining: 0, mode: 'SKIP' }, 'B start0');
expect(snaps[12], { outcome: 'FINISH_ARGUMENT', open: false, argument: '' }, 'B empty argument');

assert(
  snaps.filter((s) => s.open).every((s) => s.outcome !== 'CHAT'),
  'no CHAT inside FRAME_ACTIVE',
);

let mode: 'SKIP' | 'DATA' = 'SKIP';
let remaining = 5;
for (let i = 4; i <= 9; i++) {
  const t = canonical[i];
  const v = carrier(t.utterance);
  const bits = refBits(mode, remaining, t.speaker, 'A', v);
  const next = refNext(v);
  assert(snaps[i].bits === bits, `ref bits turn ${i + 1}`);
  assert(snaps[i].mode === next, `ref next turn ${i + 1}`);
  remaining -= bits.length;
  mode = next;
}

const clockTurns: Turn[] = [...HS, { speaker: 'A', utterance: START_5 }, { speaker: 'B', utterance: CLOCK }];
const clock = last(clockTurns);
expect(clock, { outcome: 'BODY_SKIP', bits: '', remaining: 5, accumulator: '', mode: 'DATA', open: true }, 'clock peer');
assert(refBits('SKIP', 5, 'B', 'A', 14) === '', 'clock ref bits empty');
assert(refNext(14) === clock.mode, 'clock ref next_mode');
assert(clock.bits === '', 'clock zero payload');

const shortBody = last([...HS, { speaker: 'A', utterance: START_5 }, { speaker: 'A', utterance: SESSION_CHAT }]);
expect(shortBody, { outcome: 'BODY_SKIP', bits: '', mode: 'DATA', remaining: 5, open: true }, 'Hi. is BODY inside frame');

expect(last([...HS, { speaker: 'A', utterance: START_5 }, { speaker: 'A', utterance: FINISH }]), { outcome: 'INCOMPLETE', open: false }, 'early FINISH');
expect(last([...HS, { speaker: 'A', utterance: START_5 }, { speaker: 'B', utterance: FINISH }]), { outcome: 'NOT_OWNER', open: true, owner: 'A' }, 'foreign FINISH');
expect(last([...HS, { speaker: 'A', utterance: START_5 }, { speaker: 'B', utterance: START_0 }]), { outcome: 'NEST', open: true, owner: 'A' }, 'foreign START');
expect(
  last([
    ...HS,
    { speaker: 'A', utterance: START_5 },
    { speaker: 'A', utterance: A_SKIP },
    { speaker: 'B', utterance: B_PEER },
    { speaker: 'A', utterance: A_10 },
    { speaker: 'B', utterance: B_DATA },
    { speaker: 'A', utterance: A_11 },
    { speaker: 'A', utterance: A_FINAL },
    { speaker: 'A', utterance: A_EXTRA },
  ]),
  { outcome: 'PAYLOAD_COMPLETE', open: true, remaining: 0, accumulator: '10111' },
  'owner DATA after full',
);
expect(last([...HS, { speaker: 'A', utterance: START_0 }, { speaker: 'A', utterance: FINISH }]), { outcome: 'FINISH_ARGUMENT', argument: '' }, 'zero-length');
expect(
  last([...HS, { speaker: 'A', utterance: 'Shall we begin this short wide round now?' }]),
  { outcome: 'CONTROL_ERROR', open: false, session: 'active' },
  'two markers',
);
expect(
  last([...HS, { speaker: 'A', utterance: 'Shall we begin this short round now and close this round here.' }]),
  { outcome: 'CHAT', open: false, session: 'active' },
  'START+FINISH tokens are ordinary CHAT',
);

console.log('V4 baseline  Profile 0 prefix conformance\n');
console.log('canonical    GET CUSTOMER 10111 then empty frame');
console.log(`turns        ${canonical.length}`);
console.log('frame body   no CHAT; every non-control U is BODY');
console.log('clock peer   V=14  bits=""  next=DATA');
console.log('negatives    INCOMPLETE NOT_OWNER NEST PAYLOAD_COMPLETE ARGUMENT("")');
console.log('ref          independent next_mode + symbol + FINAL');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-Baseline: same transcript, same machine after every prefix');
