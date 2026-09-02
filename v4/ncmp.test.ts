/**
 * NCMP v0.1 Baseline Profile reference machine.
 *   npm run test:v4-ncmp
 */
import {
  ACK_EXAMPLE,
  BASELINE_PROFILE,
  FINISH,
  PROBE_EXAMPLE,
  START_5,
  actionWidth,
  headerCost,
  headerWidth,
  parseFields,
  resourceWidth,
  run,
  type ApplicationObject,
  type Profile,
  type Turn,
} from './ncmp.ts';

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
const SYM_0A = 'Yes, the park gate works if we leave early.';
const SYM_0B = 'I packed two bottles and left the extra sweater.';
const SYM_10 = 'Should we grab some fresh bread at the market, or do you think we should just bake it later?';
const SYM_11 = 'What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?';
const SYM_11B = 'Do you think we should bring jackets this time?';
const FINAL_1 = 'Mostly yes and the coffee almost made up for it.';

assert(actionWidth(BASELINE_PROFILE) === 1 && resourceWidth(BASELINE_PROFILE) === 1, '2×2 widths');
assert(headerWidth(BASELINE_PROFILE) === 2, 'example header is 2');
assert(headerCost(2, 2) === 2 && headerCost(4, 6) === 5, 'general cost');
assert(parseFields('0010111', BASELINE_PROFILE).action === 'GET', 'first bit ACTION');
assert(parseFields('0010111', BASELINE_PROFILE).resource === 'CUSTOMER', 'second bit RESOURCE');
assert(parseFields('0110111', BASELINE_PROFILE).resource === 'ORDER', 'fields compose');

function body(us: string[], owner: 'A' | 'B' = 'A'): Turn[] {
  return us.map((utterance) => ({ speaker: owner, utterance }));
}

function frame(owner: 'A' | 'B', start: string, us: string[]): Turn[] {
  return [
    ...HS,
    { speaker: owner, utterance: start },
    ...(owner === 'A' ? [{ speaker: 'A' as const, utterance: A_SKIP }, { speaker: 'B' as const, utterance: B_PEER }] : []),
    ...body(us, owner),
    { speaker: owner, utterance: FINISH },
  ];
}

function lastObject(turns: Turn[], profile: Profile = BASELINE_PROFILE): ApplicationObject | null {
  const snaps = run(turns, profile);
  return snaps[snaps.length - 1].object;
}

const getCustomer = lastObject(frame('A', START_5, [SYM_0A, SYM_0B, SYM_10, SYM_11, FINAL_1]));
const getOrder = lastObject(frame('A', START_5, [SYM_0A, SYM_11, SYM_0B, SYM_11B, FINAL_1]));
assert(getCustomer?.action === 'GET' && getCustomer.resource === 'CUSTOMER' && getCustomer.argument === '10111', 'GET CUSTOMER 10111');
assert(getOrder?.action === 'GET' && getOrder.resource === 'ORDER' && getOrder.argument === '10111', 'GET ORDER 10111');
assert(getCustomer?.action === getOrder?.action && getCustomer?.resource !== getOrder?.resource, 'only resource flips');

const threeActions: Profile = { actions: ['GET', 'SET', 'DELETE'], resources: ['CUSTOMER', 'ORDER'] };
assert(actionWidth(threeActions) === 2 && headerWidth(threeActions) === 3, '3 actions pay 2 bits');
assert(parseFields('11', threeActions).reserved, 'unused action pattern reserved');

const reference: Turn[] = [
  ...HS,
  { speaker: 'A', utterance: 'Hi.' },
  { speaker: 'A', utterance: START_5 },
  { speaker: 'A', utterance: A_SKIP },
  { speaker: 'B', utterance: B_PEER },
  { speaker: 'A', utterance: SYM_0A },
  { speaker: 'A', utterance: SYM_0B },
  { speaker: 'A', utterance: SYM_10 },
  { speaker: 'B', utterance: SYM_11B },
  { speaker: 'A', utterance: SYM_11 },
  { speaker: 'A', utterance: FINAL_1 },
  { speaker: 'A', utterance: FINISH },
];
const ref = run(reference);
assert(ref[12].outcome === 'FINISH_ARGUMENT', 'ref finish');
assert(ref[12].object?.action === 'GET' && ref[12].object?.resource === 'CUSTOMER' && ref[12].object?.argument === '10111', 'ref GET CUSTOMER 10111');

const start = run([...HS, { speaker: 'A', utterance: START_5 }]).at(-1);
assert(start?.argument_bits === 5 && start.header_remaining === 2 && start.action === null, 'START declares argument only');

const other: Profile = { actions: ['READ', 'WRITE'], resources: ['FILE', 'DATABASE', 'EMAIL', 'CALENDAR'] };
assert(headerWidth(other) === 1 + 2, 'Profile Y is 3-bit header');
assert(parseFields('110', other).action === 'WRITE' && parseFields('110', other).resource === 'EMAIL', 'agreed tables, not GET/CUSTOMER');

console.log('NCMP v0.1  Baseline example profile\n');
console.log('codebooks  profile parameters, not NCMP vocabulary');
console.log('example    GET|SET × CUSTOMER|ORDER, 2-bit header');
console.log('object     GET CUSTOMER 10111 from BODY bits 00+10111');
console.log('reserved   unused codes do not complete');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nNCMP v0.1: values from conversation, meanings from the profile');
