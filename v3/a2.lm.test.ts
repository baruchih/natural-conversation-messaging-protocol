/**
 * V3-A2 live smoke: one B₂ per prefix, first frozen A₂.
 *   npm run test:v3-a2-lm
 */
import { openaiKey, openaiModel } from './m1.lm.ts';
import { replyAsB } from './a2.lm.ts';
import { FROZEN_DRAWS, PREFIXES, legalTurn, promptIsBlindReply } from './a2.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-a2-lm');
  process.exit(2);
}

console.log(`V3-A2-LM  model=${openaiModel()}`);
console.log('One B₂ each. No residue. No other samples.\n');

for (const p of PREFIXES) {
  const a2 = FROZEN_DRAWS[p.id][0];
  if (!promptIsBlindReply(p, a2)) throw new Error(`prompt leaked on ${p.id}`);
  const b2 = legalTurn(await replyAsB(p, a2));
  console.log(p.id, b2 ?? '—');
}
