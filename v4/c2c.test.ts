/**
 * C2-C first witness. Frozen scores. Do not regenerate.
 *   npm run test:v4-c2c
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BOOTSTRAP_HINT, CONTROL_SEED, SECONDARY_WIDTH, tSec } from './c2c.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const corpus = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2c.score.json'), 'utf8')) as {
  hint: string;
  hinted: number;
  probes: number;
  meets_bar: boolean;
};
const run = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2c.frozen.json'), 'utf8')) as {
  k: number;
  hint: string;
  t_sec: string;
  hits: number;
  hit: string | null;
  legal: number;
};

assert(BOOTSTRAP_HINT === 'bakery', 'hint declared');
assert(SECONDARY_WIDTH === 8, 'width 8');
assert(tSec() === 0xc1, 'T_sec');
assert(corpus.hint === 'bakery', 'corpus score is this hint');
assert(corpus.hinted === 0 && corpus.probes === 0, 'no accidental bakery PROBE');
assert(corpus.meets_bar, 'observed accidental meets bar');
assert(run.hint === 'bakery', 'same hint');
assert(run.t_sec === `0x${tSec().toString(16)}`, 'same T_sec');
assert(run.hits === 0 && run.hit === null, 'no reachability hit');
assert(run.legal >= 1, 'encoder used the hint');
assert(CONTROL_SEED === 0x9ca2c1c1, 'C1 seed');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C2-C first witness frozen ok');
