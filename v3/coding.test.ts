/**
 * V3 coding rule: R, π, accept. Published arithmetic only.
 * Not F4. No LM. No frame.
 *   npm run test:v3-coding
 */
import { decode } from '../v1-v2/p7c6.ts';

/** Published illustrations. Not an F4 frame. */
const LAST = 'Shall we begin this round now?';
const U = 'How was dinner last night after you sat down?';
const OTHER = 'Pretty good overall though the service was a little slow.';
import {
  R_MAX,
  R_MIN,
  accept,
  acceptBits,
  carrier,
  rate,
  symbol,
  symbolBits,
} from './coding.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(carrier(LAST) === decode(LAST), 'V is C6');
assert(carrier(LAST) === carrier(LAST), 'same last → same V');

const remaining = 8;
const rA = rate(LAST, remaining);
const rB = rate(LAST, remaining);
assert(rA === rB, 'A and B compute the same r from last');
assert(rA >= R_MIN && rA <= R_MAX, 'opportunity is 1..3 when remaining ≥ 3');
assert(rate(LAST, 0) === 0, 'remaining 0 → r 0');
assert(rate(LAST, 1) === 1, 'remaining caps r');
assert(rate(LAST, remaining) === rA, 'rate depends on last, not on a private sample');

assert(symbol(42, 1) === 0, '42 mod 2 = 0');
assert(symbol(42, 2) === 2, '42 mod 4 = 2');
assert(symbol(42, 3) === 2, '42 mod 8 = 2');
assert(symbolBits(42, 3) === '010', 'symbol is r bits, not six');

const r = rate(LAST, remaining);
const need = symbol(carrier(U), r);
assert(accept(U, r, need), 'the uttered V is accepted for its own symbol');
assert(!accept(U, r, (need + 1) % (1 << r)), 'a different need is rejected');
assert(acceptBits(U, r, symbolBits(carrier(U), r)), 'bit-string accept matches');

const otherNeed = symbol(carrier(OTHER), r);
if (otherNeed !== need) {
  assert(!accept(OTHER, r, need), 'a different V is not a private alternative');
}

assert(need === symbol(carrier(U), rate(LAST, remaining)), 'listener π matches speaker π');

console.log('V3 coding  published R / π / accept\n');
console.log(`V(last)           ${carrier(LAST)}`);
console.log(`R(last, 8)        ${r}`);
console.log(`V(U)              ${carrier(U)}`);
console.log(`π(V, r)           ${symbolBits(carrier(U), r)}  (${need})`);
console.log('same H → same r, same π, same accept');
console.log('no LM, no candidate set, no target 42');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3 coding: rₙ = R(Hₙ); accept ⇔ πₙ(V(U)) = need');
