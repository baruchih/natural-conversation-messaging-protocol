/**
 * V3-L1: one derived construction. Not a codebook. Not a model.
 *   npm run test:v3-l1
 */
import {
  Agent,
  L0,
  converged,
  decodeE,
  evolve,
  language,
  languageDigest,
} from './l1.ts';

const U1 = 'Did we find the restaurant was good but service was slow for that party and the holder?';
const U2 = 'Did we find the restaurant was good but service was slow for that holder?';
const TRANSMIT = 'Did we find the restaurant was good but service was slow for that party and that holder?';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-L1  derive Y, do not transmit it\n');

assert(decodeE(U1, L0) === 'CUSTOMER', 'U1 valid under L0');
assert(decodeE(U2, L0) === 'NONE', 'U2 invalid under L0');

const ev = evolve(L0, U1);
assert(ev.kind === 'derived', 'U1 derives');
assert(ev.y === 'that holder', 'Y = that + holder');
assert(!U1.toLowerCase().includes('that holder'), 'Y was not on the wire');
assert(ev.language.digest === languageDigest(ev.language), 'digest on every evolve');
assert(ev.language.digest !== L0.digest, 'language identity changed');

assert(decodeE(U2, ev.language) === 'CUSTOMER', 'U2 valid only under L1');
assert(decodeE(U2, L0) === 'NONE', 'killer: S0 still NONE');

const A = new Agent('A');
const B = new Agent('B');
assert(converged(A.language, B.language), 'start converged');
A.receive(U1);
B.receive(U1);
assert(converged(A.language, B.language), 'H(L1A) == H(L1B)');
assert(A.receive(U2).entity === 'CUSTOMER', 'A accepts U2 under L1');
assert(B.receive(U2).entity === 'CUSTOMER', 'B accepts U2 under L1');
console.log(`L1 = { ${A.language.customer.join(', ')} }`);
console.log(`digest ${A.language.digest.slice(0, 12)}…`);

const sent = evolve(L0, TRANSMIT);
assert(sent.kind === 'transmission', 'verbatim Y is transmission');
assert(sent.language.digest === L0.digest, 'transmission does not grow L');
assert(decodeE(U2, sent.language) === 'NONE', 'U2 still NONE after transmission');

const C = new Agent('C', L0);
const D = new Agent('D', language(['that party', 'this person']));
assert(!converged(C.language, D.language), 'priors differ');
C.receive(U1);
D.receive(U1);
assert(!converged(C.language, D.language), 'same U does not silently unify dialects');
const next = 'Did we find the restaurant was good but service was slow for that holder?';
assert(C.receive(next).entity === 'CUSTOMER', 'C evolved');
assert(D.receive(next).entity === 'CUSTOMER' || !converged(C.language, D.language), 'fork remains visible');
assert(!converged(C.language, D.language), 'refuse: digests still differ');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-L1: U2 is CUSTOMER only after derived evolve; transmission does not count');
