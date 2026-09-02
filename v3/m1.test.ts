/**
 * V3-M1: LM proposal + residue modulation. Frozen proposals.
 *   npm run test:v3-m1
 */
import { A2_SEED } from './k3.ts';
import {
  FROZEN_PROPOSALS,
  PREFIXES,
  TARGET,
  closeNatural,
  promptIsBlind,
} from './m1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-M1  LM proposes; code modulates residue\n');

assert(PREFIXES.every(promptIsBlind), 'proposer prompt has no protocol');
assert(PREFIXES.every((p) => FROZEN_PROPOSALS[p.id]), 'every prefix has a frozen proposal');

let hits = 0;
let jac = 0;
let depth = 0;
console.log('id  need  seedN  hit  win  depth  jac  U\'');
for (const p of PREFIXES) {
  const c = closeNatural(p, FROZEN_PROPOSALS[p.id]);
  const ch = c.modulation.chosen;
  if (c.modulation.hit) hits += 1;
  if (ch) {
    jac += ch.jaccard;
    depth += ch.depth;
  }
  console.log(
    `${p.id}  ${String(c.need).padEnd(4)} ${String(c.modulation.seedResidue).padEnd(6)} ${String(c.modulation.hit).padEnd(5)} ${String(c.window).padEnd(4)} ${String(ch?.depth ?? '—').padEnd(6)} ${ch ? ch.jaccard.toFixed(2) : '—'}  ${ch?.utterance ?? ''}`,
  );
  console.log(`    LM  ${FROZEN_PROPOSALS[p.id]}`);
  assert(c.modulation.seedResidue !== c.need, `${p.id} raw LM does not already carry the residue`);
  assert(c.modulation.hit && c.window === TARGET, `${p.id} window is ${TARGET}`);
  assert(ch !== null && !ch.utterance.includes('Confirm the restaurant'), `${p.id} is not the old dinner closer`);
  assert(ch !== null && ch.utterance !== A2_SEED, `${p.id} is not the K3 dinner seed`);
}

console.log(`\nhits ${hits}/${PREFIXES.length}  mean depth ${(depth / hits).toFixed(2)}  mean jaccard ${(jac / hits).toFixed(2)}`);

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-M1: model supplied the sentence; code selected a nearby residue');
