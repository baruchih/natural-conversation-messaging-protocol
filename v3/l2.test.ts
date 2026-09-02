/**
 * V3-L2: one evolution, language frozen, measure F and C.
 *   npm run test:v3-l2
 */
import { decodeE, L0 } from './l1.ts';
import { compareCapacity, L1, SEED_L0, SEED_L1_NEW } from './l2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(decodeE(SEED_L0, L0) === 'CUSTOMER', 'seed0 is CUSTOMER under L0');
assert(decodeE(SEED_L1_NEW, L0) === 'NONE', 'new tail is NONE under L0');
assert(decodeE(SEED_L1_NEW, L1) === 'CUSTOMER', 'new tail is CUSTOMER under L1');

const r = compareCapacity();
console.log('V3-L2  did language evolution buy capacity?\n');
console.log(`P = The restaurant was good, but service was slow.`);
console.log(`L0 { that party }`);
console.log(`    |F| ${r.L0.size}  C64 ${r.L0.residues}/64  ≥5 ${r.L0.ge5}  unique sums ${r.L0.uniqueSums}`);
console.log(`L1 { that party, that holder }`);
console.log(`    |F| ${r.L1.size}  C64 ${r.L1.residues}/64  ≥5 ${r.L1.ge5}  unique sums ${r.L1.uniqueSums}`);
console.log(`|F| grew: ${r.fGrew}   C64 grew: ${r.cGrew}   unique sums grew: ${r.sumsGrew}`);

if (r.fGrew && r.cGrew) {
  console.log('\nresult 1: realization space and 6-bit capacity both grew');
} else if (r.fGrew && !r.cGrew) {
  console.log('\nresult 2: |F| grew; C64 did not (carrier already saturated or collisions)');
} else {
  console.log('\nresult 3: neither grew materially');
}

assert(r.L0.size > 0 && r.L1.size > 0, 'both families nonempty');
assert(r.L0.residues <= 64 && r.L1.residues <= 64, 'C is residues of the published 6-bit carrier');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-L2: language held fixed; C is δ_N states, not sentence count');
