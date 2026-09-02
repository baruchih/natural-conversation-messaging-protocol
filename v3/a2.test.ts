/**
 * V3-A2: conditional carrier entropy of B₂ given frozen A₂.
 *   npm run test:v3-a2
 */
import { FROZEN_B2 } from './a2.frozen.ts';
import { FROZEN_DRAWS } from './m3.frozen.ts';
import { DRAWS } from './m3.ts';
import { PREFIXES, REPLIES, promptIsBlindReply, runFrozenCond } from './a2.ts';

const EXPECTED: Record<string, { n: number; hA: string; hB: string; hAB: string; cell: string }> = {
  p1: { n: 1600, hA: '5.19', hB: '8.75', hAB: '10.55', cell: '4.93' },
  p2: { n: 1600, hA: '5.56', hB: '8.74', hAB: '10.58', cell: '4.94' },
  p3: { n: 1600, hA: '5.31', hB: '8.78', hAB: '10.56', cell: '4.94' },
  p4: { n: 1600, hA: '5.25', hB: '8.75', hAB: '10.57', cell: '4.95' },
  p5: { n: 1599, hA: '4.81', hB: '8.76', hAB: '10.50', cell: '4.94' },
  p6: { n: 1600, hA: '5.56', hB: '8.75', hAB: '10.54', cell: '4.90' },
};

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(REPLIES === 32, 'REPLIES declared before scoring');
assert(PREFIXES.every((p) => (FROZEN_DRAWS[p.id] ?? []).length === DRAWS), 'frozen A2 size');
assert(
  PREFIXES.every((p) => promptIsBlindReply(p, FROZEN_DRAWS[p.id][0])),
  'reply prompt blind',
);

console.log('V3-A2  V(B₂) | frozen A₂   V = (C6, T8)\n');
console.log('id    n     H(A)   H(B)   H(AB)  H(B|A₂ text)');
const rows = runFrozenCond(FROZEN_B2);
for (const s of rows) {
  const exp = EXPECTED[s.prefix.id];
  const b2 = FROZEN_B2[s.prefix.id] ?? [];
  assert(b2.length === DRAWS, `${s.prefix.id} A2 rows`);
  assert(b2.every((row) => row.length === REPLIES), `${s.prefix.id} k`);
  assert(s.cond.nPairs === exp.n, `${s.prefix.id} pairs`);
  assert(s.cond.hA.toFixed(2) === exp.hA, `${s.prefix.id} H(A)`);
  assert(s.cond.hB.toFixed(2) === exp.hB, `${s.prefix.id} H(B)`);
  assert(s.cond.hAB.toFixed(2) === exp.hAB, `${s.prefix.id} H(AB)`);
  assert(s.meanGivenText.toFixed(2) === exp.cell, `${s.prefix.id} cell`);
  console.log(
    `${s.prefix.id}   ${String(s.cond.nPairs).padEnd(5)} ${s.cond.hA.toFixed(2)}   ${s.cond.hB.toFixed(2)}   ${s.cond.hAB.toFixed(2)}  ${s.meanGivenText.toFixed(2)}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-A2: ~4.9 bits after an exact A₂; there is no A3');
