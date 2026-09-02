/**
 * P7-E2: loosen E only. Published constructions, not a classifier.
 *   npm run test:e2
 */
import { decode as decodeN } from './p7c6.ts';
import { missingPoles } from './p7c6.lm.ts';
import { decodeD } from './p7d1.ts';
import { decodeE, usesMagicEntityNoun } from './p7e1.ts';
import {
  decodeE2,
  e2Coverage,
  e2For,
  matchingConstructions,
} from './p7e2.ts';

const DINNER = 'Did we find the restaurant was good but service was slow';

const SEEDS = {
  'GET/CUSTOMER/det_party': `${DINNER} for that party?`,
  'GET/CUSTOMER/whoever_held_it': `${DINNER} for whoever held it?`,
  'GET/CUSTOMER/poss_account_holder': `${DINNER} for their account holder?`,
  'GET/CUSTOMER/those_folks': `${DINNER} for those folks?`,
  'GET/CUSTOMER/anyone_seated': `${DINNER} for anyone seated?`,
  'GET/CUSTOMER/det_account_holder': `${DINNER} for the account holder?`,
  'GET/TRANSACTION/det_event': `${DINNER} on that move?`,
  'GET/TRANSACTION/whatever_went_through': `${DINNER} on whatever went through?`,
  'GET/TRANSACTION/poss_latest_charge': `${DINNER} on their latest charge?`,
  'ALLOW/CUSTOMER/whoever_held_it': `I confirm the restaurant was good but service was slow for whoever held it.`,
} as const;

const E1_INVISIBLE = [
  'GET/CUSTOMER/whoever_held_it',
  'GET/CUSTOMER/poss_account_holder',
  'GET/CUSTOMER/those_folks',
  'GET/CUSTOMER/anyone_seated',
  'GET/CUSTOMER/det_account_holder',
  'GET/TRANSACTION/whatever_went_through',
  'GET/TRANSACTION/poss_latest_charge',
] as const;

const NEAR_MISS = [
  'Did we find the restaurant was good but service was slow for the guest we like?',
  'Did we find the restaurant was good but service was slow for their regular diner?',
  'Did we find the restaurant was good but service was slow for whoever ate there?',
  'Did we find the restaurant was good but service was slow because it was involved?',
  'Did we find the restaurant was good but service was slow for those seated?',
];

const FRAGMENTS = [
  'held it',
  'account holder',
  'whoever',
  'those',
  'anyone',
  'involved',
  'processed',
];

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('P7-E2  loosen E  (published grammar, not a classifier)\n');

assert(decodeE2(SEEDS['GET/CUSTOMER/det_party']) === 'CUSTOMER', 'E2 keeps E1 pair');
assert(decodeE(SEEDS['GET/CUSTOMER/det_party']) === 'CUSTOMER', 'E1 still sees det_party');

for (const label of E1_INVISIBLE) {
  const u = SEEDS[label];
  const wantE = label.includes('TRANSACTION') ? 'TRANSACTION' : 'CUSTOMER';
  assert(decodeE(u) === 'NONE', `${label} is invisible to E1`);
  assert(decodeE2(u) === wantE, `${label} is visible to E2`);
}
console.log(`E1-invisible constructions E2 accepts: ${E1_INVISIBLE.length}`);

for (const [label, seed] of Object.entries(SEEDS)) {
  const wantD = label.startsWith('ALLOW') ? 'ALLOW' : 'GET';
  const wantE = label.includes('TRANSACTION') ? 'TRANSACTION' : 'CUSTOMER';
  assert(decodeD(seed) === wantD, `${label} δ_D`);
  assert(decodeE2(seed) === wantE, `${label} δ_E2`);
  assert(missingPoles(seed).length === 0, `${label} poles`);
  assert(!usesMagicEntityNoun(seed), `${label} magic`);

  const cov = e2Coverage(seed);
  console.log(`${label}`);
  console.log(`  family ${cov.familySize}  N ${cov.hit}/64  ≥5: ${cov.ge5}`);
  assert(cov.hit === 64, `${label} covers N`);
  assert(cov.ge5 === 64, `${label} every residue ≥5`);

  const hits = e2For(seed, 42);
  assert(hits.length >= 5, `${label}+42 ≥5`);
  for (const h of hits) {
    assert(decodeD(h.utterance) === wantD, `${label}+42 D`);
    assert(decodeE2(h.utterance) === wantE, `${label}+42 E`);
    assert(decodeN(h.utterance) === 42, `${label}+42 N`);
    assert(!usesMagicEntityNoun(h.utterance), `${label}+42 magic`);
  }
  if (label === 'GET/CUSTOMER/whoever_held_it') {
    console.log(`  GET CUSTOMER 42 via free relative  ${hits[0].utterance}`);
  }
}

for (const u of NEAR_MISS) {
  assert(decodeE2(u) === 'NONE', `near-miss is not CUSTOMER: ${u}`);
}
console.log('near-miss customer-like sentences: all NONE (not a classifier)');

for (const u of FRAGMENTS) {
  assert(decodeE2(u) === 'NONE', `fragment: ${u}`);
}

const conflict = `${DINNER} for whoever held it on whatever went through?`;
assert(decodeE2(conflict) === 'NONE', 'both classes → NONE');
assert(matchingConstructions(conflict).length >= 2, 'conflict has both constructions');

const novel = e2For(SEEDS['GET/CUSTOMER/whoever_held_it'], 42)[0];
assert(!!novel, 'GET CUSTOMER 42 on an E1-invisible construction');
if (novel) {
  assert(decodeE(novel.utterance) === 'NONE', 'that 42-sentence is still invisible to E1');
  assert(decodeE2(novel.utterance) === 'CUSTOMER', 'E2 reads CUSTOMER');
  assert(decodeD(novel.utterance) === 'GET', 'D');
  assert(decodeN(novel.utterance) === 42, 'N');
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-E2: several E constructions; δ_E2 is a published matcher; E1/D1/C6 untouched');
