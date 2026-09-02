/**
 * P7-D1: GET|ALLOW must survive C6 N-edits.
 *   npm run test:d1
 */
import { decode as decodeN, wellFormed } from './p7c6.ts';
import { missingPoles } from './p7c6.lm.ts';
import { d1Coverage, d1ForResidue, decodeD, legalD1Candidates } from './p7d1.ts';

const GET_SEED = 'Did we find the restaurant was good but service was slow?';
const ALLOW_SEED = 'I confirm the restaurant was good but service was slow.';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('P7-D1  one-bit D ∈ {GET, ALLOW} orthogonal to C6 N\n');

assert(decodeD(GET_SEED) === 'GET', 'GET seed');
assert(decodeD(ALLOW_SEED) === 'ALLOW', 'ALLOW seed');
assert(missingPoles(GET_SEED).length === 0, 'GET seed poles');
assert(missingPoles(ALLOW_SEED).length === 0, 'ALLOW seed poles');
assert(wellFormed(GET_SEED) && wellFormed(ALLOW_SEED), 'seeds well-formed');

for (const [label, seed] of [
  ['GET', GET_SEED],
  ['ALLOW', ALLOW_SEED],
] as const) {
  const cov = d1Coverage(seed);
  const family = legalD1Candidates(seed);
  const flipped = family.filter((c) => c.discourse !== label || decodeD(c.utterance) !== label);
  const both = family.filter((c) => decodeD(c.utterance) === 'NONE');

  console.log(`${label} seed: ${seed}`);
  console.log(
    `  family ${cov.familySize}  N coverage ${cov.hit}/64  min solutions ${cov.minSolutions}  ≥5: ${cov.ge5}`
  );

  assert(cov.discourse === label, `${label} δ_D(seed)`);
  assert(cov.hit === 64, `${label} covers all N`);
  assert(flipped.length === 0, `${label} N-edits must not flip D`);
  assert(both.length === 0, `${label} no NONE after lock`);
  assert(cov.ge5 === 64, `${label} every residue ≥5 realizations`);

  for (const n of [0, 17, 42, 63]) {
    const hits = d1ForResidue(seed, n);
    assert(hits.length >= 5, `${label}+${n} ≥5`);
    for (const h of hits) {
      assert(decodeN(h.utterance) === n, `${label}+${n} δ_N`);
      assert(decodeD(h.utterance) === label, `${label}+${n} δ_D`);
      assert(missingPoles(h.utterance).length === 0, `${label}+${n} P`);
    }
    console.log(`  ${label} + ${n}  x${hits.length}  e.g. ${hits[0].utterance}`);
  }
  console.log('');
}

const get42 = new Set(d1ForResidue(GET_SEED, 42).map((c) => c.utterance));
const allow42 = new Set(d1ForResidue(ALLOW_SEED, 42).map((c) => c.utterance));
const overlap = [...get42].filter((u) => allow42.has(u));
assert(overlap.length === 0, 'GET+42 and ALLOW+42 are disjoint');

if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('P7-D1: D and N coexist — GET|ALLOW locked, all 64 residues, 42 in both classes');
