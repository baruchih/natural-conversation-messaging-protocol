/**
 * V3-L3: capacity frontier of the L2 languages. Same letter-sum, larger M.
 *   npm run test:v3-l3
 */
import { frontier } from './l3.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const { rows, star0, star1 } = frontier();

console.log('V3-L3  did evolution move the capacity frontier?\n');
console.log('M      bits   L0              L1');
for (const r of rows) {
  const a = `${r.L0}/${r.modulus} ${r.L0pass ? 'PASS' : 'FAIL'}`;
  const b = `${r.L1}/${r.modulus} ${r.L1pass ? 'PASS' : 'FAIL'}`;
  console.log(`${String(r.modulus).padEnd(7)} ${String(r.bits).padEnd(6)} ${a.padEnd(16)} ${b}`);
}

console.log(`\nC*(L0,P) = ${star0 ?? 'none in sweep'}`);
console.log(`C*(L1,P) = ${star1 ?? 'none in sweep'}`);
if (star1 !== null && star0 !== null && star1 > star0) {
  console.log(`frontier moved: ${Math.log2(star0)} → ${Math.log2(star1)} bits`);
} else if (star0 === star1) {
  console.log('frontier did not move');
} else {
  console.log('frontier did not increase');
}

assert(rows[0].modulus === 64 && rows[0].L0pass && rows[0].L1pass, 'C6 still PASS on both');
assert(star0 === 64 || star0 === 128 || star0 === 256 || star0 === 512 || star0 === 1024 || star0 === null, 'C* is a sweep modulus or none');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-L3: same F as L2; C* is full coverage at M, not unique sums');
