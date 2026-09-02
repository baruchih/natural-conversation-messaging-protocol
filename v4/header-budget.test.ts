/**
 * Header budget characterization.
 *   npm run test:v4-header-budget
 */
import { EVAL_C_ENCODABLE, TABLES, headerCost, headerTurns } from './header-budget.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(headerCost(1, 1) === 0, '1×1 is the constant-type header');
assert(headerCost(2, 2) === 2, '2×2 → 2');
assert(headerCost(4, 6) === 5, '4×6 → 2+3 = 5, not 24');
assert(headerCost(6, 4) === 5, 'cost is not ordered');
assert(headerCost(16, 16) === 8, '16×16 → 8');
assert(headerCost(256, 256) === 16, '256×256 → 16');
assert(headerCost(5, 5) === 6, 'ceil(log2 5)+ceil(log2 5) = 3+3');
assert(headerCost(6, 6) === 6, 'six values still pay three bits each');

for (const row of TABLES) {
  assert(headerCost(row.actions, row.resources) === row.cost, `${row.actions}×${row.resources}`);
}

assert(EVAL_C_ENCODABLE[0] === 2 && EVAL_C_ENCODABLE[1] === 10 && EVAL_C_ENCODABLE[2] === 9, 'Eval-C C_encodable');
assert(headerCost(4, 6) === 5 && 5 >= EVAL_C_ENCODABLE[0], '5-bit header can consume a whole small C');
assert(headerCost(256, 256) > Math.max(...EVAL_C_ENCODABLE), '16-bit header exceeds measured C_encodable');

assert(Math.round(headerTurns(2)) === 7, '2 bits ≈ 7 turns at 0.3');
assert(Math.round(headerTurns(5)) === 17, '5 bits ≈ 17 turns at 0.3');
assert(Math.round(headerTurns(8)) === 27, '8 bits ≈ 27 turns at 0.3');
assert(Math.round(headerTurns(16)) === 53, '16 bits ≈ 53 turns at 0.3');

console.log('V4 header budget\n');
console.log('cost(A,R)   ceil(log2 A) + ceil(log2 R)');
console.log('2×2         2 bits');
console.log('4×6         5 bits');
console.log('C_enc       2, 10, 9   (Eval-C, search-complete)');
console.log('0.3         illustration, not a law');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nHeader-Budget: type bits compete with argument for runway');
