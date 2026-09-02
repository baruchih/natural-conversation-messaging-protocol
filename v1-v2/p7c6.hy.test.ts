/**
 * P7-C6-HY. Arithmetic is solved by code over legal edits.
 *   npm run test:c6-hy
 */
import { decode, wellFormed } from './p7c6.ts';
import { missingPoles } from './p7c6.lm.ts';
import {
  encodeHybrid,
  legalCandidates,
  pickDiverse,
  solutionsPerResidue,
  uniquePathsPerResidue,
} from './p7c6.hy.ts';

const SEEDS = [
  'The place was solid, yet service felt sluggish.',
  'The restaurant was good, but the service was slow.',
  'The kitchen was fine, though the wait was delayed last night.',
];

const TARGETS = [0, 17, 42, 63];

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('P7-C6-HY  deterministic edit search over published poles + glaze\n');

for (const seed of SEEDS) {
  assert(wellFormed(seed), `seed well-formed: ${seed}`);
  assert(missingPoles(seed).length === 0, `seed poles: ${seed}`);

  const counts = solutionsPerResidue(seed);
  const paths = uniquePathsPerResidue(seed);
  const covered = counts.filter((c) => c > 0).length;
  const family = legalCandidates(seed).length;
  const minHit = Math.min(...counts.filter((c) => c > 0));
  const maxHit = Math.max(...counts);
  const ge2 = counts.filter((c) => c >= 2).length;
  const ge5 = counts.filter((c) => c >= 5).length;

  console.log(`seed: ${seed}`);
  console.log(`  legal family ${family}  residues hit ${covered}/64  solutions min/max ${minHit}/${maxHit}`);
  console.log(`  residues with ≥2 realizations ${ge2}  ≥5 ${ge5}`);
  console.log(`  path diversity min/max ${Math.min(...paths.filter((p) => p > 0))}/${Math.max(...paths)}`);

  assert(covered === 64, `${seed} must cover all 64 residues`);
  assert(ge2 === 64, `${seed} every residue needs ≥2 realizations (not a codebook)`);

  for (const n of TARGETS) {
    const { hit, chosen, solutions, paths: pathCount } = encodeHybrid(seed, n);
    assert(hit && chosen !== null, `${seed} → ${n}`);
    if (chosen) {
      assert(decode(chosen.utterance) === n, `δ_N(${chosen.utterance}) === ${n}`);
      assert(wellFormed(chosen.utterance), `well-formed ${n}`);
      assert(missingPoles(chosen.utterance).length === 0, `poles ${n}`);
      const alts = pickDiverse(seed, n, 5).map((c) => c.utterance);
      console.log(
        `  n=${String(n).padStart(2)}  solutions=${solutions}  paths=${pathCount}  depth=${chosen.depth}  ${chosen.utterance}`
      );
      for (const alt of alts.slice(1, 4)) {
        console.log(`           alt  ${alt}`);
      }
    }
  }
  console.log('');
}

if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('P7-C6-HY: 4/4 targets from each seed; no single-word codebook');
