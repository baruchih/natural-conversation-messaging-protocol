/**
 * V3-HK2: W1 harvests X; overlapping W2 consumes X.
 *   npm run test:v3-hk2
 */
import { L0, converged } from './h1.ts';
import {
  A1,
  F1_TARGET,
  F2_TARGET,
  L1,
  Peer,
  TURNS,
  W1,
  W2,
  WINDOW_PROFILE,
  X,
  closeWindow,
  isGetCustomer42,
  singletonFrame,
  windowE,
  windowFrame,
} from './hk2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-HK2  W1 harvests; overlapping W2 consumes\n');

assert(WINDOW_PROFILE.width === 3 && WINDOW_PROFILE.relation === 'K2', 'K4 clock');
assert(!L0.customer.includes(X), 'start without X');
assert(A1.toLowerCase().includes('that party'), 'A1 names L0 construction');
assert(!A1.toLowerCase().includes('find that party'), 'A1 is not find-that-party');

const t1 = closeWindow(W1, L0, [TURNS[0], TURNS[1]]);
const t2 = closeWindow(W2, t1.language, [TURNS[0], TURNS[1], TURNS[2]]);

console.log(`X   ${X}`);
console.log(`A1  D=${singletonFrame(TURNS[0], L0).d} E=${singletonFrame(TURNS[0], L0).e} N=${singletonFrame(TURNS[0], L0).n}`);
console.log(`    ${TURNS[0]}`);
console.log(`B1  D=${singletonFrame(TURNS[1], L0).d} E=${singletonFrame(TURNS[1], L0).e} N=${singletonFrame(TURNS[1], L0).n}`);
console.log(`    ${TURNS[1]}`);
console.log(`A2  D=${singletonFrame(TURNS[2], L0).d} E=${singletonFrame(TURNS[2], L0).e} N=${singletonFrame(TURNS[2], L0).n}`);
console.log(`    ${TURNS[2]}`);
console.log(`B2  D=${singletonFrame(TURNS[3], t1.language).d} E=${singletonFrame(TURNS[3], t1.language).e} N=${singletonFrame(TURNS[3], t1.language).n}`);
console.log(`    ${TURNS[3]}`);
console.log(`W1 / L0   D=${t1.frame.d} E=${t1.frame.e} N=${t1.frame.n}`);
console.log(`W2 / L0   E=${windowE(W2, L0)}`);
console.log(`W2 / L1   D=${t2.frame.d} E=${t2.frame.e} N=${t2.frame.n}`);
console.log(`L1 = { ${t1.language.customer.join(', ')} }`);

assert(isGetCustomer42(t1.frame), 'W1 under L0 is GET CUSTOMER 42');
assert(t1.harvest.kind === 'harvested' && t1.harvest.token === X, 'W1 harvests X');
assert(L1.customer.includes(X), 'L1 contains X');
assert(windowE(W2, L0) === 'NONE', 'killer: W2 under L0 is not CUSTOMER');
assert(windowE(W2, t1.language) === 'CUSTOMER', 'W2 under L1 is CUSTOMER');
assert(t2.frame.e === 'CUSTOMER' && t2.frame.n === F2_TARGET, `W2 under L1 is CUSTOMER ${F2_TARGET}`);
assert(t1.frame.n === F1_TARGET, 'W1 N is 42');
assert(!W1.some((u) => isGetCustomer42(singletonFrame(u, L0))), 'no W1 singleton is the frame');
assert(!TURNS[2].toLowerCase().includes('find sunset'), 'A2 is not find-sunset');

const A = new Peer();
const B = new Peer();
assert(converged(A.language, B.language), 'start converged');
for (const u of TURNS) {
  A.accept(u);
  B.accept(u);
}
assert(A.turns.join('\n') === B.turns.join('\n'), 'shared transcript');
assert(A.frames.length === 2 && B.frames.length === 2, 'two frames');
assert(
  A.frames.every((f, i) => f.d === B.frames[i].d && f.e === B.frames[i].e && f.n === B.frames[i].n),
  'shared frames',
);
assert(converged(A.language, B.language), 'end converged');
assert(A.frames[0].e === 'CUSTOMER' && A.frames[1].e === 'CUSTOMER', 'both frames have E');
assert(windowFrame(W2, L0).e === 'NONE', 'same W2 without the mutation is NONE');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-HK2: W1 mutates L; overlapping W2 consumes the mutation');
