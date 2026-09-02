/**
 * V3-K1: N in a three-turn relation. No camouflage. No D/E.
 *   npm run test:v3-k1
 */
import { TARGET, U1, U2, U3, WINDOW, singletonN, wellFormedWindow, windowFrame, windowN } from './k1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-K1  relational N across a conversational window\n');

assert(wellFormedWindow(WINDOW), 'all three turns well-formed');

const { n, singles } = windowFrame(WINDOW);
const [n1, n2, n3] = singles;

console.log(`A1  N=${n1}  ${U1}`);
console.log(`B1  N=${n2}  ${U2}`);
console.log(`A2  N=${n3}  ${U3}`);
console.log(`windowN(A1,B1,A2) = ${n}  target ${TARGET}`);

assert(n1 !== TARGET && n2 !== TARGET && n3 !== TARGET, 'no singleton carries the target');
assert(n === TARGET, 'window carries 42');
assert(windowN(U1, U2, U3) === TARGET, 'both sides compute the same g from the same window');

const broken = windowN(U1, U2, U1);
assert(broken !== TARGET, 'replacing A2 with A1 loses the target');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-K1: 42 is a relation among turns, not a property of one string');
