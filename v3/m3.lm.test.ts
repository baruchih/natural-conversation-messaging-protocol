/**
 * V3-M3 live smoke: one independent draw per prefix.
 * The frozen corpus is npm run test:v3-m3.
 *   npm run test:v3-m3-lm
 */
import { openaiKey, openaiModel } from './m1.lm.ts';
import { sampleTurn } from './m3.lm.ts';
import { PREFIXES, parseTurn, promptIsBlindSample } from './m3.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-m3-lm');
  process.exit(2);
}

console.log(`V3-M3-LM  model=${openaiModel()}`);
console.log('One draw each. Generator is not given other samples, residue, or NCMP.\n');

for (const p of PREFIXES) {
  if (!promptIsBlindSample(p)) throw new Error(`prompt leaked on ${p.id}`);
  const u = parseTurn(await sampleTurn(p));
  console.log(p.id, u || '—');
}
