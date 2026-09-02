/**
 * V4-F4 live conversation. One 50-candidate set per body turn.
 * No residue in the prompt. No second call after a miss.
 *   npm run test:v4-f4-lm
 *   F4_WRITE_FROZEN=1 npm run test:v4-f4-lm
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ARGUMENT_BITS_TEXT,
  BATCH,
  INTENTS,
  START_8,
  carrier,
  encodeFromSets,
  intentPrompt,
  parseCandidates,
  promptIsBlind,
  rate,
  selectAccepted,
} from './f4.ts';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-f4-lm');
  process.exit(2);
}

console.log(`V4-F4-LM  model=${openaiModel()}  k=${BATCH}`);
console.log('Generator is not given U, NCMP, residue, r, π, or hit/miss.\n');

const sets: string[][] = [];
const history: { speaker: string; utterance: string }[] = [];
let last = START_8;
let remaining = ARGUMENT_BITS_TEXT;
let miss: { intentIndex: number; r: number; wanted: string; legal: number; considered: number } | null = null;

for (let i = 0; i < INTENTS.length; i++) {
  if (remaining.length === 0) break;
  const intent = INTENTS[i];
  if (!promptIsBlind(history, intent.speaker, intent.text)) {
    throw new Error(`prompt leaked on intent ${i + 1}`);
  }
  const r = rate(last, remaining.length);
  const wanted = remaining.slice(0, r);
  const raw = await proposeIntentSet(history, intent.speaker, intent.text);
  const candidates = parseCandidates(raw);
  sets.push(candidates);
  const sel = selectAccepted(candidates, r, wanted);
  console.log(
    `intent ${i + 1} ${intent.speaker}  r=${r}  wanted=${wanted}  parsed=${candidates.length}  legal=${sel.legal.length}  hit=${sel.chosen !== null}`,
  );
  if (sel.chosen === null) {
    miss = { intentIndex: i, r, wanted, legal: sel.legal.length, considered: sel.considered.length };
    console.log('NO_CANDIDATE  (do not enlarge k, mutate, change r, or regenerate)');
    break;
  }
  console.log(`  U*  C6=${carrier(sel.chosen)}  ${sel.chosen}`);
  history.push({ speaker: intent.speaker, utterance: sel.chosen });
  remaining = remaining.slice(r);
  last = sel.chosen;
}

const encoded = encodeFromSets(ARGUMENT_BITS_TEXT, START_8, sets);
const result = encoded.kind === 'ENCODED' ? 'ARGUMENT' : 'NO_CANDIDATE';
console.log(`\nreplay ${encoded.kind}  unused intents ${INTENTS.length - sets.length}`);
if (encoded.kind === 'ENCODED') {
  console.log(`sender bits   ${encoded.bits}`);
}

if (process.env.F4_WRITE_FROZEN === '1') {
  const turns =
    encoded.kind === 'ENCODED'
      ? encoded.turns.map((t) => ({
          speaker: t.speaker,
          intent: t.intent,
          r: t.r,
          wanted: t.wanted,
          utterance: t.utterance,
          c6: t.c6,
          pi: t.pi,
        }))
      : history.map((t, i) => ({
          speaker: t.speaker,
          intent: INTENTS[i].text,
          r: rate(i === 0 ? START_8 : history[i - 1].utterance, ARGUMENT_BITS_TEXT.length),
          wanted: '',
          utterance: t.utterance,
          c6: carrier(t.utterance),
          pi: '',
        }));
  const file = `/**
 * Frozen F4 transcript. One run. Do not regenerate.
 */
export const FROZEN = ${JSON.stringify(
    {
      start: START_8,
      argument: ARGUMENT_BITS_TEXT,
      result,
      miss,
      turns,
      candidates: sets,
    },
    null,
    2,
  )} as const;
`;
  const path = resolve(process.cwd(), 'v4/f4.frozen.ts');
  writeFileSync(path, file);
  console.log(`wrote ${path}`);
}

console.log(`\nF4-LM: ${result}`);
console.log('Prompt shape:\n');
console.log(intentPrompt([], INTENTS[0].speaker, INTENTS[0].text).split('\n').slice(0, 8).join('\n'));
