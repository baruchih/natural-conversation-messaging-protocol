/**
 * V4-F6 live independent opportunities. One 50-set per context.
 *   npm run test:v4-f6-lm
 *   F6_WRITE_FROZEN=1 npm run test:v4-f6-lm
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';
import { parseCandidates } from './f4.ts';
import { BATCH, OPPORTUNITIES, intentPrompt, promptIsBlind, scoreOpportunity } from './f6.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-f6-lm');
  process.exit(2);
}

console.log(`V4-F6-LM  model=${openaiModel()}  k=${BATCH}`);
console.log('One declared symbol per context. No residue, r, or hit/miss in the prompt.\n');

const candidates: string[][] = [];
const rows = [];

for (const opp of OPPORTUNITIES) {
  if (!promptIsBlind(opp.history, opp.speaker, opp.intent)) {
    throw new Error(`prompt leaked on ${opp.id}`);
  }
  const raw = await proposeIntentSet(opp.history, opp.speaker, opp.intent);
  const set = parseCandidates(raw);
  const scored = scoreOpportunity(opp, set);
  candidates.push(set);
  rows.push(scored);
  console.log(
    `${opp.id} r=${scored.r} need=${opp.need} legal=${scored.legal} covered=${scored.covered}/${scored.bins} hit=${scored.hit}${scored.hit ? ` examined=${scored.examined}` : ''}`,
  );
}

if (process.env.F6_WRITE_FROZEN === '1') {
  const path = resolve(process.cwd(), 'v4/f6.frozen.ts');
  writeFileSync(
    path,
    `/**
 * Frozen F6 independent opportunities. One run. Do not regenerate.
 */
export const FROZEN = ${JSON.stringify({ rows, candidates }, null, 2)} as const;
`,
  );
  console.log(`\nwrote ${path}`);
}

console.log('\nF6-LM done. Measure with npm run test:v4-f6');
console.log(intentPrompt(OPPORTUNITIES[0].history, OPPORTUNITIES[0].speaker, OPPORTUNITIES[0].intent).split('\n').slice(0, 6).join('\n'));
