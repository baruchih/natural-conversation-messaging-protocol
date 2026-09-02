/**
 * C1-D distribution. Not process.
 *   npm run test:v4-c1d
 */
import { analyze, loadCorpus, loadSeeds } from './c1d.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const seeds = loadSeeds();
const corpus = loadCorpus();
const r = analyze(corpus, seeds);

assert(seeds.length === 256, '256 predeclared seeds');
assert(r.n === 58256, `frozen N=${r.n}`);
assert(r.space === 1 << 24, '24-bit space');
assert(r.max_freq <= 2, `max freq ${r.max_freq}`);
assert(r.observed_pairs === 97, `pairs ${r.observed_pairs}`);
assert(Math.abs(r.observed_pairs - r.expected_pairs) < 20, 'pairs near uniform');
assert(r.bit_frac_min > 0.49 && r.bit_frac_max < 0.51, 'bit balance');
assert(r.chi8 < 320, `chi8 ${r.chi8}`);
assert(r.chi12 < 4300, `chi12 ${r.chi12}`);
assert(r.short_chi8 !== null && r.short_chi8 < 320, 'short utterances');
assert(r.long_chi8 !== null && r.long_chi8 < 320, 'long utterances');
assert(r.construction_seed_hits === 0, 'C1 seed not hit');
assert(r.max_target_hits <= 1, 'no hot predeclared target');
assert(r.observed_target_hits <= 6, `target hits ${r.observed_target_hits}`);
assert(r.slack === 256, '256× slack over 2^-16');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C1-D distribution ok');
