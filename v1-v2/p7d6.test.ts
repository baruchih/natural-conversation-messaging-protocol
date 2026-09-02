/**
 * P7-D6: discourse alphabet 2 → 6. Composition invariants held.
 *   npm run test:d6
 */
import { decode as decodeN } from './p7c6.ts';
import { missingPoles } from './p7c6.lm.ts';
import { decodeE, usesMagicEntityNoun } from './p7e1.ts';
import { isAck, isProbe, PROBE_EXAMPLE, ACK_EXAMPLE } from './p7s1.ts';
import {
  D6_CUES,
  D6_OPCODES,
  d6Coverage,
  d6For,
  decodeD6,
  grammarFootprint,
  type Discourse6,
} from './p7d6.ts';

const DINNER = 'the restaurant was good but service was slow';

const SEEDS: Record<string, string> = {
  'GET/CUSTOMER': `Did we find ${DINNER} for that party?`,
  'GET/TRANSACTION': `Did we find ${DINNER} on that move?`,
  'ALLOW/CUSTOMER': `I confirm ${DINNER} for that party.`,
  'ALLOW/TRANSACTION': `I confirm ${DINNER} on that move.`,
  'DENY/CUSTOMER': `I declined ${DINNER} for that party.`,
  'DENY/TRANSACTION': `I declined ${DINNER} on that move.`,
  'CONSTRAINT/CUSTOMER': `Unless noted ${DINNER} for that party.`,
  'CONSTRAINT/TRANSACTION': `Unless noted ${DINNER} on that move.`,
  'REPLACE/CUSTOMER': `Instead ${DINNER} for that party.`,
  'REPLACE/TRANSACTION': `Instead ${DINNER} on that move.`,
  'DELEGATE/CUSTOMER': `I forwarded ${DINNER} for that party.`,
  'DELEGATE/TRANSACTION': `I forwarded ${DINNER} on that move.`,
};

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('P7-D6  discourse 2 → 6  (E1 + C6 frozen)\n');

const cueWords = D6_OPCODES.flatMap((op) => [...D6_CUES[op]]);
assert(new Set(cueWords).size === cueWords.length, 'cue tokens are disjoint');
assert(!cueWords.includes('deny'), 'DENY is not the word deny');
assert(!cueWords.includes('replace'), 'REPLACE is not the word replace');
assert(!cueWords.includes('delegate'), 'DELEGATE is not the word delegate');

assert(decodeD6(PROBE_EXAMPLE) === 'NONE', 'probe is not a D6 frame');
assert(decodeD6(ACK_EXAMPLE) === 'NONE', 'ack is not a D6 frame');
assert(isProbe(PROBE_EXAMPLE) && isAck(ACK_EXAMPLE), 'S1 handshake unchanged');

const collide = `I confirm I declined ${DINNER} for that party.`;
assert(decodeD6(collide) === 'NONE', 'two D cues → NONE');

const footprint = grammarFootprint();
console.log(
  `grammar footprint  ${D6_OPCODES.map((op) => `${op}:${footprint[op]}`).join('  ')}  total ${cueWords.length}`,
);

let combos = 0;
for (const [label, seed] of Object.entries(SEEDS)) {
  const [wantD, wantE] = label.split('/') as [Discourse6, 'CUSTOMER' | 'TRANSACTION'];
  assert(decodeD6(seed) === wantD, `${label} δ_D6`);
  assert(decodeE(seed) === wantE, `${label} δ_E`);
  assert(missingPoles(seed).length === 0, `${label} poles`);
  assert(!usesMagicEntityNoun(seed), `${label} magic`);

  const cov = d6Coverage(seed);
  console.log(`${label}: family ${cov.familySize}  N ${cov.hit}/64  ≥5: ${cov.ge5}`);
  assert(cov.hit === 64, `${label} covers N`);
  assert(cov.ge5 === 64, `${label} every residue ≥5`);
  combos += cov.hit;

  for (const n of [0, 17, 42, 63]) {
    const hits = d6For(seed, n);
    assert(hits.length >= 5, `${label}+${n} ≥5`);
    for (const h of hits) {
      assert(decodeD6(h.utterance) === wantD, `${label}+${n} D`);
      assert(decodeE(h.utterance) === wantE, `${label}+${n} E`);
      assert(decodeN(h.utterance) === n, `${label}+${n} N`);
    }
    if (n === 42) console.log(`  ${wantD} ${wantE} 42  x${hits.length}  ${hits[0].utterance}`);
  }
}

assert(combos === 768, `12 families × 64 residues = 768, got ${combos}`);

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-D6: 6×2×64 covered; D and E do not flip; cue sets stay small');
