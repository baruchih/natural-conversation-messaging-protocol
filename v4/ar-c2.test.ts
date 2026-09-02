/**
 * AR-C2 wider header composition.
 *   npm run test:v4-ar-c2
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
  tile,
  type ApplicationObject,
  type Turn,
} from './ar-c2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const HS: Turn[] = [
  { speaker: 'A', utterance: PROBE_EXAMPLE },
  { speaker: 'B', utterance: ACK_EXAMPLE },
];
const A_SKIP = 'How was dinner last night after you sat down?';
const B_PEER = 'The pasta was decent and the bread came out warm.';

const POOL: Record<string, string> = {
  '0': 'Yes, the park gate works if we leave early.',
  '10': 'Should we grab some fresh bread at the market, or do you think we should just bake it later?',
  '11': 'What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?',
  '1': 'Mostly yes and the coffee almost made up for it.',
};

function frame(wire: string): Turn[] {
  return [
    ...HS,
    { speaker: 'A', utterance: START_5 },
    { speaker: 'A', utterance: A_SKIP },
    { speaker: 'B', utterance: B_PEER },
    ...tile(wire).map((sym) => {
      const utterance = POOL[sym];
      if (!utterance) throw new Error(`no plant for ${sym}`);
      return { speaker: 'A' as const, utterance };
    }),
    { speaker: 'A', utterance: FINISH },
  ];
}

function finished(wire: string): ApplicationObject | null {
  const turns = frame(wire);
  const { a, b } = runTwo(turns);
  const oa = a[a.length - 1];
  const ob = b[b.length - 1];
  assert(oa.outcome === 'FINISH_ARGUMENT', `${wire} A ${oa.outcome}`);
  assert(ob.outcome === 'FINISH_ARGUMENT', `${wire} B ${ob.outcome}`);
  assert(JSON.stringify(oa.object) === JSON.stringify(ob.object), `${wire} A/B disagree`);
  return oa.object;
}

function eqObj(got: ApplicationObject | null, want: ApplicationObject, label: string): void {
  assert(got !== null, `${label} missing`);
  if (!got) return;
  assert(got.action === want.action, `${label}.action ${got.action}≠${want.action}`);
  assert(got.resource === want.resource, `${label}.resource ${got.resource}≠${want.resource}`);
  assert(got.argument === want.argument, `${label}.argument ${got.argument}≠${want.argument}`);
}

assert(ACTIONS.length === 4 && RESOURCES.length === 6, '4×6 table');
assert(HEADER_WIDTH === 5, '5-bit header');
assert(parseFields('00000').action === 'GET' && parseFields('00000').resource === 'CUSTOMER', 'low/low');
assert(parseFields('11101').action === 'EXECUTE' && parseFields('11101').resource === 'SESSION', 'high/high');
assert(parseFields('00110').reserved, '110 reserved');
assert(parseFields('00111').reserved, '111 reserved');
assert(tile('0000010111').join(',') === '0,0,0,0,0,10,11,1', 'GET CUSTOMER 10111 tiles');

const ARG = '10111';
const ARG2 = '01010';
const getCustomer = finished('00000' + ARG);
const getSession = finished('00101' + ARG);
const executeCustomer = finished('11000' + ARG);
const executeSession = finished('11101' + ARG);
const getCustomerAlt = finished('00000' + ARG2);

eqObj(getCustomer, { action: 'GET', resource: 'CUSTOMER', argument: ARG }, '00 000');
eqObj(getSession, { action: 'GET', resource: 'SESSION', argument: ARG }, '00 101');
eqObj(executeCustomer, { action: 'EXECUTE', resource: 'CUSTOMER', argument: ARG }, '11 000');
eqObj(executeSession, { action: 'EXECUTE', resource: 'SESSION', argument: ARG }, '11 101');
eqObj(getCustomerAlt, { action: 'GET', resource: 'CUSTOMER', argument: ARG2 }, '00 000 alt');

assert(getCustomer?.action === getSession?.action, 'same ACTION, action holds');
assert(getCustomer?.resource !== getSession?.resource, 'RESOURCE flip only');
assert(getCustomer?.argument === getSession?.argument, 'resource flip keeps argument');

assert(getCustomer?.resource === executeCustomer?.resource, 'same RESOURCE, resource holds');
assert(getCustomer?.action !== executeCustomer?.action, 'ACTION flip only');
assert(getCustomer?.argument === executeCustomer?.argument, 'action flip keeps argument');

assert(getCustomer?.action === getCustomerAlt?.action && getCustomer?.resource === getCustomerAlt?.resource, 'same header');
assert(getCustomer?.argument !== getCustomerAlt?.argument, 'argument flip only');

const reserved = run(frame('00110' + ARG));
assert(reserved.at(-1)?.outcome === 'HEADER_RESERVED', 'reserved resource is not a completed object');
assert(reserved.at(-1)?.object === null, 'reserved commits nothing');

const start = run([...HS, { speaker: 'A', utterance: START_5 }]).at(-1);
assert(start?.argument_bits === 5 && start?.header_remaining === 5, 'START declares argument; header is profile');

console.log('V4 AR-C2   5-bit header composition\n');
console.log('vocab      GET/SET/DELETE/EXECUTE × 6 resources');
console.log('controls   low/high action, low/high resource, argument');
console.log('reserved   110/111 do not complete');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nAR-C2: wider fields still compose on the same BODY machine');
