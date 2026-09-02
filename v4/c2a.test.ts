/**
 * C2-A frozen run. Do not regenerate.
 *   npm run test:v4-c2a
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONTROL_SEED, K, p, tProbe } from './c2a.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const frozen = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2a.frozen.json'), 'utf8')) as {
  k: number;
  seed: string;
  t_probe: string;
  result: string;
  a: { considered: number; legal: number; hits: number; hit: string | null; candidates: { u: string; p: number; hit: boolean }[] };
  b: unknown;
};

assert(frozen.k === K, 'k = 50');
assert(frozen.seed === `0x${CONTROL_SEED.toString(16)}`, 'same C1 seed');
assert(frozen.t_probe === `0x${tProbe().toString(16)}`, 'T_probe');
assert(frozen.a.considered === 50, 'one set of 50');
assert(frozen.a.legal === 50, 'all legal under §4');
assert(frozen.a.hits === 0, 'no probe hit');
assert(frozen.a.hit === null, 'no chosen U_probe');
assert(frozen.b === null, 'B was not generated');
assert(frozen.result === 'NO', 'C2-A is NO');
assert(
  frozen.a.candidates.every((c) => p(c.u) !== tProbe() || c.hit === false),
  'no silent T_probe hit',
);

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C2-A frozen NO ok');
