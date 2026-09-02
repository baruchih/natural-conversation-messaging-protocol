/**
 * V3-M2 live intent set, then select.
 *   npm run test:v3-m2-lm
 */
import { openaiKey, openaiModel } from './m1.lm.ts';
import { PREFIXES, TARGET, parseCandidates, promptIsBlindIntent, selectIntent } from './m2.ts';
import { proposeIntentSet } from './m2.lm.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-m2-lm');
  process.exit(2);
}

console.log(`V3-M2-LM  model=${openaiModel()}`);
console.log('Intent generator is not given U, NCMP, residue, or hit/miss.\n');

let hits = 0;
for (const p of PREFIXES) {
  if (!promptIsBlindIntent(p)) throw new Error(`prompt leaked on ${p.id}`);
  const s = selectIntent(p, parseCandidates(await proposeIntentSet(p)));
  if (s.chosen && s.window === TARGET) hits += 1;
  console.log(p.id, 'legal', s.legal.length, 'residues', s.uniqueResidues, 'need', s.need, 'hit', s.chosen !== null);
  if (s.chosen) console.log('  U*', s.chosen);
}

console.log(`\nlive hits ${hits}/${PREFIXES.length}  (frozen corpus is npm run test:v3-m2)`);
