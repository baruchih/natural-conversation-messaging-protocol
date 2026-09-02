/**
 * V3-A1: joint carrier state on frozen M3. No new sentences.
 *   npm run test:v3-a1
 */
import { DRAWS } from './m3.ts';
import { runFrozenAccum } from './a1.ts';

const EXPECTED: Record<string, { support: number; h: string; coll: string; pair: number; pairH: string }> = {
  p1: { support: 40, h: '5.19', coll: '0.031', pair: 1600, pairH: '10.38' },
  p2: { support: 48, h: '5.56', coll: '0.022', pair: 2304, pairH: '11.13' },
  p3: { support: 42, h: '5.31', coll: '0.027', pair: 1764, pairH: '10.62' },
  p4: { support: 41, h: '5.25', coll: '0.029', pair: 1681, pairH: '10.51' },
  p5: { support: 33, h: '4.81', coll: '0.042', pair: 1089, pairH: '9.63' },
  p6: { support: 48, h: '5.56', coll: '0.022', pair: 2304, pairH: '11.13' },
};

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const { prefixes, pooled } = runFrozenAccum();

console.log('V3-A1  V = (C6, T8)  frozen M3\n');
console.log('id   |V|   H(V)   coll   |V,V\'|  H(V,V\')');
for (const s of prefixes) {
  const exp = EXPECTED[s.prefix.id];
  assert(s.closer.n === DRAWS, `${s.prefix.id} n`);
  assert(s.closer.support === exp.support, `${s.prefix.id} support`);
  assert(s.closer.entropy.toFixed(2) === exp.h, `${s.prefix.id} H`);
  assert(s.closer.collision.toFixed(3) === exp.coll, `${s.prefix.id} collision`);
  assert(s.pair.support === exp.pair, `${s.prefix.id} pair support`);
  assert(s.pair.entropy.toFixed(2) === exp.pairH, `${s.prefix.id} pair H`);
  assert(Math.abs(s.pair.entropy - 2 * s.closer.entropy) < 1e-12, `${s.prefix.id} product is 2H`);
  assert(s.window.entropy === s.closer.entropy, `${s.prefix.id} prefix is fixed`);
  console.log(
    `${s.prefix.id}   ${String(s.closer.support).padEnd(5)} ${s.closer.entropy.toFixed(2)}   ${s.closer.collision.toFixed(3)}   ${String(s.pair.support).padEnd(6)} ${s.pair.entropy.toFixed(2)}`,
  );
}

console.log('\npooled 300\n');
console.log(`V(U)       ${pooled.closer.support}  ${pooled.closer.entropy.toFixed(2)}  ${pooled.closer.collision.toFixed(3)}`);
console.log(`(A1, B1)     ${pooled.prefixPair.support}  ${pooled.prefixPair.entropy.toFixed(2)}  ${pooled.prefixPair.collision.toFixed(3)}`);
console.log(`(A1, B1, U) ${pooled.window.support}  ${pooled.window.entropy.toFixed(2)}  ${pooled.window.collision.toFixed(3)}`);

assert(pooled.closer.n === 300, 'pooled n');
assert(pooled.closer.support === 214 && pooled.closer.entropy.toFixed(2) === '7.58', 'pooled closer');
assert(pooled.prefixPair.support === 6 && pooled.prefixPair.entropy.toFixed(2) === '2.58', 'six prefixes');
assert(pooled.window.support === 252 && pooled.window.entropy.toFixed(2) === '7.87', 'pooled window');
assert(pooled.aThenU.support === 252 && pooled.bThenU.support === 252, 'A then U / B then U');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-A1: accumulate, do not hunt the missing bit');
