/**
 * V3-L4: same f, repeated, until the toy grammar stops.
 *   npm run test:v3-l4
 */
import { L0 } from './l1.ts';
import { curve, family, nextGrow, seedFor, U_L1 } from './l4.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const points = curve();
const last = points[points.length - 1];

console.log('V3-L4  does accumulated growth move C*?\n');
console.log('n   L                    |L|   |F|     unique  C*');
for (const p of points) {
  const lex = `{ ${p.language.customer.join(', ')} }`;
  console.log(
    `${String(p.n).padEnd(4)}${lex.padEnd(42)} ${String(p.sizeL).padEnd(5)} ${String(p.sizeF).padEnd(7)} ${String(p.uniqueSums).padEnd(7)} ${p.star ?? 'none'}`,
  );
  const bits = p.coverage
    .map((c) => `C${Math.log2(c.modulus)} ${c.hit}/${c.modulus} ${c.pass ? 'PASS' : 'FAIL'}`)
    .join('  ');
  console.log(`    ${bits}`);
}

assert(points[0].language.digest === L0.digest, 'curve starts at frozen L0');
assert(points[0].sizeF === 3024 && points[0].uniqueSums === 357 && points[0].star === 256, 'L0 matches L3');
assert(points.length >= 2, 'at least one evolve');
assert(points[1].language.customer.includes('that holder'), 'first grow is frozen L1');
assert(points[1].sizeF === 6048 && points[1].uniqueSums === 384 && points[1].star === 256, 'L1 matches L3');
assert(nextGrow(last.language) === null, 'toy f is exhausted');
assert(family(L0).length === family(points[0].language).length, 'L0 family via seedFor(that party)');
assert(seedFor('that party') === 'Did we find the restaurant was good but service was slow for that party?');
assert(U_L1.includes('the holder'), 'first U is the L1 derivation');

const stars = points.map((p) => p.star);
const jumped = stars.some((s, i) => i > 0 && s !== null && stars[0] !== null && s > stars[0]);
if (jumped) {
  console.log(`\nfrontier moved: ${stars[0]} → ${last.star}`);
} else {
  console.log(`\nfrontier did not move (C* = ${last.star} through L${last.n})`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-L4: same f; C* is coverage, not |L| or unique sums');
