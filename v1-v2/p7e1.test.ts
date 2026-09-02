/**
 * P7-E1: D × E × N composition. No magic customer/transaction nouns.
 *   npm run test:e1
 */
import { decode as decodeN } from './p7c6.ts';
import { missingPoles } from './p7c6.lm.ts';
import { decodeD } from './p7d1.ts';
import { decodeE, e1Coverage, e1For, usesMagicEntityNoun } from './p7e1.ts';

const SEEDS = {
  'GET/CUSTOMER': 'Did we find the restaurant was good but service was slow for that party?',
  'GET/TRANSACTION': 'Did we find the restaurant was good but service was slow on that move?',
  'ALLOW/CUSTOMER': 'I confirm the restaurant was good but service was slow for that party.',
  'ALLOW/TRANSACTION': 'I confirm the restaurant was good but service was slow on that move.',
} as const;

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('P7-E1  D × E × N  (E = reference construction, not a noun codebook)\n');

for (const [label, seed] of Object.entries(SEEDS)) {
  const [wantD, wantE] = label.split('/') as ['GET' | 'ALLOW', 'CUSTOMER' | 'TRANSACTION'];
  assert(decodeD(seed) === wantD, `${label} δ_D seed`);
  assert(decodeE(seed) === wantE, `${label} δ_E seed`);
  assert(missingPoles(seed).length === 0, `${label} poles`);
  assert(!usesMagicEntityNoun(seed), `${label} no magic noun`);

  const cov = e1Coverage(seed);
  console.log(`${label}: ${seed}`);
  console.log(`  family ${cov.familySize}  N ${cov.hit}/64  ≥5: ${cov.ge5}`);

  assert(cov.hit === 64, `${label} covers N`);
  assert(cov.ge5 === 64, `${label} every residue ≥5`);

  for (const n of [0, 17, 42, 63]) {
    const hits = e1For(seed, n);
    assert(hits.length >= 5, `${label}+${n} ≥5`);
    for (const h of hits) {
      assert(decodeD(h.utterance) === wantD, `${label}+${n} D`);
      assert(decodeE(h.utterance) === wantE, `${label}+${n} E`);
      assert(decodeN(h.utterance) === n, `${label}+${n} N`);
      assert(!usesMagicEntityNoun(h.utterance), `${label}+${n} magic`);
      assert(missingPoles(h.utterance).length === 0, `${label}+${n} P`);
    }
    if (n === 42) {
      console.log(`  ${wantD} ${wantE} 42  x${hits.length}  ${hits[0].utterance}`);
    }
  }
  console.log('');
}

const gc42 = e1For(SEEDS['GET/CUSTOMER'], 42);
assert(gc42.length >= 5, 'GET CUSTOMER 42 exists');
console.log(`GET CUSTOMER 42  (composed primitives, not NCMP/2.0 §21)`);
console.log(`  ${gc42[0].utterance}`);
console.log(`  D=${decodeD(gc42[0].utterance)} E=${decodeE(gc42[0].utterance)} N=${decodeN(gc42[0].utterance)}`);

if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-E1: D, E, N compose; N-edits flip neither D nor E');
