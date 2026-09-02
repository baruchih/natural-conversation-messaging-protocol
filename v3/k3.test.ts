/**
 * V3-K3: A closes the window after uncontrolled B.
 *   npm run test:v3-k3
 */
import { TARGET as K2_TARGET, U2, windowN as k2WindowN } from './k2.ts';
import { A1, TARGET, close, requiredA2, singletonN, sweep } from './k3.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-K3  A completes the window after B replies\n');

assert(TARGET === K2_TARGET, 'same target as K2');
const nA1 = singletonN(A1);
console.log(`A1 N=${nA1}`);
console.log(`B1 example (K2) N=${singletonN(U2)}`);

const k2b = close(U2);
assert(k2b.hit && k2b.window === TARGET, 'closes K2’s B1 to 42');
assert(k2b.a2 !== null && k2WindowN(A1, U2, k2b.a2) === TARGET, 'K2 arithmetic on generated A2');
assert(k2b.need === requiredA2(nA1, singletonN(U2)), 'required residue is target + N(A1) − N(B1)');
console.log(`K2 B1 → need A2=${k2b.need}  generated N=${k2b.nA2}  window=${k2b.window}`);

const s = sweep();
console.log(`B replies ${s.replies}  B residues ${s.residues}  A2 cover ${s.a2Cover}/64`);
console.log(`closes ${s.hits}/${s.replies}  miss needs ${s.missNeed.join(',') || 'none'}`);

assert(s.replies > 100, 'many uncontrolled B replies');
assert(s.hits === s.replies, 'every B reply in the family can be closed');
assert(s.missNeed.length === 0, 'no required A2 residue missing');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-K3: A solves for A2 after B; the window is the target');
