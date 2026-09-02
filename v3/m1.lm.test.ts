/**
 * V3-M1 live: propose one next turn, then modulate.
 *   npm run test:v3-m1-lm
 */
import { TARGET, PREFIXES, closeNatural, promptIsBlind } from './m1.ts';
import { openaiKey, openaiModel, proposeNext } from './m1.lm.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-m1-lm');
  process.exit(2);
}

console.log(`V3-M1-LM  model=${openaiModel()}`);
console.log('Proposer is not given NCMP, residue, or a target.\n');

let hits = 0;
for (const p of PREFIXES) {
  if (!promptIsBlind(p)) throw new Error(`prompt leaked protocol on ${p.id}`);
  const proposal = await proposeNext(p);
  const c = closeNatural(p, proposal);
  if (c.modulation.hit && c.window === TARGET) hits += 1;
  console.log(p.id);
  console.log(`  LM   ${proposal}`);
  console.log(`  need ${c.need}  seedN ${c.modulation.seedResidue}  hit ${c.modulation.hit}  win ${c.window}`);
  if (c.modulation.chosen) {
    console.log(`  U'   ${c.modulation.chosen.utterance}`);
    console.log(`  dist depth=${c.modulation.chosen.depth} jaccard=${c.modulation.chosen.jaccard.toFixed(2)}`);
  }
}

console.log(`\nlive hits ${hits}/${PREFIXES.length}  (frozen corpus is npm run test:v3-m1)`);
console.log('V3-M1-LM: proposer saw conversation and intent only');
