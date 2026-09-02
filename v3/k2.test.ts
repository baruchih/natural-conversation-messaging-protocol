/**
 * V3-K2: N irreducible in A1, B1, A2. Not camouflage.
 *   npm run test:v3-k2
 */
import { TARGET as K1_TARGET, U3 as K1_A2, windowN as k1WindowN } from './k1.ts';
import { ALT_A1, ALT_A2, ALT_B1, TARGET, U1, U2, U3, WINDOW, wellFormedWindow, windowFrame, windowN } from './k2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-K2  N depends on all three turns, including B\n');

assert(wellFormedWindow(WINDOW), 'window well-formed');
assert(U3 !== K1_A2, 'A2 is not K1’s A2');

const { n, singles } = windowFrame(WINDOW);
const [n1, n2, n3] = singles;

console.log(`A1  N=${n1}  ${U1}`);
console.log(`B1  N=${n2}  ${U2}`);
console.log(`A2  N=${n3}  ${U3}`);
console.log(`windowN = (ΣA2 − ΣA1 + ΣB1) mod 64 = ${n}`);

assert(n1 !== TARGET && n2 !== TARGET && n3 !== TARGET, 'no singleton is 42');
assert(n === TARGET, 'window is 42');
assert(windowN(U1, U2, U3) === TARGET, 'both sides same value');

assert(k1WindowN(U1, U2, U3) !== TARGET, 'K1’s A2-only difference is not 42 on this window');
assert(windowN(ALT_A1, U2, U3) !== TARGET, 'change A1 loses 42');
assert(windowN(U1, ALT_B1, U3) !== TARGET, 'change B1 loses 42');
assert(windowN(U1, U2, ALT_A2) !== TARGET, 'change A2 loses 42');

console.log(`alt A1 → ${windowN(ALT_A1, U2, U3)}`);
console.log(`alt B1 → ${windowN(U1, ALT_B1, U3)}`);
console.log(`alt A2 → ${windowN(U1, U2, ALT_A2)}`);
assert(K1_TARGET === TARGET, 'same published target');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-K2: B’s reply is in the value; no turn is disposable');
