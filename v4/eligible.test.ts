/**
 * V4 eligibility / wire-language audit.
 *   npm run test:v4-eligible
 * Does not change Profile 0.
 */
import { decode } from '../v1-v2/p7c6.ts';
import {
  RESTRICTIONS,
  UUID_MISS,
  auditSet,
  carrier,
  encoderAcceptable,
  gates,
  noDigits,
  protocolDecodes,
  turnOk,
  turnOkIfDigitsAllowed,
  vDefined,
  wellFormed,
} from './eligible.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const CLOCK = 'Let’s meet around 7:30 before the lot fills up.';
const CLOCK_ROW = gates(CLOCK);
const SIX = 'How about we meet at the usual gate around six?';
const SHORT = 'Hi.';
const TWO = 'Oh nice! How was the vibe once they arrived?';
const miss = auditSet(UUID_MISS);

console.log('V4-Eligible  wire-language audit  turnOk is encoder hygiene\n');
console.log('restriction                 V  state  payload  origin');
for (const r of RESTRICTIONS) {
  const v = r.neededForV ? 'yes' : 'no';
  const s = r.neededForState ? 'yes' : 'no';
  const p = r.neededForPayloadDecode ? 'yes' : 'no';
  console.log(`${r.id.padEnd(28)} ${v.padEnd(4)} ${s.padEnd(6)} ${p.padEnd(8)} ${r.need}`);
}

console.log(`\nC6 V on clock time          ${CLOCK_ROW.v}`);
console.log(`turnOk                     ${CLOCK_ROW.turnOk}`);
console.log(`wellFormed                 ${CLOCK_ROW.wellFormed}`);
console.log(`V defined                  ${CLOCK_ROW.vDefined}`);
console.log(`digits allowed → turnOk    ${turnOkIfDigitsAllowed(CLOCK)}`);

console.log(`\nUUID U12  peer  “before the lot fills up”`);
console.log(`parsed                    ${miss.n}`);
console.log(`turnOk                    ${miss.turnOk}`);
console.log(`wellFormed                ${miss.wellFormed}`);
console.log(`V defined                 ${miss.vDefined}/${miss.n}`);
console.log(`contain digits            ${miss.failDigits}`);
console.log(`fail digits only          ${miss.failDigitsOnly}`);
console.log(`would pass minus digits   ${miss.wouldPassWithoutDigitBan}`);
console.log(`fail tokens / letters     ${miss.failTokens} / ${miss.failLetters}`);
console.log(`control                   ${miss.control}`);

assert(vDefined(CLOCK) && vDefined('') && vDefined(SHORT), 'V is total');
assert(protocolDecodes(CLOCK) && protocolDecodes(''), 'protocol decode is total');
assert(!encoderAcceptable(CLOCK) && encoderAcceptable(SIX), 'turnOk is encoder hygiene');
assert(carrier(CLOCK) === decode(CLOCK), 'C6 decode is the carrier');
assert(Number.isInteger(CLOCK_ROW.v) && CLOCK_ROW.v >= 0 && CLOCK_ROW.v < 64, 'clock V in 0..63');
assert(!CLOCK_ROW.turnOk && !CLOCK_ROW.wellFormed, 'clock rejected by grammar');
assert(!CLOCK_ROW.digits && CLOCK_ROW.terminal && CLOCK_ROW.tokens && CLOCK_ROW.letters, 'clock fails digits only');
assert(turnOkIfDigitsAllowed(CLOCK), 'clock is a conversational turn if digits are allowed');
assert(noDigits(SIX) && turnOk(SIX), 'spelled six is eligible');
assert(!turnOk(SHORT) && !turnOkIfDigitsAllowed(SHORT), 'Hi. fails mins, not digits');
assert(turnOk(TWO) && !wellFormed(TWO), 'M2 already dropped single-sentence');

assert(miss.n === 46, `U12 parsed ${miss.n}`);
assert(miss.turnOk === 0, 'U12 zero legal');
assert(miss.vDefined === miss.n, 'every U12 candidate has V');
assert(miss.failDigits === miss.n, 'every U12 candidate has a digit');
assert(miss.failDigitsOnly === miss.n, 'U12 fails the digit ban only');
assert(miss.wouldPassWithoutDigitBan === miss.n, 'all 46 are turns if digits are allowed');
assert(miss.failTokens === 0 && miss.failLetters === 0 && miss.failTerminal === 0, 'U12 mins hold');
assert(miss.control === 0, 'U12 is not START/FINISH');

const inherit = RESTRICTIONS.filter((r) => r.inTurnOk && !r.neededForV && !r.neededForState && !r.neededForPayloadDecode);
assert(inherit.some((r) => r.id === 'digits forbidden'), 'digit ban is inherited');
assert(inherit.length === 4, 'terminal, tokens, letters, digits are inherited reject gates');
assert(
  RESTRICTIONS.every((r) => r.neededForPayloadDecode === r.neededForV),
  'payload decode needs nothing beyond V',
);
assert(
  !RESTRICTIONS.some((r) => r.id.includes('D / E') && (r.inTurnOk || r.inWellFormed)),
  'no D/E remnant in eligibility',
);

if (failed > 0) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log('\nV4-Eligible: turnOk is encoder hygiene. Body membership locked yes.');
