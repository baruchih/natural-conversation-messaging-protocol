/**
 * V4-F6: Result #6, PARTIAL, frozen.
 * Independent opportunities. Not a calibrated R.
 *   npm run test:v4-f6
 */
import { CONTEXTS as F5_CONTEXTS, lastOf as f5Last } from './f5.ts';
import { FROZEN } from './f6.frozen.ts';
import {
  BATCH,
  DRAWS,
  OPPORTUNITIES,
  declaredRate,
  groupByRate,
  lastOf,
  scoreOpportunity,
} from './f6.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(BATCH === 50, 'k = 50 stays frozen');
assert(DRAWS === 6, 'N = 6 per rate, declared');
assert(OPPORTUNITIES.length === 18, '18 independent opportunities');
assert(OPPORTUNITIES.filter((o) => declaredRate(o) === 1).length === 6, 'six r=1');
assert(OPPORTUNITIES.filter((o) => declaredRate(o) === 2).length === 6, 'six r=2');
assert(OPPORTUNITIES.filter((o) => declaredRate(o) === 3).length === 6, 'six r=3');
assert(
  OPPORTUNITIES.every((o) => o.need.length === declaredRate(o)),
  'declared need matches R(last)',
);

const f5Lasts = new Set(F5_CONTEXTS.map(f5Last));
assert(
  OPPORTUNITIES.every((o) => !f5Lasts.has(lastOf(o))),
  'F6 lasts are not F5 lasts',
);
assert(new Set(OPPORTUNITIES.map((o) => o.id)).size === 18, 'ids unique');

console.log('V4-F6  independent opportunities, frozen R / π / k\n');
console.log(`N per rate        ${DRAWS}`);
console.log(`k                 ${BATCH}`);
console.log('one generation per context; one declared symbol; no set reuse');

if (FROZEN) {
  const rows = FROZEN.rows.map((row, i) => {
    const opp = OPPORTUNITIES.find((o) => o.id === row.id);
    assert(!!opp, `frozen id ${row.id}`);
    const scored = scoreOpportunity(opp!, FROZEN.candidates[i] ?? []);
    assert(scored.hit === row.hit, `${row.id} replay hit`);
    assert(scored.covered === row.covered, `${row.id} replay coverage`);
    return scored;
  });
  console.log('\nr  opportunities  hit  miss');
  for (const g of groupByRate(rows)) {
    console.log(`${g.r}  ${String(g.n).padEnd(15)}${String(g.hit).padEnd(5)}${g.miss}`);
  }
  const hits = rows.filter((x) => x.hit);
  const examined = hits.length ? hits.reduce((n, x) => n + x.examined, 0) / hits.length : 0;
  console.log(`NO_CANDIDATE      ${rows.filter((x) => !x.hit).length}/${rows.length}`);
  console.log(`examined/hit      ${examined.toFixed(2)}`);
  console.log('\nr  covered/bins (mean)');
  for (const r of [1, 2, 3]) {
    const at = rows.filter((x) => x.r === r);
    const mean = at.reduce((n, x) => n + x.covered, 0) / at.length;
    console.log(`${r}  ${mean.toFixed(2)}/${1 << r}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F6: fresh set, one bin, no reuse');
