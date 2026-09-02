/**
 * AR-C1 header composition.
 *   npm run test:v4-ar-c1
 */
import {
  ACK_EXAMPLE,
  ACTIONS,
  FINISH,
  HEADER_WIDTH,
  PROBE_EXAMPLE,
  RESOURCES,
  START_5,
  parseFields,
  run,
  runTwo,
  type ApplicationObject,
  type Turn,
} from './ar-c1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

function eqObj(got: ApplicationObject | null, want: ApplicationObject, label: string): void {
  assert(got !== null, `${label} missing object`);
  if (!got) return;
  assert(got.action === want.action, `${label}.action got ${got.action} want ${want.action}`);
  assert(got.resource === want.resource, `${label}.resource got ${got.resource} want ${want.resource}`);
  assert(got.argument === want.argument, `${label}.argument got ${got.argument} want ${want.argument}`);
}

const HS: Turn[] = [
  { speaker: 'A', utterance: PROBE_EXAMPLE },
  { speaker: 'B', utterance: ACK_EXAMPLE },
];

const A_SKIP = 'How was dinner last night after you sat down?';
const B_PEER = 'The pasta was decent and the bread came out warm.';
const SYM_0A = 'Yes, the park gate works if we leave early.';
const SYM_0B = 'I packed two bottles and left the extra sweater.';
const SYM_0C = 'The quieter path past the mill looks better today.';
const SYM_10A = 'Should we grab some fresh bread at the market, or do you think we should just bake it later?';
const SYM_10B = 'Want to walk before the shops get busy?';
const SYM_11A = 'What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?';
const SYM_11B = 'Do you think we should bring jackets this time?';
const FINAL_1 = 'Mostly yes and the coffee almost made up for it.';

assert(ACTIONS[0] === 'GET' && ACTIONS[1] === 'SET', 'action codebook');
assert(RESOURCES[0] === 'CUSTOMER' && RESOURCES[1] === 'ORDER', 'resource codebook');
assert(HEADER_WIDTH === 2, 'header is 2 bits');
assert(parseFields('0010111').action === 'GET', 'first bit is ACTION');
assert(parseFields('0010111').resource === 'CUSTOMER', 'second bit is RESOURCE');
assert(parseFields('0110111').resource === 'ORDER', 'resource flips alone');
assert(parseFields('1010111').action === 'SET', 'action flips alone');
assert(parseFields('00').argument === '', 'header only, empty argument slice');

function frame(body: string[]): Turn[] {
  return [
    ...HS,
    { speaker: 'A', utterance: START_5 },
    { speaker: 'A', utterance: A_SKIP },
    { speaker: 'B', utterance: B_PEER },
    ...body.map((utterance) => ({ speaker: 'A' as const, utterance })),
    { speaker: 'A', utterance: FINISH },
  ];
}

function finished(turns: Turn[]): ApplicationObject | null {
  const { a, b } = runTwo(turns);
  const oa = a[a.length - 1];
  const ob = b[b.length - 1];
  assert(oa.outcome === 'FINISH_ARGUMENT', `A ${oa.outcome}`);
  assert(ob.outcome === 'FINISH_ARGUMENT', `B ${ob.outcome}`);
  assert(JSON.stringify(oa.object) === JSON.stringify(ob.object), 'A and B disagree');
  return oa.object;
}

const ARG = '10111';
const ARG2 = '01010';

const getCustomer = finished(
  frame([SYM_0A, SYM_0B, SYM_10A, SYM_11A, FINAL_1]),
);
const getOrder = finished(frame([SYM_0A, SYM_11A, SYM_0B, SYM_11B, FINAL_1]));
const setCustomer = finished(frame([SYM_10A, SYM_10B, SYM_11A, FINAL_1]));
const setOrder = finished(frame([SYM_11B, SYM_10A, SYM_11A, FINAL_1]));
const getCustomerAlt = finished(frame([SYM_0A, SYM_0B, SYM_0C, SYM_10A, SYM_10B]));

eqObj(getCustomer, { action: 'GET', resource: 'CUSTOMER', argument: ARG }, '00 10111');
eqObj(getOrder, { action: 'GET', resource: 'ORDER', argument: ARG }, '01 10111');
eqObj(setCustomer, { action: 'SET', resource: 'CUSTOMER', argument: ARG }, '10 10111');
eqObj(setOrder, { action: 'SET', resource: 'ORDER', argument: ARG }, '11 10111');
eqObj(getCustomerAlt, { action: 'GET', resource: 'CUSTOMER', argument: ARG2 }, '00 01010');

assert(getCustomer?.action === getOrder?.action, 'same ACTION bit, action holds');
assert(getCustomer?.resource !== getOrder?.resource, 'changed RESOURCE bit, only resource');
assert(getCustomer?.argument === getOrder?.argument, 'resource flip keeps argument');

assert(getCustomer?.resource === setCustomer?.resource, 'same RESOURCE bit, resource holds');
assert(getCustomer?.action !== setCustomer?.action, 'changed ACTION bit, only action');
assert(getCustomer?.argument === setCustomer?.argument, 'action flip keeps argument');

assert(getCustomer?.action === getCustomerAlt?.action, 'same header, action holds');
assert(getCustomer?.resource === getCustomerAlt?.resource, 'same header, resource holds');
assert(getCustomer?.argument !== getCustomerAlt?.argument, 'changed argument only');

const early = run([
  ...HS,
  { speaker: 'A', utterance: START_5 },
  { speaker: 'A', utterance: A_SKIP },
  { speaker: 'B', utterance: B_PEER },
  { speaker: 'A', utterance: SYM_0A },
  { speaker: 'A', utterance: FINISH },
]);
const cut = early[early.length - 1];
assert(cut.outcome === 'INCOMPLETE', 'FINISH before header+argument is INCOMPLETE');
assert(cut.object === null, 'incomplete does not commit an object');

const start = run([...HS, { speaker: 'A', utterance: START_5 }]).at(-1);
assert(start?.argument_bits === 5, 'START still declares argument length');
assert(start?.header_remaining === 2, 'header remaining is profile width');
assert(start?.argument_remaining === 5, 'argument remaining is declared n');
assert(start?.action === null && start?.resource === null, 'no type assigned at START');

console.log('V4 AR-C1   header composition\n');
console.log('vocab      GET/SET × CUSTOMER/ORDER');
console.log('header     2 bits, parsed as two fields');
console.log('argument   10111 × 4 headers, then 01010');
console.log('controls   resource / action / argument each flip alone');
console.log('machines   A and B agree after every FINISH');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nAR-C1: ACTION × RESOURCE × ARGUMENT from one BODY bitstream');
