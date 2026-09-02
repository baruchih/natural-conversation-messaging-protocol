/**
 * C2-D frozen scores. Do not regenerate.
 *   npm run test:v4-c2d
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BOOTSTRAP_HINT, SECONDARY_WIDTH, hasHint, isProbeC2D, tSec } from './c2d.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const corpus = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2d.score.json'), 'utf8')) as {
  n: number;
  hinted: number;
  probes: number;
  meets_bar: boolean;
};
const run = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2d.frozen.json'), 'utf8')) as {
  hint: string;
  hits: number;
  hit: string | null;
};

assert(BOOTSTRAP_HINT === 'umbrella', 'declared hint');
assert(SECONDARY_WIDTH === 6, 'declared width');
assert(tSec() === 0x01, 'T_sec');
assert(corpus.n === 99434, 'held-out N');
assert(corpus.hinted === 58, 'hint count');
assert(corpus.probes === 1, 'one accidental PROBE');
assert(corpus.meets_bar, 'accidental ≤ 2^-16');
assert(run.hint === 'umbrella', 'same hint');
assert(run.hits === 3, 'three encoder hits');
assert(run.hit !== null && hasHint(run.hit) && isProbeC2D(run.hit), 'chosen hit is PROBE');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C2-D YES frozen ok');
