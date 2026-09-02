/**
 * V3-M3: independent next-turn draws. Frozen corpus. Do not enlarge.
 *   npm run test:v3-m3
 */
import { ADJUNCTS } from './m1.ts';
import { FROZEN_DRAWS } from './m3.frozen.ts';
import {
  DRAWS,
  PREFIXES,
  TARGET,
  formatHist,
  promptIsBlindSample,
  runFrozenDraws,
  samplePrompt,
  turnOk,
} from './m3.ts';

const EXPECTED: Record<string, { uniq: number; residues: number; h: string; hit: boolean }> = {
  p1: { uniq: 43, residues: 32, h: '4.82', hit: true },
  p2: { uniq: 50, residues: 35, h: '4.98', hit: true },
  p3: { uniq: 48, residues: 29, h: '4.69', hit: true },
  p4: { uniq: 45, residues: 33, h: '4.88', hit: true },
  p5: { uniq: 42, residues: 29, h: '4.61', hit: false },
  p6: { uniq: 50, residues: 34, h: '4.93', hit: true },
};

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(ADJUNCTS.includes('for now'), 'M1 neighborhood unused');
assert(PREFIXES.every(promptIsBlindSample), 'sample prompt blind');
assert(!samplePrompt(PREFIXES[0]).toLowerCase().includes('50'), 'not an enumerated list');
assert(
  turnOk('Oh nice! How was the vibe once they arrived?'),
  'a two-clause turn is legal',
);

console.log('V3-M3  independent next-turn samples\n');
const rows = runFrozenDraws(FROZEN_DRAWS);
let hits = 0;
console.log('id  need  n    uniq  legal  residues  Hbits  hit');
for (const s of rows) {
  if (s.chosen) hits += 1;
  const set = FROZEN_DRAWS[s.prefix.id] ?? [];
  const exp = EXPECTED[s.prefix.id];
  assert(set.length === DRAWS, `${s.prefix.id} has ${DRAWS} draws`);
  assert(s.draws.length === DRAWS, `${s.prefix.id} parsed ${DRAWS}`);
  assert(s.legal.length === DRAWS, `${s.prefix.id} all legal`);
  assert(s.uniqueTexts === exp.uniq, `${s.prefix.id} unique texts`);
  assert(s.uniqueResidues === exp.residues, `${s.prefix.id} unique residues`);
  assert(s.entropy.toFixed(2) === exp.h, `${s.prefix.id} entropy`);
  assert((s.chosen !== null) === exp.hit, `${s.prefix.id} hit lock`);
  if (s.chosen) {
    assert(s.legal.includes(s.chosen), `${s.prefix.id} chosen is unedited`);
    assert(s.window === TARGET, `${s.prefix.id} window 42`);
    assert(turnOk(s.chosen), `${s.prefix.id} chosen is a legal turn`);
  }
  console.log(
    `${s.prefix.id}  ${String(s.need).padEnd(4)} ${String(set.length).padEnd(4)} ${String(s.uniqueTexts).padEnd(5)} ${String(s.legal.length).padEnd(6)} ${String(s.uniqueResidues).padEnd(9)} ${s.entropy.toFixed(2).padEnd(6)} ${s.chosen !== null}`,
  );
}

console.log('\nresidue histogram (count desc, occupied only)\n');
for (const s of rows) {
  console.log(`${s.prefix.id}  ${formatHist(s.histogram)}`);
}

console.log(`\nhits ${hits}/6   draws ${DRAWS}`);
assert(hits === 5, 'this frozen sample batch hit 5/6; do not enlarge draws');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-M3: sample, do not enumerate');
