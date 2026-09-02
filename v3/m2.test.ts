/**
 * V3-M2: paraphrase batch A (0/6) and intent batch B.
 *   npm run test:v3-m2
 */
import { ADJUNCTS } from './m1.ts';
import { wellFormed } from '../v1-v2/p7c6.ts';
import {
  BATCH,
  FROZEN_INTENT,
  FROZEN_PROPOSALS,
  FROZEN_SETS,
  PREFIXES,
  TARGET,
  coverage,
  intentPrompt,
  paraphrasePrompt,
  promptIsBlindIntent,
  promptIsBlindParaphrase,
  runFrozenIntent,
  runFrozenParaphrase,
  turnOk,
} from './m2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(ADJUNCTS.includes('for now'), 'M1 neighborhood unused');
assert(PREFIXES.every((p) => promptIsBlindParaphrase(p, FROZEN_PROPOSALS[p.id])), 'paraphrase prompt blind');
assert(PREFIXES.every(promptIsBlindIntent), 'intent prompt blind');
assert(!intentPrompt(PREFIXES[0]).toLowerCase().includes('what did you end up ordering'), 'intent prompt has no seed U');
assert(
  turnOk('Oh nice! How was the vibe once they arrived?'),
  'a two-clause turn is legal',
);
assert(
  !wellFormed('Oh nice! How was the vibe once they arrived?'),
  'P7 wellFormed still rejects that turn',
);

console.log('V3-M2  batch A  paraphrase of U  (P7 wellFormed)\n');
const a = runFrozenParaphrase();
let aHits = 0;
console.log('id  need  n    legal  residues  hit');
for (const s of a) {
  if (s.chosen) aHits += 1;
  const set = FROZEN_SETS[s.prefix.id] ?? [];
  assert(set.length >= 40, `${s.prefix.id} A batch`);
  console.log(
    `${s.prefix.id}  ${String(s.need).padEnd(4)} ${String(set.length).padEnd(4)} ${String(s.legal.length).padEnd(6)} ${String(s.uniqueResidues).padEnd(9)} ${s.chosen !== null}`,
  );
}
assert(aHits === 0, 'batch A remains 0/6');

console.log('\nV3-M2  batch B  realizations of intent  (turn gate)\n');
const b = runFrozenIntent();
let bHits = 0;
console.log('id  need  n    legal  residues  hit  chosen');
for (const s of b) {
  if (s.chosen) bHits += 1;
  const set = FROZEN_INTENT[s.prefix.id] ?? [];
  assert(set.length >= 40, `${s.prefix.id} B batch`);
  assert(s.candidates.length >= BATCH * 0.7, `${s.prefix.id} parsed`);
  if (s.chosen) {
    assert(s.legal.includes(s.chosen), `${s.prefix.id} chosen is unedited`);
    assert(s.window === TARGET, `${s.prefix.id} window 42`);
    assert(turnOk(s.chosen), `${s.prefix.id} chosen is a legal turn`);
  }
  console.log(
    `${s.prefix.id}  ${String(s.need).padEnd(4)} ${String(set.length).padEnd(4)} ${String(s.legal.length).padEnd(6)} ${String(s.uniqueResidues).padEnd(9)} ${String(s.chosen !== null).padEnd(5)} ${s.chosen ?? '—'}`,
  );
}

console.log('\nB residue histogram (count desc, occupied only)\n');
for (const s of b) {
  const hist = coverage(s.residues)
    .map((n, r) => ({ r, n }))
    .filter((bin) => bin.n > 0)
    .sort((x, y) => y.n - x.n || x.r - y.r)
    .map((bin) => `${bin.r}×${bin.n}`)
    .join('  ');
  console.log(`${s.prefix.id}  ${hist}`);
}

console.log(`\nA hits ${aHits}/6   B hits ${bHits}/6   batch ${BATCH}`);
assert(bHits === 2, 'this frozen intent batch hit 2/6; do not enlarge k');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-M2: paraphrase ≠ intent; U is a turn');
