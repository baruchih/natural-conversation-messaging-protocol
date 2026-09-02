/**
 * V4-Code: offline (k1,k2,k3) budgets on frozen F6 sets.
 * Contiguous allocation. No LM. No chosen code.
 *   npm run test:v4-code
 */
import { FROZEN } from './f6.frozen.ts';
import {
  ALPHABET,
  cost,
  decode,
  enumerateBudgets,
  residuesOfSet,
  scoreBudget,
} from './code.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const budgets = enumerateBudgets();
assert(budgets.every((b) => cost(b) <= ALPHABET), 'Kraft: 2k1+4k2+8k3 ≤ 64');
assert(budgets.some((b) => b.k1 === 4 && b.k2 === 4 && b.k3 === 4), 'illustrative 4/4/4 is feasible');
assert(budgets.some((b) => b.k1 === 8 && b.k2 === 6 && b.k3 === 3), 'illustrative 8/6/3 is feasible');
assert(decode(0, { k1: 4, k2: 4, k3: 4 }) === '0', 'contiguous 4/4/4: V=0 → 0');
assert(decode(4, { k1: 4, k2: 4, k3: 4 }) === '1', 'contiguous 4/4/4: V=4 → 1');
assert(decode(11, { k1: 1, k2: 1, k3: 1 }) === '101', '1/1/1: V=11 → 101');
assert(decode(63, { k1: 4, k2: 4, k3: 4 }) === null, 'reserved stays reserved');

assert(FROZEN !== null, 'F6 frozen corpus present');
const sets = FROZEN!.candidates.map((list) => residuesOfSet(list));
assert(sets.length === 18, '18 F6 sets');
assert(sets.every((s) => s.length >= 40), 'each set has legal C6 values');

const scores = budgets.map((b) => scoreBudget(b, sets));
const full = scores.filter((s) => s.fullSets === 18);
const none = scores.filter((s) => s.fullSets === 0);

console.log('V4-Code  offline budgets on frozen F6\n');
console.log(`feasible (k1,k2,k3)     ${budgets.length}`);
console.log(`full coverage 18/18     ${full.length}`);
console.log(`never full              ${none.length}`);
console.log('allocation              contiguous 1 then 2 then 3');
console.log('no residue fitting\n');

console.log('k1 k2 k3  cost  full  mean/14  min  w1  w2  w3');
const interesting = scores
  .slice()
  .sort((a, b) => b.fullSets - a.fullSets || b.budget.k3 - a.budget.k3 || b.budget.k2 - a.budget.k2 || b.budget.k1 - a.budget.k1)
  .slice(0, 12);

for (const s of interesting) {
  const { k1, k2, k3 } = s.budget;
  console.log(
    `${String(k1).padStart(2)} ${String(k2).padStart(2)} ${String(k3).padStart(2)}  ${String(s.cost).padStart(4)}  ${String(s.fullSets).padStart(4)}  ${s.meanCovered.toFixed(2).padStart(7)}  ${String(s.minCovered).padStart(3)}  ${String(s.widthFull[1]).padStart(2)}  ${String(s.widthFull[2]).padStart(2)}  ${String(s.widthFull[3]).padStart(2)}`,
  );
}

console.log('\nillustrative budgets');
for (const b of [
  { k1: 4, k2: 4, k3: 4 },
  { k1: 8, k2: 6, k3: 3 },
  { k1: 8, k2: 4, k3: 4 },
  { k1: 4, k2: 4, k3: 5 },
  { k1: 4, k2: 6, k3: 4 },
]) {
  const s = scores.find((x) => x.budget.k1 === b.k1 && x.budget.k2 === b.k2 && x.budget.k3 === b.k3);
  if (!s) continue;
  console.log(
    `${b.k1}/${b.k2}/${b.k3}  full ${s.fullSets}/18  mean ${s.meanCovered.toFixed(2)}  min ${s.minCovered}  w3 ${s.widthFull[3]}/18`,
  );
}

console.log('\nby k3: best fullSets / 18');
for (let k3 = 8; k3 >= 1; k3--) {
  const at = scores.filter((s) => s.budget.k3 === k3);
  if (at.length === 0) continue;
  const best = at.reduce((a, b) => (b.fullSets > a.fullSets ? b : a));
  console.log(
    `k3=${k3}  best ${best.fullSets}/18  at k1=${best.budget.k1} k2=${best.budget.k2}  mean ${best.meanCovered.toFixed(2)}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-Code: Σ k(b) ≤ 64; contiguous; F6 offline');
