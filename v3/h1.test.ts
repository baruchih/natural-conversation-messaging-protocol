/**
 * V3-H1: arbitrary terminal harvest. Not camouflage. Not capacity.
 *   npm run test:v3-h1
 */
import { decode as decodeN, wellFormed } from '../v1-v2/p7c6.ts';
import { decodeD } from '../v1-v2/p7d1.ts';
import {
  Agent,
  G_POSITION,
  L0,
  U1,
  U2,
  U_APPEAR,
  converged,
  decodeE,
  languageDigest,
  promote,
  select,
} from './h1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-H1  harvest an arbitrary terminal, do not assign it on the wire\n');

assert(select(U1) === 'sunset', `g(U1, ${G_POSITION}) is sunset`);
assert(wellFormed(U1) && decodeD(U1) === 'GET', 'U1 is GET');
assert(decodeE(U1, L0) === 'CUSTOMER', 'U1 is CUSTOMER under L0');
assert(decodeE(U2, L0) === 'NONE', 'U2 is NONE under L0');
assert(wellFormed(U2) && decodeD(U2) === 'GET', 'U2 is a GET question');

const ev = promote(L0, U1);
assert(ev.kind === 'harvested', 'U1 harvests');
assert(ev.token === 'sunset', 'Y is sunset');
assert(!U1.toLowerCase().includes('sunset means'), 'no explicit assignment on the wire');
assert(ev.language.digest === languageDigest(ev.language), 'digest on every promote');
assert(ev.language.digest !== L0.digest, 'language identity changed');
assert(ev.language.customer.includes('that party') && ev.language.customer.includes('sunset'), 'L1 has both');

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
console.log(`U1 N=${decodeN(U1)}  (H1 does not retune to 42)`);

const already = promote(L0, U1, 5);
assert(select(U1, 5) === 'party', 'position 5 is party');
assert(already.kind === 'none', 'token already in L: no change');
assert(already.language.digest === L0.digest, 'party does not grow L');

const reserved = promote(L0, U1, 1);
assert(select(U1, 1) === 'did', 'position 1 is did');
assert(reserved.kind === 'none', 'reserved token: no change');
assert(reserved.language.digest === L0.digest, 'did does not grow L');

assert(decodeE(U_APPEAR, ev.language) === 'NONE', 'appearance is not membership');
assert(decodeE('The sunset was beautiful.', ev.language) === 'NONE', 'short prose still NONE');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-H1: sunset is CUSTOMER only after harvest, and only in the E slot');
